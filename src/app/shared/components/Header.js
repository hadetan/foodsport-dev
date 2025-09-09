"use client";

import Image from "next/image";
import styles from "@/app/shared/css/Header.module.css";
import Link from "next/link";
import { useAuth } from "@/app/shared/contexts/authContext";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BsCart2 } from "react-icons/bs";
import Search from "./Search";
import Avatar from "./avatar";
import AvatarSkeleton from "./skeletons/AvatarSkeleton";
import { useUser } from "@/app/shared/contexts/userContext";
import { useActivities } from "../contexts/ActivitiesContext";

export default function Header() {
    const { authToken } = useAuth();
    const { user, loading } = useUser();
    const [mounted, setMounted] = useState(false);
    const pathname = usePathname();
    const [hoveredIdx, setHoveredIdx] = useState(null);
    const { activities } = useActivities();

    //#region This fixed the hydration error of mismatched authToken. The authToken is populated only after the mounting, so we wait to be mounted first before using the authToken.
    useEffect(() => {
        setMounted(true);
    }, []);
    if (!mounted) return null;
    //#endregion

    const navLinks = [
        {
            label: "HOME",
            href: authToken ? "/my/" : "/",
        },
        {
            label: "JOIN ACTIVITIES",
            href: authToken ? "/my/activities" : "/activities",
        },
        {
            label: "REDEEM REWARDS",
            href: null,
        },
        !authToken && {
            label: "HOW DOES IT WORK",
            href: "/how",
        },
    ];

    const filteredNavLinks = navLinks.filter(Boolean);

    // Function to check if current path is a child of the nav link
    const isParentPath = (navHref, currentPath) => {
        if (!navHref || !currentPath) return false;

        // For activities routes (both user and admin)
        if (currentPath.includes("/activities")) {
            return navHref.includes("/activities");
        }

        // For my pages
        if (currentPath.startsWith("/my/") && navHref === "/my/") {
            return true;
        }

        // Check if current path starts with nav href (for child pages)
        if (currentPath.startsWith(navHref) && navHref !== "/") {
            return true;
        }

        // For root path, only match exact or specific children
        if (navHref === "/" || navHref === "/my/") {
            return currentPath === navHref || currentPath === "/how";
        }

        return false;
    };

    const activeIdx = filteredNavLinks.findIndex((link) => {
        if (!link.href) return false;

        // Exact match check
        if (pathname === link.href) {
            return true;
        }

        // Special case for HOME
        if (
            authToken &&
            link.label === "HOME" &&
            (pathname === "/my" || pathname === "/my/")
        ) {
            return true;
        }

        // Parent path check
        return isParentPath(link.href, pathname);
    });

    return (
        <header className={styles.headerWrapper}>
            {/* Grey Top Bar */}
            <div className={styles.greyTopBar}>
                <div className={styles.topBarRight}>
                    <Search sortedActivities={activities} />
                    <span className={`${styles.icon} ${styles.borderLeft}`}>
                        <BsCart2 />
                    </span>
                    {authToken ? (
                        loading ? (
                            <AvatarSkeleton isNav={true} />
                        ) : (
                            <Avatar
                                srcAvatar={user.profilePictureUrl || undefined}
                                firstName={user.firstname}
                                lastName={user.lastname}
                                isNav={true}
                                pointer={true}
                            />
                        )
                    ) : (
                        <Link href="/auth/login" className={styles.login}>
                            LOGIN / REGISTER
                        </Link>
                    )}

                    {/* Language Switch */}
                    <span
                        className={`${styles.langSwitch} ${styles.borderLeft}`}
                    >
                        繁 / EN
                    </span>
                </div>
            </div>
            {/* White Nav Bar with Centered Logo */}
            <div className={styles.whiteNavBar}>
                <div className={styles.topBarLeft}>
                    <span className={styles.menuIcon}>&#9776;</span>
                </div>
                <div className={styles.logoContainer}>
                    <Image
                        src="/logo.png"
                        alt="Foodsport Logo"
                        width={220}
                        height={60}
                        priority
                    />
                </div>
            </div>
            <nav className={styles.navBar}>
                <ul className={styles.navList}>
                    {filteredNavLinks.map((link, idx) => (
                        <li
                            key={link.label}
                            className={[
                                idx === activeIdx ? styles.active : "",
                                idx === hoveredIdx ? styles.navHover : "",
                            ].join(" ")}
                            onMouseEnter={() => setHoveredIdx(idx)}
                            onMouseLeave={() => setHoveredIdx(null)}
                            style={{ cursor: "pointer" }}
                        >
                            {link.href ? (
                                <Link
                                    href={link.href}
                                    style={{
                                        textDecoration: "none",
                                        color: "inherit",
                                    }}
                                >
                                    {link.label}
                                </Link>
                            ) : (
                                link.label
                            )}
                        </li>
                    ))}
                </ul>
            </nav>
        </header>
    );
}
