"use client";

import Image from "next/image";
import styles from "@/app/shared/css/Header.module.css";
import Link from "next/link";
import { useAuth } from "@/app/shared/contexts/authContext";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Search from "./Search";
import Avatar from "./avatar";
import AvatarSkeleton from "./skeletons/AvatarSkeleton";
import { useUser } from "@/app/shared/contexts/userContext";
import { useActivities } from "../contexts/ActivitiesContext";
import LocaleSwitcher from "./LocaleSwitcher";
import { useTranslations, useLocale } from 'next-intl';

export default function Header() {
    const { authToken } = useAuth();
    const { user, loading } = useUser();
    const [mounted, setMounted] = useState(false);
    const pathname = usePathname();
    const [hoveredIdx, setHoveredIdx] = useState(null);
    const { activities } = useActivities();
    const t = useTranslations();
    const locale = useLocale();

    //#region This fixed the hydration error of mismatched authToken. The authToken is populated only after the mounting, so we wait to be mounted first before using the authToken.
    useEffect(() => {
        setMounted(true);
    }, []);
    if (!mounted) return null;
    //#endregion

    const navLinks = [
        {
            id: 'home',
            label: t('Header.home'),
            href: authToken ? `/${locale}/my/` : `/${locale}/`,
        },
        {
            id: 'joinActivities',
            label: t('Header.joinActivities'),
            href: authToken ? `/${locale}/my/activities` : `/${locale}/activities`,
        },
        {
            id: 'redeemRewards',
            label: t('Header.redeemRewards'),
            href: null,
            clickable: true,
        },
        !authToken && {
            id: 'howDoesItWork',
            label: t('Header.howDoesItWork'),
            href: `/${locale}/how`,
        },
        {
            label: <Search sortedActivities={activities} />,
            href: null,
            isButton: true,
        },
        {
            label: authToken ? (
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
                    <Link href={`/${locale}/auth/login`} className={styles.login}>
                    {t('Header.loginRegister')}
                </Link>
            ),
            href: null,
            isButton: true,
        },
        {
            label: <LocaleSwitcher className={styles.langSwitch}/>,
            href: null,
            isButton: true,
        },
    ];

    const filteredNavLinks = navLinks.filter(Boolean);

    const navLinksLeft = filteredNavLinks.filter((link) => !link.isButton);

    const strippedPath = (() => {
        if (!pathname) return '';
        const prefix = `/${locale}`;
        let p = pathname;
        if (p === prefix) return '/';
        if (p.startsWith(prefix + '/')) p = p.slice(prefix.length);
        // Normalize trailing slash (treat '/my' and '/my/' the same)
        if (p.length > 1 && p.endsWith('/')) p = p.slice(0, -1);
        return p || '/';
    })();

    let activeIdx = -1;
    if (strippedPath === '/') {
        activeIdx = navLinksLeft.findIndex((l) => l.id === 'home');
    } else if (strippedPath === '/my') {
        activeIdx = navLinksLeft.findIndex((l) => l.id === 'home');
    } else if (strippedPath === '/how') {
        activeIdx = navLinksLeft.findIndex((l) => l.id === 'howDoesItWork');
    } else if (strippedPath === '/activities' || strippedPath === '/my/activities' || strippedPath.startsWith('/activities/')) {
        activeIdx = navLinksLeft.findIndex((l) => l.id === 'joinActivities');
    } else {
        activeIdx = -1;
    }

    return (
        <header className={styles.headerWrapper}>
            <div className={styles.whiteNavBar}>
                <div className={styles.logoContainer}>
                    <Image
                        src="/logo.png"
                        alt="Foodsport Logo"
                        width={220}
                        height={60}
                        priority
                    />
                </div>
                <div className={styles.topBarRight}>
                    {/* Render right-side buttons */}
                    {filteredNavLinks
                        .filter((link) => link.isButton)
                        .map((link, idx) => (
                            <span
                                key={`${link.label}-${idx}`}
                                className={styles.navButtonRight}
                                style={{
                                    cursor: "pointer",
                                    marginLeft: "24px",
                                }}
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
                            </span>
                        ))}
                </div>
            </div>
            <nav className={styles.navBar}>
                <ul className={styles.navList}>
                    {navLinksLeft.map((link, idx) => (
                        <li
                            key={`${link.label}-${idx}`}
                            className={[
                                idx === activeIdx ? styles.active : "",
                                idx === hoveredIdx ? styles.navHover : "",
                            ].join(" ")}
                            onMouseEnter={() => setHoveredIdx(idx)}
                            onMouseLeave={() => setHoveredIdx(null)}
                            style={{
                                cursor: link.clickable || link.href ? "pointer" : "default",
                            }}
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
