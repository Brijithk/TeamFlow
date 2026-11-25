from rest_framework import serializers


class ProjectDashboardSerializer(serializers.Serializer):
    total_tasks = serializers.IntegerField()
    todo_tasks = serializers.IntegerField()
    in_progress_tasks = serializers.IntegerField()
    in_review_tasks = serializers.IntegerField()
    completed_tasks = serializers.IntegerField()
    overdue_tasks = serializers.IntegerField()
    completion_percentage = serializers.FloatField()