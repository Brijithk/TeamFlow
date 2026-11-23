import React from "react";
import useAuth from "../hooks/useAuth";
import { NavLink, NavLinkRenderProps } from "react-router";
import {
  Search,
  LayoutDashboard,
  CheckSquare,
  PlusCircle,
  Users,
  History,
  FolderKanban,
  ChevronsUpDown,
  LogOut,
  Layers
} from "lucide-react";
import "./Sidebar.css";

interface User {
  name?: string;
  email?: string;
  role?: "TEAM_LEAD" | "EMPLOYEE" | string;
}

interface AuthContextType {
  user: User | null;
  logout?: () => void;
}

const Sidebar: React.FC = () => {
  const { user, logout } = useAuth() as AuthContextType;

  const getNavClass = ({ isActive }: NavLinkRenderProps): string =>
    isActive ? "nav-item active" : "nav-item";

  return (
    <aside className="sidebar">
      {/* Top Section */}
      <div className="sidebar-top">
        {/* Brand Header */}
        {/* <div className="brand-header">
          <div className="brand-info">
            <div className="brand-logo">
              <Layers size={18} />
            </div>
            <div>
              <h1 className="brand-title">TeamFlow</h1>
              <p className="brand-subtitle">
                {user?.role ? user.role.replace("_", " ").toLowerCase() : "Workspace"}
              </p>
            </div>
          </div>
          <ChevronsUpDown size={16} className="muted-icon" />
        </div> */}

        {/* Search Input */}
        {/* <div className="search-wrapper">
          <Search size={15} className="search-icon" />
          <input
            type="text"
            placeholder="Search"
            className="search-input"
          />
          <span className="shortcut-badge">⌘K</span>
        </div> */}

        {/* Navigation Links */}
        <nav className="sidebar-nav">
          {user?.role === "TEAM_LEAD" && (
            <>
              <NavLink end className={getNavClass} to="/dashboard">
                <span className="nav-label">
                  <LayoutDashboard size={16} className="nav-icon" />
                  Overview
                </span>
                <span className="nav-shortcut">⌘1</span>
              </NavLink>

              <NavLink end className={getNavClass} to="/dashboard/tasks">
                <span className="nav-label">
                  <CheckSquare size={16} className="nav-icon" />
                  Manage Tasks
                </span>
                <span className="nav-shortcut">⌘2</span>
              </NavLink>

              <NavLink end className={getNavClass} to="/dashboard/tasks/create">
                <span className="nav-label">
                  <PlusCircle size={16} className="nav-icon" />
                  Create Task
                </span>
                <span className="nav-shortcut">⌘3</span>
              </NavLink>

              <div className="nav-divider" />
              <p className="nav-section-title">Management</p>

              <NavLink end className={getNavClass} to="/dashboard/team">
                <span className="nav-label">
                  <Users size={16} className="nav-icon" />
                  Team Members
                </span>
              </NavLink>

              <NavLink end className={getNavClass} to="/dashboard/history">
                <span className="nav-label">
                  <History size={16} className="nav-icon" />
                  Task History
                </span>
              </NavLink>
            </>
          )}

          {user?.role === "EMPLOYEE" && (
            <>
              <NavLink end className={getNavClass} to="/dashboard">
                <span className="nav-label">
                  <LayoutDashboard size={16} className="nav-icon" />
                  Overview
                </span>
                <span className="nav-shortcut">⌘1</span>
              </NavLink>

              <NavLink end className={getNavClass} to="/dashboard/my-tasks">
                <span className="nav-label">
                  <FolderKanban size={16} className="nav-icon" />
                  My Tasks
                </span>
                <span className="nav-shortcut">⌘2</span>
              </NavLink>

              <NavLink end className={getNavClass} to="/dashboard/history">
                <span className="nav-label">
                  <History size={16} className="nav-icon" />
                  Task History
                </span>
                <span className="nav-shortcut">⌘3</span>
              </NavLink>
            </>
          )}
        </nav>
      </div>

      {/* Bottom Profile Footer */}
      <div className="sidebar-footer">
        <div className="user-card">
          <div className="user-info">
            <div className="user-avatar">
              {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="user-details">
              <p className="user-name">{user?.name || "Team Member"}</p>
              <p className="user-email">{user?.email || "user@teamflow.com"}</p>
            </div>
          </div>
          {logout ? (
            <button
              type="button"
              onClick={logout}
              title="Logout"
              className="logout-btn"
            >
              <LogOut size={16} />
            </button>
          ) : (
            <ChevronsUpDown size={16} className="muted-icon" />
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;