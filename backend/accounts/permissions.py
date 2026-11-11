from rest_framework.permissions import BasePermission


class IsTeamLead(BasePermission):

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role == 'TEAM_LEAD'
        )


class IsEmployee(BasePermission):

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role == 'EMPLOYEE'
        )