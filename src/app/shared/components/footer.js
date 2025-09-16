"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "@/app/shared/css/footer.module.css";
import api from "@/utils/axios/api";
import {
    Facebook,
    Instagram,
    Linkedin,
    Youtube,
    Globe,
    Phone,
    Mail,
    MapPin,
} from "lucide-react";

export default function Footer() {
    const [galleryImages, setGalleryImages] = useState([]);
    const [hoveredIndex, setHoveredIndex] = useState(null);

    useEffect(() => {
        fetchImages();

        // Listen for custom event to refresh images
        const handler = () => fetchImages();
        window.addEventListener("socialImagesUpdated", handler);
        return () => window.removeEventListener("socialImagesUpdated", handler);
    }, []);

    // Fetch images for the footer gallery
    async function fetchImages() {
        try {
            const data = await api.request({ method: "GET", url: "/social" });
            if (Array.isArray(data.data.images)) setGalleryImages(data.data.images);
            else setGalleryImages([]);
        } catch (e) {
            setGalleryImages([]);
        }
    }

    return (
        <footer className={styles.footer}>
            <div className={styles.content}>
                <div className={styles.mainContent}>
                    <div className={styles.followSection}>
                        <h2 className={styles.title}>FOLLOW US</h2>
                        <div className={styles.imageGallery}>
                            {galleryImages.map((img, index) => (
                                <a
                                    key={index}
                                    href={img.socialMediaUrl || "#"}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={styles.galleryItem}
                                    onMouseEnter={() => setHoveredIndex(index)}
                                    onMouseLeave={() => setHoveredIndex(null)}
                                >
                                    <img
                                        src={img.imageUrl}
                                        alt={`Activity ${index + 1}`}
                                    />
                                    {hoveredIndex === index && (
                                        <div className={styles.overlay}>
                                            View In Social Media
                                        </div>
                                    )}
                                </a>
                            ))}
                        </div>
                    </div>

                    <div className={styles.socialLinks}>
                    <div className={styles.socialRow}>
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

                        <div className={styles.navLinks}>
                            <Link href="https://www.foodsport.com.hk/aboutus " target="_blank">
                                ABOUT FOODSPORT
                            </Link>
                            <span className={styles.separator}>|</span>
                            <Link href="https://www.foodsport.com.hk/supportus" target="_blank">
                                SUPPORT US
                            </Link>
                            <span className={styles.separator}>|</span>
                            <Link href="https://www.foodsport.com.hk/privacy-policy" target="_blank">
                                PRIVACY POLICY
                            </Link>
                        </div>
                    </div>
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
                                Room A, 20/F, Infotech Centre, 21 Hung To Road,
                                Kwun Tong, Kowloon, Hong Kong
                            </span>
                        </div>
                    </div>
                    <div className={styles.copyright}>
                        <p>
                            ©COPYRIGHT {new Date().getFullYear()} BY SYMBOL OF
                            ALLIANCE LIMITED & FOODSPORT FOUNDATION LIMITED, ALL
                            RIGHTS RESERVED.
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
