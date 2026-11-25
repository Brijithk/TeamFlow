
from django.urls import path
from .views import (
    ProjectCreateView,
    MyProjectsView,
    ProjectMemberManagementView,
    ProjectMemberRoleUpdateView,
ProjectMemberRemoveView,
)
urlpatterns = [
    path(
        'projects/',
        ProjectCreateView.as_view(),
        name='project-create'
    ),
        path(
        'my-projects/',
        MyProjectsView.as_view(),
        name='my-projects'
    ),
        path(
        'projects/<int:project_id>/members/',
        ProjectMemberManagementView.as_view(),
        name='project-members'
    ),

    path(
    '<int:project_id>/members/<int:membership_id>/role/',
    ProjectMemberRoleUpdateView.as_view(),
    name='project-member-role-update'
),

path(
    '<int:project_id>/members/<int:membership_id>/remove/',
    ProjectMemberRemoveView.as_view(),
    name='project-member-remove'
),
]
