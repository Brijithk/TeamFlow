import React, { useState, useEffect } from "react";
import type { TaskHistory } from "../../types/task";
import { getTaskHistory } from "../../services/taskService";
import "./TaskHistory.css";

const dateTimeOptions: Intl.DateTimeFormatOptions = {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
};

const TaskHistory: React.FC = () => {
  const [history, setHistory] = useState<TaskHistory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const getHistory = async () => {
    try {
      setError("");
      setLoading(true);
      const response = await getTaskHistory();
      setHistory(response);
    } catch (e) {
      console.log(e);
      setError("Failed to load task history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getHistory();
  }, []);

  const formatLabel = (value?: string) =>
    value ? value.replace(/_/g, " ").toLowerCase() : "—";

  const formatDateTime = (value?: string) => {
    if (!value) return "—";
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime())
      ? value
      : parsed.toLocaleString("en-GB", dateTimeOptions);
  };

  const getStatusClass = (status?: string) => {
    switch (status) {
      case "COMPLETED":
        return "th-badge th-badge-completed";
      case "IN_PROGRESS":
        return "th-badge th-badge-progress";
      case "PENDING":
      default:
        return "th-badge th-badge-pending";
    }
  };

  return (
    <div className="th-page">
      {/* Page Header */}
      <div className="th-header">
        <div>
          <h1 className="th-title">Task History</h1>
          <p className="th-subtitle">
            Audit log of task status updates and activity
          </p>
        </div>

        <button
          type="button"
          onClick={getHistory}
          disabled={loading}
          className="th-refresh-btn"
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {error && (
        <div className="th-alert-error" role="alert">
          {error}
        </div>
      )}

      {/* Main Content Card */}
      <section className="th-card">
        {loading ? (
          <div className="th-state-box">
            <p className="th-state-text">Loading history...</p>
          </div>
        ) : history.length === 0 ? (
          <div className="th-state-box">
            <p className="th-state-text">No task history available.</p>
          </div>
        ) : (
          <div className="th-table-wrapper">
            <table className="th-table">
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Updated By</th>
                  <th>Previous Status</th>
                  <th>New Status</th>
                  <th>Updated At</th>
                </tr>
              </thead>
              <tbody>
                {history.map((historyItem) => {
                  const updater = historyItem.updated_by_username || "System";

                  return (
                    <tr key={historyItem.id}>
                      <td className="th-task-cell">
                        {historyItem.task_title || "—"}
                      </td>

                      <td>
                        <div className="th-user-cell">
                          <span className="th-avatar" aria-hidden="true">
                            {updater.charAt(0).toUpperCase()}
                          </span>
                          <span>{updater}</span>
                        </div>
                      </td>

                      <td>
                        <span className={getStatusClass(historyItem.old_status)}>
                          {formatLabel(historyItem.old_status)}
                        </span>
                      </td>

                      <td>
                        <span className={getStatusClass(historyItem.new_status)}>
                          {formatLabel(historyItem.new_status)}
                        </span>
                      </td>

                      <td className="th-date-cell">
                        {formatDateTime(historyItem.changed_at)}
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

export default TaskHistory;