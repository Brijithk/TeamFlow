import React, { useState, useEffect, useMemo } from "react";
import type { Task } from "../../types/task";
import { getTeamTasks } from "../../services/taskService";
import "./TeamLeadDashboard.css";

const TeamLeadDashboard: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const fetchTeamTasks = async () => {
    try {
      setError("");
      setLoading(true);
      const response = await getTeamTasks();
      setTasks(response);
    } catch (e: unknown) {
      setError("Error while fetching data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamTasks();
  }, []);

  const stats = useMemo(() => {
    const total = tasks.length;
    const pending = tasks.filter((t) => t.status === "PENDING").length;
    const inProgress = tasks.filter((t) => t.status === "IN_PROGRESS").length;
    const completed = tasks.filter((t) => t.status === "COMPLETED").length;
    return { total, pending, inProgress, completed };
  }, [tasks]);

  const recentTasks = useMemo(() => {
    return [...tasks]
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      .slice(0, 5);
  }, [tasks]);

  const formatLabel = (value?: string) =>
    value ? value.replace(/_/g, " ").toLowerCase() : "—";

  const getStatusClass = (status?: string) => {
    switch (status) {
      case "COMPLETED":
        return "badge badge-completed";
      case "IN_PROGRESS":
        return "badge badge-progress";
      case "PENDING":
      default:
        return "badge badge-pending";
    }
  };

  const getPriorityClass = (priority?: string) => {
    switch (priority?.toUpperCase()) {
      case "HIGH":
      case "URGENT":
        return "priority priority-high";
      case "MEDIUM":
        return "priority priority-medium";
      case "LOW":
      default:
        return "priority priority-low";
    }
  };

  return (
    <div className="dashboard-page">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Team Lead Dashboard</h1>
          <p className="page-subtitle">
            Monitor team workload, task progress, and recent activity.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchTeamTasks}
          disabled={loading}
          className="refresh-btn"
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* Summary Cards Grid */}
      <div className="summary-grid">
        <div className="summary-card">
          <span className="summary-label">Total Tasks</span>
          <p className="summary-value">{loading ? "—" : stats.total}</p>
          <span className="summary-meta">All assigned tasks</span>
        </div>

        <div className="summary-card">
          <span className="summary-label">Pending Tasks</span>
          <p className="summary-value summary-value-amber">
            {loading ? "—" : stats.pending}
          </p>
          <span className="summary-meta">Awaiting start</span>
        </div>

        <div className="summary-card">
          <span className="summary-label">In Progress Tasks</span>
          <p className="summary-value summary-value-indigo">
            {loading ? "—" : stats.inProgress}
          </p>
          <span className="summary-meta">Actively worked on</span>
        </div>

        <div className="summary-card">
          <span className="summary-label">Completed Tasks</span>
          <p className="summary-value summary-value-emerald">
            {loading ? "—" : stats.completed}
          </p>
          <span className="summary-meta">Finished & verified</span>
        </div>
      </div>

      {/* Recent Tasks Section */}
      <section className="recent-section">
        <div className="section-header">
          <div>
            <h2 className="section-title">Recent Tasks</h2>
            <p className="section-subtitle">Latest 5 tasks created across your team</p>
          </div>
        </div>

        {loading ? (
          <div className="state-box">
            <p className="state-text">Loading recent tasks...</p>
          </div>
        ) : error ? (
          <div className="state-box state-error">
            <p className="state-text">{error}</p>
          </div>
        ) : recentTasks.length === 0 ? (
          <div className="state-box">
            <p className="state-text">No tasks found.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="tasks-table">
              <thead>
                <tr>
                  <th>Task Title</th>
                  <th>Assigned To</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Due Date</th>
                </tr>
              </thead>
              <tbody>
                {recentTasks.map((task) => {
                  const assignee = task.assigned_to_username || "Unassigned";
                  const avatarInitial = assignee.charAt(0).toUpperCase();

                  return (
                    <tr key={task.id}>
                      <td className="task-title-cell">{task.title}</td>
                      <td>
                        <div className="assignee-cell">
                          <span className="assignee-avatar" aria-hidden="true">
                            {avatarInitial}
                          </span>
                          <span>{assignee}</span>
                        </div>
                      </td>
                      <td>
                        <span className={getPriorityClass(task.priority)}>
                          <span className="priority-dot" />
                          {formatLabel(task.priority)}
                        </span>
                      </td>
                      <td>
                        <span className={getStatusClass(task.status)}>
                          {formatLabel(task.status)}
                        </span>
                      </td>
                      <td className="date-cell">{task.deadline || "—"}</td>
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

export default TeamLeadDashboard;