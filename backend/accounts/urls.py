from django.urls import path
from .views import RegisterAPIView ,LogoutAPIView,CreateEmployeeAPIView
from .views import csrf_token_view ,CurrentUserApiView ,EmployeeListAPIView
from .views import (
    OrganizationCreateView,
    MyOrganizationsView,
    OrganizationInviteView,
    AcceptOrganizationInvitationView
)
urlpatterns = [
    path('register/', RegisterAPIView.as_view(), name='register'),
    path('csrf/',csrf_token_view ,name='csrf'),
    path('me/',CurrentUserApiView.as_view(),name='currentUserInfo'),
    path('logout/',LogoutAPIView.as_view(),name='logout'),
    path('employees/',EmployeeListAPIView.as_view(),name='employeeList'),
    path('team-members/create/',CreateEmployeeAPIView.as_view(),name='create-employee'),
     path(
        'organizations/',
        OrganizationCreateView.as_view(),
        name='organization-create'
    ),
        path(
        'my-organizations/',
        MyOrganizationsView.as_view(),
        name='my-organizations'
    ),
    path(
        'organizations/invite/',
        OrganizationInviteView.as_view(),
        name='organization-invite'
    ),

    path(
        'invitations/<uuid:token>/accept/',
        AcceptOrganizationInvitationView.as_view(),
        name='accept-organization-invitation'
    ),
]