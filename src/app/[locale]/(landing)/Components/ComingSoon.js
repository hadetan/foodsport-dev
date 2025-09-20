import "./comingSoon.css";
import Image from "next/image";
import RewardCards from "./rewardCards";
import { useTranslations } from "next-intl";
import styles from './coming.module.css'
export default function ComingSoon() {
    const t = useTranslations();
    const brands = [
        { id: 1, name: "GARMIN", logo: "/garmin.png" },
        { id: 2, name: "Häagen-Dazs", logo: "/haagen-dazs.svg" },
        { id: 3, name: "X-ABILITIES" },
        { id: 4, name: "APPLE", logo: "/apple.svg" },
        { id: 5, name: "DECATHLON", logo: "/decathalon.svg" },
        { id: 6, name: "NIKE", logo: "/nike.svg" },
        { id: 7, name: "ADIDAS", logo: "/adidas.svg" },
        { id: 8, name: "HOKA", logo: "/hoka.svg" },
    ];

    const rewards = [
        {
            id: "smartwatch",
            title: t("ComingSoon.rewards.smartwatch.title"),
            description: t("ComingSoon.rewards.smartwatch.description"),
            image: "/smart.jpg",
        },
        {
            id: "nike-gift-card",
            title: t("ComingSoon.rewards.nike_gift_card.title"),
            description: t("ComingSoon.rewards.nike_gift_card.description"),
            image: "/nike.webp",
        },
        {
            id: "apple-airpods-3",
            title: t("ComingSoon.rewards.apple_airpods_3.title"),
            description: t("ComingSoon.rewards.apple_airpods_3.description"),
            image: "/aripod.webp",
        },
    ];

    return (
        <>
            <div className="coming-soon-bg w-full"></div>

            <div className="light-grey-overlay-wrap">
                <section className={styles.activityHero}>
                    <div className={styles.overlay}>
                        <div className={styles.centerContent}>
                            <span className={styles.line}></span>
                            <h1 className={styles.title}>
                                {t("ComingSoon.title")}
                            </h1>
                            <span className={styles.line}></span>
                        </div>
                    </div>
                </section>

                <section className="mt-12 popular-rewards-section">
                    <h2 className="sponsor-title">
                        {t("ComingSoon.popularRewards")}
                    </h2>
                    <RewardCards items={rewards} />
                </section>
            </div>
        </>
    );
}
