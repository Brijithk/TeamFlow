
import { useState } from "react";

interface CreateProjectProps {
  onSubmit: (projectData: {
    name: string;
    key: string;
    description: string;
    status: "PLANNING" | "ACTIVE" | "ON_HOLD";
  }) => Promise<void>;
  onCancel: () => void;
}

function CreateProject({ onSubmit, onCancel }: CreateProjectProps) {
  const [name, setName] = useState("");
  const [key, setKey] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<
    "PLANNING" | "ACTIVE" | "ON_HOLD"
  >("PLANNING");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim() || !key.trim()) {
      setError("Project name and key are required.");
      return;
    }

    try {
      setLoading(true);

      await onSubmit({
        name: name.trim(),
        key: key.trim().toUpperCase(),
        description: description.trim(),
        status,
      });
    } catch (err) {
      console.error(err);
      setError("Unable to create project. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block mb-2 font-medium">Project Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. E-commerce Website"
            className="w-full border rounded-lg p-3"
            required
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">Project Key</label>
          <input
            value={key}
            onChange={(e) =>
              setKey(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))
            }
            placeholder="e.g. ECOM"
            maxLength={10}
            className="w-full border rounded-lg p-3"
            required
          />
          <p className="text-sm text-gray-500 mt-1">
            Used in task IDs, for example ECOM-1.
          </p>
        </div>

        <div>
          <label className="block mb-2 font-medium">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your project..."
            rows={4}
            className="w-full border rounded-lg p-3"
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">Project Status</label>
          <select
            value={status}
            onChange={(e) =>
              setStatus(
                e.target.value as "PLANNING" | "ACTIVE" | "ON_HOLD"
              )
            }
            className="w-full border rounded-lg p-3"
          >
            <option value="PLANNING">Planning</option>
            <option value="ACTIVE">Active</option>
            <option value="ON_HOLD">On Hold</option>
          </select>
        </div>

        {error && <p className="text-red-500">{error}</p>}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2 border rounded-lg"
            disabled={loading}
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Project"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateProject;
