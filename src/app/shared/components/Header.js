import Image from 'next/image';
import styles from '@/app/shared/css/Header.module.css';
import Link from 'next/link';
import ThemeSelector from "@/app/shared/components/ThemeSelector";

export default function Header() {
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
          <span className={styles.login}>LOGIN / REGISTER</span>
          <span className={styles.langSwitch}>繁 / EN</span>
          <ThemeSelector />
        </div>
      </div>
      <nav className={styles.navBar}>
        <ul className={styles.navList}>
          <li className={styles.active}>HOME</li>
          <li>
            <Link
              href="/activities"
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