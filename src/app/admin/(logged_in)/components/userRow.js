import React from "react";
import Status from "@/app/admin/(logged_in)/components/status";
import Avatar from "@/app/shared/components/avatar";
import { Pencil } from "lucide-react";
import formatDate from "@/utils/formatDate";
import { useRouter } from "next/navigation";

export const UserRow = ({ user, onRowClick }) => {
    const router = useRouter();
    return (
        <tr
            className="cursor-pointer hover:bg-base-200"
            onClick={() => onRowClick && onRowClick(user.id)}
        >
            <td>
                <div className="flex items-center space-x-3">
                    <div className="avatar">
                        <div className="mask mask-squircle w-12 h-12">
                            {
                                <Avatar
                                    srcAvatar={user.profilePictureUrl}
                                    firstName={user.firstname}
                                    lastName={user.lastname}
                                />
                            }
                        </div>
                    </div>
                    <div className="min-w-[120px] sm:min-w-[160px] md:min-w-[200px]">
                        <div className="font-bold max-w-[220px] md:max-w-[320px] break-words">
                            {user.firstname +
                                " " +
                                (user.lastname !== undefined
                                    ? user.lastname
                                    : "")}
                        </div>
                        <div className="text-sm opacity-50 truncate">{user.email}</div>
                    </div>
                </div>
            </td>
            <td>
                <div className="text-sm">
                    <div className="text-l opacity-100">
                        {formatDate(user.createdAt.split("T")[0])}
                    </div>
                </div>
            </td>
            <td>
                <Status statusOfUser={user.isActive} isRegistered={user.isRegistered} />
            </td>
            <td>
                <div className="text-sm">
                    <div>Activities: {user.stats?.totalActivities || 0}</div>
                    <div>Donations: {user.stats?.totalDonations || 0}</div>
                    <div>Badges: {user.stats?.badgeCount || 0}</div>
                </div>
            </td>
            <td>
                <div className="btn-group">
                    <button
                        className="btn btn-sm btn-ghost tooltip "
                        data-tip="Edit User"
                        onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/admin/users/${user.id}`);
                        }}
                    >
                        <Pencil />
                    </button>
                   
                </div>
            </td>
        </tr>
    );
};
export default UserRow;
