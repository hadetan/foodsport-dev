import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import styles from '@/app/shared/css/item.module.css';

export default function ActivityItemSkeleton() {
  return (
    <div className={styles.card}>
      <div className={styles.imageWrapper}>
        <Skeleton height={180} width="100%" />
      </div>
      <div className={styles.content}>
        <div className={styles.cardTitleRow}>
          <h3 className={styles.cardTitleText}>
            <Skeleton width={120} />
          </h3>
          <div className={styles.badges}>
            <Skeleton circle width={32} height={32} />
          </div>
        </div>
        <div className={styles.cardSubtitle}>
          <Skeleton count={2} />
        </div>
        <div className={styles.metaContainer}>
          <div className={styles.metaLeft}>
            <div className={styles.detailsRow}>
              <span className={styles.icon}><Skeleton circle width={19} height={19} /></span>
              <Skeleton width={110} />
            </div>
            <div className={styles.detailsRow}>
              <span className={styles.icon}><Skeleton circle width={20} height={20} /></span>
              <Skeleton width={90} />
            </div>
            <div className={styles.detailsRow}>
              <span className={styles.icon}><Skeleton circle width={20} height={20} /></span>
              <Skeleton width={80} />
            </div>
          </div>
          <div className={styles.metaRight}>
            <div className={styles.rightRow}>
              <span className={styles.icon}><Skeleton circle width={23} height={23} /></span>
              <Skeleton width={80} />
            </div>
            <div className={styles.rightRow}>
              <span className={styles.icon}><Skeleton circle width={23} height={23} /></span>
              <Skeleton width={80} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}