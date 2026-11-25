from rest_framework import serializers
from .models import Task


class KanbanTaskSerializer(serializers.ModelSerializer):
    assigned_username = serializers.CharField(
        source='assigned_to.username',
        read_only=True
    )

    class Meta:
        model = Task
        fields = [
            'id',
            'title',
            'description',
            'priority',
            'status',
            'deadline',
            'assigned_to',
            'assigned_username',
            'created_at',
            'updated_at',
        ]