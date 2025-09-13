import React, { useState } from 'react';
import { useActivities } from '@/app/shared/contexts/ActivitiesContext';
import { useUser } from '@/app/shared/contexts/userContext';
import ActivityIcon from '@/app/shared/components/ActivityIcon';
import InvitePartnersDialog from '@/app/shared/components/InvitePartnersDialog';
import '@/app/[locale]/my/css/RecentActivitiesTable.css'

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric'
  });
}

function getDuration(start, end) {
  if (!start || !end) return 'N/A';
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diffMs = endDate - startDate;
  if (diffMs <= 0) return 'N/A';
  const diffMins = Math.floor(diffMs / 60000);
  const hours = Math.floor(diffMins / 60);
  const mins = diffMins % 60;
  return `${hours}h ${mins.toString().padStart(2, '0')}m`;
}

export default function RecentActivitiesTable() {
  const { activities } = useActivities();
  const { user } = useUser();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [selectedActivityId, setSelectedActivityId] = useState(null);

  const activitiesMap = React.useMemo(() => {
    const map = {};
    activities?.forEach(act => {
      map[act.id] = act;
    });
    return map;
  }, [activities]);

  const joinedActivities = user?.joinedActivityIds?.map(id => activitiesMap[id]).filter(Boolean).slice(0, 10) || [];

  return (
    <div className="recent-activities-card">
      <div className="recent-activities-table-wrapper">
        <table className="recent-activities-table">
          <thead>
            <tr className="recent-activities-table-header">
              <th className="recent-activities-th">TYPE</th>
              <th className="recent-activities-th">DATE</th>
              <th className="recent-activities-th">EXERCISE</th>
              <th className="recent-activities-th">TIME</th>
              <th className="recent-activities-th">KCAL</th>
              <th className="recent-activities-th">FS POINTS</th>
              <th className="recent-activities-th">INVITE</th>
            </tr>
          </thead>
          <tbody>
            {joinedActivities.length === 0 ? (
              <tr><td colSpan={7} className="recent-activities-empty">No activities found.</td></tr>
            ) : (
              joinedActivities.map((act) => (
                <tr key={act.id} className="recent-activities-row">
                  <td className="recent-activities-td">
                    <span className="recent-activities-type-icon">
                      <ActivityIcon type={act.activityType} size={20} />
                    </span>
                  </td>
                  <td className="recent-activities-td">{formatDate(act.startDate)}</td>
                  <td className="recent-activities-td">{act.title}</td>
                  <td className="recent-activities-td">{getDuration(act.startTime, act.endTime)}</td>
                  <td className="recent-activities-td">{act.caloriesPerHour ? `${act.caloriesPerHour}kcal` : 'N/A'}</td>
                  <td className="recent-activities-td">{act.totalCaloriesBurnt ?? 'N/A'}</td>
                  <td className="recent-activities-td">
                    <button
                      type="button"
                      onClick={() => { setSelectedActivityId(act.id); setInviteOpen(true); }}
                      className="recent-activities-invite-btn"
                    >Invite</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Invite dialog rendered once; it returns null when not open */}
      <InvitePartnersDialog activityId={selectedActivityId} open={inviteOpen} onClose={() => setInviteOpen(false)} />
    </div>
  );
}
