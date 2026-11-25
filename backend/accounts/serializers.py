from rest_framework import serializers
from .models import (
    Organization,
    OrganizationInvitation,
    OrganizationMembership,
    User
)
from django.db import transaction
from django.utils.text import slugify


class RegisterSerializer(serializers.ModelSerializer):

    password = serializers.CharField(
        write_only=True,
        min_length=8
    )

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password']

    @transaction.atomic
    def create(self, validated_data):

        # 1. Create user account
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            role=User.Role.TEAM_LEAD
        )

        # 2. Generate personal workspace name
        organization_name = f"{user.username}'s Workspace"

        base_slug = slugify(organization_name)
        slug = base_slug
        counter = 1

        # 3. Ensure workspace slug is unique
        while Organization.objects.filter(slug=slug).exists():
            slug = f"{base_slug}-{counter}"
            counter += 1

        # 4. Create personal organization
        organization = Organization.objects.create(
            name=organization_name,
            slug=slug,
            created_by=user
        )

        # 5. Make user the organization admin
        OrganizationMembership.objects.create(
            organization=organization,
            user=user,
            role=OrganizationMembership.Role.ADMIN
        )

        return user

    def validate_email(self, email):
        if User.objects.filter(email__iexact=email).exists():
            raise serializers.ValidationError(
                "This email address is already registered."
            )

        return email


class EmployeeListSerializer(serializers.ModelSerializer):
  class Meta:
    model= User
    fields=['id','username','email']
    read_only_fields=['id','username','email']


class CreateEmployeeSerializer(serializers.ModelSerializer):

    password=serializers.CharField(
      write_only=True,
      min_length=8
    )


    class Meta:
      model=User
      fields=['id','username','email','password']
      read_only_fields=['id']
    def create(self,validated_data):
            user=User.objects.create_user(
                username=validated_data['username'],
                email=validated_data['email'],
                password=validated_data['password'],
                role=User.Role.EMPLOYEE,
                team_lead=self.context['request'].user
            )
            return user

class OrganizationSerializer(serializers.ModelSerializer):

    class Meta:
        model = Organization
        fields = ['id', 'name', 'slug', 'created_at']
        read_only_fields = ['id', 'slug', 'created_at']



class MyOrganizationSerializer(serializers.ModelSerializer):

    role = serializers.SerializerMethodField()

    class Meta:
        model = Organization
        fields = ['id', 'name', 'slug', 'role', 'created_at']

    def get_role(self, obj):
        user = self.context['request'].user

        membership = obj.memberships.filter(user=user).first()

        return membership.role if membership else None


class OrganizationInvitationSerializer(serializers.ModelSerializer):

    class Meta:
        model = OrganizationInvitation
        fields = [
            'id',
            'organization',
            'email',
            'token',
            'status',
            'expires_at',
            'created_at'
        ]

        read_only_fields = fields

   