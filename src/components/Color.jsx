import React, { useEffect, useState } from "react";

const Color = () => {
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [colorName, setColorName] = useState("");
  const [colorCode, setColorCode] = useState("#000000");

  const [colors, setColors] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editingId, setEditingId] = useState(null); // null = add mode

  const base = import.meta.env.VITE_APP_SERVER_URL;

  // 🔄 fetch all colors
  const fetchColors = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${base}api/colors`);
      const data = await res.json();
      setColors(data || []);
    } catch (err) {
      console.error(err);
      setErrorMessage("Failed to load colors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchColors();
  }, []);

  // 📝 form submit (add + edit)
  const handleSubmit = async (e) => {
    e.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    if (!colorName || !colorCode) {
      setErrorMessage("Color name and code are required");
      return;
    }

    const data = {
      name: colorName,
      code: colorCode,
    };

    try {
      let url = `${base}api/colors`;
      let method = "POST";

      if (editingId) {
        // edit mode
        url = `${base}api/colors/${editingId}`;
        method = "PUT";
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        setErrorMessage(result.message || "Something went wrong");
        return;
      }

      // state update
      if (editingId) {
        setColors((prev) =>
          prev.map((c) => (c._id === result.color._id ? result.color : c))
        );
        setSuccessMessage("Color updated successfully");
      } else {
        setColors((prev) => [result.color, ...prev]);
        setSuccessMessage("Color added successfully");
      }

      // reset form
      setColorName("");
      setColorCode("#000000");
      setEditingId(null);
    } catch (error) {
      console.error("Error adding/updating color:", error);
      setErrorMessage("Internal Server Error");
    }
  };

  // ✏️ edit button
  const handleEdit = (color) => {
    setEditingId(color._id);
    setColorName(color.name);
    setColorCode(color.code);
    setSuccessMessage("");
    setErrorMessage("");
    // চাইলে scroll top
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setColorName("");
    setColorCode("#000000");
    setSuccessMessage("");
    setErrorMessage("");
  };

  // 🗑 delete button
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this color?")) return;

    try {
      const res = await fetch(`${base}api/colors/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Delete failed");
      }

      setColors((prev) => prev.filter((c) => c._id !== id));
      setSuccessMessage("Color deleted successfully");
      setErrorMessage("");
    } catch (err) {
      console.error(err);
      setErrorMessage("Failed to delete color");
    }
  };

  return (
    <div className="px-4 py-8 flex flex-col items-center gap-8">
      {/* form card */}
      <div className="bg-white rounded-lg shadow-lg w-full max-w-full px-3 xl:px-5 border py-5 border-blue-400">
        <h2 className="text-2xl font-semibold font-quicksand mb-4 ">
          {editingId ? "Edit Color" : "Add Color"}
        </h2>

        {successMessage && (
          <p className="text-green-600 mb-4">{successMessage}</p>
        )}
        {errorMessage && <p className="text-red-600 mb-4">{errorMessage}</p>}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-semibold mb-2">
              Color Name
            </label>
            <input
              type="text"
              value={colorName}
              onChange={(e) => setColorName(e.target.value)}
              className="w-full p-2 rounded outline-none border border-blue-500"
              placeholder="color name"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-semibold mb-2">
              Color Code
            </label>
            <div className="flex items-center">
              <input
                type="text"
                value={colorCode}
                onChange={(e) => setColorCode(e.target.value)}
                placeholder="#FF5733"
                className="p-2 rounded w-full outline-none border border-blue-500 mr-2"
                required
              />
              <input
                type="color"
                value={colorCode}
                onChange={(e) => setColorCode(e.target.value)}
                className="w-10 h-10 rounded border"
              />
            </div>
          </div>

          <div className="flex gap-2">
            {editingId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="w-1/3 bg-gray-100 text-gray-700 py-2 rounded-lg border hover:bg-gray-200"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
            >
              {editingId ? "Update Color" : "Submit Color"}
            </button>
          </div>
        </form>
      </div>

      {/* list section */}
      <div className="w-full max-w-5xl">
        <h3 className="text-lg font-semibold mb-3">All Colors</h3>

        {loading ? (
          <div className="text-gray-500">Loading colors…</div>
        ) : colors.length === 0 ? (
          <div className="text-gray-500">No colors found.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {colors.map((color) => (
              <div
                key={color._id}
                className="bg-white rounded-xl border shadow-sm p-3 flex flex-col items-center gap-2"
              >
                <div
                  className="w-10 h-10 rounded-full border"
                  style={{ backgroundColor: color.code }}
                />
                <div className="text-center">
                  <p className="font-medium text-gray-800 text-sm">
                    {color.name}
                  </p>
                  <p className="text-xs text-gray-500">{color.code}</p>
                </div>

                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => handleEdit(color)}
                    className="px-3 py-1 text-xs rounded-lg border border-blue-500 text-blue-600 hover:bg-blue-50"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(color._id)}
                    className="px-3 py-1 text-xs rounded-lg border border-red-500 text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Color;
