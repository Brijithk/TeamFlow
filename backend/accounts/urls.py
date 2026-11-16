from django.urls import path
from .views import RegisterAPIView ,LogoutAPIView
from .views import csrf_token_view ,CurrentUserApiView ,EmployeeListAPIView
urlpatterns = [
    path('register/', RegisterAPIView.as_view(), name='register'),
    path('csrf/',csrf_token_view ,name='csrf'),
    path('me/',CurrentUserApiView.as_view(),name='currentUserInfo'),
    path('logout/',LogoutAPIView.as_view(),name='logout'),
    path('employees/',EmployeeListAPIView.as_view(),name='employeeList'),
]