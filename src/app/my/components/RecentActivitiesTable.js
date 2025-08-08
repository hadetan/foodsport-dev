import React from 'react';
import { useActivities } from '@/app/shared/contexts/ActivitiesContext';
import { useUser } from '@/app/shared/contexts/userContext';
import ActivityIcon from '@/app/shared/components/ActivityIcon';
import '@/app/my/css/RecentActivitiesTable.css'

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
  const { activities, loading } = useActivities();
  const { user } = useUser();

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
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="recent-activities-loading">Loading...</td></tr>
            ) : joinedActivities.length === 0 ? (
              <tr><td colSpan={6} className="recent-activities-empty">No activities found.</td></tr>
            ) : (
              joinedActivities.map((act, idx) => (
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
                  <td className="recent-activities-td">{act.pointsPerParticipant ?? 'N/A'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
