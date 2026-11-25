
from rest_framework import serializers
from .models import TaskComment


class TaskCommentSerializer(serializers.ModelSerializer):

    username = serializers.CharField(
        source='user.username',
        read_only=True
    )

    class Meta:
        model = TaskComment

        fields = [
            'id',
            'task',
            'user',
            'username',
            'content',
            'created_at',
            'updated_at'
        ]

        read_only_fields = [
            'id',
            'task',
            'user',
            'username',
            'created_at',
            'updated_at'
        ]

    def validate_content(self, value):

        if not value.strip():
            raise serializers.ValidationError(
                'Comment cannot be empty.'
            )

        return value.strip()
