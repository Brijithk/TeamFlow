import React from "react";
import { Outlet } from "react-router";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import "./DashboardLayout.css";

const DashboardLayout: React.FC = () => {
  return (
    <div className="dashboard-layout">
      <div className="dashboard-header">
        <Header />
      </div>

      <div className="dashboard-body">
        <aside className="dashboard-sidebar">
          <Sidebar />
        </aside>

        <main className="dashboard-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;