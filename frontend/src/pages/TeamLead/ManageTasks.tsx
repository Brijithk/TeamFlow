import React, { useState, useEffect } from "react";
import { getTeamTasks, deleteTask } from "../../services/taskService";
import type { Task } from "../../types/task";
import axios from "axios";
import { useNavigate } from "react-router";
import "./ManageTasks.css";

const dateOptions: Intl.DateTimeFormatOptions = {
  day: "2-digit",
  month: "short",
  year: "numeric",
};

const ManageTasks: React.FC = () => {
  const [taskList, setTaskList] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [deleting, setDeleting] = useState<boolean>(false);
  const navigate = useNavigate();

  const getAllTask = async () => {
    try {
      setError("");
      setLoading(true);
      const response = await getTeamTasks();
      setTaskList(response);
    } catch (e: unknown) {
      if (axios.isAxiosError(e)) {
        console.log("API error:", e.response?.data);
        setError("API error");
      } else {
        console.log("Unexpected error:", e);
        setError("Unexpected error");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllTask();
  }, []);

  const performDelete = async (id: number) => {
    try {
      setDeleting(true);
      await deleteTask(id);
      const filteredTask = taskList.filter((val) => val.id !== id);
      setTaskList(filteredTask);
    } catch (e) {
      console.log(e);
      setError("Failed to delete task.");
    } finally {
      setDeleting(false);
    }
  };

  const formatLabel = (value?: string) =>
    value ? value.replace(/_/g, " ").toLowerCase() : "—";

  const formatDate = (value?: string) => {
    if (!value) return "—";
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime())
      ? value
      : parsed.toLocaleDateString("en-GB", dateOptions);
  };

  const getStatusClass = (status?: string) => {
    switch (status) {
      case "COMPLETED":
        return "mtk-badge mtk-badge-completed";
      case "IN_PROGRESS":
        return "mtk-badge mtk-badge-progress";
      case "PENDING":
      default:
        return "mtk-badge mtk-badge-pending";
    }
  };

  const getPriorityClass = (priority?: string) => {
    switch (priority?.toUpperCase()) {
      case "HIGH":
      case "URGENT":
        return "mtk-priority mtk-priority-high";
      case "MEDIUM":
        return "mtk-priority mtk-priority-medium";
      case "LOW":
      default:
        return "mtk-priority mtk-priority-low";
    }
  };

  return (
    <div className="mtk-page">
      {/* Page Header */}
      <div className="mtk-header">
        <div>
          <h1 className="mtk-title">Manage Tasks</h1>
          <p className="mtk-subtitle">
            {loading
              ? "Loading team tasks..."
              : `Total Team Tasks: ${taskList.length}`}
          </p>
        </div>

        <div className="mtk-header-actions">
          <button
            type="button"
            onClick={getAllTask}
            disabled={loading || deleting}
            className="mtk-secondary-btn"
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/dashboard/tasks/create")}
            className="mtk-primary-btn"
          >
            + Create Task
          </button>
        </div>
      </div>

      {/* Main Card */}
      <section className="mtk-card">
        {loading ? (
          <div className="mtk-state-box">
            <p className="mtk-state-text">Loading tasks....</p>
          </div>
        ) : error ? (
          <div className="mtk-state-box mtk-state-error">
            <p className="mtk-state-text">{error}</p>
          </div>
        ) : taskList.length === 0 ? (
          <div className="mtk-state-box">
            <p className="mtk-state-text">No tasks found.</p>
          </div>
        ) : (
          <div className="mtk-table-wrapper">
            <table className="mtk-table">
              <thead>
                <tr>
                  <th>Task Title</th>
                  <th>Assigned To</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Due Date</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {taskList.map((task) => {
                  const assignee = task.assigned_to_username || "Unassigned";

                  return (
                    <tr key={task.id}>
                      <td className="mtk-task-cell">{task.title}</td>

                      <td>
                        <div className="mtk-user-cell">
                          <span className="mtk-avatar" aria-hidden="true">
                            {assignee.charAt(0).toUpperCase()}
                          </span>
                          <span>{assignee}</span>
                        </div>
                      </td>

                      <td>
                        <span className={getPriorityClass(task.priority)}>
                          <span className="mtk-priority-dot" />
                          {formatLabel(task.priority)}
                        </span>
                      </td>

                      <td>
                        <span className={getStatusClass(task.status)}>
                          {formatLabel(task.status)}
                        </span>
                      </td>

                      <td className="mtk-date-cell">
                        {formatDate(task.deadline)}
                      </td>

                      <td>
                        <div className="mtk-actions-group">
                          <button
                            type="button"
                            className="mtk-edit-btn"
                            disabled={deleting}
                            onClick={() => {
                              navigate("/dashboard/tasks/create", {
                                state: {
                                  task: task,
                                },
                              });
                            }}
                          >
                            edit
                          </button>

                          <button
                            type="button"
                            className="mtk-delete-btn"
                            disabled={deleting}
                            onClick={() => performDelete(task.id)}
                          >
                            delete
                          </button>
                        </div>
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

export default ManageTasks;