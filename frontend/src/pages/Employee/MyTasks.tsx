import React, { useState, useEffect, useMemo } from "react";
import type { Task, TaskStatus } from "../../types/task";
import { getMyTasks, updateTaskStatus } from "../../services/taskService";
import { useNavigate } from "react-router-dom";
import "./MyTasks.css";

const dateOptions: Intl.DateTimeFormatOptions = {
  day: "2-digit",
  month: "short",
  year: "numeric",
};

const MyTasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusUpdating, setStatusUpdating] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const navigate = useNavigate();

  const getTask = async () => {
    try {
      setError("");
      setLoading(true);
      const response = await getMyTasks();
      console.log(response);
      setTasks(response);
    } catch (e) {
      console.log(e);
      setError("Failed to load your assigned tasks.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: number, status: TaskStatus) => {
    try {
      setError("");
      setStatusUpdating(true);
      await updateTaskStatus(id, status);

      setTasks((previousTask) =>
        previousTask.map((task) =>
          task.id === id ? { ...task, status: status } : task
        )
      );
    } catch (e: unknown) {
      console.log("API error:", e);
      setError("Could not update task status. Please try again.");
    } finally {
      setStatusUpdating(false);
    }
  };

  useEffect(() => {
    getTask();
  }, []);

  const taskCountLabel = useMemo(() => {
    if (loading) return "Loading...";
    return `My Assigned Tasks: ${tasks.length}`;
  }, [loading, tasks.length]);

  const formatLabel = (value?: string) =>
    value ? value.replace(/_/g, " ").toLowerCase() : "—";

  const getStatusClass = (status?: string) => {
    switch (status) {
      case "COMPLETED":
        return "mt-badge mt-badge-completed";
      case "IN_PROGRESS":
        return "mt-badge mt-badge-progress";
      case "PENDING":
      default:
        return "mt-badge mt-badge-pending";
    }
  };

  const getPriorityClass = (priority?: string) => {
    switch (priority?.toUpperCase()) {
      case "HIGH":
      case "URGENT":
        return "mt-priority mt-priority-high";
      case "MEDIUM":
        return "mt-priority mt-priority-medium";
      case "LOW":
      default:
        return "mt-priority mt-priority-low";
    }
  };

  return (
    <div className="mt-page">
      {/* Page Header */}
      <div className="mt-header">
        <div>
          <h1 className="mt-title">My Tasks</h1>
          <p className="mt-subtitle">{taskCountLabel}</p>
        </div>

        <button
          type="button"
          onClick={getTask}
          disabled={loading || statusUpdating}
          className="mt-refresh-btn"
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {error && (
        <div className="mt-alert-error" role="alert">
          {error}
        </div>
      )}

      {/* Main Content Card */}
      <section className="mt-card">
        {loading ? (
          <div className="mt-state-box">
            <p className="mt-state-text">Loading...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="mt-state-box">
            <p className="mt-state-text">No tasks assigned to you yet.</p>
          </div>
        ) : (
          <div className="mt-table-wrapper">
            <table className="mt-table">
              <thead>
                <tr>
                  <th>Task Title</th>
                  <th>Description</th>
                  <th>Assigned By</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Deadline</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => {
                  const creator = task.created_by_username || "Team Lead";
                  const isCompleted = task.status === "COMPLETED";

                  return (
                    <tr key={task.id}>
                      <td>
                        <button
                          type="button"
                          className="mt-task-link"
                          onClick={() =>
                            navigate(`/dashboard/my-tasks/${task.id}`, {
                              state: { task },
                            })
                          }
                        >
                          {task.title}
                        </button>
                      </td>

                      <td className="mt-desc-cell" title={task.description}>
                        {task.description || "—"}
                      </td>

                      <td>
                        <div className="mt-user-cell">
                          <span className="mt-avatar" aria-hidden="true">
                            {creator.charAt(0).toUpperCase()}
                          </span>
                          <span>{creator}</span>
                        </div>
                      </td>

                      <td>
                        <span className={getPriorityClass(task.priority)}>
                          <span className="mt-priority-dot" />
                          {formatLabel(task.priority)}
                        </span>
                      </td>

                      <td>
                        <span className={getStatusClass(task.status)}>
                          {formatLabel(task.status)}
                        </span>
                      </td>

                      <td className="mt-date-cell">
                        {task.deadline
                          ? new Date(task.deadline).toLocaleDateString(
                              "en-GB",
                              dateOptions
                            )
                          : "—"}
                      </td>

                      <td>
                        <select
                          name="status"
                          value={task.status}
                          id={`status-${task.id}`}
                          aria-label={`Update status for ${task.title}`}
                          className="mt-status-select"
                          disabled={statusUpdating || isCompleted}
                          onChange={(e) => {
                            const currentStatus = e.target.value as TaskStatus;
                            handleStatusUpdate(task.id, currentStatus);
                          }}
                        >
                          <option value="PENDING">PENDING</option>
                          <option value="IN_PROGRESS">IN_PROGRESS</option>
                          <option value="COMPLETED">COMPLETED</option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default MyTasks;