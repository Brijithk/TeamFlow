import React, { useState, useEffect } from "react";
import { getEmployees } from "../../services/employeeService";
import { createTask, updateTask } from "../../services/taskService";
import type { CreateTaskData } from "../../types/task";
import type { Employee } from "../../types/employee";
import { useLocation, useNavigate } from "react-router";
import "./CreateTask.css";

enum Priority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
}

function getLocalToday(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const CreateTask: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const retrievedTask = location.state?.task;
  const isEditMode = Boolean(retrievedTask);

  const [employee, setEmployee] = useState<Employee[]>([]);
  const [title, setTitle] = useState<string>(retrievedTask?.title ?? "");
  const [description, setDescription] = useState<string>(
    retrievedTask?.description ?? ""
  );
  const [success, setSuccess] = useState<string>("");
  const [assignTo, setAssignTo] = useState<string>(
    retrievedTask ? String(retrievedTask.assigned_to) : ""
  );
  const [priority, setPriority] = useState<Priority>(
    retrievedTask?.priority ?? Priority.LOW
  );

  const today = getLocalToday();
  const [dueDate, setDueDate] = useState<string>(
    retrievedTask?.deadline ?? today
  );
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPriority(e.target.value as Priority);
  };

  const getEmployeeList = async () => {
    try {
      setLoading(true);
      const response = await getEmployees();
      setEmployee(response);
    } catch (e) {
      console.log("error while fetching data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getEmployeeList();
  }, []);

  const handleSubmit = async () => {
    setError("");
    setSuccess("");

    if (!title.trim() || !description.trim() || !assignTo.trim()) {
      setError("Please fill all required fields.");
      return;
    }

    if (!dueDate) {
      setError("Please select a date.");
      return;
    }

    if (dueDate < today) {
      setError("Date cannot be in the past.");
      return;
    }

    const data: CreateTaskData = {
      title: title,
      description: description,
      assigned_to: Number(assignTo),
      priority: priority,
      deadline: dueDate,
    };

    try {
      setSubmitting(true);
      console.log(data);
      if (!isEditMode) {
        await createTask(data);
        setSuccess("form submitted successfully");
      } else {
        await updateTask(retrievedTask.id, data);
        setSuccess("form updated successfully");
      }
      setTitle("");
      setDescription("");
      setAssignTo("");
      setPriority(Priority.LOW);
      setDueDate("");
    } catch (e: any) {
      setError("Failed to create task. Please try again.");
      console.log("API error:", e.response?.data);
    } finally {
      setSubmitting(false);
    }
  };

  const submitButtonText = submitting
    ? isEditMode
      ? "Updating..."
      : "Submitting..."
    : isEditMode
    ? "Update Task"
    : "Create Task";

  return (
    <div className="ct-page">
      {/* Page Header */}
      <div className="ct-header">
        <div>
          <h1 className="ct-title">
            {isEditMode ? "Edit Task" : "Create New Task"}
          </h1>
          <p className="ct-subtitle">
            {isEditMode
              ? "Update task details, assignee, priority, or deadline."
              : "Assign a new task to a team member with priority and due date."}
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate(-1)}
          className="ct-back-btn"
        >
          ← Back
        </button>
      </div>

      {/* Form Card */}
      <section className="ct-card">
        <form
          className="ct-form"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <div className="ct-field">
            <label htmlFor="Task-Title" className="ct-label">
              Task Title <span className="ct-required">*</span>
            </label>
            <input
              type="text"
              id="Task-Title"
              className="ct-input"
              placeholder="e.g., Prepare Q4 sprint report"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="ct-field">
            <label htmlFor="Description" className="ct-label">
              Description <span className="ct-required">*</span>
            </label>
            <textarea
              className="ct-textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              name="Description"
              id="Description"
              rows={4}
              placeholder="Enter multiple lines of text..."
              required
            />
          </div>

          <div className="ct-row-2">
            <div className="ct-field">
              <label htmlFor="assign-to" className="ct-label">
                Assign To <span className="ct-required">*</span>
              </label>
              <select
                id="assign-to"
                className="ct-select"
                value={assignTo}
                onChange={(e) => setAssignTo(e.target.value)}
                disabled={loading}
                required
              >
                <option value="">Select Employee</option>
                {loading ? (
                  <option value="">Loading employees...</option>
                ) : employee.length === 0 ? (
                  <option value="" disabled>
                    No employees available
                  </option>
                ) : (
                  employee.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.username}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="ct-field">
              <label htmlFor="role-select" className="ct-label">
                Priority
              </label>
              <select
                id="role-select"
                className="ct-select"
                value={priority}
                onChange={handleChange}
                required
              >
                {Object.values(Priority).map((priorityValue) => (
                  <option key={priorityValue} value={priorityValue}>
                    {priorityValue}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="ct-field ct-field-half">
            <label htmlFor="DueDate" className="ct-label">
              Due Date <span className="ct-required">*</span>
            </label>
            <input
              type="date"
              id="DueDate"
              className="ct-input"
              min={today}
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
            />
          </div>

          {success && (
            <div className="ct-alert ct-alert-success" role="status">
              {success}
            </div>
          )}

          {error && (
            <div className="ct-alert ct-alert-error" role="alert">
              {error}
            </div>
          )}

          <div className="ct-actions">
            <button
              type="button"
              onClick={() => navigate(-1)}
              disabled={submitting}
              className="ct-cancel-btn"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || loading}
              className="ct-submit-btn"
            >
              {submitButtonText}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};

export default CreateTask;