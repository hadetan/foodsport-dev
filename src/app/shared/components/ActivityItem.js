import styles from "@/app/shared/css/item.module.css";
import Image from "next/image";
import Link from "next/link";

export default function ActivityItem({
    activity,
    setActivityData,
    setShowActivity
}) {
    // const Wrapper = href ? Link : "div";
    // const wrapperProps = href
    //     ? { href, style: { textDecoration: "none", color: "inherit" } }
    //     : {};
    let formattedDate = activity.startDate;
    let formattedTime = activity.startTime;
    if (typeof activity.startDate === 'string' && !isNaN(Date.parse(activity.startDate))) {
        formattedDate = new Date(activity.startDate).toLocaleDateString();
    }
    if (typeof activity.startTime === 'string' && !isNaN(Date.parse(activity.startTime))) {
        formattedTime = new Date(activity.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    return (
        // <Wrapper {...wrapperProps}>
            <div className={styles.card}>
                {activity.isFeatured && (
                    <div className={styles.featuredBadge}>★ Featured</div>
                )}
                <div className={styles.imageWrapper}>
                    {activity.imageUrl && (
                        <Image
                        src={activity.imageUrl}
                        alt={activity.activityType}
                        fill
                        className="image-full"
                        onClick={() => {
                            setActivityData(activity)
                            setShowActivity(true);
                        }}
                    />
                    )}
                    <div className={styles.overlayText}>{activity.activityType}</div>
                </div>
                <div className={styles.content}>
                    <div className={styles.row}>
                        <div>
                            <div className="card-title">{activity.title}</div>
                            <div className={styles.subtitle}>{activity.description}</div>
                        </div>
                        <button className={styles.filterBtn} title="Filter">
                            <svg
                                width="28"
                                height="28"
                                viewBox="0 0 28 28"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <rect
                                    width="28"
                                    height="28"
                                    rx="8"
                                    fill="#FFE23B"
                                />
                                <path
                                    d="M8 11H20M10 15H18"
                                    stroke="#444"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                />
                            </svg>
                        </button>
                    </div>
                    <div className={styles.infoRow}>
                        <span className={styles.icon}>&#128197;</span>
                        <span>{formattedDate}</span>
                    </div>
                    <div className={styles.infoRow}>
                        <span className={styles.icon}>&#128337;</span>
                        <span>{formattedTime}</span>
                    </div>
                    <div className={styles.infoRow}>
                        <span className={styles.icon}>&#128205;</span>
                        <span>{activity.location}</span>
                    </div>
                    <div className={styles.infoRow}>
                        <span className={styles.icon} role="img" aria-label="Status">&#8505;</span>
                        <span>Status: {activity.status}</span>
                    </div>
                    <div className={styles.infoRow}>
                        <span className={styles.icon} role="img" aria-label="Participants">&#128101;</span>
                        <span>Participants: {activity.participantCount} / {activity.participantLimit}</span>
                    </div>
                    <div className={styles.infoRow}>
                        <span className={styles.icon} role="img" aria-label="Points">&#127941;</span>
                        <span>Points: {activity.pointsPerParticipant}</span>
                    </div>
                    <div className={styles.infoRow}>
                        <span className={styles.icon} role="img" aria-label="Calories">&#128293;</span>
                        <span>Calories/hr: {activity.caloriesPerHour}</span>
                    </div>
                </div>
                <div className={styles["card-actions"]}>
                    <button className={styles.actionBtn}>
                        <span className={styles.actionIcon}>⭘</span>
                        STATUS
                    </button>
                    <button className={styles.actionBtn}>
                        <span className={styles.actionIcon}>↗</span>
                        SHARE
                    </button>
                    <button
                        className={`${styles.actionBtn} ${styles.joinBtn}`}
                    >
                        + JOIN NOW
                    </button>
                </div>
            </div>
        // </Wrapper>
    );
}
