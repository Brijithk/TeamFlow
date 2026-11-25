from django.contrib import admin
from django.urls import path, include

from accounts.views import CookieTokenObtainPairView 
from accounts.views import CookieTokenRefreshView
urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/accounts/', include('accounts.urls')),
    path('api/accounts/login/', CookieTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/accounts/token/refresh/', CookieTokenRefreshView.as_view(), name='token_refresh'),
    path('api/tasks/', include('tasks.urls')),
    path('api/', include('projects.urls')),
]
