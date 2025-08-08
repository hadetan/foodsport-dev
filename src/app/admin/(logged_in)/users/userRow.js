import React from "react";
import Status from "@/app/admin/(logged_in)/users/status";
import Avatar from "@/app/shared/components/avatar";
import { Pencil, Eye } from "lucide-react";

export const UserRow = ({ user, onRowClick }) => {
    return (
        <tr
            className="cursor-pointer hover:bg-base-200"
            onClick={() => onRowClick && onRowClick(user.id)}
        >
            <td>
                <div className="flex items-center space-x-3">
                    <div className="avatar">
                        <div className="mask mask-squircle w-12 h-12">
                            <Avatar
                                srcAvatar={user.avatar}
                                firstName={user.firstname}
                                lastName={user.lastname}
                            />
                        </div>
                    </div>
                    <div>
                        <div className="font-bold">
                            {user.firstname +
                                " " +
                                (user.lastname !== undefined
                                    ? user.lastname
                                    : "")}
                        </div>
                        <div className="text-sm opacity-50">{user.email}</div>
                       
                    </div>
                </div>
            </td>
            <td>
                <div className="text-sm">
                <div className="text-l opacity-100">
                         {new Date(user.joinDate).toLocaleDateString()}
                        </div>
                </div>
            </td>
            <td>
                <Status statusOfUser={user.isActive} />
            </td>
            <td>
                <div className="text-sm">
                    <div>Activities: {user.stats?.totalActivities}</div>
                    <div>Donations: {user.stats?.totalDonations}</div>
                    <div>Badges: {user.stats?.badgeCount}</div>
                </div>
            </td>
            <td>
                <div className="btn-group">
                    <button
                        className="btn btn-sm btn-ghost tooltip"
                        data-tip="View Profile"
                        onClick={() => router.push(`/admin/users/${user.id}`)}
                    >
                        <Pencil />
                    </button>
                    <button
                        className="btn btn-sm btn-ghost tooltip"
                        data-tip="Edit User"
                    >
                        <Eye />
                    </button>
                </div>
            </td>
        </tr>
    );
};
export default UserRow;
