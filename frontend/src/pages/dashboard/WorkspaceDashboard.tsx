import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FolderKanban, Plus, X } from "lucide-react";

import { getMyOrganizations } from "../../services/organizationService";
import { getMyProjects, createProject } from "../../services/projectService";
import type { CreateProjectData } from "../../services/projectService";

import type { Organization } from "../../types/organization";
import type { Project } from "../../types/project";
import CreateProject from "../projects/CreateProject";
import "./WorkspaceDashboard.css";

interface WorkspaceStats {
  totalProjects: number;
  totalMembers: number | null;
  totalTasks: number | null;
  completedTasks: number | null;
}

const WorkspaceDashboard: React.FC = () => {
  const navigate = useNavigate();

  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [showCreateProject, setShowCreateProject] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

const handleCreateProject = async (projectData: {
  name: string;
  key: string;
  description: string;
  status: "PLANNING" | "ACTIVE" | "ON_HOLD";
}) => {
  try {
    setError("");

    if (organizations.length === 0) {
      throw new Error("No workspace found. Please create a workspace first.");
    }

await createProject({
  ...projectData,
  organization: organizations[0].id,
});
    const updatedProjects = await getMyProjects();

    setProjects(
      updatedProjects.filter(
        (project) => project.organization === organizations[0].id
      )
    );

    setShowCreateProject(false);
  } catch (err) {
    console.error("Project creation failed:", err);
    throw err;
  }
};

  // Load organizations and projects
  useEffect(() => {
    const loadOrganizations = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getMyOrganizations();

console.log("Organizations received:", data);
console.log("Is array:", Array.isArray(data));

setOrganizations(data);

        if (data.length > 0) {
          const projectsData = await getMyProjects();
          setProjects(
            projectsData.filter((project) => project.organization === data[0].id)
          );
        }
      } catch (err) {
        console.error(err);
        setError("Unable to load workspace data.");
      } finally {
        setLoading(false);
      }
    };

    loadOrganizations();
  }, []);

  const stats: WorkspaceStats = useMemo(() => {
    const activeOrg = organizations[0] as
      | (Organization & { member_count?: number; members_count?: number })
      | undefined;

    const totalProjects = projects.length;

    const orgMembers =
      typeof activeOrg?.member_count === "number"
        ? activeOrg.member_count
        : typeof activeOrg?.members_count === "number"
        ? activeOrg.members_count
        : null;

    let taskSum = 0;
    let completedSum = 0;
    let hasTaskCounts = false;

    for (const proj of projects as Array<
      Project & {
        task_count?: number;
        tasks_count?: number;
        completed_task_count?: number;
        completed_tasks_count?: number;
      }
    >) {
      const pTasks =
        typeof proj.task_count === "number"
          ? proj.task_count
          : typeof proj.tasks_count === "number"
          ? proj.tasks_count
          : null;

      const pCompleted =
        typeof proj.completed_task_count === "number"
          ? proj.completed_task_count
          : typeof proj.completed_tasks_count === "number"
          ? proj.completed_tasks_count
          : null;

      if (pTasks !== null) {
        taskSum += pTasks;
        hasTaskCounts = true;
      }
      if (pCompleted !== null) {
        completedSum += pCompleted;
        hasTaskCounts = true;
      }
    }

    return {
      totalProjects,
      totalMembers: orgMembers,
      totalTasks: hasTaskCounts ? taskSum : null,
      completedTasks: hasTaskCounts ? completedSum : null,
    };
  }, [organizations, projects]);

  const formatLabel = (value?: string) =>
    value ? value.replace(/_/g, " ").toLowerCase() : "—";

  if (loading) {
    return (
      <div className="wd-page">
        <div className="wd-state-box">
          <p className="wd-state-text">Loading workspace...</p>
        </div>
      </div>
    );
  }

  if (error && organizations.length === 0) {
    return (
      <div className="wd-page">
        <div className="wd-state-box">
          <p className="wd-state-text wd-state-error">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="wd-page">
      {/* Header */}
      <header className="wd-header">
        <div>
          <h1 className="wd-page-title">Workspace Overview</h1>
          <p className="wd-page-subtitle">
            Manage your projects and team in one place.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateProject(true)}
          className="wd-primary-btn"
        >
          <Plus size={18} aria-hidden="true" />
          <span>Create Project</span>
        </button>
      </header>

      {/* Summary Cards Grid */}
      <section className="wd-summary-grid" aria-label="Workspace summary">
        <div className="wd-summary-card">
          <span className="wd-summary-label">Total Projects</span>
          <p className="wd-summary-value">{stats.totalProjects}</p>
          <span className="wd-summary-meta">In your workspace</span>
        </div>

        <div className="wd-summary-card">
          <span className="wd-summary-label">Total Team Members</span>
          <p className="wd-summary-value wd-value-indigo">
            {stats.totalMembers !== null ? stats.totalMembers : "—"}
          </p>
          <span className="wd-summary-meta">Workspace members</span>
        </div>

        <div className="wd-summary-card">
          <span className="wd-summary-label">Total Tasks</span>
          <p className="wd-summary-value wd-value-amber">
            {stats.totalTasks !== null ? stats.totalTasks : "—"}
          </p>
          <span className="wd-summary-meta">Across workspace projects</span>
        </div>

        <div className="wd-summary-card">
          <span className="wd-summary-label">Completed Tasks</span>
          <p className="wd-summary-value wd-value-emerald">
            {stats.completedTasks !== null ? stats.completedTasks : "—"}
          </p>
          <span className="wd-summary-meta">Finished &amp; verified</span>
        </div>
      </section>

      {/* Project List Section */}
      <section className="wd-projects-section">
        <div className="wd-section-header">
          <div>
            <h2 className="wd-section-title">Your Projects</h2>
            <p className="wd-section-subtitle">
              {`${projects.length} ${
                projects.length === 1 ? "project" : "projects"
              } in your workspace`}
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/projects")}
            className="wd-link-btn"
          >
            View all
          </button>
        </div>

        {error && (
          <div className="wd-alert-error" role="alert">
            {error}
          </div>
        )}

        {organizations.length === 0 ? (
          <div className="wd-empty-card">
            <FolderKanban
              className="wd-empty-icon"
              size={36}
              aria-hidden="true"
            />
            <h3 className="wd-empty-title">No workspace yet</h3>
            <p className="wd-empty-text">
              Create an organization to get started.
            </p>
            <button
              type="button"
              onClick={() => navigate("/organizations/create")}
              className="wd-primary-btn"
            >
              Create Workspace
            </button>
          </div>
        ) : projects.length === 0 ? (
          <div className="wd-empty-card">
            <FolderKanban
              className="wd-empty-icon"
              size={36}
              aria-hidden="true"
            />
            <h3 className="wd-empty-title">No projects yet</h3>
            <p className="wd-empty-text">
              Create your first project in this workspace.
            </p>
            <button
              type="button"
              onClick={() => setShowCreateProject(true)}
              className="wd-primary-btn"
            >
              Create Project
            </button>
          </div>
        ) : (
          <div className="wd-projects-grid">
            {projects.map((project) => (
              <article
                key={project.id}
                onClick={() => navigate(`/projects/${project.id}`)}
                className="wd-project-card"
              >
                <div className="wd-project-top">
                  <span className="wd-key-badge">{project.key}</span>
                  <span className="wd-status-pill">
                    {formatLabel(project.status)}
                  </span>
                </div>

                <h3 className="wd-project-title">{project.name}</h3>

                <p className="wd-project-desc">
                  {project.description || "No description provided."}
                </p>

                <div className="wd-project-footer">
                  <span className="wd-role-label">Your role</span>
                  <span className="wd-role-value">
                    {formatLabel(project.role)}
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Create Project Modal */}
      {showCreateProject && (
        <div
          className="wd-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="wd-modal-title"
          onClick={() => setShowCreateProject(false)}
        >
          <div className="wd-modal" onClick={(e) => e.stopPropagation()}>
            <div className="wd-modal-header">
              <div>
                <h2 id="wd-modal-title" className="wd-modal-title">
                  Create Project
                </h2>
                <p className="wd-modal-subtitle">
                  Add a new project to your current workspace.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateProject(false)}
                className="wd-close-btn"
                aria-label="Close modal"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            <div className="wd-modal-body">
              <CreateProject
                onSubmit={handleCreateProject}
                onCancel={() => setShowCreateProject(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkspaceDashboard;