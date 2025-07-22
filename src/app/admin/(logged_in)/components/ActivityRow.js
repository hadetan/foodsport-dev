import React from "react";
import { Users, Pencil, Trash2, Search } from "lucide-react";

// Status color mapping
const statusBadgeClass = {
    upcoming: "bg-yellow-400 text-black btn-lg",
    active: "bg-green-500 text-white btn-lg",
    closed: "bg-gray-500 text-white btn-lg",
    completed: "bg-blue-500 text-white btn-lg",
    cancelled: "bg-red-700 text-white btn-lg",
    draft: "bg-pink-400 text-white btn-lg",
};

const ActivityRow = ({ activity }) => {
    return (
        <>
            <tr key={activity.id} className="text-lg">
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
                            <div className="font-bold text-xl">
                                {activity.title}
                            </div>
                        </div>
                    </div>
                </td>
                <td className="text-lg">{activity.type}</td>
                <td className="text-lg">
                    <div>{activity.date}</div>
                    <div className="text-base opacity-50">{activity.time}</div>
                </td>
                <td className="text-lg">{activity.location}</td>
                <td>
                    <div className="flex flex-col gap-1">
                        <div className="text-base">
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
                        className={`badge px-5 py-2 rounded-full font-bold text-lg ${
                            statusBadgeClass[activity.status] ||
                            "bg-gray-200 text-black btn-lg"
                        }`}
                    >
                        {activity.status}
                    </div>
                </td>
                <td>
                    <div className="btn-group">
                        <button
                            className="btn btn-lg btn-ghost"
                            onClick={() =>
                                document
                                    .getElementById("view_participants_modal")
                                    .showModal()
                            }
                        >
                            <Users size={28} />
                        </button>
                        <button
                            className="btn btn-lg btn-ghost"
                            onClick={() =>
                                router.push(`/admin/activities/${activity.id}`)
                            }
                        >
                            <Pencil size={28} />
                        </button>
                        <button className="btn btn-lg btn-ghost text-error">
                            <Trash2 size={28} />
                        </button>
                    </div>
                </td>
            </tr>
        </>
    );
};

export default ActivityRow;
