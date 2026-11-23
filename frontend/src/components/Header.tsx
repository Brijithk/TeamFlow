import React from "react";
import useAuth from "../hooks/useAuth";
import useLogout from "../hooks/useLogout";
import logo from "../assets/images/logo.jpg"; 
import "./Header.css";

interface User {
  username?: string;
  name?: string;
  role?: string;
}

interface AuthHookReturn {
  user: User | null;
}

interface LogoutHookReturn {
  handleLogout: () => void | Promise<void>;
  loading: boolean;
  setLoading?: React.Dispatch<React.SetStateAction<boolean>>;
  error?: string | null;
  setError?: React.Dispatch<React.SetStateAction<string | null>>;
}

const Header: React.FC = () => {
  const { user } = useAuth() as AuthHookReturn;
  const { handleLogout, loading, error } = useLogout() as LogoutHookReturn;

  const displayUsername = user?.username || user?.name || "User";
  const initial = displayUsername.charAt(0).toUpperCase();

  return (
    <header className="header-wrapper">
      <div className="header-bar">
        {/* Left: Company Logo & Name */}
        <div className="header-brand">
          <img
            src={logo}
            alt="TeamFlow logo"
            className="header-logo"
          />
          <span className="header-brand-name">TeamFlow</span>
        </div>

        {/* Right: Username & Logout */}
        <div className="header-actions">
          <div className="header-user">
            <div className="header-avatar" aria-hidden="true">
              {initial}
            </div>
            <span className="header-username">{displayUsername}</span>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            disabled={loading}
            className="header-logout-btn"
          >
            {loading ? "Logging out..." : "Logout"}
          </button>
        </div>
      </div>

      {error && (
        <div className="header-error" role="alert">
          {error}
        </div>
      )}
    </header>
  );
};

export default Header;