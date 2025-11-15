"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import styles from "./rewardCards.module.css";

const formatPrice = (value) => {
    if (value === null || value === undefined) return "0";
    const numeric =
        typeof value === "number" ? value : Number.parseFloat(value);
    return new Intl.NumberFormat().format(
        Number.isFinite(numeric) ? numeric : 0
    );
};

const SkeletonCard = () => (
    <article className={`${styles.card} ${styles.skeletonCard}`} aria-hidden="true">
        <div className={`${styles.media} ${styles.skeletonBlock}`} />
        <div className={styles.body}>
            <div className={`${styles.skeletonBlock} ${styles.skeletonTitle}`} />
            <div className={`${styles.skeletonBlock} ${styles.skeletonText}`} />
        </div>
        <div className={`${styles.actions} ${styles.skeletonActions}`}>
            <div className={`${styles.skeletonBlock} ${styles.skeletonButton}`} />
            <div className={`${styles.skeletonBlock} ${styles.skeletonButton}`} />
        </div>
    </article>
);

export default function RewardCards({ items = [], loading = false, limit = 3 }) {
    const t = useTranslations();
    const pointsLabel = t("ComingSoon.RewardCards.pointsLabel");

    const displayedItems = useMemo(() => {
        const safeItems = Array.isArray(items) ? items : [];
        return typeof limit === "number" && limit > 0
            ? safeItems.slice(0, limit)
            : safeItems;
    }, [items, limit]);

    const skeletonCount = Number.isFinite(limit) && limit > 0 ? limit : 3;

    if (loading) {
        return (
            <div
                className={`${styles.grid} ${styles.loadingState}`}
                role="status"
                aria-live="polite"
            >
                {Array.from({ length: skeletonCount }).map((_, idx) => (
                    <SkeletonCard key={`skeleton-${idx}`} />
                ))}
            </div>
        );
    }

    if (displayedItems.length === 0) {
        return (
            <div className={styles.emptyState}>
                <p>{t("ComingSoon.RewardCards.empty")}</p>
            </div>
        );
    }

    return (
        <div className={styles.grid}>
            {displayedItems.map((item, idx) => (
                <article key={item.id} className={styles.card}>
                    <div className={styles.media}>
                        {item.productImageUrl ? (
                            <Image
                                src={item.productImageUrl}
                                alt={item.title || t("ComingSoon.RewardCards.imageAlt")}
                                fill
                                className={styles.mediaImage}
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                priority={idx === 0}
                            />
                        ) : (
                            <div className={styles.mediaFallback}>
                                <span>{t("ComingSoon.RewardCards.imageAlt")}</span>
                            </div>
                        )}

                        <button
                            type="button"
                            aria-label={t("ComingSoon.RewardCards.saveAria")}
                            className={styles.bookmarkBtn}
                        >
                            <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                aria-hidden="true"
                            >
                                <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                            </svg>
                        </button>
                    </div>

                    <div className={styles.body}>
                        <div className={styles.header}>
                            <h3 className={styles.title}>{item.title}</h3>
                            {item.summary ? (
                                <p className={styles.description}>{item.summary}</p>
                            ) : null}
                        </div>

                        <div className={styles.metaRow}>
                            <div className={styles.pointsChip}>
                                <svg
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    aria-hidden="true"
                                    fill="currentColor"
                                >
                                    <circle cx="12" cy="12" r="10" className={styles.pointsHalo} />
                                    <path d="M12 6c3.31 0 6 1.79 6 4s-2.69 4-6 4-6-1.79-6-4 2.69-4 6-4zm0 10c-3.31 0-6-1.79-6-4v2c0 2.21 2.69 4 6 4s6-1.79 6-4v-2c0 2.21-2.69 4-6 4z" />
                                </svg>
                                <span className={styles.pointsValue}>{formatPrice(item.price)}</span>
                                <span className={styles.pointsLabel}>{pointsLabel}</span>
                            </div>
                        </div>
                    </div>

                    <div className={styles.actions}>
                        <button type="button" className={styles.actionBtn} disabled>
                            <svg
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                aria-hidden="true"
                            >
                                <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7a3.27 3.27 0 0 0 0-1.39l7-4.11A3 3 0 1 0 14 5a3 3 0 0 0 .04.49L7.1 9.6a3 3 0 1 0 0 4.79l6.94 4.03c-.03.19-.04.38-.04.58a3 3 0 1 0 3-3z" />
                            </svg>
                            <span>{t("ComingSoon.RewardCards.share")}</span>
                        </button>
                        <button type="button" className={styles.actionBtn} disabled>
                            <svg
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                aria-hidden="true"
                            >
                                <path d="M20 7h-2.18A3 3 0 0 0 12 5.1 3 3 0 0 0 6.18 7H4a1 1 0 0 0-1 1v3h18V8a1 1 0 0 0-1-1zM7 6a2 2 0 1 1 2 2H7a2 2 0 0 1 0-2zm10 0a2 2 0 1 1-2 2h2a2 2 0 0 1 0-2zM3 20a1 1 0 0 0 1 1h6v-8H3v7zm11 1h6a1 1 0 0 0 1-1v-7h-7v8z" />
                            </svg>
                            <span>{t("ComingSoon.RewardCards.redeem")}</span>
                        </button>
                    </div>
                </article>
            ))}
        </div>
    );
}
