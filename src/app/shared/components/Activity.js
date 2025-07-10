import styles from '@/app/shared/css/Activity.module.css';

export default function Activity() {
    return (
      <section className={styles.activityHero}>
        <div className={styles.overlay}>
          <div className={styles.centerContent}>
            <span className={styles.line}></span>
            <h1 className={styles.title}>ACTIVITIES</h1>
            <span className={styles.line}></span>
          </div>
        </div>
      </section>
    );
} 