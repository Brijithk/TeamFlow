import React from "react";
import { useLocation, useNavigate } from "react-router";
import type { Task } from "../../types/task";
import "./TaskDetails.css";

interface LocationState {
  task?: Task;
}

const dateOptions: Intl.DateTimeFormatOptions = {
  day: "2-digit",
  month: "short",
  year: "numeric",
};

const TaskDetails: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState | null;
  const selectedTask = state?.task;

  const formatLabel = (value?: string) =>
    value ? value.replace(/_/g, " ").toLowerCase() : "—";

  const getStatusClass = (status?: string) => {
    switch (status) {
      case "COMPLETED":
        return "td-badge td-badge-completed";
      case "IN_PROGRESS":
        return "td-badge td-badge-progress";
      case "PENDING":
      default:
        return "td-badge td-badge-pending";
    }
  };

  const getPriorityClass = (priority?: string) => {
    switch (priority?.toUpperCase()) {
      case "HIGH":
      case "URGENT":
        return "td-priority td-priority-high";
      case "MEDIUM":
        return "td-priority td-priority-medium";
      case "LOW":
      default:
        return "td-priority td-priority-low";
    }
  };

  if (!selectedTask) {
    return (
      <div className="td-page">
        <div className="td-card td-empty-state">
          <h1 className="td-empty-title">Task Details Unavailable</h1>
          <p className="td-empty-text">
            No task data was passed for this view. Go back to your tasks list to
            select a task.
          </p>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="td-back-btn"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  const assignee = selectedTask.created_by_username || "Team Lead";
  const formattedDeadline = selectedTask.deadline
    ? new Date(selectedTask.deadline).toLocaleDateString("en-GB", dateOptions)
    : "—";

  return (
    <div className="td-page">
      {/* Top Action Bar */}
      <div className="td-topbar">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="td-back-btn"
        >
          ← Back
        </button>

        <div className="td-badges-group">
          <span className={getPriorityClass(selectedTask.priority)}>
            <span className="td-priority-dot" />
            {formatLabel(selectedTask.priority)}
          </span>
          <span className={getStatusClass(selectedTask.status)}>
            {formatLabel(selectedTask.status)}
          </span>
        </div>
      </div>

      {/* Main Details Card */}
      <article className="td-card">
        <div className="td-card-header">
          <span className="td-eyebrow">Task Overview</span>
          <h1 className="td-title">{selectedTask.title}</h1>
        </div>

        <div className="td-description-box">
          <h2 className="td-section-label">Description</h2>
          <p className="td-description-text">
            {selectedTask.description || "No description provided for this task."}
          </p>
        </div>

        <div className="td-meta-grid">
          <div className="td-meta-item">
            <span className="td-meta-label">Assigned By</span>
            <div className="td-user-row">
              <span className="td-avatar" aria-hidden="true">
                {assignee.charAt(0).toUpperCase()}
              </span>
              <span className="td-meta-value">{assignee}</span>
            </div>
          </div>

          <div className="td-meta-item">
            <span className="td-meta-label">Priority</span>
            <span className="td-meta-value td-capitalize">
              {formatLabel(selectedTask.priority)}
            </span>
          </div>

          <div className="td-meta-item">
            <span className="td-meta-label">Status</span>
            <span className="td-meta-value td-capitalize">
              {formatLabel(selectedTask.status)}
            </span>
          </div>

          <div className="td-meta-item">
            <span className="td-meta-label">Deadline</span>
            <span className="td-meta-value">{formattedDeadline}</span>
          </div>
        </div>
      </article>
    </div>
  );
};

export default TaskDetails;