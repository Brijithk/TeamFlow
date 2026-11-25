import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    FolderKanban,
    Plus,
    Users,
    CheckSquare,
    Settings,
    Bell,
    LayoutDashboard,
} from "lucide-react";

import { getMyOrganizations } from "../../services/organizationService";
import { getMyProjects } from "../../services/projectService";

import type { Organization } from "../../types/organization";
import type { Project } from "../../types/project";

function WorkspaceDashboard() {
    const navigate = useNavigate();

    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);

    const [selectedOrganization, setSelectedOrganization] =
        useState<number | null>(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Load organizations
    useEffect(() => {
        const loadOrganizations = async () => {
            try {
                setLoading(true);
                setError("");

                const data = await getMyOrganizations();

                setOrganizations(data);

                if (data.length > 0) {
                    setSelectedOrganization(data[0].id);
                }
            } catch (error) {
                console.error(error);
                setError("Unable to load organizations.");
            } finally {
                setLoading(false);
            }
        };

        loadOrganizations();
    }, []);

    // Load projects whenever workspace changes
    useEffect(() => {
        if (selectedOrganization === null) {
            setProjects([]);
            return;
        }

        const loadProjects = async () => {
            try {
                const data = await getMyProjects();

                const filteredProjects = data.filter(
                    (project) =>
                        project.organization === selectedOrganization
                );

                setProjects(filteredProjects);
            } catch (error) {
                console.error(error);
                setError("Unable to load projects.");
            }
        };

        loadProjects();
    }, [selectedOrganization]);

    if (loading) {
        return <div className="p-10">Loading workspace...</div>;
    }

    if (error && organizations.length === 0) {
        return <div className="p-10 text-red-600">{error}</div>;
    }

    return (
        <div className="flex min-h-screen bg-gray-50">

            {/* Sidebar */}
            <aside className="w-64 bg-white border-r p-5">

                <h1 className="text-2xl font-bold mb-8">
                    TeamFlow
                </h1>

                <nav className="space-y-3">

                    <button className="flex items-center gap-3 w-full p-3 rounded-lg bg-blue-50 text-blue-600">
                        <LayoutDashboard size={20} />
                        Overview
                    </button>

                    <button
                        onClick={() => navigate("/projects")}
                        className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-gray-100"
                    >
                        <FolderKanban size={20} />
                        My Projects
                    </button>

                    <button
                        onClick={() => navigate("/my-tasks")}
                        className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-gray-100"
                    >
                        <CheckSquare size={20} />
                        My Tasks
                    </button>

                    <button className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-gray-100">
                        <Users size={20} />
                        Team Members
                    </button>

                    <button className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-gray-100">
                        <Bell size={20} />
                        Notifications
                    </button>

                    <button className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-gray-100">
                        <Settings size={20} />
                        Settings
                    </button>

                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8">

                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-2xl font-bold">
                            Workspace Overview
                        </h2>

                        <p className="text-gray-500 mt-1">
                            Manage your projects and team in one place.
                        </p>
                    </div>

                    <button
                        onClick={() => navigate("/projects/create")}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                        <Plus size={18} />
                        Create Project
                    </button>
                </header>

                {/* Workspace Selector */}
                <section className="mb-8">

                    <label className="block text-sm font-medium mb-2">
                        Current Workspace
                    </label>

                    <select
                        value={selectedOrganization ?? ""}
                        onChange={(e) =>
                            setSelectedOrganization(Number(e.target.value))
                        }
                        className="w-full md:w-80 border rounded-lg p-3 bg-white"
                    >
                        {organizations.map((organization) => (
                            <option
                                key={organization.id}
                                value={organization.id}
                            >
                                {organization.name}
                            </option>
                        ))}
                    </select>

                </section>

                {/* Project List */}
                <section>

                    <div className="flex justify-between items-center mb-5">
                        <h3 className="text-xl font-semibold">
                            Your Projects
                        </h3>

                        <button
                            onClick={() => navigate("/projects")}
                            className="text-blue-600 hover:underline"
                        >
                            View all
                        </button>
                    </div>

                    {error && (
                        <p className="text-red-600 mb-4">{error}</p>
                    )}

                    {organizations.length === 0 ? (

                        <div className="bg-white border rounded-xl p-10 text-center">
                            <h3 className="font-semibold text-lg">
                                No workspace yet
                            </h3>

                            <p className="text-gray-500 mt-2">
                                Create an organization to get started.
                            </p>

                            <button
                                onClick={() => navigate("/organizations/create")}
                                className="mt-5 bg-blue-600 text-white px-5 py-2 rounded-lg"
                            >
                                Create Workspace
                            </button>
                        </div>

                    ) : projects.length === 0 ? (

                        <div className="bg-white border rounded-xl p-10 text-center">
                            <FolderKanban className="mx-auto text-gray-400 mb-3" size={35} />

                            <h3 className="font-semibold">
                                No projects yet
                            </h3>

                            <p className="text-gray-500 mt-2">
                                Create your first project in this workspace.
                            </p>

                            <button
                                onClick={() => navigate("/projects/create")}
                                className="mt-5 bg-blue-600 text-white px-5 py-2 rounded-lg"
                            >
                                Create Project
                            </button>
                        </div>

                    ) : (

                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">

                            {projects.map((project) => (
                                <div
                                    key={project.id}
                                    onClick={() =>
                                        navigate(`/projects/${project.id}`)
                                    }
                                    className="bg-white border rounded-xl p-5 cursor-pointer hover:shadow-md transition"
                                >
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-semibold bg-blue-50 text-blue-600 px-3 py-1 rounded">
                                            {project.key}
                                        </span>

                                        <span className="text-xs text-gray-500">
                                            {project.status}
                                        </span>
                                    </div>

                                    <h4 className="font-semibold text-lg mt-4">
                                        {project.name}
                                    </h4>

                                    <p className="text-gray-500 text-sm mt-2">
                                        {project.description || "No description provided."}
                                    </p>

                                    <div className="border-t mt-5 pt-4 text-sm text-gray-500">
                                        Your role: {project.role}
                                    </div>
                                </div>
                            ))}

                        </div>
                    )}

                </section>

            </main>
        </div>
    );
}

export default WorkspaceDashboard;