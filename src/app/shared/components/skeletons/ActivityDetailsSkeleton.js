import '@/app/shared/css/ActivityDetails.css';

export default function ActivityDetailsSkeleton() {
  return (
    <div className="activityDetailsPage">
      <div className="activityDetailsHero skeleton-hero">
        <div className="activityDetailsBackBtn skeleton skeleton-btn" style={{width: 80, height: 32}} />
        <div className="activityDetailsImage skeleton skeleton-img" style={{borderRadius: 0}} />
        {/* <span className="activityDetailsFeaturedBadge skeleton skeleton-badge" style={{width: 100, height: 28}} /> */}
      </div>
      <div className="activityDetailsContent">
        <main className="activityDetailsMain">
          <div className="skeleton skeleton-title" style={{width: 220, height: 36, marginBottom: 16}} />
          <div className="skeleton skeleton-desc" style={{width: 380, height: 24, marginBottom: 24}} />
          <div className="skeleton skeleton-section-title" style={{width: 160, height: 24, marginBottom: 18}} />
          <div className="activityDetailsDetailsGrid">
            {[...Array(4)].map((_, i) => (
              <div className="activityDetailsDetailsItem" key={i}>
                <div className="skeleton skeleton-icon" style={{width: 32, height: 32, borderRadius: 8}} />
                <div>
                  <div className="skeleton skeleton-label" style={{width: 90, height: 16, marginBottom: 6}} />
                  <div className="skeleton skeleton-value" style={{width: 70, height: 18}} />
                </div>
              </div>
            ))}
          </div>
        </main>
        <aside className="activityDetailsSidebar">
          <div className="activityDetailsSidebarRow">
            <div className="skeleton skeleton-icon" style={{width: 24, height: 24, borderRadius: 6}} />
            <div className="skeleton skeleton-label" style={{width: 120, height: 16}} />
          </div>
          <div className="activityDetailsSidebarRow">
            <div className="skeleton skeleton-icon" style={{width: 24, height: 24, borderRadius: 6}} />
            <div className="skeleton skeleton-label" style={{width: 120, height: 16}} />
          </div>
          <div className="activityDetailsSidebarRow">
            <div className="skeleton skeleton-icon" style={{width: 24, height: 24, borderRadius: 6}} />
            <div className="skeleton skeleton-label" style={{width: 120, height: 16}} />
          </div>
          <div className="activityDetailsSidebarRow">
            <div className="skeleton skeleton-icon" style={{width: 24, height: 24, borderRadius: 6}} />
            <div className="skeleton skeleton-label" style={{width: 120, height: 16}} />
          </div>
          <div className="activityDetailsAvatars">
            {[...Array(5)].map((_, i) => (
              <div className="skeleton skeleton-avatar" style={{width: 32, height: 32, borderRadius: '50%', marginRight: 4}} key={i} />
            ))}
            <span className="activityDetailsAvatarMore skeleton" style={{width: 32, height: 32, borderRadius: '50%'}} />
          </div>
          <div className="activityDetailsSidebarActions">
            <div className="skeleton skeleton-btn" style={{width: 120, height: 38, marginRight: 12}} />
            <div className="skeleton skeleton-btn" style={{width: 90, height: 38}} />
          </div>
        </aside>
      </div>
    </div>
  );
}
