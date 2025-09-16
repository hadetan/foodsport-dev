"use client";

import styles from '@/app/shared/css/Activity.module.css';
import { useTranslations } from 'next-intl';

export default function Activity() {
    const t = useTranslations();
    return (
      <section className={styles.activityHero}>
        <div className={styles.overlay}>
          <div className={styles.centerContent}>
            <span className={styles.line}></span>
            <h1 className={styles.title}>{t('Activity.ActivitySection.title')}</h1>
            <span className={styles.line}></span>
          </div>
        </div>
      </section>
    );
}