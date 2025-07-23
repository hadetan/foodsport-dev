import React from "react";
import { Users, Pencil, Trash2, Search } from "lucide-react";
import { useRouter } from "next/navigation";

const ActivityRow = ({ activity, shouldShowEdit, setActivity }) => {
    const router = useRouter();

    const handleEdit = () => {
        shouldShowEdit(true);
        setActivity(activity);
    };
    return (
        <>
            <tr key={activity.id}>
                <td>
                    <div className="flex items-center space-x-3">
                        <div className="avatar">
                            <div className="mask mask-squircle w-12 h-12">
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
                            <div className="font-bold">{activity.title}</div>
                        </div>
                    </div>
                </td>
                <td>{activity.type}</td>
                <td>
                    <div>{activity.date}</div>
                    <div className="text-sm opacity-50">{activity.time}</div>
                </td>
                <td>{activity.location}</td>
                <td>
                    <div className="flex flex-col gap-1">
                        <div className="text-sm">
                            {activity.participantCount}/
                            {activity.participantLimit}
                        </div>
                        <progress
                            className="progress progress-primary w-20"
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
                            onClick={handleEdit}
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
