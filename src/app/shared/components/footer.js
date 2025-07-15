import Link from "next/link";
import styles from "@/app/shared/css/footer.module.css";
import {
    Facebook,
    Instagram,
    Linkedin,
    Youtube,
    Globe,
    Phone,
    Printer,
    Mail,
    MapPin,
} from "lucide-react";

export default function Footer() {
    const galleryImages = [
        "https://placehold.co/200x200",
        "https://placehold.co/200x200",
        "https://placehold.co/200x200",
        "https://placehold.co/200x200",
        "https://placehold.co/200x200",
    ];

    return (
        <footer className={styles.footer}>
            <div className={styles.content}>
                <div className={styles.mainContent}>
                    <div className={styles.followSection}>
                        <h2 className={styles.title}>FOLLOW US</h2>
                        <div
                            className="imageGallery"
                            style={{
                                display: "flex",
                                justifyContent: "center",
                                gap: "1rem",
                                flexWrap: "wrap",
                            }}
                        >
                            {galleryImages.map((src, index) => (
                                <div key={index} className="galleryItem">
                                    <img
                                        src={src}
                                        alt={`Activity ${index + 1}`}
                                        width={200}
                                        height={200}
                                        style={{ objectFit: "cover" }}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className={styles.socialLinks}>
                        <a
                            href="https://www.facebook.com/FoodSport.hk"
                            className={styles.socialIcon}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <Facebook size={20} />
                        </a>
                        <a
                            href="https://www.instagram.com/foodsport_hk/"
                            className={styles.socialIcon}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <Instagram size={20} />
                        </a>
                        <a
                            href="https://www.linkedin.com/company/foodsport"
                            className={styles.socialIcon}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <Linkedin size={20} />
                        </a>
                        <a
                            href="https://www.youtube.com/FOODSPORT"
                            className={styles.socialIcon}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <Youtube size={20} />
                        </a>
                        <a
                            href="https://www.foodsport.com.hk/"
                            className={styles.socialIcon}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <Globe size={20} />
                        </a>
                    </div>
                </div>

                <div className={styles.navLinks}>
                    <Link href="https://www.foodsport.com.hk/aboutus "target="_blank">ABOUT FOODSPORT</Link>
                    <span className={styles.separator}>|</span>
                    <Link href="https://www.foodsport.com.hk/supportus"target="_blank">SUPPORT US</Link>
                    <span className={styles.separator}>|</span>
                    <Link href="https://www.foodsport.com.hk/privacy-policy" target="_blank">PRIVACY POLICY</Link>
                </div>

                <div className={styles.bottomSection}>
                    <div className={styles.contactInfo}>
                        <div className={styles.contactItem}>
                            <Phone size={16} />
                            <span>852 3611 0334</span>
                        </div>
                        <div className={styles.contactItem}>
                            <Mail size={16} />
                            <span>foodsport@symbol-of.com</span>
                        </div>
                        <div className={styles.contactItem}>
                            <MapPin size={16} />
                            <span>
                                Rm U, 8/F., Phase 1, Kwun Tong Ind. Ctr, 472-484
                                Kwun Tong Rd, Kwun Tong, Kln, H.K
                            </span>
                        </div>
                    </div>
                    <div className={styles.copyright}>
                        ©COPYRIGHT {new Date().getFullYear()} BY SYMBOL OF ALLIANCE LIMITED &
                        FOODSPORT FOUNDATION LIMITED, ALL RIGHTS RESERVED.
                    </div>
                </div>
            </div>
        </footer>
    );
}
