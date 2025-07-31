import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import styles from '@/app/shared/css/item.module.css';

export default function ActivityItemSkeleton() {
  return (
    <div className={styles.card}>
      <div className={styles.imageWrapper}>
        <Skeleton height={180} width="100%" />
        <div className={styles.overlayText}>
          <Skeleton width={60} />
        </div>
      </div>
      <div className={styles.content}>
        <div className={styles.row}>
          <div>
            <div className={styles.cardTitle}>
              <Skeleton width={120} />
            </div>
            <div className={styles.cardSubtitle}>
              <Skeleton count={2} />
            </div>
          </div>
        </div>
        <div className={styles.detailsRow}>
          <Skeleton width={120} />
        </div>
        <div className={styles.detailsRow}>
          <Skeleton width={100} />
        </div>
        <div className={styles.detailsRow}>
          <Skeleton width={80} />
        </div>
      </div>
      <div className={styles.cardActions}>
        <Skeleton width={90} height={36} style={{ marginRight: 8 }} />
        <Skeleton width={90} height={36} style={{ marginRight: 8 }} />
        <Skeleton width={90} height={36} />
      </div>
    </div>
  );
}