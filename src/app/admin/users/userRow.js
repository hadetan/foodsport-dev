import React from "react";
import Status from "@/app/admin/users/status";
import Avatar from "@/app/admin/users/avatar";
import {Pencil,Eye} from 'lucide-react'

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
                            <Pencil/>
                        </button>
                        <button
                            className="btn btn-sm btn-ghost tooltip"
                            data-tip="Edit User"
                        >
                            <Eye/>
                        </button>
                    </div>
                </td>
            </tr>
        </>
    );
};
export default UserRow;
