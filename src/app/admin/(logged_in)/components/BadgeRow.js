import React, { useState } from "react";
import { Eye, Pencil } from "lucide-react";
import { useRouter } from "next/navigation";

const BadgeRow = ({ badge }) => {
    const router = useRouter();
    const [imageError, setImageError] = useState(false);

    // Helper to capitalize first letter of each word
    const capitalize = (str) => {
        if (!str) return "";
        return str.replace(/\b\w/g, (c) => c.toUpperCase()).replace(/_/g, " ");
    };

    return (
        <tr
            key={badge.id}
            className="text-base align-middle cursor-pointer hover:bg-purple-100"
        >
            {/* Badge Name with Image */}
            <td className="align-middle">
                <div className="flex items-center space-x-3">
                    {badge.imageUrl && !imageError && (
                        <div className="avatar">
                            <div className="mask mask-squircle w-16 h-16">
                                <img
                                    src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${badge.imageUrl}`}
                                    alt={badge.name}
                                    className="cursor-pointer hover:opacity-75"
                                    onError={() => {
                                        setImageError(true);
                                    }}
                                />
                            </div>
                        </div>
                    )}
                    <div className="min-w-[120px] sm:min-w-[160px] md:min-w-[200px]">
                        <div className="font-bold text-base max-w-[220px] md:max-w-[320px] break-words">
                            {badge.name}
                        </div>
                        {badge.nameZh && (
                            <div className="text-sm text-gray-500 max-w-[220px] md:max-w-[320px] break-words">
                                {badge.nameZh}
                            </div>
                        )}
                    </div>
                </div>
            </td>

            {/* Activity Name */}
            <td className="text-base align-middle">
                {badge.activity ? (
                    <div>
                        <div className="font-semibold">{badge.activity.title}</div>
                        {badge.activity.titleZh && (
                            <div className="text-sm text-gray-500">
                                {badge.activity.titleZh}
                            </div>
                        )}
                    </div>
                ) : (
                    <span className="text-gray-400 italic">No specific activity</span>
                )}
            </td>

            {/* Activity Type */}
            <td className="text-base align-middle">
                {badge.activity?.activityType ? (
                    capitalize(badge.activity.activityType)
                ) : (
                    <span className="text-gray-400 italic">N/A</span>
                )}
            </td>

            {/* Description */}
            <td className="text-base align-middle">
                <div className="max-w-xs">
                    <div className="truncate" title={badge.description}>
                        {badge.description || (
                            <span className="text-gray-400 italic">No description</span>
                        )}
                    </div>
                    {badge.descriptionZh && (
                        <div className="text-sm text-gray-500 truncate" title={badge.descriptionZh}>
                            {badge.descriptionZh}
                        </div>
                    )}
                </div>
            </td>

            {/* Badge Rules */}
            <td className="text-base align-middle">
                <div className="flex flex-col gap-1 text-sm max-w-xs">
                    {badge.badgeRules && badge.badgeRules.length > 0 ? (
                        badge.badgeRules.map((rule, index) => (
                            <div key={rule.id || index} className="mb-1">
                                <span className="font-semibold capitalize">
                                    {(rule.ruleType || rule.type)?.replace(/_/g, " ") || "N/A"}
                                </span>
                                {!rule.isActive && (
                                    <span className="ml-2 text-xs text-gray-500">(Inactive)</span>
                                )}
                            </div>
                        ))
                    ) : (
                        <span className="text-gray-400 italic">No rules defined</span>
                    )}
                </div>
            </td>

            {/* Target Value */}
            <td className="text-base align-middle text-center">
                <div className="flex flex-col gap-1 text-sm">
                    {badge.badgeRules && badge.badgeRules.length > 0 ? (
                        badge.badgeRules.map((rule, index) => (
                            <div key={rule.id || index} className="mb-1">
                                {rule.targetValue ? (
                                    <span className="font-semibold">{rule.targetValue}</span>
                                ) : (
                                    <span className="text-gray-400 italic">N/A</span>
                                )}
                            </div>
                        ))
                    ) : (
                        <span className="text-gray-400 italic">-</span>
                    )}
                </div>
            </td>

            {/* Actions */}
            <td className="text-base align-middle text-center">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/admin/badges/${badge.id}`);
                    }}
                    className="btn btn-ghost btn-sm btn-circle hover:bg-primary hover:text-white"
                    title="Edit Badge"
                >
                    <Pencil size={18} />
                </button>
            </td>
        </tr>
    );
};

export default BadgeRow;
