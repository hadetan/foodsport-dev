import React from "react";
import { Users, Pencil, Trash2, Search } from "lucide-react";
import { useRouter } from "next/navigation";

// Status color mapping
const statusBadgeClass = {
    upcoming: "bg-yellow-400 text-black btn-md",
    active: "bg-green-500 text-white btn-md",
    closed: "bg-gray-500 text-white btn-md",
    completed: "bg-blue-500 text-white btn-md",
    cancelled: "bg-red-700 text-white btn-md",
    draft: "bg-pink-400 text-white btn-md",
};

const ActivityRow = ({ activity }) => {
    const router = useRouter();
    return (
        <>
            <tr key={activity.id} className="text-base">
                <td>
                    <div className="flex items-center space-x-3">
                        <div className="avatar">
                            <div className="mask mask-squircle w-16 h-16">
                                <img
                                    src={activity.image}
                                    alt={activity.title}
                                    className="cursor-pointer hover:opacity-75"
                                    onClick={() => {
                                        if (activity.image) {
                                            setSelectedImage(activity.image);
                                            setIsImageModalOpen(true);
                                        }
                                    }}
                                />
                            </div>
                        </div>
                        <div>
                            <div className="font-bold text-base">
                                {activity.title}
                            </div>
                        </div>
                    </div>
                </td>
                <td className="text-base">{activity.type}</td>
                <td className="text-base">
                    <div>{activity.date}</div>
                    <div className="text-sm opacity-50">{activity.time}</div>
                </td>
                <td className="text-base">{activity.location}</td>
                <td>
                    <div className="flex flex-col gap-1">
                        <div className="text-sm">
                            {activity.participantCount}/
                            {activity.participantLimit}
                        </div>
                        <progress
                            className="progress progress-primary w-32 h-4"
                            value={
                                activity.participantLimit
                                    ? (activity.participantCount /
                                          activity.participantLimit) *
                                      100
                                    : 0
                            }
                            max="100"
                        ></progress>
                    </div>
                </td>
                <td>
                    <div
                        className={`badge px-5 py-2 rounded-full font-bold text-base ${
                            statusBadgeClass[activity.status]
                        }`}
                    >
                        {activity.status}
                    </div>
                </td>
                <td>
                    <div className="btn-group">
                        <button
                            className="btn btn-md btn-ghost"
                            onClick={() =>
                                document
                                    .getElementById("view_participants_modal")
                                    .showModal()
                            }
                        >
                            <Users size={24} />
                        </button>
                        <button
                            className="btn btn-md btn-ghost"
                            onClick={() =>
                                router.push(
                                    "/admin/activities/editActivity?id=" +
                                        activity.id
                                )
                            }
                        >
                            <Pencil size={24} />
                        </button>
                        <button className="btn btn-md btn-ghost text-error">
                            <Trash2 size={24} />
                        </button>
                    </div>
                </td>
            </tr>
        </>
    );
};

export default ActivityRow;
