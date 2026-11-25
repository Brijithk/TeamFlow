from rest_framework import serializers
from .models import TaskActivity


class TaskActivitySerializer(serializers.ModelSerializer):
    username = serializers.SerializerMethodField()

    class Meta:
        model = TaskActivity
        fields = [
            'id',
            'task',
            'user',
            'username',
            'action',
            'description',
            'created_at',
        ]

    def get_username(self, obj):
        if obj.user:
            return obj.user.username

        return "Deleted user"

