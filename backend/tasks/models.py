from django.db import models
from django.conf import settings


class Task(models.Model):

    class Priority(models.TextChoices):
        LOW = 'LOW', 'Low'
        MEDIUM = 'MEDIUM', 'Medium'
        HIGH = 'HIGH', 'High'
        CRITICAL = 'CRITICAL', 'Critical'

    class Status(models.TextChoices):
        TO_DO = 'TO_DO', 'To Do'
        IN_PROGRESS = 'IN_PROGRESS', 'In Progress'
        IN_REVIEW = 'IN_REVIEW', 'In Review'
        DONE = 'DONE', 'Done'

    project = models.ForeignKey(
        'projects.Project',
        on_delete=models.CASCADE,
        related_name='tasks',
        null=True,
        blank=True
    )

    title = models.CharField(max_length=200)

    description = models.TextField(blank=True)

    priority = models.CharField(
        max_length=10,
        choices=Priority.choices,
        default=Priority.MEDIUM
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.TO_DO
    )

    deadline = models.DateField(null=True, blank=True)

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='created_tasks'
    )

    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='assigned_tasks'
    )

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} - {self.project}"


class TaskHistory(models.Model):
    task = models.ForeignKey(
        Task,
        on_delete=models.CASCADE,
        related_name='history'
    )

    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='task_updates'
    )

    old_status = models.CharField(
        max_length=20,
        choices=Task.Status.choices,
        blank=True
    )

    new_status = models.CharField(
        max_length=20,
        choices=Task.Status.choices
    )

    changed_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.task.title}: {self.old_status} -> {self.new_status}"



class TaskComment(models.Model):

    task = models.ForeignKey(
        Task,
        on_delete=models.CASCADE,
        related_name='comments'
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='task_comments'
    )

    content = models.TextField()

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"Comment by {self.user.username} on {self.task.title}"



class TaskActivity(models.Model):

    class Action(models.TextChoices):
        CREATED = 'CREATED', 'Task Created'
        ASSIGNED = 'ASSIGNED', 'Task Assigned'
        STATUS_CHANGED = 'STATUS_CHANGED', 'Status Changed'
        PRIORITY_CHANGED = 'PRIORITY_CHANGED', 'Priority Changed'
        DEADLINE_CHANGED = 'DEADLINE_CHANGED', 'Deadline Changed'
        APPROVED = 'APPROVED', 'Task Approved'

    task = models.ForeignKey(
        Task,
        on_delete=models.CASCADE,
        related_name='activities'
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='task_activities'
    )

    action = models.CharField(
        max_length=30,
        choices=Action.choices
    )

    description = models.TextField()

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.task.title} - {self.action}"




     