import React, { useState } from "react";
import { useNavigate } from "react-router";
import { createEmployee } from "../services/authService";
import "./CreateEmployee.css";

const CreateEmployee: React.FC = () => {
  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const navigate = useNavigate();

  const handleCreateEmployee = async () => {
    setError("");
    setSuccess("");

    if (!username.trim() || !email.trim()) {
      setError("Please fill all required fields.");
      return;
    }

    if (password.length < 8) {
      setError("Password must contain at least 8 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("password and confirm password not match");
      return;
    }

    setLoading(true);
    try {
      await createEmployee(username, email, password);
      setSuccess("created successfully");
      setConfirmPassword("");
      setPassword("");
      setEmail("");
      setUsername("");
    } catch (e) {
      setError("error while api call");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ce-page">
      {/* Page Header */}
      <div className="ce-header">
        <div>
          <h1 className="ce-title">Create Employee</h1>
          <p className="ce-subtitle">
            Add a new team member account to your workspace.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate(-1)}
          className="ce-back-btn"
        >
          ← Back
        </button>
      </div>

      {/* Form Card */}
      <section className="ce-card">
        <form
          className="ce-form"
          onSubmit={(e) => {
            e.preventDefault();
            handleCreateEmployee();
          }}
        >
          <div className="ce-row-2">
            <div className="ce-field">
              <label htmlFor="ce-username" className="ce-label">
                Username <span className="ce-required">*</span>
              </label>
              <input
                id="ce-username"
                type="text"
                className="ce-input"
                placeholder="e.g., alex_rivera"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (error) setError("");
                }}
                required
              />
            </div>

            <div className="ce-field">
              <label htmlFor="ce-email" className="ce-label">
                Email <span className="ce-required">*</span>
              </label>
              <input
                id="ce-email"
                type="email"
                className="ce-input"
                placeholder="e.g., alex@teamflow.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError("");
                }}
                required
              />
            </div>
          </div>

          <div className="ce-row-2">
            <div className="ce-field">
              <label htmlFor="ce-password" className="ce-label">
                Password <span className="ce-required">*</span>
              </label>
              <input
                id="ce-password"
                type="password"
                className="ce-input"
                placeholder="Minimum 8 characters"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError("");
                }}
                required
              />
            </div>

            <div className="ce-field">
              <label htmlFor="ce-confirm-password" className="ce-label">
                Confirm Password <span className="ce-required">*</span>
              </label>
              <input
                id="ce-confirm-password"
                type="password"
                className="ce-input"
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (error) setError("");
                }}
                required
              />
            </div>
          </div>

          {error && (
            <p className="ce-alert ce-alert-error" role="alert">
              {error}
            </p>
          )}

          {success && (
            <p className="ce-alert ce-alert-success" role="status">
              {success}
            </p>
          )}

          <div className="ce-actions">
            <button
              type="button"
              onClick={() => navigate(-1)}
              disabled={loading}
              className="ce-cancel-btn"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="ce-submit-btn"
            >
              {loading ? "submiting" : "submit"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};

export default CreateEmployee;