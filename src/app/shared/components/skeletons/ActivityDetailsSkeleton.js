import '@/app/shared/css/ActivityDetails.css';

export default function ActivityDetailsSkeleton() {
  return (
    <div className="activityDetailsPage">
      <div className="activityDetailsHero">
        <div className="activityDetailsBackBtn skeleton" style={{width: 80, height: 32}} />
        <div className="activityDetailsImage skeleton" style={{borderRadius: 0}} />
      </div>
      <div className="activityDetailsContent">
        <main className="activityDetailsMain">
          <div className="skeleton" style={{width: 220, height: 36, marginBottom: 16}} />
          <div className="skeleton" style={{width: 380, height: 24, marginBottom: 24}} />
          <div className="skeleton" style={{width: 160, height: 24, marginBottom: 18}} />
          <div className="activityDetailsDetailsGrid">
            {[...Array(4)].map((_, i) => (
              <div className="activityDetailsDetailsItem" key={i}>
                <div className="skeleton" style={{width: 32, height: 32, borderRadius: 8}} />
                <div>
                  <div className="skeleton" style={{width: 90, height: 16, marginBottom: 6}} />
                  <div className="skeleton" style={{width: 70, height: 18}} />
                </div>
              </div>
            ))}
          </div>
          {/* Google Maps skeleton */}
          <div className="skeleton" style={{width: '100%', height: 320, borderRadius: 12, margin: '32px 0'}} />
        </main>
        <aside className="activityDetailsSidebar">
          <div className="activityDetailsSidebarRow">
            <div className="skeleton" style={{width: 24, height: 24, borderRadius: 6}} />
            <div className="skeleton" style={{width: 120, height: 16}} />
          </div>
          <div className="activityDetailsSidebarRow">
            <div className="skeleton" style={{width: 24, height: 24, borderRadius: 6}} />
            <div className="skeleton" style={{width: 120, height: 16}} />
          </div>
          <div className="activityDetailsSidebarRow">
            <div className="skeleton" style={{width: 24, height: 24, borderRadius: 6}} />
            <div className="skeleton" style={{width: 120, height: 16}} />
          </div>
          <div className="activityDetailsSidebarRow">
            <div className="skeleton" style={{width: 24, height: 24, borderRadius: 6}} />
            <div className="skeleton" style={{width: 120, height: 16}} />
          </div>
          <div className="activityDetailsAvatars">
            {[...Array(5)].map((_, i) => (
              <div className="skeleton" style={{width: 32, height: 32, borderRadius: '50%', marginRight: 4}} key={i} />
            ))}
            <span className="activityDetailsAvatarMore skeleton" style={{width: 32, height: 32, borderRadius: '50%'}} />
          </div>
          <div className="activityDetailsSidebarActions">
            {/* TNC Checkbox skeleton */}
            <div className="skeleton" style={{width: 220, height: 22, marginBottom: 12}} />
            {/* Invite Partners button skeleton */}
            <div className="skeleton" style={{width: 160, height: 38, marginBottom: 12, borderRadius: 6}} />
            {/* Leave/Join button skeleton */}
            <div className="skeleton" style={{width: 160, height: 38, marginRight: 12}} />
            {/* Share button skeleton */}
            <div className="skeleton" style={{width: 160, height: 38}} />
          </div>
        </aside>
      </div>
    </div>
  );
}
