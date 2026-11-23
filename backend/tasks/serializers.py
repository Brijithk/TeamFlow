from rest_framework import serializers
from .models import Task, TaskHistory
from accounts.models import User


class TaskSerializer(serializers.ModelSerializer):

    assigned_to_username = serializers.CharField(source='assigned_to.username', read_only=True)
    created_by_username = serializers.CharField(
    source='created_by.username',
    read_only=True
    )
    class Meta:
        model = Task
        fields = '__all__'
        read_only_fields = [
            'id',
            'created_by',
            'status',
            'created_at',
            'updated_at',
            'assigned_to_username',
            'created_by_username'
        ]

    def validate_assigned_to(self, value):
        if value.role != User.Role.EMPLOYEE:
            raise serializers.ValidationError(
                "Tasks can only be assigned to employees."
            )
        return value


class TaskHistorySerializer(serializers.ModelSerializer):
    
    task_title=serializers.CharField(
        read_only=True,
        source="task.title"
    )
    updated_by_username=serializers.CharField(
        read_only=True,
        source="updated_by.username"
    )
    class Meta:
        model = TaskHistory
        fields = '__all__'
        read_only_fields=[
            'task_title',
            'updated_by_username']


class TaskStatusUpdateSerializer(serializers.ModelSerializer):

    class Meta:
        model = Task
        fields = ['status']