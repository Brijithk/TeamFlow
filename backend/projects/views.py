
from django.shortcuts import get_object_or_404
from django.db import IntegrityError, transaction

from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import PermissionDenied, ValidationError

from accounts.models import Organization, OrganizationMembership
from .models import Project, ProjectMembership
from .serializers import ProjectMemberRoleSerializer,ProjectSerializer ,MyProjectSerializer , ProjectMembershipSerializer


class ProjectCreateView(APIView):

    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request):

        organization_id = request.data.get('organization')

        if not organization_id:
            raise ValidationError(
                {'organization': 'Organization ID is required.'}
            )

        organization = get_object_or_404(
            Organization,
            id=organization_id
        )

        organization_membership = OrganizationMembership.objects.filter(
            organization=organization,
            user=request.user
        ).first()

        if not organization_membership:
            raise PermissionDenied(
                'You do not belong to this organization.'
            )

        if organization_membership.role != OrganizationMembership.Role.ADMIN:
            raise PermissionDenied(
                'Only organization admins can create projects.'
            )

        serializer = ProjectSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            project = serializer.save(
                organization=organization,
                created_by=request.user
            )

            # Automatically make the creator a Project Manager.
            ProjectMembership.objects.create(
                project=project,
                user=request.user,
                role=ProjectMembership.Role.MANAGER
            )

        except IntegrityError:
            raise ValidationError(
                {'key': 'This project key already exists in this organization.'}
            )

        return Response(
            ProjectSerializer(project).data,
            status=status.HTTP_201_CREATED
        )

class MyProjectsView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        projects = Project.objects.filter(
            memberships__user=request.user
        ).select_related(
            'organization'
        ).distinct()

        serializer = MyProjectSerializer(
            projects,
            many=True,
            context={'request': request}
        )

        return Response(serializer.data)

class ProjectMemberManagementView(APIView):

    permission_classes = [IsAuthenticated]

    def get_project(self, project_id):
        return get_object_or_404(Project, id=project_id)

    def check_manager_permission(self, project, user):

        is_manager = ProjectMembership.objects.filter(
            project=project,
            user=user,
            role=ProjectMembership.Role.MANAGER
        ).exists()

        if not is_manager:
            raise PermissionDenied(
                'Only project managers can manage project members.'
            )

    def get(self, request, project_id):

        project = self.get_project(project_id)

        is_member = ProjectMembership.objects.filter(
            project=project,
            user=request.user
        ).exists()

        if not is_member:
            raise PermissionDenied(
                'You are not a member of this project.'
            )

        memberships = ProjectMembership.objects.filter(
            project=project
        ).select_related('user')

        serializer = ProjectMembershipSerializer(
            memberships,
            many=True
        )

        return Response(serializer.data)

    def post(self, request, project_id):

        project = self.get_project(project_id)

        self.check_manager_permission(project, request.user)

        serializer = ProjectMembershipSerializer(
            data=request.data,
            context={'project': project}
        )

        serializer.is_valid(raise_exception=True)

        if ProjectMembership.objects.filter(
            project=project,
            user=serializer.validated_data['user']
        ).exists():
            raise ValidationError(
                'This user is already a member of this project.'
            )

        membership = serializer.save(project=project)

        return Response(
            ProjectMembershipSerializer(membership).data,
            status=status.HTTP_201_CREATED
        )

class ProjectMemberRoleUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, project_id, membership_id):

        # Only a project manager can manage member roles
        manager = ProjectMembership.objects.filter(
            project_id=project_id,
            user=request.user,
            role=ProjectMembership.Role.MANAGER
        ).exists()

        if not manager:
            raise PermissionDenied(
                "Only project managers can change member roles."
            )

        membership = ProjectMembership.objects.filter(
            id=membership_id,
            project_id=project_id
        ).first()

        if not membership:
            return Response(
                {"error": "Project member not found."},
                status=404
            )

        if membership.user_id == request.user.id:
            raise ValidationError(
                "You cannot change your own role."
            )

        serializer = ProjectMemberRoleSerializer(
            membership,
            data=request.data,
            partial=True
        )

        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(serializer.data)

class ProjectMemberRemoveView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, project_id, membership_id):

        with transaction.atomic():

            manager = ProjectMembership.objects.filter(
                project_id=project_id,
                user=request.user,
                role=ProjectMembership.Role.MANAGER
            ).exists()

            if not manager:
                raise PermissionDenied(
                    "Only project managers can remove members."
                )

            membership = ProjectMembership.objects.select_for_update().filter(
                id=membership_id,
                project_id=project_id
            ).first()

            if not membership:
                return Response(
                    {"error": "Project member not found."},
                    status=404
                )

            if membership.user_id == request.user.id:
                raise ValidationError(
                    "You cannot remove yourself from this project."
                )

            if membership.role == ProjectMembership.Role.MANAGER:

                manager_count = ProjectMembership.objects.filter(
                    project_id=project_id,
                    role=ProjectMembership.Role.MANAGER
                ).count()

                if manager_count <= 1:
                    raise ValidationError(
                        "A project must have at least one manager."
                    )

            membership.delete()

        return Response(
            {"message": "Project member removed successfully."},
            status=200
        )