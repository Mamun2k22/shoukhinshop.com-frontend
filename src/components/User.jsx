import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  FiEdit2,
  FiTrash2,
  FiUser,
  FiMail,
  FiPhone,
  FiShield,
  FiLock,
  FiUnlock,
  FiSearch,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";

const User = () => {
  const queryClient = useQueryClient();

  // ✅ Safe base url (no double slash issue)
  const baseUrl = (import.meta.env.VITE_APP_SERVER_URL || "").replace(/\/$/, "");

  // ✅ Auth headers
  const token = localStorage.getItem("token");
  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [sortConfig, setSortConfig] = useState({ key: "name", direction: "asc" });
  const [selectedUsers, setSelectedUsers] = useState([]);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const [showStatusModal, setShowStatusModal] = useState(false);
  const [userForStatusChange, setUserForStatusChange] = useState(null);

  // ✅ Role modal states
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [userForRoleChange, setUserForRoleChange] = useState(null);
  const [newRole, setNewRole] = useState("user");

  // Fetch users
  const { data: users = [], isLoading, error, refetch } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await fetch(`${baseUrl}/api/users`, {
        headers: authHeaders,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to fetch users");
      }

      const result = await response.json();
      return result.users || [];
    },
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (userId) => {
      const response = await fetch(`${baseUrl}/api/users/${userId}`, {
        method: "DELETE",
        headers: authHeaders,
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.message || "Failed to delete user");
      }
      return data;
    },
    onSuccess: () => {
      toast.success("User deleted successfully");
      queryClient.invalidateQueries(["users"]);
      setShowDeleteModal(false);
      setUserToDelete(null);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete user");
    },
  });

  // Update user status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ userId, isActive }) => {
      const response = await fetch(`${baseUrl}/api/users/${userId}/status`, {
        method: "PATCH",
        headers: authHeaders,
        body: JSON.stringify({ isActive }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.message || "Failed to update user status");
      }
      return data;
    },
    onSuccess: (_, variables) => {
      toast.success(`User ${variables.isActive ? "activated" : "deactivated"} successfully`);
      queryClient.invalidateQueries(["users"]);
      setShowStatusModal(false);
      setUserForStatusChange(null);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update user status");
    },
  });

  // ✅ Update user role mutation
  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }) => {
      const response = await fetch(`${baseUrl}/api/users/${userId}/role`, {
        method: "PATCH",
        headers: authHeaders,
        body: JSON.stringify({ role }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.message || "Failed to update role");
      }
      return data;
    },
    onSuccess: () => {
      toast.success("Role updated successfully");
      queryClient.invalidateQueries(["users"]);
      setShowRoleModal(false);
      setUserForRoleChange(null);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update role");
    },
  });

  // Filter and sort users
  const filteredAndSortedUsers = users
    .filter((user) => {
      const matchesSearch =
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.mobile?.includes(searchTerm);

      const matchesRole = roleFilter === "all" || user.role === roleFilter;
      return matchesSearch && matchesRole;
    })
    .sort((a, b) => {
      if (sortConfig.key) {
        const aValue = a[sortConfig.key] || "";
        const bValue = b[sortConfig.key] || "";
        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });

  // Handle sort
  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  // Handle select user
  const handleSelectUser = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedUsers.length === filteredAndSortedUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredAndSortedUsers.map((user) => user._id));
    }
  };

  // Bulk delete
  const handleBulkDelete = () => {
    if (selectedUsers.length === 0) {
      toast.warning("Please select users to delete");
      return;
    }
    if (window.confirm(`Are you sure you want to delete ${selectedUsers.length} user(s)?`)) {
      selectedUsers.forEach((userId) => {
        deleteMutation.mutate(userId);
      });
      setSelectedUsers([]);
    }
  };

  // Handle delete confirmation
  const confirmDelete = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  // Handle status change
  const toggleUserStatus = (user) => {
    setUserForStatusChange(user);
    setShowStatusModal(true);
  };

  // ✅ Open role modal (Edit button)
  const openRoleModal = (user) => {
    setUserForRoleChange(user);
    setNewRole(user.role || "user");
    setShowRoleModal(true);
  };

  // Get user initials for avatar
  const getUserInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Get role color
  const getRoleColor = (role) => {
    switch (role?.toLowerCase()) {
      case "admin":
        return "bg-purple-100 text-purple-800";
      case "manager":
        return "bg-blue-100 text-blue-800";
      case "editor":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <div className="text-red-500 text-4xl mb-3">⚠️</div>
        <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Users</h3>
        <p className="text-red-600 mb-4">{error.message}</p>
        <button
          onClick={() => refetch()}
          className="bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-md font-medium transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-6">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 font-poppins">User Management</h1>
              <p className="text-gray-600 mt-1">
                {filteredAndSortedUsers.length} user
                {filteredAndSortedUsers.length !== 1 ? "s" : ""} found
              </p>
            </div>
            <div className="flex items-center gap-3">
              {selectedUsers.length > 0 && (
                <button
                  onClick={handleBulkDelete}
                  className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <FiTrash2 /> Delete Selected ({selectedUsers.length})
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
              <div className="relative">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg py-2.5 pl-4 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                >
                  <option value="all">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="user">User</option>
                  <option value="manager">Manager</option>
                </select>
                <FiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={
                      selectedUsers.length === filteredAndSortedUsers.length &&
                      filteredAndSortedUsers.length > 0
                    }
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort("name")}
                    className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                  >
                    User
                    {sortConfig.key === "name" &&
                      (sortConfig.direction === "asc" ? <FiChevronUp /> : <FiChevronDown />)}
                  </button>
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort("email")}
                    className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                  >
                    Contact Info
                    {sortConfig.key === "email" &&
                      (sortConfig.direction === "asc" ? <FiChevronUp /> : <FiChevronDown />)}
                  </button>
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort("role")}
                    className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                  >
                    Role
                    {sortConfig.key === "role" &&
                      (sortConfig.direction === "asc" ? <FiChevronUp /> : <FiChevronDown />)}
                  </button>
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Status
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAndSortedUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="text-gray-400 mb-3">
                      <FiUser className="w-12 h-12 mx-auto" />
                    </div>
                    <p className="text-gray-500 text-lg">No users found</p>
                    <p className="text-gray-400 mt-1">
                      {searchTerm ? "Try a different search term" : "Add users to get started"}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredAndSortedUsers.map((user) => (
                  <tr
                    key={user._id}
                    className={`hover:bg-blue-50 transition-colors ${
                      selectedUsers.includes(user._id) ? "bg-blue-50" : ""
                    }`}
                  >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user._id)}
                        onChange={() => handleSelectUser(user._id)}
                        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      />
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {getUserInitials(user.name || "U U")}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">ID: {user._id?.slice(-6)}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-900">
                          <FiMail className="text-gray-400" />
                          {user.email || "No email"}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <FiPhone className="text-gray-400" />
                          {user.mobile || "No phone"}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(
                          user.role
                        )}`}
                      >
                        <FiShield className="mr-1.5" />
                        {user.role || "User"}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleUserStatus(user)}
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                          user.isActive
                            ? "bg-green-100 text-green-800 hover:bg-green-200"
                            : "bg-red-100 text-red-800 hover:bg-red-200"
                        }`}
                      >
                        {user.isActive ? (
                          <>
                            <FiUnlock className="mr-1.5" />
                            Active
                          </>
                        ) : (
                          <>
                            <FiLock className="mr-1.5" />
                            Inactive
                          </>
                        )}
                      </button>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {/* ✅ Role Edit */}
                        <button
                          title="Edit Role"
                          onClick={() => openRoleModal(user)}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <FiEdit2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => confirmDelete(user)}
                          title="Delete"
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination (Optional - add if you have backend pagination) */}
        {filteredAndSortedUsers.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing 1 to {filteredAndSortedUsers.length} of {filteredAndSortedUsers.length} results
            </div>
          </div>
        )}
      </div>

      {/* ✅ Role Change Modal */}
      {showRoleModal && userForRoleChange && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mx-auto mb-4">
                <FiShield className="w-6 h-6 text-purple-600" />
              </div>

              <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                Change Role
              </h3>

              <p className="text-gray-600 text-center mb-6">
                Update role for <span className="font-semibold">{userForRoleChange.name}</span>
              </p>

              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-lg py-2.5 px-4 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition mb-6"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowRoleModal(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>

                <button
                  onClick={() =>
                    updateRoleMutation.mutate({
                      userId: userForRoleChange._id,
                      role: newRole,
                    })
                  }
                  disabled={updateRoleMutation.isLoading}
                  className="flex-1 px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updateRoleMutation.isLoading ? "Updating..." : "Update Role"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && userToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
                <FiTrash2 className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                Delete User
              </h3>
              <p className="text-gray-600 text-center mb-6">
                Are you sure you want to delete{" "}
                <span className="font-semibold">{userToDelete.name}</span>? This action cannot be
                undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteMutation.mutate(userToDelete._id)}
                  disabled={deleteMutation.isLoading}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleteMutation.isLoading ? "Deleting..." : "Delete User"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Change Modal */}
      {showStatusModal && userForStatusChange && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mx-auto mb-4">
                {userForStatusChange.isActive ? (
                  <FiLock className="w-6 h-6 text-blue-600" />
                ) : (
                  <FiUnlock className="w-6 h-6 text-blue-600" />
                )}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                {userForStatusChange.isActive ? "Deactivate User" : "Activate User"}
              </h3>
              <p className="text-gray-600 text-center mb-6">
                Are you sure you want to{" "}
                {userForStatusChange.isActive ? "deactivate" : "activate"}{" "}
                <span className="font-semibold">{userForStatusChange.name}</span>?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowStatusModal(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() =>
                    updateStatusMutation.mutate({
                      userId: userForStatusChange._id,
                      isActive: !userForStatusChange.isActive,
                    })
                  }
                  disabled={updateStatusMutation.isLoading}
                  className={`flex-1 px-4 py-2.5 rounded-lg text-white transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed ${
                    userForStatusChange.isActive
                      ? "bg-orange-600 hover:bg-orange-700"
                      : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                  {updateStatusMutation.isLoading
                    ? "Updating..."
                    : userForStatusChange.isActive
                    ? "Deactivate"
                    : "Activate"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </>
  );
};

export default User;
