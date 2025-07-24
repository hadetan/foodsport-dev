'use client';

import Image from 'next/image';
import styles from '@/app/shared/css/Header.module.css';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Header() {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setLoggedIn(!!localStorage.getItem('auth_token'));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    window.location.reload();
  }

  return (
    <header className={styles.headerWrapper}>
      <div className={styles.topBar}>
        <div className={styles.leftIcons}>
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
        <div className={styles.rightIcons}>
          <span className={styles.icon}>&#128722;</span>
          {!loggedIn ? (
            <Link href="/auth/login" className={styles.login} style={{ textDecoration: 'none', color: 'inherit' }}>
              LOGIN / REGISTER
            </Link>
          ) : (
            <button
              className={styles.logoutBtn}
              style={{ background: '#FFE23B', color: '#444', fontWeight: 600, border: 'none', borderRadius: 6, padding: '8px 18px', cursor: 'pointer', fontSize: 15 }}
              onClick={handleLogout}
            >
              LOGOUT
            </button>
          )}
          <span className={styles.langSwitch}>繁 / EN</span>
          {/* <ThemeSelector /> */}
        </div>
      </div>
      <nav className={styles.navBar}>
        <ul className={styles.navList}>
          <li className={styles.active}>
            <Link
              href={loggedIn ? "/my/" : "/"}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              HOME
            </Link>
          </li>
          <li>
            <Link
              href={loggedIn ? "/my/activities" : "/activities"}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              JOIN ACTIVITIES
            </Link>
          </li>
          <li>REDEEM REWARDS</li>
          <li>HOW DOES IT WORK</li>
        </ul>
      </nav>
    </header>
  );
}