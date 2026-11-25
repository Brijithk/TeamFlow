from django.db import models
from django.conf import settings


class Project(models.Model):

    class Status(models.TextChoices):
        PLANNING = 'PLANNING', 'Planning'
        ACTIVE = 'ACTIVE', 'Active'
        ON_HOLD = 'ON_HOLD', 'On Hold'
        COMPLETED = 'COMPLETED', 'Completed'
        CANCELLED = 'CANCELLED', 'Cancelled'

    organization = models.ForeignKey(
        'accounts.Organization',
        on_delete=models.CASCADE,
        related_name='projects'
    )

    name = models.CharField(max_length=200)

    key = models.CharField(max_length=10)

    description = models.TextField(blank=True)

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PLANNING
    )

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='created_projects'
    )

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['organization', 'key'],
                name='unique_project_key_per_organization'
            )
        ]

    def __str__(self):
        return f"{self.organization.name} - {self.name} ({self.key})"

class ProjectMembership(models.Model):

    class Role(models.TextChoices):
        MANAGER = 'MANAGER', 'Project Manager'
        MEMBER = 'MEMBER', 'Team Member'
        REVIEWER = 'REVIEWER', 'Reviewer'

    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name='memberships'
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='project_memberships'
    )

    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.MEMBER
    )

    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['project', 'user'],
                name='unique_user_per_project'
            )
        ]

    def __str__(self):
        return f"{self.user.username} - {self.project.name} - {self.role}"