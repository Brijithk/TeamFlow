
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils.text import slugify

from accounts.models import User, Organization, OrganizationMembership


class Command(BaseCommand):
    help = "Create personal workspaces for users who don't have one"

    @transaction.atomic
    def handle(self, *args, **options):

        created_count = 0

        for user in User.objects.all():

            # Skip users who already belong to an organization
            if OrganizationMembership.objects.filter(user=user).exists():
                continue

            organization_name = f"{user.username}'s Workspace"
            base_slug = slugify(organization_name)
            slug = base_slug
            counter = 1

            while Organization.objects.filter(slug=slug).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1

            organization = Organization.objects.create(
                name=organization_name,
                slug=slug,
                created_by=user
            )

            OrganizationMembership.objects.create(
                organization=organization,
                user=user,
                role=OrganizationMembership.Role.ADMIN
            )

            created_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Created {created_count} personal workspaces."
            )
        )
