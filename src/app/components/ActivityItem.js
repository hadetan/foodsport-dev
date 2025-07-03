import styles from "./ActivityItem.module.css";
import Image from "next/image";
import Link from "next/link";

export default function ActivityItem({
    image,
    overlayText,
    title,
    subtitle,
    date,
    time,
    location,
    onStatus,
    onShare,
    onJoin,
    href,
}) {
    const Wrapper = href ? Link : "div";
    const wrapperProps = href
        ? { href, style: { textDecoration: "none", color: "inherit" } }
        : {};
    return (
        <Wrapper {...wrapperProps}>
            <div className={styles.card}>
                <div className={styles.imageWrapper}>
                    <Image
                        src={image}
                        alt={overlayText}
                        fill
                        className="image-full"
                    />
                    <div className={styles.overlayText}>{overlayText}</div>
                </div>
                <div className={styles.content}>
                    <div className={styles.row}>
                        <div>
                            <div className="card-title">{title}</div>
                            <div className={styles.subtitle}>{subtitle}</div>
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
                        <span>{date}</span>
                    </div>
                    <div className={styles.infoRow}>
                        <span className={styles.icon}>&#128337;</span>
                        <span>{time}</span>
                    </div>
                    <div className={styles.infoRow}>
                        <span className={styles.icon}>&#128205;</span>
                        <span>{location}</span>
                    </div>
                </div>
                <div className={styles["card-actions"]}>
                    <button className={styles.actionBtn} onClick={onStatus}>
                        <span className={styles.actionIcon}>⭘</span>
                        STATUS
                    </button>
                    <button className={styles.actionBtn} onClick={onShare}>
                        <span className={styles.actionIcon}>↗</span>
                        SHARE
                    </button>
                    <button
                        className={`${styles.actionBtn} ${styles.joinBtn}`}
                        onClick={onJoin}
                    >
                        + JOIN NOW
                    </button>
                </div>
            </div>
        </Wrapper>
    );
}
