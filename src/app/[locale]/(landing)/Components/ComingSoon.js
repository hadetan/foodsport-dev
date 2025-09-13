import "./comingSoon.css";
import Image from "next/image";

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

    return (
        <>
            <div className="coming-soon-bg">
                {/* Existing coming soon content will remain here */}
            </div>
            <div className="sponsor-section">
                <h2 className="sponsor-title">Trusted by top brands</h2>
                <div className="brand-grid">
                    {brands.map((brand) => (
                        <div key={brand.id} className="brand-card">
                            {brand.logo ? (
                                <Image
                                    src={brand.logo}
                                    alt={brand.name}
                                    width={brand.name === "APPLE" ? 60 : 100}
                                    height={brand.name === "APPLE" ? 80 : 50}
                                    className="brand-logo"
                                />
                            ) : (
                                <div className="brand-name">{brand.name}</div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}
