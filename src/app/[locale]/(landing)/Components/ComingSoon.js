import "./comingSoon.css";
import Image from "next/image";
import RewardCards from "./rewardCards";

export default function ComingSoon() {
    // Array of brand sponsors with their names
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

    // Rewards to showcase as cards (shared component expects image, title, description)
    const rewards = [
        {
            id: "smartwatch",
            title: "SMARTWATCH",
            description: "Garmin Forerunner 965 Smart Watch",
            image: "/smart.jpg",
        },
        {
            id: "nike-gift-card",
            title: "Nike",
            description: "Nike Gift Card",
            image: "/nike.webp",
        },
        {
            id: "apple-airpods-3",
            title: "Apple",
            description: "AirPods (3rd generation)",
            image: "/aripod.webp",
        },
    ];

    return (
        <>
            <div className="coming-soon-bg w-full">
                {/* Existing coming soon content will remain here */}
            </div>

            {/* Wrap the entire section (46-73) to apply a single overlay */}
            <div className="light-grey-overlay-wrap">
                <div className="fade-overlay" />

                <div className="sponsor-section">
                    <h2 className="sponsor-title">Trusted by top brands</h2>
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

                {/* New rewards UI cards (as shown in the reference image) */}
                <section className="mt-12 mb-4 popular-rewards-section">
                    {/* removed inner overlay to use the wrapper overlay */}
                    <h2 className="sponsor-title">Popular rewards</h2>
                    {/* replaced inline grid with shared component */}
                    <RewardCards items={rewards} />
                </section>
            </div>
        </>
    );
}
