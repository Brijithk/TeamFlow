from django.db import models
from django.contrib.auth.models import AbstractUser
import uuid
from datetime import timedelta
from django.utils import timezone
from django.conf import settings

class User(AbstractUser):

    class Role(models.TextChoices):
        TEAM_LEAD = 'TEAM_LEAD', 'Team Lead'
        EMPLOYEE = 'EMPLOYEE', 'Employee'

    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.EMPLOYEE
    )

    team_lead= models.ForeignKey(
         'self',
         on_delete= models.SET_NULL,
         null=True,
         blank=True,
         related_name="team_members"
    )

    email = models.EmailField(unique=True)

    def __str__(self):
        return f"{self.username} - {self.role}"


class Organization(models.Model):

    name = models.CharField(max_length=150)

    slug = models.SlugField(
        unique=True
    )

    created_by = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name="created_organizations"
    )

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class OrganizationMembership(models.Model):

    class Role(models.TextChoices):
        ADMIN = 'ADMIN', 'Admin'
        MEMBER = 'MEMBER', 'Member'

    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name='memberships'
    )

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='organization_memberships'
    )

    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.MEMBER
    )

    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('organization', 'user')

    def __str__(self):
        return f"{self.user.username} - {self.organization.name} - {self.role}"

def invitation_expiry():
    return timezone.now() + timedelta(days=7)


class OrganizationInvitation(models.Model):

    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        ACCEPTED = 'ACCEPTED', 'Accepted'
        EXPIRED = 'EXPIRED', 'Expired'

    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name='invitations'
    )

    email = models.EmailField()

    invited_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='sent_invitations'
    )

    token = models.UUIDField(
        default=uuid.uuid4,
        unique=True,
        editable=False
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING
    )

    expires_at = models.DateTimeField(
        default=invitation_expiry
    )

    created_at = models.DateTimeField(auto_now_add=True)

    accepted_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.email} - {self.organization.name}"