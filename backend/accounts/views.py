from rest_framework import generics
from rest_framework.permissions import AllowAny
from .serializers import RegisterSerializer ,EmployeeListSerializer
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

class RegisterAPIView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

class EmployeeListAPIView(generics.ListAPIView):
    serializer_class = EmployeeListSerializer
    permission_classes = [IsAuthenticated,IsTeamLead]
    queryset = User.objects.filter(role=User.Role.EMPLOYEE)
      

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



