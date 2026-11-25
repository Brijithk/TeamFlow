
from rest_framework import serializers
from .models import Project  , ProjectMembership
from accounts.models import OrganizationMembership



class ProjectSerializer(serializers.ModelSerializer):

    class Meta:
        model = Project
        fields = [
            'id',
            'organization',
            'name',
            'key',
            'description',
            'status',
            'created_by',
            'created_at'
        ]

        read_only_fields = [
            'id',
            'created_by',
            'created_at'
        ]

    def validate_key(self, value):
        value = value.strip().upper()

        if not value.isalnum():
            raise serializers.ValidationError(
                'Project key must contain only letters and numbers.'
            )

        return value


class MyProjectSerializer(serializers.ModelSerializer):

    role = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = [
            'id',
            'organization',
            'name',
            'key',
            'description',
            'status',
            'role',
            'created_at'
        ]

    def get_role(self, obj):
        user = self.context['request'].user

        membership = obj.memberships.filter(
            user=user
        ).first()

        return membership.role if membership else None


class ProjectMembershipSerializer(serializers.ModelSerializer):

    username = serializers.CharField(
        source='user.username',
        read_only=True
    )

    email = serializers.EmailField(
        source='user.email',
        read_only=True
    )

    class Meta:
        model = ProjectMembership
        fields = [
            'id',
            'project',
            'user',
            'username',
            'email',
            'role',
            'joined_at'
        ]

        read_only_fields = [
            'id',
            'project',
            'username',
            'email',
            'joined_at'
        ]

    def validate_user(self, user):

        project = self.context['project']

        is_organization_member = OrganizationMembership.objects.filter(
            organization=project.organization,
            user=user
        ).exists()

        if not is_organization_member:
            raise serializers.ValidationError(
                'This user does not belong to the project organization.'
            )

        return user

    def validate_role(self, value):

        if value == ProjectMembership.Role.MANAGER:
            raise serializers.ValidationError(
                'A new member cannot be assigned the Manager role through this API.'
            )

        return value


class ProjectMemberRoleSerializer(serializers.ModelSerializer):

    class Meta:
        model = ProjectMembership
        fields = ['id', 'role']

    def validate_role(self, value):
        allowed_roles = [
            ProjectMembership.Role.MANAGER,
            ProjectMembership.Role.MEMBER,
            ProjectMembership.Role.REVIEWER,
        ]

        if value not in allowed_roles:
            raise serializers.ValidationError(
                "Invalid project role."
            )

        return value