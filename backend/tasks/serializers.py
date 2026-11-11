from rest_framework import serializers
from .models import Task, TaskHistory
from accounts.models import User


class TaskSerializer(serializers.ModelSerializer):

    class Meta:
        model = Task
        fields = '__all__'
        read_only_fields = [
            'id',
            'created_by',
            'status',
            'created_at',
            'updated_at'
        ]

    def validate_assigned_to(self, value):
        if value.role != User.Role.EMPLOYEE:
            raise serializers.ValidationError(
                "Tasks can only be assigned to employees."
            )
        return value


class TaskHistorySerializer(serializers.ModelSerializer):

    class Meta:
        model = TaskHistory
        fields = '__all__'


class TaskStatusUpdateSerializer(serializers.ModelSerializer):

    class Meta:
        model = Task
        fields = ['status']