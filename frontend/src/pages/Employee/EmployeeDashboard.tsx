import React, { useState, useEffect, useMemo } from "react";
import type { Task } from "../../types/task";
import { getMyTasks } from "../../services/taskService";
import "./EmployeeDashboard.css";

const dateOptions: Intl.DateTimeFormatOptions = {
  day: "2-digit",
  month: "short",
  year: "numeric",
};

const EmployeeDashboard: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const getTasks = async () => {
    try {
      setError("");
      setLoading(true);
      const response = await getMyTasks();
      setTasks(response);
    } catch (e) {
      setError("Error while fetching api");
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getTasks();
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
    <div className="emp-dashboard-page">
      {/* Page Header */}
      <div className="emp-page-header">
        <div>
          <h1 className="emp-page-title">Employee Dashboard</h1>
          <p className="emp-page-subtitle">
            Track your assigned tasks, deadlines, and daily progress.
          </p>
        </div>
        <button
          type="button"
          onClick={getTasks}
          disabled={loading}
          className="emp-refresh-btn"
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* Summary Cards Grid */}
      <div className="emp-summary-grid">
        <div className="emp-summary-card">
          <span className="emp-summary-label">My Total Tasks</span>
          <p className="emp-summary-value">{loading ? "—" : stats.total}</p>
          <span className="emp-summary-meta">Assigned to you</span>
        </div>

        <div className="emp-summary-card">
          <span className="emp-summary-label">Pending Tasks</span>
          <p className="emp-summary-value emp-value-amber">
            {loading ? "—" : stats.pending}
          </p>
          <span className="emp-summary-meta">Not started yet</span>
        </div>

        <div className="emp-summary-card">
          <span className="emp-summary-label">In Progress Tasks</span>
          <p className="emp-summary-value emp-value-indigo">
            {loading ? "—" : stats.inProgress}
          </p>
          <span className="emp-summary-meta">Currently working</span>
        </div>

        <div className="emp-summary-card">
          <span className="emp-summary-label">Completed Tasks</span>
          <p className="emp-summary-value emp-value-emerald">
            {loading ? "—" : stats.completed}
          </p>
          <span className="emp-summary-meta">Marked complete</span>
        </div>
      </div>

      {/* Recent Tasks Section */}
      <section className="emp-recent-section">
        <div className="emp-section-header">
          <div>
            <h2 className="emp-section-title">Recent Tasks</h2>
            <p className="emp-section-subtitle">
              Your 5 most recently assigned tasks
            </p>
          </div>
        </div>

        {loading ? (
          <div className="emp-state-box">
            <p className="emp-state-text">Loading tasks...</p>
          </div>
        ) : error ? (
          <div className="emp-state-box emp-state-error">
            <p className="emp-state-text">{error}</p>
          </div>
        ) : recentTasks.length === 0 ? (
          <div className="emp-state-box">
            <p className="emp-state-text">No tasks assigned yet.</p>
          </div>
        ) : (
          <div className="emp-table-wrapper">
            <table className="emp-tasks-table">
              <thead>
                <tr>
                  <th>Task Title</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Due Date</th>
                </tr>
              </thead>
              <tbody>
                {recentTasks.map((task) => (
                  <tr key={task.id}>
                    <td className="emp-task-title-cell">{task.title}</td>
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
                    <td className="emp-date-cell">
                      {task.deadline
                        ? new Date(task.deadline).toLocaleDateString(
                            "en-GB",
                            dateOptions
                          )
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default EmployeeDashboard;