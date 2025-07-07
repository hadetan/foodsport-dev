import React from "react";
import Status from "./status";
import Avatar from "./avatar";

export const UserRow = ({ user }) => {
    return (
        <>
            <tr key={user.id} className="hover:bg-base-200">
                <td>
                    <div className="flex items-center space-x-3">
                        <div className="avatar">
                            <div className="mask mask-squircle w-12 h-12">
                                <Avatar
                                    srcAvatar={user.avatar}
                                    nameOfUser={user.name}
                                />
                            </div>
                        </div>
                        <div>
                            <div className="font-bold">{user.name}</div>
                            <div className="text-sm opacity-50">
                                {user.email}
                            </div>
                            <div className="text-xs opacity-50">
                                Joined: {user.joinedAt}
                            </div>
                        </div>
                    </div>
                </td>
                <td>
                    <div className="text-sm">
                        <div>{user.location.state}</div>
                        <div className="text-xs opacity-50">
                            {user.location.city}, {user.location.postal}
                        </div>
                    </div>
                </td>
                <td>
                    <Status statusOfUser={user.status} />
                </td>
                <td>
                    <div className="text-sm">
                        <div>Activities: {user.stats.totalActivities}</div>
                        <div>Donations: {user.stats.totalDonations}</div>
                        <div>Badges: {user.stats.badgeCount}</div>
                    </div>
                </td>
                <td>
                    <div className="btn-group">
                        <button
                            className="btn btn-sm btn-ghost tooltip"
                            data-tip="View Profile"
                            onClick={() =>
                                router.push(`/admin/users/${user.id}`)
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
                    </div>
                </td>
            </tr>
        </>
    );
};
export default UserRow;
