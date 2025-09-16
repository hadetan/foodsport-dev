import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import styles from '@/app/shared/css/item.module.css';

export default function ActivityItemSkeleton() {
  return (
    <div className={styles.card}>
      <div className={styles.imageWrapper}>
        <Skeleton height={140} />
      </div>
      <div className={styles.content}>
        <div className={styles.cardTitleRow}>
          <div style={{ flex: 1 }}>
            <Skeleton width={`70%`} height={20} />
            <div style={{ height: 8 }} />
            <Skeleton width={`40%`} height={14} />
          </div>
          <div className={styles.badges}>
            <Skeleton circle={true} height={36} width={36} />
          </div>
        </div>

        <div className={styles.cardSubtitle}>
          <Skeleton count={3} />
        </div>

        <div className={styles.metaContainer}>
          <div className={styles.metaLeft}>
            <div className={styles.detailsRow}>
              <Skeleton width={20} height={20} />
              <div style={{ width: 8 }} />
              <Skeleton width={80} />
            </div>
            <div className={styles.detailsRow}>
              <Skeleton width={20} height={20} />
              <div style={{ width: 8 }} />
              <Skeleton width={40} />
            </div>
            <div className={styles.detailsRow}>
              <Skeleton width={20} height={20} />
              <div style={{ width: 8 }} />
              <Skeleton width={50} />
            </div>
          </div>
          <div className={styles.metaRight}>
            <div className={styles.rightRow}>
              <Skeleton circle={true} height={20} width={20} />
              <div style={{ width: 8 }} />
              <Skeleton width={80} />
            </div>
            <div className={styles.rightRow}>
              <Skeleton circle={true} height={20} width={20} />
              <div style={{ width: 8 }} />
              <Skeleton width={60} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}