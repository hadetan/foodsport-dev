import React from "react";
import { Users, Pencil, Trash2, Search } from "lucide-react";

const ActivityRow = ({ activity }) => {
    return (
        <>
            <tr key={activity.id}>
                <td>
                    <div className="flex items-center space-x-3">
                        <div className="avatar">
                            <div className="mask mask-squircle w-12 h-12">
                                <img
                                    src={
                                        activity.image ||
                                        "https://placehold.co/100x100"
                                    }
                                    alt={activity.title || "Placeholder"}
                                    className="cursor-pointer hover:opacity-75"
                                    onClick={() => {
                                        if (activity.image) {
                                            setSelectedImage(activity.image);
                                            setIsImageModalOpen(true);
                                        }
                                    }}
                                    onError={(e) => {
                                        e.target.src =
                                            "https://placehold.co/100";
                                    }}
                                />
                            </div>
                        </div>
                        <div>
                            <div className="font-bold">{activity.title}</div>
                        </div>
                    </div>
                </td>
                <td>{activity.type || "null"}</td>
                <td>
                    <div>{activity.date || "null"}</div>
                    <div className="text-sm opacity-50">
                        {activity.time || "null"}
                    </div>
                </td>
                <td>{activity.location || "null"}</td>
                <td>
                    <div className="flex flex-col gap-1">
                        <div className="text-sm">
                            {activity.enrolled || "null"}/
                            {activity.capacity || "null"}
                        </div>
                        <progress
                            className="progress progress-primary w-20"
                            value={
                                activity.capacity
                                    ? (activity.enrolled / activity.capacity) *
                                      100
                                    : 0
                            }
                            max="100"
                        ></progress>
                    </div>
                </td>
                <td>
                    <div
                        className={`badge ${
                            activity.status === "active"
                                ? "badge-success"
                                : activity.status === "pending"
                                ? "badge-warning"
                                : activity.status === "completed"
                                ? "badge-info"
                                : "badge-error"
                        }`}
                    >
                        {activity.status}
                    </div>
                </td>
                <td>
                    <div className="btn-group">
                        <button
                            className="btn btn-sm btn-ghost"
                            onClick={() =>
                                document
                                    .getElementById("view_participants_modal")
                                    .showModal()
                            }
                        >
                            <Users />
                        </button>
                        <button
                            className="btn btn-sm btn-ghost"
                            onClick={() =>
                                router.push(`/admin/activities/${activity.id}`)
                            }
                        >
                            <Pencil />
                        </button>
                        <button className="btn btn-sm btn-ghost text-error">
                            <Trash2 />
                        </button>
                    </div>
                </td>
            </tr>
        </>
    );
};

export default ActivityRow;
