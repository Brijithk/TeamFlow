from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from accounts.permissions import IsTeamLead, IsEmployee
from .models import Task, TaskHistory
from .serializers import TaskSerializer, TaskStatusUpdateSerializer ,TaskHistorySerializer

from django.db.models import Q

class TeamLeadTaskListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated, IsTeamLead]

    def get_queryset(self):
        return Task.objects.filter(created_by=self.request.user)

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
class TeamLeadTaskDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated, IsTeamLead]

    def get_queryset(self):
        return Task.objects.filter(created_by=self.request.user)

class EmployeeTaskListAPIView(generics.ListAPIView):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated, IsEmployee]

    def get_queryset(self):
        return Task.objects.filter(assigned_to=self.request.user)

class EmployeeTaskStatusUpdateAPIView(generics.UpdateAPIView):
    serializer_class = TaskStatusUpdateSerializer
    permission_classes = [IsAuthenticated, IsEmployee]

    def get_queryset(self):
        return Task.objects.filter(assigned_to=self.request.user)

    def perform_update(self, serializer):
        task = self.get_object()
        old_status = task.status

        updated_task = serializer.save()

        if old_status != updated_task.status:
            TaskHistory.objects.create(
                task=updated_task,
                updated_by=self.request.user,
                old_status=old_status,
                new_status=updated_task.status
            )


class TaskHistoryListAPIView(generics.ListAPIView):
    serializer_class = TaskHistorySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return TaskHistory.objects.filter(
            Q(task__created_by=self.request.user) |
            Q(task__assigned_to=self.request.user)
        ).order_by('-changed_at')