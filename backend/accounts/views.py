from rest_framework import generics
from rest_framework.permissions import AllowAny
from .serializers import OrganizationInvitationSerializer,MyOrganizationSerializer,OrganizationSerializer,RegisterSerializer ,EmployeeListSerializer ,CreateEmployeeSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.views import TokenRefreshView
from django.views.decorators.csrf import ensure_csrf_cookie
from django.middleware.csrf import get_token
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_protect
from django.utils.decorators import method_decorator
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated 
from .permissions import IsEmployee, IsTeamLead
from .models import User
from django.db import transaction
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework.exceptions import PermissionDenied, ValidationError
from .models import (
    Organization,
    OrganizationMembership,
    OrganizationInvitation
)
from django.utils.text import slugify

class RegisterAPIView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

class EmployeeListAPIView(generics.ListAPIView):
    serializer_class = EmployeeListSerializer
    permission_classes = [IsAuthenticated,IsTeamLead]
    def get_queryset(self):
        return User.objects.filter(role=User.Role.EMPLOYEE,team_lead=self.request.user)
      

class LogoutAPIView(APIView):
      permission_classes=[IsAuthenticated]
      def post(self,request):
        response=Response({"detail":"successfully logged out."},status=status.HTTP_200_OK)
        response.delete_cookie(key="access_token",path="/",samesite="Lax")
        response.delete_cookie(key="refresh_token",path="/",samesite="Lax")
        return response


@method_decorator(csrf_protect, name="dispatch")
class CookieTokenObtainPairView(TokenObtainPairView):
    def post(self,request):
        serializer=self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        access_token = serializer.validated_data["access"]
        refresh_token = serializer.validated_data["refresh"]
        response =Response({"detail":"Login successful"},status=status.HTTP_200_OK)
        response.set_cookie(key="access_token",value=access_token,httponly=True,secure=False,samesite="Lax",path="/")
        response.set_cookie(key="refresh_token",value=refresh_token,httponly=True,secure=False,samesite="Lax", path="/")
        print(response.cookies)
        return response

@method_decorator(csrf_protect, name="dispatch")
class CookieTokenRefreshView(TokenRefreshView):
    def post(self, request):
        refresh_token = request.COOKIES.get("refresh_token")

        if not refresh_token:
            return Response(
                {"detail": "Refresh token not found"},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        serializer=self.get_serializer(data={"refresh": refresh_token})
        serializer.is_valid(raise_exception=True)
        access_token = serializer.validated_data["access"]
        response =Response({"detail": "Token refreshed successfully"},status=status.HTTP_200_OK)
        response.set_cookie(key="access_token",value=access_token,httponly=True,secure=False,samesite="Lax",path="/")
        return response
        
@ensure_csrf_cookie
def csrf_token_view(request):
    return JsonResponse({
        "csrfToken": get_token(request)
    })


class CurrentUserApiView(APIView):
    permission_classes=[IsAuthenticated]
    def get(self,request):
        return Response({
            "username":request.user.username,
            "id":request.user.id,
            "email":request.user.email,
            "role":request.user.role
        })

class CreateEmployeeAPIView(generics.CreateAPIView):
    serializer_class = CreateEmployeeSerializer
    permission_classes = [IsAuthenticated, IsTeamLead]   


class OrganizationCreateView(APIView):

    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request):

        serializer = OrganizationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        name = serializer.validated_data['name']

        base_slug = slugify(name)

        if not base_slug:
            return Response(
                {'error': 'Please provide a valid organization name.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        slug = base_slug
        counter = 1

        while Organization.objects.filter(slug=slug).exists():
            slug = f"{base_slug}-{counter}"
            counter += 1

        organization = Organization.objects.create(
            name=name,
            slug=slug,
            created_by=request.user
        )

        OrganizationMembership.objects.create(
            organization=organization,
            user=request.user,
            role=OrganizationMembership.Role.ADMIN
        )

        return Response(
            OrganizationSerializer(organization).data,
            status=status.HTTP_201_CREATED
        )


class MyOrganizationsView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        organizations = Organization.objects.filter(
            memberships__user=request.user
        ).distinct()

        serializer = MyOrganizationSerializer(
            organizations,
            many=True,
            context={'request': request}
        )

        return Response(serializer.data)


    
class OrganizationInviteView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        organization_id = request.data.get('organization_id')
        email = request.data.get('email')

        if not organization_id or not email:
            raise ValidationError(
                'Organization ID and email are required.'
            )

        email = email.strip().lower()

        organization = get_object_or_404(
            Organization,
            id=organization_id
        )

        membership = OrganizationMembership.objects.filter(
            organization=organization,
            user=request.user,
            role=OrganizationMembership.Role.ADMIN
        ).first()

        if not membership:
            raise PermissionDenied(
                'Only organization admins can invite members.'
            )

        if OrganizationMembership.objects.filter(
            organization=organization,
            user__email__iexact=email
        ).exists():
            raise ValidationError(
                'This user is already a member.'
            )

        existing_invitation = OrganizationInvitation.objects.filter(
            organization=organization,
            email__iexact=email,
            status=OrganizationInvitation.Status.PENDING
        ).first()

        if existing_invitation:
            raise ValidationError(
                'A pending invitation already exists for this email.'
            )

        invitation = OrganizationInvitation.objects.create(
            organization=organization,
            email=email,
            invited_by=request.user
        )

        serializer = OrganizationInvitationSerializer(invitation)

        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED
        )


class AcceptOrganizationInvitationView(APIView):

    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request, token):

        invitation = get_object_or_404(
            OrganizationInvitation.objects.select_for_update(),
            token=token
        )

        if invitation.status != OrganizationInvitation.Status.PENDING:
            raise ValidationError(
                'This invitation is no longer pending.'
            )

        if invitation.expires_at <= timezone.now():
            invitation.status = OrganizationInvitation.Status.EXPIRED
            invitation.save(update_fields=['status'])

            raise ValidationError(
                'This invitation has expired.'
            )

        if invitation.email.lower() != request.user.email.lower():
            raise PermissionDenied(
                'This invitation was sent to a different email address.'
            )

        OrganizationMembership.objects.get_or_create(
            organization=invitation.organization,
            user=request.user,
            defaults={
                'role': OrganizationMembership.Role.MEMBER
            }
        )

        invitation.status = OrganizationInvitation.Status.ACCEPTED
        invitation.accepted_at = timezone.now()
        invitation.save(
            update_fields=['status', 'accepted_at']
        )

        return Response(
            {
                'message': 'You have successfully joined the organization.',
                'organization': invitation.organization.name
            },
            status=status.HTTP_200_OK
        )



