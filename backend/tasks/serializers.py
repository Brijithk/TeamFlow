from rest_framework import serializers
from .models import Task, TaskHistory
from accounts.models import User
from projects.models import ProjectMembership


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


class ProjectTaskSerializer(serializers.ModelSerializer):

    assigned_username = serializers.CharField(
        source='assigned_to.username',
        read_only=True
    )

    class Meta:
        model = Task

        fields = [
            'id',
            'project',
            'title',
            'description',
            'priority',
            'status',
            'deadline',
            'created_by',
            'assigned_to',
            'assigned_username',
            'created_at',
            'updated_at'
        ]

        read_only_fields = [
            'id',
            'project',
            'created_by',
            'created_at',
            'updated_at'
        ]

    def validate_assigned_to(self, user):

        project = self.context['project']

        is_project_member = ProjectMembership.objects.filter(
            project=project,
            user=user
        ).exists()

        if not is_project_member:
            raise serializers.ValidationError(
                'The assigned user must be a member of this project.'
            )

        return user

    def validate_status(self, value):

        if value != Task.Status.TO_DO:
            raise serializers.ValidationError(
                'New tasks must start with To Do status.'
            )

        return value


class TaskDetailsSerializer(serializers.ModelSerializer):

    assigned_username = serializers.CharField(
        source='assigned_to.username',
        read_only=True
    )

    assigned_email = serializers.EmailField(
        source='assigned_to.email',
        read_only=True
    )

    creator_username = serializers.CharField(
        source='created_by.username',
        read_only=True
    )

    project_name = serializers.CharField(
        source='project.name',
        read_only=True
    )

    project_key = serializers.CharField(
        source='project.key',
        read_only=True
    )

    class Meta:
        model = Task

        fields = [
            'id',
            'title',
            'description',
            'project',
            'project_name',
            'project_key',
            'assigned_to',
            'assigned_username',
            'assigned_email',
            'created_by',
            'creator_username',
            'priority',
            'status',
            'deadline',
            'created_at',
            'updated_at'
        ]



class TaskUpdateSerializer(serializers.ModelSerializer):

    class Meta:
        model = Task

        fields = [
            'title',
            'description',
            'priority',
            'deadline',
            'assigned_to'
        ]

    def validate_assigned_to(self, user):

        task = self.instance

        is_member = ProjectMembership.objects.filter(
            project=task.project,
            user=user
        ).exists()

        if not is_member:
            raise serializers.ValidationError(
                'Assigned user must belong to this project.'
            )

        return user



class TaskStatusSerializer(serializers.Serializer):

    status = serializers.ChoiceField(
        choices=Task.Status.choices
    )

    feedback = serializers.CharField(
        required=False,
        allow_blank=True
    )
