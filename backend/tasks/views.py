from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import PermissionDenied
from accounts.permissions import IsTeamLead, IsEmployee
from .models import Task, TaskHistory,TaskActivity,TaskComment ,Task
from .serializers import TaskUpdateSerializer,TaskDetailsSerializer,TaskSerializer, TaskStatusUpdateSerializer ,TaskHistorySerializer
from projects.models import Project, ProjectMembership
from .serializers import ProjectTaskSerializer
from django.db.models import Q,Count
from .comment_serializers import TaskCommentSerializer
from .activity_serializers import TaskActivitySerializer
from .board_serializers import KanbanTaskSerializer
from .activity_utils import create_task_activity
from django.utils import timezone
from .dashboard_serializers import ProjectDashboardSerializer
from django.db import transaction


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


class ProjectTaskCreateView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request, project_id):

        project = get_object_or_404(
            Project,
            id=project_id
        )

        is_manager = ProjectMembership.objects.filter(
            project=project,
            user=request.user,
            role=ProjectMembership.Role.MANAGER
        ).exists()

        if not is_manager:
            raise PermissionDenied(
                'Only project managers can create tasks.'
            )

        serializer = ProjectTaskSerializer(
            data=request.data,
            context={'project': project}
        )

        serializer.is_valid(raise_exception=True)

        task = serializer.save(
            project=project,
            created_by=request.user
        )

        create_task_activity(
            task=task,
            user=request.user,
            action=TaskActivity.Action.CREATED,
            description=f"Task '{task.title}' was created."
        )

        return Response(
            ProjectTaskSerializer(task).data,
            status=status.HTTP_201_CREATED
        )


class ProjectTaskListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, project_id):

        membership = ProjectMembership.objects.filter(
            project_id=project_id,
            user=request.user
        ).first()

        if not membership:
            raise PermissionDenied(
                "You are not a member of this project."
            )

        tasks = Task.objects.filter(
            project_id=project_id
        ).select_related(
            'created_by',
            'assigned_to',
            'project'
        )

        # Members can see only their assigned tasks
        if membership.role != ProjectMembership.Role.MANAGER:
            tasks = tasks.filter(assigned_to=request.user)

        # Search by task title or description
        search = request.query_params.get('search')

        if search:
            tasks = tasks.filter(
                Q(title__icontains=search) |
                Q(description__icontains=search)
            )

        # Filter by status
        status = request.query_params.get('status')

        if status:
            if status not in Task.Status.values:
                return Response(
                    {"error": "Invalid task status."},
                    status=400
                )

            tasks = tasks.filter(status=status)

        # Filter by priority
        priority = request.query_params.get('priority')

        if priority:
            if priority not in Task.Priority.values:
                return Response(
                    {"error": "Invalid task priority."},
                    status=400
                )

            tasks = tasks.filter(priority=priority)

        # Filter by assigned user
        assigned_to = request.query_params.get('assigned_to')

        if assigned_to:
            if not assigned_to.isdigit():
                return Response(
                    {"error": "Invalid assigned user ID."},
                    status=400
                )

            tasks = tasks.filter(assigned_to_id=int(assigned_to))

        # Filter by deadline
        deadline = request.query_params.get('deadline')

        if deadline:
            tasks = tasks.filter(deadline=deadline)

        tasks = tasks.order_by('-created_at')

        serializer = ProjectTaskSerializer(
            tasks,
            many=True
        )

        return Response(serializer.data)

class TaskDetailsView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request, project_id, task_id):

        task = get_object_or_404(
            Task.objects.select_related(
                'project',
                'created_by',
                'assigned_to'
            ),
            id=task_id,
            project_id=project_id
        )

        membership = ProjectMembership.objects.filter(
            project_id=project_id,
            user=request.user
        ).first()

        if not membership:
            raise PermissionDenied(
                'You are not a member of this project.'
            )

        if (
            membership.role != ProjectMembership.Role.MANAGER
            and task.assigned_to_id != request.user.id
        ):
            raise PermissionDenied(
                'You cannot view this task.'
            )

        serializer = TaskDetailsSerializer(task)

        return Response(serializer.data)

