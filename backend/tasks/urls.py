from django.urls import path

from .views import (
    TeamLeadTaskListCreateAPIView,
    TeamLeadTaskDetailAPIView,
    EmployeeTaskListAPIView,
    EmployeeTaskStatusUpdateAPIView,
    TaskHistoryListAPIView,
)

urlpatterns = [
    path(
        'team-lead/',
        TeamLeadTaskListCreateAPIView.as_view(),
        name='team-lead-tasks'
    ),
    path(
        'team-lead/<int:pk>/',
        TeamLeadTaskDetailAPIView.as_view(),
        name='team-lead-task-detail'
    ),
    path(
        'employee/',
        EmployeeTaskListAPIView.as_view(),
        name='employee-tasks'
    ),
    path(
        'employee/<int:pk>/status/',
        EmployeeTaskStatusUpdateAPIView.as_view(),
        name='employee-task-status-update'
    ),
    path(
        'history/',
        TaskHistoryListAPIView.as_view(),
        name='task-history'
    ),
]