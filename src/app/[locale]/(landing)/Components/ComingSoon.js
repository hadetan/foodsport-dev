"use client";

import "./comingSoon.css";
import Image from "next/image";
import RewardCards from "./rewardCards";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { useProducts } from "@/app/shared/contexts/productsContext";
import styles from "./coming.module.css";

export default function ComingSoon() {
    const t = useTranslations();
    const { products, loading: productsLoading } = useProducts();

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

    const rewards = useMemo(() => {
        if (products.length === 0) return [];

        const featured = products.filter((product) => product?.isFeatured);
        const nonFeatured = products.filter((product) => !product?.isFeatured);
        return [...featured, ...nonFeatured].slice(0, 3);
    }, [products]);

    return (
        <>
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

            <div className="light-grey-overlay-wrap">
                <div className="fade-overlay" />

                <div className="sponsor-section">
                    <h2 className="sponsor-title">{t('ComingSoon.trustedBy')}</h2>
                    <div className="brand-grid">
                        {brands.map((brand) => (
                            <div key={brand.id} className="brand-card">
                                {brand.logo ? (
                                    <Image
                                        src={brand.logo}
                                        alt={brand.name}
                                        width={
                                            brand.name === "APPLE" ? 60 : 100
                                        }
                                        height={
                                            brand.name === "APPLE" ? 80 : 50
                                        }
                                        className="brand-logo"
                                    />
                                ) : (
                                    <div className="brand-name">
                                        {brand.name}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <section className="mt-12 popular-rewards-section">
                    <h2 className="sponsor-title">
                        {t("ComingSoon.popularRewards")}
                    </h2>
                    <div className="rewards-grid-wrap">
                        <RewardCards
                            items={rewards}
                            loading={productsLoading}
                            limit={3}
                        />
                    </div>
                </section>
            </div>
        </>
    );
}