class TaskUpdateView(APIView):

    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def patch(self, request, project_id, task_id):

        task = get_object_or_404(
            Task.objects.select_for_update(),
            id=task_id,
            project_id=project_id
        )

        membership = ProjectMembership.objects.filter(
            project_id=project_id,
            user=request.user
        ).first()

        if not membership:
            raise PermissionDenied(
                'You are not a project member.'
            )

        is_manager = (
            membership.role == ProjectMembership.Role.MANAGER
        )

        is_assignee = task.assigned_to_id == request.user.id

        if not is_manager and not is_assignee:
            raise PermissionDenied(
                'You cannot update this task.'
            )

        if not is_manager and task.status == Task.Status.DONE:
            raise PermissionDenied(
                'Completed tasks cannot be edited by members.'
            )

        old_assignee = task.assigned_to

        serializer = TaskUpdateSerializer(
            task,
            data=request.data,
            partial=True
        )

        serializer.is_valid(raise_exception=True)
        old_priority = task.priority
        old_deadline = task.deadline
        updated_task = serializer.save()
        
        if old_priority != updated_task.priority:
            create_task_activity(
                task=updated_task,
                user=request.user,
                action=TaskActivity.Action.PRIORITY_CHANGED,
                description=(
                    f"Priority changed from "
                    f"{old_priority} to "
                    f"{updated_task.priority}."
                )
            )
        if old_assignee != updated_task.assigned_to:
            create_task_activity(
                task=updated_task,
                user=request.user,
                action=TaskActivity.Action.ASSIGNED,
                description=(
                    f"Task reassigned from "
                    f"{old_assignee.username} to "
                    f"{updated_task.assigned_to.username}."
                )
            )
        
        if old_deadline != updated_task.deadline:
            create_task_activity(
                task=updated_task,
                user=request.user,
                action=TaskActivity.Action.DEADLINE_CHANGED,
                description=(
                    f"Deadline changed from "
                    f"{old_deadline} to "
                    f"{updated_task.deadline}."
                )
            )

        return Response(
            TaskDetailsSerializer(task).data,
            status=status.HTTP_200_OK
        )


class TaskStatusUpdateView(APIView):

    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def patch(self, request, project_id, task_id):

        task = get_object_or_404(
            Task.objects.select_for_update(),
            id=task_id,
            project_id=project_id
        )

        membership = ProjectMembership.objects.filter(
            project_id=project_id,
            user=request.user
        ).first()

        if not membership:
            raise PermissionDenied(
                'You are not a project member.'
            )

        serializer = TaskStatusSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        new_status = serializer.validated_data['status']
        feedback = serializer.validated_data.get('feedback', '')

        old_status = task.status

        is_manager = (
            membership.role == ProjectMembership.Role.MANAGER
        )

        is_reviewer = (
            membership.role == ProjectMembership.Role.REVIEWER
        )

        is_assignee = task.assigned_to_id == request.user.id

        if new_status == old_status:
            raise ValidationError('Task already has this status.')

        if new_status == Task.Status.IN_PROGRESS:
            if not is_assignee:
                raise PermissionDenied(
                    'Only the assigned member can start or resume this task.'
                )

            if old_status not in [
                Task.Status.TO_DO,
                Task.Status.IN_REVIEW
            ]:
                raise ValidationError(
                    'Invalid transition to In Progress.'
                )

        elif new_status == Task.Status.IN_REVIEW:
            if not is_assignee:
                raise PermissionDenied(
                    'Only the assigned member can submit work for review.'
                )

            if old_status != Task.Status.IN_PROGRESS:
                raise ValidationError(
                    'Only In Progress tasks can be submitted for review.'
                )

        elif new_status == Task.Status.DONE:
            if not (is_manager or is_reviewer):
                raise PermissionDenied(
                    'Only a Project Manager or Reviewer can approve a task.'
                )

            if old_status != Task.Status.IN_REVIEW:
                raise ValidationError(
                    'Only tasks in review can be approved.'
                )

        elif new_status == Task.Status.TO_DO:
            if not is_manager:
                raise PermissionDenied(
                    'Only a Project Manager can move a task to To Do.'
                )

            if old_status not in [
                Task.Status.IN_PROGRESS,
                Task.Status.IN_REVIEW
            ]:
                raise ValidationError(
                    'Invalid transition to To Do.'
                )

        task.status = new_status
        task.save(update_fields=['status', 'updated_at'])

        TaskHistory.objects.create(
            task=task,
            updated_by=request.user,
            old_status=old_status,
            new_status=new_status
        )

        TaskActivity.objects.create(
            task=task,
            user=request.user,
            action=(
                TaskActivity.Action.APPROVED
                if new_status == Task.Status.DONE
                else TaskActivity.Action.STATUS_CHANGED
            ),
            description=(
                f"Changed status from {old_status} to {new_status}."
                + (f" Feedback: {feedback}" if feedback else "")
            )
        )

        return Response(
            TaskDetailsSerializer(task).data,
            status=status.HTTP_200_OK
        )


class TaskCommentListCreateView(APIView):

    permission_classes = [IsAuthenticated]

    def get_task_and_membership(self, request, project_id, task_id):

        task = get_object_or_404(
            Task,
            id=task_id,
            project_id=project_id
        )

        membership = ProjectMembership.objects.filter(
            project_id=project_id,
            user=request.user
        ).first()

        if not membership:
            raise PermissionDenied(
                'You are not a member of this project.'
            )

        if (
            membership.role != ProjectMembership.Role.MANAGER
            and task.assigned_to_id != request.user.id
        ):
            raise PermissionDenied(
                'You cannot access this task.'
            )

        return task, membership

    def get(self, request, project_id, task_id):

        task, membership = self.get_task_and_membership(
            request,
            project_id,
            task_id
        )

        comments = task.comments.select_related('user').all()

        serializer = TaskCommentSerializer(
            comments,
            many=True
        )

        return Response(serializer.data)

    def post(self, request, project_id, task_id):

        task, membership = self.get_task_and_membership(
            request,
            project_id,
            task_id
        )

        serializer = TaskCommentSerializer(
            data=request.data
        )

        serializer.is_valid(raise_exception=True)

        comment = serializer.save(
            task=task,
            user=request.user
        )

        return Response(
            TaskCommentSerializer(comment).data,
            status=status.HTTP_201_CREATED
        )


