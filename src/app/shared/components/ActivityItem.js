import styles from "@/app/shared/css/item.module.css";
import ParticipantCircle from "./ParticipantCircle";
import Image from "next/image";

export default function ActivityItem({
    activity,
    setActivityData,
    setShowActivity
}) {

    let formattedStartDate = activity.startDate;
    let formattedEndDate = activity.endDate;
    let formattedStartTime = activity.startTime;
    let formattedEndTime = activity.endTime;

    if (typeof activity.startDate === 'string' && !isNaN(Date.parse(activity.startDate))) {
        formattedStartDate = new Date(activity.startDate).toLocaleDateString();
    }
    if (typeof activity.endDate === 'string' && !isNaN(Date.parse(activity.endDate))) {
        formattedEndDate = new Date(activity.endDate).toLocaleDateString();
    }
    if (typeof activity.startTime === 'string' && !isNaN(Date.parse(activity.startTime))) {
        formattedStartTime = new Date(activity.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    if (typeof activity.endTime === 'string' && !isNaN(Date.parse(activity.endTime))) {
        formattedEndTime = new Date(activity.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    return (
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
                        className={styles.cardImage}
                        onClick={() => {
                            setActivityData(activity)
                            setShowActivity(true);
                        }}
                    />
                )}
                <div className={styles.overlayText}><em>{activity.activityType}</em></div>
            </div>
            <div className={styles.content}>
                <div className={styles.row}>
                    <div>
                        <div className={styles.cardTitle}>{activity.title}</div>
                        <div className={styles.cardSubtitle}>{activity.description}</div>
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
                <div className={styles.detailsRow}>
                    <span className={styles.icon}>&#128197;</span>
                    <span>{formattedStartDate} - {formattedEndDate}</span>
                </div>
                <div className={styles.detailsRow}>
                    <span className={styles.icon}>&#128337;</span>
                    <span>{formattedStartTime} - {formattedEndTime}</span>
                </div>
                <div className={styles.detailsRow}>
                    <span className={styles.icon}>&#128205;</span>
                    <span>{activity.location}</span>
                </div>
            </div>
            <div className={styles.cardActions}>
                <button className={styles.actionBtn}>
                    <ParticipantCircle participantCount={activity.participantCount} participantLimit={activity.participantLimit} size={32} />
                    STATUS
                </button>
                <button className={styles.actionBtn}>
                    <span className={styles.actionIcon}>↗</span>
                    SHARE
                </button>
                <button className={`${styles.actionBtn} ${styles.joinBtn}`}>
                    + JOIN NOW
                </button>
            </div>
        </div>
    );
}
