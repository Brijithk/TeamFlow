import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import type { Employee } from "../../types/employee";
import { getEmployees } from "../../services/employeeService";
import "./TeamMembers.css";

const TeamMembers: React.FC = () => {
  const [employeeList, setEmployeeList] = useState<Employee[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const navigate = useNavigate();

  const fetchEmployees = async () => {
    try {
      setError("");
      setLoading(true);
      const response = await getEmployees();
      setEmployeeList(response);
    } catch (e) {
      console.log(e);
      setError("Failed to load team members.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  return (
    <div className="tm-page">
      {/* Page Header */}
      <div className="tm-header">
        <div>
          <h1 className="tm-title">Team Members</h1>
          <p className="tm-subtitle">
            {loading
              ? "Loading team directory..."
              : `Total Members: ${employeeList.length}`}
          </p>
        </div>

        <div className="tm-header-actions">
          <button
            type="button"
            onClick={fetchEmployees}
            disabled={loading}
            className="tm-refresh-btn"
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/dashboard/team/create")}
            className="tm-add-btn"
          >
            + Add Team Member
          </button>
        </div>
      </div>

      {error && (
        <div className="tm-alert-error" role="alert">
          {error}
        </div>
      )}

      {/* Main Content Card */}
      <section className="tm-card">
        {loading ? (
          <div className="tm-state-box">
            <p className="tm-state-text">Loading Employees...</p>
          </div>
        ) : employeeList.length === 0 ? (
          <div className="tm-state-box">
            <p className="tm-state-text">No employees found</p>
          </div>
        ) : (
          <div className="tm-table-wrapper">
            <table className="tm-table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                </tr>
              </thead>
              <tbody>
                {employeeList.map((emp) => {
                  const displayName = emp.username || "Member";

                  return (
                    <tr key={emp.id}>
                      <td>
                        <div className="tm-user-cell">
                          <span className="tm-avatar" aria-hidden="true">
                            {displayName.charAt(0).toUpperCase()}
                          </span>
                          <span className="tm-username">{displayName}</span>
                        </div>
                      </td>
                      <td className="tm-email-cell">{emp.email}</td>
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

export default TeamMembers;