class TaskCommentDetailView(APIView):

    permission_classes = [IsAuthenticated]

    def get_comment(self, request, project_id, task_id, comment_id):

        task = get_object_or_404(
            Task,
            id=task_id,
            project_id=project_id
        )

        membership = ProjectMembership.objects.filter(
            project=task.project,
            user=request.user
        ).first()

        if not membership:
            raise PermissionDenied(
                'You are not a project member.'
            )

        comment = get_object_or_404(
            TaskComment,
            id=comment_id,
            task=task
        )

        if (
            membership.role != ProjectMembership.Role.MANAGER
            and comment.user_id != request.user.id
        ):
            raise PermissionDenied(
                'You can only manage your own comments.'
            )

        return comment, membership

    def patch(self, request, project_id, task_id, comment_id):

        comment, membership = self.get_comment(
            request, project_id, task_id, comment_id
        )

        if comment.user_id != request.user.id:
            raise PermissionDenied(
                'You can only edit your own comments.'
            )

        serializer = TaskCommentSerializer(
            comment,
            data=request.data,
            partial=True
        )

        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(serializer.data)

    def delete(self, request, project_id, task_id, comment_id):

        comment, membership = self.get_comment(
            request, project_id, task_id, comment_id
        )

        comment.delete()

        return Response(
            {'message': 'Comment deleted successfully.'},
            status=status.HTTP_204_NO_CONTENT
        )


class TaskActivityListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, project_id, task_id):

        task = get_object_or_404(
            Task.objects.select_related('project'),
            id=task_id,
            project_id=project_id
        )

        membership = get_object_or_404(
            ProjectMembership,
            project_id=project_id,
            user=request.user
        )


        if (
            membership.role != ProjectMembership.Role.MANAGER
            and task.assigned_to_id != request.user.id
        ):
            raise PermissionDenied(
                "You cannot view this task's activity."
            )

        activities = task.activities.select_related('user').all()

        serializer = TaskActivitySerializer(
            activities,
            many=True
        )

        return Response(serializer.data)


class ProjectKanbanBoardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, project_id):

        # Check whether the project exists
        membership = ProjectMembership.objects.filter(
            project_id=project_id,
            user=request.user
        ).select_related('project').first()

        if not membership:
            raise PermissionDenied(
                "You are not a member of this project."
            )

        # Get tasks belonging to this project
        tasks = Task.objects.filter(
            project_id=project_id
        ).select_related('assigned_to')

        # Members can see only their assigned tasks
        if membership.role != ProjectMembership.Role.MANAGER:
            tasks = tasks.filter(
                assigned_to=request.user
            )

        # Group tasks by workflow status
        board = {}

        for status_value, status_label in Task.Status.choices:

            status_tasks = tasks.filter(
                status=status_value
            ).order_by('-created_at')

            serializer = KanbanTaskSerializer(
                status_tasks,
                many=True
            )

            board[status_value] = {
                'label': status_label,
                'tasks': serializer.data,
                'count': status_tasks.count()
            }

        return Response(board)


class ProjectDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, project_id):

        membership = ProjectMembership.objects.filter(
            project_id=project_id,
            user=request.user
        ).first()

        if not membership:
            raise PermissionDenied(
                "You are not a member of this project."
            )

        tasks = Task.objects.filter(
            project_id=project_id
        )

        # Team members see statistics for their assigned tasks
        if membership.role != ProjectMembership.Role.MANAGER:
            tasks = tasks.filter(
                assigned_to=request.user
            )

        statistics = tasks.aggregate(
            total_tasks=Count('id'),

            todo_tasks=Count(
                'id',
                filter=Q(status=Task.Status.TO_DO)
            ),

            in_progress_tasks=Count(
                'id',
                filter=Q(status=Task.Status.IN_PROGRESS)
            ),

            in_review_tasks=Count(
                'id',
                filter=Q(status=Task.Status.IN_REVIEW)
            ),

            completed_tasks=Count(
                'id',
                filter=Q(status=Task.Status.DONE)
            ),

            overdue_tasks=Count(
                'id',
                filter=Q(
                    deadline__lt=timezone.localdate()
                ) & ~Q(status=Task.Status.DONE)
            )
        )

        total = statistics['total_tasks']
        completed = statistics['completed_tasks']

        statistics['completion_percentage'] = (
            round((completed / total) * 100, 2)
            if total > 0 else 0.0
        )

        serializer = ProjectDashboardSerializer(
            statistics
        )

        return Response(serializer.data)