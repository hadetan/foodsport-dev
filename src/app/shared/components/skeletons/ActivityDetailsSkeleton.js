import '@/app/shared/css/ActivityDetails.css';

export default function ActivityDetailsSkeleton() {
  return (
    <div className="activityDetailsPage">
        <div className="activityDetailsContent">
        <main className="activityDetailsMain">
            <div className="skeleton skeleton-title" style={{height: 32, width: '60%', marginBottom: 12}} />
            <div className="activityDetailsMainDesc">
            <div className="activityDetailsHero">
                <div className="skeleton skeleton-image" style={{width: '100%', height: 460, borderRadius: 8}} />
            </div>
            <section className="desc-section">
                <div className="skeleton" style={{height: 12, width: '90%', marginBottom: 8}} />
                <div className="skeleton" style={{height: 12, width: '80%', marginBottom: 8}} />
                <div className="skeleton" style={{height: 12, width: '95%', marginBottom: 8}} />
            </section>
            </div>

            <div className="activityDetailsDetailsSection">
            <div className="skeleton skeleton-subtitle" style={{height: 20, width: '40%', marginBottom: 12}} />
            <div className="activityDetailsDetailsGrid">
                {Array.from({length: 4}).map((_, i) => (
                <div className="activityDetailsDetailsItem" key={i}>
                    <div className="skeleton" style={{height: 36, width: 36, borderRadius: 6, marginRight: 12}} />
                        <div style={{flex: 1}}>
                        <div className="skeleton" style={{height: 12, width: '50%', marginBottom: 6}} />
                        <div className="skeleton" style={{height: 14, width: '80%'}} />
                    </div>
                </div>
                ))}
            </div>
            </div>
            <div style={{marginTop: '12px'}}>
                <div className="skeleton" style={{height: 12, width: '90%', marginBottom: 8}} />
                <div className="skeleton" style={{height: 12, width: '80%', marginBottom: 8}} />
                <div className="skeleton" style={{height: 12, width: '95%', marginBottom: 8}} />
                <div className="skeleton" style={{height: 12, width: '90%', marginBottom: 8}} />
                <div className="skeleton" style={{height: 12, width: '80%', marginBottom: 8}} />
                <div className="skeleton" style={{height: 12, width: '95%', marginBottom: 8}} />
                <div className="skeleton" style={{height: 12, width: '90%', marginBottom: 8}} />
                <div className="skeleton" style={{height: 12, width: '80%', marginBottom: 8}} />
                <div className="skeleton" style={{height: 12, width: '95%', marginBottom: 8}} />
                <div className="skeleton" style={{height: 12, width: '90%', marginBottom: 8}} />
                <div className="skeleton" style={{height: 12, width: '80%', marginBottom: 8}} />
                <div className="skeleton" style={{height: 12, width: '95%', marginBottom: 8}} />
                <div className="skeleton" style={{height: 12, width: '90%', marginBottom: 8}} />
                <div className="skeleton" style={{height: 12, width: '80%', marginBottom: 8}} />
                <div className="skeleton" style={{height: 12, width: '95%', marginBottom: 8}} />
                <div className="skeleton" style={{height: 12, width: '90%', marginBottom: 8}} />
                <div className="skeleton" style={{height: 12, width: '80%', marginBottom: 8}} />
                <div className="skeleton" style={{height: 12, width: '95%', marginBottom: 8}} />
                <div className="skeleton" style={{height: 12, width: '90%', marginBottom: 8}} />
                <div className="skeleton" style={{height: 12, width: '80%', marginBottom: 8}} />
                <div className="skeleton" style={{height: 12, width: '95%', marginBottom: 8}} />
                <div className="skeleton" style={{height: 12, width: '90%', marginBottom: 8}} />
                <div className="skeleton" style={{height: 12, width: '80%', marginBottom: 8}} />
                <div className="skeleton" style={{height: 12, width: '95%', marginBottom: 8}} />
                <div className="skeleton" style={{height: 12, width: '90%', marginBottom: 8}} />
                <div className="skeleton" style={{height: 12, width: '80%', marginBottom: 8}} />
                <div className="skeleton" style={{height: 12, width: '95%', marginBottom: 8}} />
                <div className="skeleton" style={{height: 12, width: '90%', marginBottom: 8}} />
                <div className="skeleton" style={{height: 12, width: '80%', marginBottom: 8}} />
                <div className="skeleton" style={{height: 12, width: '95%', marginBottom: 8}} />
            </div>
        </main>
        <aside className="activityDetailsSidebar">
            <div className="skeleton" style={{height: 16, width: '70%', marginBottom: 12}} />
            <div className="skeleton" style={{height: 16, width: '60%', marginBottom: 12}} />
            <div className="skeleton" style={{height: 16, width: '80%', marginBottom: 12}} />

            <div className="activityDetailsAvatars" style={{marginTop: 12}}>
            {Array.from({length: 5}).map((_, i) => (
                <div key={i} className="skeleton" style={{width:32, height:32, borderRadius: 9999, marginRight: 6}} />
            ))}
            </div>

            <div className="activityDetailsSidebarActions" style={{marginTop: 18}}>
            <div className="skeleton" style={{height: 40, width: '100%', borderRadius: 8, marginBottom: 10}} />
            <div className="skeleton" style={{height: 36, width: '60%', borderRadius: 8}} />
            </div>

            <div className="skeleton" style={{width: '100%', height: 200, marginTop: 28, borderRadius: 12}} />
        </aside>
        </div>
    </div>
  );
}
