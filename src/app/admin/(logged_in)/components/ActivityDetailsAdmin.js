"use client";

import React, { useState } from "react";
import Link from "next/link";
import "@/app/shared/css/ActivityDetails.css";
import Image from "next/image";
import Avatar from "@/app/shared/components/avatar";
import ActivityIcon from "@/app/shared/components/ActivityIcon";
import { FaBurn, FaCalendar, FaClock, FaTrophy } from "react-icons/fa";
import { IoPersonSharp } from "react-icons/io5";
import formatDate from "@/utils/formatDate";
import Featured from "@/app/shared/components/Featured";
import ActivitySummary from "@/app/shared/components/ActivitySummary";
import { FaLocationDot } from "react-icons/fa6";
import calculateSeats from "@/utils/calculateSeats";
import { MdEventSeat } from "react-icons/md";
import '@/app/shared/css/public.css'
import ShareDialog from "@/app/shared/components/ShareDialog";

const ActivityDetailsAdmin = ({
    activity,
    formattedStartTime,
    formattedEndTime,
    showZh = false,
}) => {
    const [showShare, setShowShare] = useState(false);
    const { seatsLeft } = calculateSeats(activity);

    return (
        <div className="activityDetailsPage">
            <div className="activityDetailsContent">
                <main className="activityDetailsMain">
                    <h1 className="activityDetailsMainTitle" style={{border: 'none', marginBottom: '10px'}}>
                        {showZh ? (activity.titleZh || activity.title) : activity.title}
                    </h1>
                    <div className="activityDetailsSidebarRow" style={{borderBottom: '1px solid #dadada', paddingBottom: '10px', marginBottom: '30px'}}>
                        <p style={{fontSize: '18px'}}>
                            <span>Activity Created By{' '}</span>
                            <span style={{fontWeight: '600'}}>{activity.organizerName}</span>
                        </p>
                    </div>
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
                            <p>{showZh ? (activity.descriptionZh || activity.description) : activity.description}</p>
                        </section>
                    </div>
                    <div className="activityDetailsDetailsSection">
                        <h2 className="activityDetailsDetailsTitle">
                            Activity Details
                        </h2>
                        <div className="activityDetailsDetailsGrid">
                            <div className="activityDetailsDetailsItem">
                                <span role="img" aria-label="type">
                                    <ActivityIcon
                                        type={activity.activityType}
                                        className="logo"
                                        translate={false}
                                    />
                                </span>
                                <div>
                                    <div className="activityDetailsDetailsLabel">
                                        Activity Type
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
                                        Calories Burned
                                    </div>
                                    <div className="activityDetailsDetailsValue">
                                        {activity.totalCaloriesBurnt || "—"}{" "}
                                        Total Calories Burnt
                                    </div>
                                </div>
                            </div>
                            <div className="activityDetailsDetailsItem">
                                <span role="img" aria-label="calories">
                                    <FaBurn className="logo" />
                                </span>
                                <div>
                                    <div className="activityDetailsDetailsLabel">
                                        Calories Burned
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
                                        Organizer
                                    </div>
                                    <div className="activityDetailsDetailsValue">
                                        {activity.organizationName || 'Unknown'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    { (showZh ? (activity.summaryZh || activity.summary) : activity.summary) && (
                        <ActivitySummary summary={ showZh ? (activity.summaryZh || activity.summary) : activity.summary } />
                    )}
                </main>
                <aside className="activityDetailsSidebar">
                    <div style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
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
                            {seatsLeft} {seatsLeft === 1 ? 'Seat left' : 'Seats left'}
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
                                            className="activityDetailsAvatar"
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
                        {activity.tnc && (
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
                                            style={{
                                                marginRight: "8px",
                                                marginTop: "3px",
                                            }}
                                            disabled={true}
                                        />
                                        <span style={{display: 'inline', wordBreak: 'break-word', whiteSpace: 'normal'}}>I accept the 
                                            <Link
                                                href={`/activities/${activity.id}/${activity.tnc.title.replace(/\s+/g, '-')}`}
                                                style={{
                                                    color: '#0099c4',
                                                    textDecoration: 'underline',
                                                    margin: '0 4px',
                                                    wordBreak: 'break-word',
                                                    whiteSpace: 'normal'
                                                }}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                conditions
                                            </Link>
                                            for participating on the event
                                        </span>
                                    </label>
                                </div>
                            )}

                        <button
                            className="activityDetailsBtn"
                            disabled={true}
                        >
                            JOIN NOW
                        </button>
                        <button
                            className="activityDetailsShareBtn"
                            onClick={() => setShowShare(true)}
                        >
                            SHARE
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
                            Something went wrong while loading map.
                        </div>
                    )}
                </aside>
            </div>
        </div>
    );
};

export default ActivityDetailsAdmin;
