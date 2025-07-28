'use client';

import Image from 'next/image';
import styles from '@/app/shared/css/Header.module.css';
import Link from 'next/link';
import { useAuth } from '@/app/shared/contexts/authContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Header() {
  const { logout, authToken } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);

  //#region This fixed the hydration error of mismatched authToken. The authToken is populated only after the mounting, so we wait to be mounted first before using the authToken.
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;
  //#endregion

  const handleLogout = async () => {
    setLoading(true)
    await logout();
    router.push('/');
    setLoading(true);
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
          {!authToken ? (
            <Link href="/auth/login" className={styles.login} style={{ textDecoration: 'none', color: 'inherit' }}>
              LOGIN / REGISTER
            </Link>
          ) : (
            <button
              className={styles.logoutBtn}
              style={{ background: '#FFE23B', color: '#444', fontWeight: 600, border: 'none', borderRadius: 6, padding: '8px 18px', cursor: 'pointer', fontSize: 15 }}
              onClick={handleLogout}
              disabled={loading}
            >
              {loading ? 'LOGGING OUT' : 'LOGOUT'}
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
              href={authToken ? "/my/" : "/"}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              HOME
            </Link>
          </li>
          <li>
            <Link
              href={authToken ? "/my/activities" : "/activities"}
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