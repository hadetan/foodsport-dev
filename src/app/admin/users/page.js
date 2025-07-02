"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ErrorAlert from "@/app/components/ErrorAlert";

const UserManagementPage = () => {
    const router = useRouter();
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [tableLoading, setTableLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [notification, setNotification] = useState({
        show: false,
        message: "",
        type: "",
    });

    // Mock data - Replace with actual API call
    const users = [
        {
            id: 1,
            name: "John Doe",
            email: "john@example.com",
            status: "active",
            role: "user",
            avatar: "/default-avatar.png",
        },
        {
            id: 2,
            name: "Jane Smith",
            email: "jane@example.com",
            status: "inactive",
            role: "admin",
            avatar: "/default-avatar.png",
        },
        // Add more mock users as needed
    ];

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedUsers(users.map((user) => user.id));
        } else {
            setSelectedUsers([]);
        }
    };

    const handleSelectUser = (userId) => {
        setSelectedUsers((prev) =>
            prev.includes(userId)
                ? prev.filter((id) => id !== userId)
                : [...prev, userId]
        );
    };

    const handleBulkAction = async (action) => {
        setActionLoading(true);
        try {
            // Implement bulk action logic here
            await new Promise((resolve) => setTimeout(resolve, 1000)); // Mock API call
            setNotification({
                show: true,
                message: `Successfully ${action}ed ${selectedUsers.length} users`,
                type: "success",
            });
            setSelectedUsers([]);
            if (action === "delete") {
                setIsDeleteModalOpen(false);
            }
        } catch (error) {
            setNotification({
                show: true,
                message: `Failed to ${action} users`,
                type: "error",
            });
        } finally {
            setActionLoading(false);
        }
    };

    // Simulate initial data loading
    useState(() => {
        setTimeout(() => {
            setTableLoading(false);
        }, 1000);
    }, []);

    return (
        <div className="p-4">
            {/* Success/Error Alert */}
            {notification.show &&
                (notification.type === "error" ? (
                    <ErrorAlert
                        message={notification.message}
                        onClose={() =>
                            setNotification({ ...notification, show: false })
                        }
                    />
                ) : (
                    <div className="alert alert-success mb-4">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="stroke-current shrink-0 h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                        <span>{notification.message}</span>
                        <button
                            className="btn btn-sm btn-ghost"
                            onClick={() =>
                                setNotification({
                                    ...notification,
                                    show: false,
                                })
                            }
                        >
                            ×
                        </button>
                    </div>
                ))}

            {/* Search and Filters */}
            <div className="flex flex-col lg:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                    <input
                        type="text"
                        placeholder="Search users..."
                        className="input input-bordered w-full md:max-w-md pr-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                    </svg>
                </div>

                <select
                    className="select select-bordered w-full lg:w-48"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                </select>

                <div className="dropdown dropdown-end">
                    <label
                        tabIndex={0}
                        className={`btn btn-secondary w-full lg:w-auto ${
                            selectedUsers.length === 0 ? "btn-disabled" : ""
                        }`}
                        data-tip={
                            selectedUsers.length === 0
                                ? "Select users to enable actions"
                                : ""
                        }
                    >
                        Bulk Actions ({selectedUsers.length})
                    </label>
                    <ul
                        tabIndex={0}
                        className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52"
                    >
                        <li>
                            <a
                                onClick={() => handleBulkAction("activate")}
                                className={actionLoading ? "loading" : ""}
                            >
                                Activate Selected
                            </a>
                        </li>
                        <li>
                            <a
                                onClick={() => handleBulkAction("deactivate")}
                                className={actionLoading ? "loading" : ""}
                            >
                                Deactivate Selected
                            </a>
                        </li>
                        <li>
                            <a
                                onClick={() => setIsDeleteModalOpen(true)}
                                className="text-error"
                            >
                                Delete Selected
                            </a>
                        </li>
                    </ul>
                </div>
            </div>

            {/* User Table with Loading State */}
            <div className="overflow-x-auto bg-base-100 rounded-lg shadow relative">
                {tableLoading ? (
                    <div className="min-h-[300px] flex items-center justify-center">
                        <span className="loading loading-spinner loading-lg"></span>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="table table-zebra w-full">
                            <thead className="sticky top-0 bg-base-100">
                                <tr>
                                    <th className="w-16">
                                        <label>
                                            <input
                                                type="checkbox"
                                                className="checkbox"
                                                checked={
                                                    selectedUsers.length ===
                                                    users.length
                                                }
                                                onChange={handleSelectAll}
                                            />
                                        </label>
                                    </th>
                                    <th>User</th>
                                    <th className="hidden md:table-cell">
                                        Role
                                    </th>
                                    <th className="hidden sm:table-cell">
                                        Status
                                    </th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr
                                        key={user.id}
                                        className="hover:bg-base-200"
                                    >
                                        <td>
                                            <label>
                                                <input
                                                    type="checkbox"
                                                    className="checkbox"
                                                    checked={selectedUsers.includes(
                                                        user.id
                                                    )}
                                                    onChange={() =>
                                                        handleSelectUser(
                                                            user.id
                                                        )
                                                    }
                                                />
                                            </label>
                                        </td>
                                        <td>
                                            <div className="flex items-center space-x-3">
                                                <div className="avatar">
                                                    <div className="mask mask-squircle w-12 h-12">
                                                        <img
                                                            src={user.avatar}
                                                            alt={user.name}
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="font-bold">
                                                        {user.name}
                                                    </div>
                                                    <div className="text-sm opacity-50">
                                                        {user.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="hidden md:table-cell">
                                            <span className="badge badge-ghost">
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="hidden sm:table-cell">
                                            <span
                                                className={`badge ${
                                                    user.status === "active"
                                                        ? "badge-success"
                                                        : user.status ===
                                                          "inactive"
                                                        ? "badge-warning"
                                                        : "badge-error"
                                                }`}
                                            >
                                                {user.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="btn-group">
                                                <button
                                                    className="btn btn-sm btn-ghost tooltip"
                                                    data-tip="View Profile"
                                                    onClick={() =>
                                                        router.push(
                                                            `/admin/users/${user.id}`
                                                        )
                                                    }
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className="h-4 w-4"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth="2"
                                                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                        />
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth="2"
                                                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                                        />
                                                    </svg>
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-ghost tooltip"
                                                    data-tip="Edit User"
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className="h-4 w-4"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth="2"
                                                            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                                                        />
                                                    </svg>
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-ghost text-error tooltip"
                                                    data-tip="Delete User"
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className="h-4 w-4"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth="2"
                                                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                        />
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Pagination */}
            <div className="flex justify-center mt-4">
                <div className="btn-group">
                    <button className="btn btn-outline">«</button>
                    <button className="btn btn-outline">Page 1</button>
                    <button className="btn btn-outline">»</button>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            <dialog
                id="delete_modal"
                className={`modal ${isDeleteModalOpen ? "modal-open" : ""}`}
            >
                <div className="modal-box">
                    <h3 className="font-bold text-lg">Confirm Delete</h3>
                    <p className="py-4">
                        Are you sure you want to delete {selectedUsers.length}{" "}
                        selected users? This action cannot be undone.
                    </p>
                    <div className="modal-action">
                        <button
                            className="btn"
                            onClick={() => setIsDeleteModalOpen(false)}
                            disabled={actionLoading}
                        >
                            Cancel
                        </button>
                        <button
                            className={`btn btn-error ${
                                actionLoading ? "loading" : ""
                            }`}
                            onClick={() => handleBulkAction("delete")}
                            disabled={actionLoading}
                        >
                            Delete
                        </button>
                    </div>
                </div>
                <form method="dialog" className="modal-backdrop">
                    <button onClick={() => setIsDeleteModalOpen(false)}>
                        close
                    </button>
                </form>
            </dialog>

            {/* Loading Overlay for Bulk Actions */}
            {actionLoading && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-base-100 rounded-lg p-4 flex flex-col items-center space-y-2">
                        <span className="loading loading-spinner loading-lg"></span>
                        <p className="text-base-content">Processing...</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagementPage;
