"use client";

import getActivityStatus from "@/utils/getActivityStatus";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import "@/app/shared/css/ActivityDetails.css";
import Image from "next/image";
import Avatar from "@/app/shared/components/avatar";
import ActivityIcon from "@/app/shared/components/ActivityIcon";
import { FaBurn, FaCalendar, FaClock, FaTrophy } from "react-icons/fa";
import { IoPersonSharp } from "react-icons/io5";
import formatDate from "@/utils/formatDate";
import Featured from "./Featured";
import api from "@/utils/axios/api";
import ShareDialog from "@/app/shared/components/ShareDialog";
import toast from "@/utils/Toast";
import ActivitySummary from "./ActivitySummary";
import { FaLocationDot } from "react-icons/fa6";
import calculateSeats from "@/utils/calculateSeats";
import { MdEventSeat } from "react-icons/md";
import Tooltip from "./Tooltip";
import { useTranslations } from "next-intl";
import { useAuth } from "../contexts/authContext";

const ActivityDetails = ({
    activity,
    setActivities,
    user,
    setUser,
    formattedStartTime,
    formattedEndTime,
}) => {
    const topRef = useRef(null);
    const [loading, setLoading] = useState(false);
    const [showShare, setShowShare] = useState(false);
    const [tncChecked, setTncChecked] = useState(false);
    const t = useTranslations();

    const { authToken } = useAuth();
    const { status: activityStatus } = getActivityStatus(activity);
    let hideJoin = false;
    let wasPresent = false;
    const isCancelledOrClosed =
        activity.status === "cancelled" || activity.status === "closed";
    if (user && Array.isArray(user.userActivities) && activity.id) {
        const ua = user.userActivities.find(
            (ua) => ua.activityId === activity.id
        );
        if (ua && ua.wasPresent) wasPresent = true;
    }
    if (
        activityStatus === "completed" ||
        activityStatus === "finished" ||
        wasPresent ||
        isCancelledOrClosed
    ) {
        hideJoin = true;
    } else {
        const end = new Date(activity.endDate);
        if (activity.endTime) {
            const t = new Date(activity.endTime);
            if (!isNaN(t)) {
                end.setHours(
                    t.getHours(),
                    t.getMinutes(),
                    t.getSeconds() || 0,
                    0
                );
            }
        }
        const now = new Date();
        const msLeft = end - now;
        if (msLeft <= 6 * 60 * 60 * 1000) {
            hideJoin = true;
        }
    }

    useEffect(() => {
        if (topRef.current) {
            topRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, []);

    const { seatsLeft } = calculateSeats(activity);

    const hasTncs =
        Array.isArray(activity?.tncs) && activity.tncs.length > 0;

    function renderTncLinks() {
        if (!hasTncs) return null;
        const andText = t('Activity.DetailsPage.and');
        const links = activity.tncs.map((tnc) => {
            const slug =
                typeof tnc.title === 'string'
                    ? tnc.title.replace(/\s+/g, '-')
                    : '';
            return (
                <Link
                    key={tnc.id}
                    href={`/activities/${activity.id}/${slug}`}
                    style={{
                        color: '#0099c4',
                        textDecoration: 'underline',
                        margin: '0 4px',
                        wordBreak: 'break-word',
                        whiteSpace: 'normal',
                    }}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    {tnc.title}
                </Link>
            );
        });
        if (links.length === 1) return links[0];
        if (links.length === 2)
            return (
                <>
                    {links[0]} {andText} {links[1]}
                </>
            );
        return (
            <>
                {links.slice(0, -1).map((node, idx) => (
                    <React.Fragment key={idx}>
                        {node}
                        {idx < links.length - 2 ? ', ' : ''}
                    </React.Fragment>
                ))}{' '}
                {andText} {links[links.length - 1]}
            </>
        );
    }

    async function handleJoin() {
        if (!authToken) {
            window.location.href = "/auth/login";
            return;
        }
        if (hasTncs && !tncChecked) {
            toast.warning(t('Activity.DetailsPage.agreeTncWarning'));
            return;
        }
        if (activity.status !== "active") {
            toast.warning(t('Activity.DetailsPage.notActiveWarning'));
            return;
        }
        if (!user.weight || !user.height) {
            toast.warning(t('Activity.DetailsPage.fillProfileWarning'));
            return (window.location.href = `/my/profile?editProfile=1&returnTo=${encodeURIComponent(
                window.location.pathname
            )}`);
        }
        try {
            setLoading(true);
            const res = await api.post("/my/activities/join", {
                activityId: activity.id,
            });
            setUser((prevUser) => ({
                ...prevUser,
                joinedActivityIds: [
                    ...(prevUser.joinedActivityIds || []),
                    res.data?.userActivity?.activityId,
                ],
            }));
            setActivities((prevActivities) =>
                prevActivities.map((act) =>
                    act.id === activity.id
                        ? { ...act, participantCount: (act.participantCount || 0) + 1 }
                        : act
                )
            );
        } catch (error) {
            const status = error?.response?.status;
            const serverMsg = error?.response?.data?.error;
            if (status === 401 && serverMsg?.includes("Token")) {
                window.location.href = "/auth/login";
            } else if (
                status === 400 &&
                serverMsg?.includes("Activity is not")
            ) {
                toast.warning(t('Activity.DetailsPage.notActiveWarning'));
            } else if (serverMsg) {
                if (
                    serverMsg.toLowerCase().includes("height") ||
                    serverMsg.toLowerCase().includes("weight")
                ) {
                    window.location.href = `/my/profile?editProfile=1&returnTo=${encodeURIComponent(
                        window.location.pathname
                    )}`;
                }
            }
        } finally {
            setLoading(false);
        }
    }

    async function handleLeave() {
        try {
            setLoading(true);
            await api.delete("/my/activities/leave", {
                data: { activityId: activity.id },
            });
            setUser((prevUser) => {
                const prevIds = Array.isArray(prevUser.joinedActivityIds)
                    ? prevUser.joinedActivityIds
                    : [];
                const removeId = activity.id;
                return {
                    ...prevUser,
                    joinedActivityIds: prevIds.filter((id) => id !== removeId),
                };
            });
            setActivities((prevActivities) =>
                prevActivities.map((act) =>
                    act.id === activity.id
                        ? { ...act, participantCount: Math.max(0, (act.participantCount || 1) - 1) }
                        : act
                )
            );
        } catch (error) {
            if (
                error.status === 401 &&
                error.response?.data?.error?.includes("Token")
            ) {
                window.location.href = "/auth/login";
            }
        } finally {
            setLoading(false);
        }
    }

    const tooltipText = t('Activity.ActivityItem.startEndFull', {
        startDate: formatDate(activity.startDate),
        startTime: formattedStartTime,
        endDate: formatDate(activity.endDate),
        endTime: formattedEndTime,
    });

    return (
        <div className="activityDetailsPage" ref={topRef}>
            <div className="activityDetailsContent">
                <main className="activityDetailsMain">
                    <h1 className="activityDetailsMainTitle">
                        {activity.title}
                    </h1>
                    <div className="activityDetailsMainDesc">
                        <div className="activityDetailsHero">
                            {activity.imageUrl && (
                                <Image
                                    src={activity.imageUrl}
                                    alt={activity.activityType}
                                    fill={true}
                                    className="activityDetailsImage"
                                    priority
                                />
                            )}
                            {activity.isFeatured && (
                                <Featured position="bottom" />
                            )}
                        </div>
                        <section className="desc-section">
                            <p>{activity.description}</p>
                        </section>
                    </div>
                    <div className="activityDetailsDetailsSection">
                        <h2 className="activityDetailsDetailsTitle">
                            {t('Activity.DetailsPage.detailsTitle')}
                        </h2>
                        <div className="activityDetailsDetailsGrid">
                            <div className="activityDetailsDetailsItem">
                                <span role="img" aria-label="type">
                                    <ActivityIcon
                                        type={activity.activityType}
                                        className="logo"
                                    />
                                </span>
                                <div>
                                    <div className="activityDetailsDetailsLabel">
                                        {t('Activity.DetailsPage.activityTypeLabel')}
                                    </div>
                                    <div className="activityDetailsDetailsValue">
                                        {activity.activityType}
                                    </div>
                                </div>
                            </div>
                            <div className="activityDetailsDetailsItem">
                                <span role="img" aria-label="points">
                                    <FaTrophy className="logo" />
                                </span>
                                <div>
                                    <div className="activityDetailsDetailsLabel">
                                        {t('Activity.DetailsPage.totalCaloriesLabel')}
                                    </div>
                                    <div className="activityDetailsDetailsValue">
                                        {activity.totalCaloriesBurnt}{" "}
                                        calories burnt
                                    </div>
                                </div>
                            </div>
                            <div className="activityDetailsDetailsItem">
                                <span role="img" aria-label="calories">
                                    <FaBurn className="logo" />
                                </span>
                                <div>
                                    <div className="activityDetailsDetailsLabel">
                                        {t('Activity.DetailsPage.caloriesPerHourLabel')}
                                    </div>
                                    <div className="activityDetailsDetailsValue">
                                        {activity.caloriesPerHour || "—"}{" "}
                                        calories/hour
                                    </div>
                                </div>
                            </div>
                            <div className="activityDetailsDetailsItem">
                                <span role="img" aria-label="organizer">
                                    <IoPersonSharp className="logo" />
                                </span>
                                <div>
                                    <div className="activityDetailsDetailsLabel">
                                        {t('Activity.DetailsPage.organizerLabel')}
                                    </div>
                                    <div className="activityDetailsDetailsValue">
                                        {activity.organizationName || t('Activity.DetailsPage.unknown')}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {activity.summary && (
                        <ActivitySummary summary={activity.summary} />
                    )}
                </main>
                <aside className="activityDetailsSidebar">
                    <Tooltip content={tooltipText} width={'16rem'}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div className="activityDetailsSidebarRow">
                                <FaCalendar className="logo logo-faded" size={22} />
                                <span>{`${formatDate(
                                    activity.startDate
                                )} - ${formatDate(activity.endDate)}`}</span>
                            </div>
                            <div className="activityDetailsSidebarRow">
                                <FaClock className="logo logo-faded" />
                                <span>{`${formattedStartTime} - ${formattedEndTime}`}</span>
                            </div>
                        </div>
                    </Tooltip>
                    <div className="activityDetailsSidebarRow">
                        <span>
                            <FaLocationDot className="logo logo-faded" />
                        </span>
                        <span>{activity.location}</span>
                    </div>
                    <div className="activityDetailsSidebarRow">
                        <span>
                            <MdEventSeat
                                className="logo logo-faded"
                                size={28}
                            />
                        </span>
                        <span>
                            {t(
                                seatsLeft === 1
                                    ? 'Activity.DetailsPage.seatsLeft_one'
                                    : 'Activity.DetailsPage.seatsLeft_other'
                            ).replace('#', seatsLeft)}
                        </span>
                    </div>
                    {/* Avatars */}
                    <div className="activityDetailsAvatars">
                        {Array.isArray(activity.participants) &&
                            activity.participants
                                .slice(0, 7)
                                .map((p, idx) => {
                                    const first = p.firstname || "";
                                    const last = p.lastname || "";
                                    const full = `${(first + " " + last).trim()}`;
                                    const alt = full || "avatar";
                                    return (
                                        <Avatar
                                            key={idx}
                                            srcAvatar={p.profilePictureUrl}
                                            firstName={first}
                                            lastName={last}
                                            title={alt}
                                            isNav={true}
                                        />
                                    );
                                })}
                        {activity.participantCount > 7 && (
                            <span className="activityDetailsAvatarMore">
                                +{activity.participantCount - 7}
                            </span>
                        )}
                    </div>
                    <div className="activityDetailsSidebarActions">
                        {/* Disable join/share if completed or <6h left */}
                        {/* TNC Checkbox for joining */}
                        {!user?.joinedActivityIds?.includes(activity.id) &&
                            hasTncs && (
                                <div
                                    className="activityDetailsTncCheckbox"
                                    style={{ marginBottom: "12px" }}
                                >
                                    <label
                                        style={{
                                            fontSize: "0.95em",
                                            flexWrap: "wrap",
                                            lineHeight: "1.4",
                                        }}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={tncChecked}
                                            onChange={(e) =>
                                                setTncChecked(e.target.checked)
                                            }
                                            style={{
                                                marginRight: "8px",
                                                marginTop: "3px",
                                            }}
                                            disabled={hideJoin}
                                        />
                                        <span style={{ display: 'inline', wordBreak: 'break-word', whiteSpace: 'normal' }}>
                                            {t('Activity.DetailsPage.acceptTncsPrefix')}{' '}
                                            {renderTncLinks()}
                                        </span>
                                    </label>
                                </div>
                            )}

                        {user?.joinedActivityIds?.includes(activity.id) ? (
                            <button
                                className="activityDetailsBtn"
                                onClick={handleLeave}
                                disabled={loading || hideJoin || wasPresent}
                            >
                                {loading
                                    ? t('Activity.DetailsPage.leaving')
                                    : t('Activity.DetailsPage.leave')}
                            </button>
                        ) : (
                            <button
                                className="activityDetailsBtn"
                                onClick={handleJoin}
                                disabled={loading || hideJoin}
                            >
                                {loading
                                    ? t('Activity.DetailsPage.joining')
                                    : t('Activity.DetailsPage.joinNow')}
                            </button>
                        )}
                        <button
                            className="activityDetailsShareBtn"
                            onClick={() => setShowShare(true)}
                        >
                            {t('Activity.DetailsPage.share')}
                        </button>
                        {showShare && (
                            <ShareDialog
                                url={
                                    typeof window !== "undefined"
                                        ? window.location.origin +
                                        `/activities/${activity.id}`
                                        : `/activities/${activity.id}`
                                }
                                onClose={() => setShowShare(false)}
                            />
                        )}
                    </div>
                    {activity.mapUrl ? (
                        /^https:\/\/(www\.)?google\.(com|co\.[a-z]{2})\/maps/.test(
                            activity.mapUrl
                        ) && (
                            <div style={{ width: "100%", margin: "32px 0" }}>
                                <iframe
                                    title="Activity Map"
                                    src={activity.mapUrl}
                                    width="100%"
                                    height="320"
                                    style={{ border: 0, borderRadius: "12px" }}
                                    allowFullScreen
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                ></iframe>
                            </div>
                        )
                    ) : (
                        <div style={{ width: '100%', margin: '32px 0', color: 'red', textAlign: 'center' }}>
                            {t('Activity.DetailsPage.mapError')}
                        </div>
                    )}
                </aside>
            </div>
        </div>
    );
};

export default ActivityDetails;
