from .models import TaskActivity


def create_task_activity(task, user, action, description):
    return TaskActivity.objects.create(
        task=task,
        user=user,
        action=action,
        description=description
    )