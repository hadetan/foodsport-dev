import React, { useEffect, useState } from 'react';
import { useActivities } from '@/app/shared/contexts/ActivitiesContext';
import { useUser } from '@/app/shared/contexts/userContext';
import ActivityIcon from '@/app/shared/components/ActivityIcon';
import InvitePartnersDialog from '@/app/shared/components/InvitePartnersDialog';
import '@/app/[locale]/my/css/RecentActivitiesTable.css'
import { useTranslations } from 'next-intl';
import getActivityStatus from '@/utils/getActivityStatus';

const PAGE_SIZE = 10;

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric'
  });
}

export default function RecentActivitiesTable() {
  const { activities } = useActivities();
  const { user } = useUser();
  const t = useTranslations('RecentActivities');
  const [inviteOpen, setInviteOpen] = useState(false);
  const [selectedActivityId, setSelectedActivityId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const activitiesMap = React.useMemo(() => {
    const map = {};
    activities?.forEach(act => {
      map[act.id] = act;
    });
    return map;
  }, [activities]);

  const joinedActivities = user?.joinedActivityIds?.map(id => activitiesMap[id]).filter(Boolean) || [];
  const getActStatus = (act) => {
    if (!act) return false;
    const { status } = getActivityStatus(act);
    const isCancelledOrClosed = act.status === 'cancelled' || act.status === 'closed';
    return status === 'completed' || isCancelledOrClosed;
  };

  const totalItems = joinedActivities.length;
  const shouldPaginate = totalItems > PAGE_SIZE;
  const totalPages = shouldPaginate ? Math.ceil(totalItems / PAGE_SIZE) : 1;
  const startIdx = shouldPaginate ? (currentPage - 1) * PAGE_SIZE : 0;
  const endIdx = shouldPaginate ? startIdx + PAGE_SIZE : totalItems;
  const visibleActivities = shouldPaginate ? joinedActivities.slice(startIdx, endIdx) : joinedActivities;

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
    if (currentPage < 1) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  const getMyActivityWorkoutDuration = (actId) => {
    const found =  user.userActivities.filter((ua) => {
      return ua.activityId === actId && ua.totalDuration
    });
    if (!!found.length) {
      return `${found[0].totalDuration} Minutes`;
    } else {
      return t('na');
    }
  }

  return (
    <div className="recent-activities-card">
      <div className="recent-activities-table-wrapper">
        <table className="recent-activities-table">
          <thead>
            <tr className="recent-activities-table-header">
              <th className="recent-activities-th">{t('headers.exercise')}</th>
              <th className="recent-activities-th">{t('headers.type')}</th>
              <th className="recent-activities-th">{t('headers.date')}</th>
              <th className="recent-activities-th">{t('headers.kcal')}</th>
              <th className="recent-activities-th">{t('headers.totalWorkoutDuration')}</th>
              <th className="recent-activities-th">{t('headers.invite')}</th>
            </tr>
          </thead>
          <tbody>
            {joinedActivities.length === 0 ? (
              <tr><td colSpan={6} className="recent-activities-empty">{t('noActivities')}</td></tr>
            ) : (
              visibleActivities.map((act) => (
                <tr key={act.id} className="recent-activities-row">
                  <td className="no-wrap recent-activities-td recent-activities-exercise" data-label={t('headers.exercise')}>{act.title}</td>
                  <td className="recent-activities-td" data-label={t('headers.type')}>
                    <span className="recent-activities-type-icon">
                      <ActivityIcon type={act.activityType} size={20} />
                    </span>
                  </td>
                  <td className="recent-activities-td no-wrap" data-label={t('headers.date')}>{formatDate(act.startDate)}</td>
                  <td className="recent-activities-td no-wrap" data-label={t('headers.kcal')}>{act.caloriesPerHour ? `${act.caloriesPerHour}kcal` : t('na')}</td>
                  <td className="recent-activities-td" data-label={t('headers.totalWorkoutDuration')}>{getMyActivityWorkoutDuration(act.id)}</td>
                  <td className="recent-activities-td no-wrap" data-label={t('headers.invite')}>
                    <button
                      type="button"
                      onClick={() => { setSelectedActivityId(act.id); setInviteOpen(true); }}
                      className="recent-activities-invite-btn"
                      disabled={getActStatus(act)}
                    >
                      {t('invite')}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {shouldPaginate && totalItems > 0 && (
        <div className="recent-activities-pagination">
          <button
            type="button"
            className="recent-activities-page-btn"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span className="recent-activities-page-indicator">Page {currentPage} of {totalPages}</span>
          <button
            type="button"
            className="recent-activities-page-btn"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}
      <InvitePartnersDialog activityId={selectedActivityId} open={inviteOpen} onClose={() => setInviteOpen(false)} />
    </div>
  );
}
