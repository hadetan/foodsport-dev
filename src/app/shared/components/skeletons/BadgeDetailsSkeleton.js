import '@/app/[locale]/(landing)/Components/BadgeDetails.css';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

export function BadgeDetailsSkeleton({ message }) {
    const baseColor = 'rgba(15, 23, 42, 0.08)';
    const highlightColor = 'rgba(15, 23, 42, 0.15)';
    const renderTagSkeletons = Array.from({ length: 3 });
    const renderRuleSkeletons = Array.from({ length: 3 });
    const renderRailSkeletons = Array.from({ length: 3 });

    return (
        <div className="badge-details__skeleton" aria-busy="true" aria-live="polite">
            <div className="badge-hero badge-hero--skeleton">
                <div className="badge-hero__media">
                    <Skeleton height={260} width="100%" borderRadius={24} baseColor={baseColor} highlightColor={highlightColor} />
                    <div className="badge-hero__pill">
                        <Skeleton width={80} height={16} borderRadius={999} baseColor={baseColor} highlightColor={highlightColor} />
                    </div>
                </div>
                <div className="badge-hero__content">
                    <p className="badge-hero__kicker">
                        <Skeleton width={140} height={14} baseColor={baseColor} highlightColor={highlightColor} />
                    </p>
                    <h1>
                        <Skeleton width="80%" height={36} baseColor={baseColor} highlightColor={highlightColor} />
                    </h1>
                    <div className="badge-hero__description">
                        <Skeleton count={2} height={16} baseColor={baseColor} highlightColor={highlightColor} />
                    </div>
                    <div className="badge-hero__tags">
                        {renderTagSkeletons.map((_, idx) => (
                            <Skeleton
                                key={`tag-skeleton-${idx}`}
                                width={110}
                                height={26}
                                borderRadius={999}
                                baseColor={baseColor}
                                highlightColor={highlightColor}
                            />
                        ))}
                    </div>
                    <div className="badge-hero__meta">
                        <div>
                            <Skeleton width={80} height={12} baseColor={baseColor} highlightColor={highlightColor} />
                            <Skeleton width="70%" height={20} baseColor={baseColor} highlightColor={highlightColor} style={{ marginTop: 8 }} />
                        </div>
                        <div>
                            <Skeleton width={90} height={12} baseColor={baseColor} highlightColor={highlightColor} />
                            <Skeleton width="80%" height={20} baseColor={baseColor} highlightColor={highlightColor} style={{ marginTop: 8 }} />
                        </div>
                    </div>
                    <div className="badge-hero__actions">
                        <Skeleton width={160} height={44} borderRadius={999} baseColor={baseColor} highlightColor={highlightColor} />
                        <Skeleton width={160} height={44} borderRadius={999} baseColor={baseColor} highlightColor={highlightColor} />
                    </div>
                </div>
            </div>

            <div className="badge-panels-grid">
                <section className="badge-panel badge-panel--full badge-panel--skeleton">
                    <div className="badge-panel__header">
                        <div>
                            <Skeleton width={120} height={14} baseColor={baseColor} highlightColor={highlightColor} />
                            <Skeleton width={220} height={28} baseColor={baseColor} highlightColor={highlightColor} style={{ marginTop: 8 }} />
                        </div>
                    </div>
                    <div className="badge-rules badge-rules--skeleton">
                        {renderRuleSkeletons.map((_, idx) => (
                            <article className="badge-rule-card badge-rule-card--skeleton" key={`rule-skeleton-${idx}`}>
                                <div className="badge-rule-card__icon">
                                    <Skeleton circle width={44} height={44} baseColor={baseColor} highlightColor={highlightColor} />
                                </div>
                                <div>
                                    <Skeleton width="50%" height={18} baseColor={baseColor} highlightColor={highlightColor} />
                                    <Skeleton count={2} height={12} baseColor={baseColor} highlightColor={highlightColor} style={{ marginTop: 8 }} />
                                </div>
                            </article>
                        ))}
                    </div>
                </section>

                <section className="badge-panel badge-panel--full badge-panel--skeleton">
                    <div className="badge-panel__header">
                        <div>
                            <Skeleton width={150} height={14} baseColor={baseColor} highlightColor={highlightColor} />
                            <Skeleton width={260} height={28} baseColor={baseColor} highlightColor={highlightColor} style={{ marginTop: 8 }} />
                        </div>
                    </div>
                    <div className="badge-activity badge-activity--skeleton">
                        <div className="badge-activity__details">
                            <Skeleton count={2} height={18} baseColor={baseColor} highlightColor={highlightColor} />
                            <ul>
                                <li>
                                    <Skeleton width="80%" height={14} baseColor={baseColor} highlightColor={highlightColor} />
                                </li>
                                <li>
                                    <Skeleton width="60%" height={14} baseColor={baseColor} highlightColor={highlightColor} />
                                </li>
                            </ul>
                        </div>
                        <div className="badge-activity__cta">
                            <Skeleton width={180} height={44} borderRadius={12} baseColor={baseColor} highlightColor={highlightColor} />
                        </div>
                    </div>
                </section>

                <section className="badge-panel badge-panel--rail badge-panel--skeleton">
                    <div className="badge-panel__header">
                        <div>
                            <Skeleton width={110} height={14} baseColor={baseColor} highlightColor={highlightColor} />
                            <Skeleton width={180} height={26} baseColor={baseColor} highlightColor={highlightColor} style={{ marginTop: 8 }} />
                        </div>
                    </div>
                    <div className="badge-rail">
                        {renderRailSkeletons.map((_, idx) => (
                            <article className="badge-rail-card badge-rail-card--skeleton" key={`rail-skeleton-${idx}`}>
                                <div className="badge-rail-card__media">
                                    <Skeleton height={120} borderRadius={16} baseColor={baseColor} highlightColor={highlightColor} />
                                </div>
                                <Skeleton width="70%" height={18} baseColor={baseColor} highlightColor={highlightColor} style={{ marginTop: 12 }} />
                                <Skeleton width="90%" height={14} baseColor={baseColor} highlightColor={highlightColor} style={{ marginTop: 8 }} />
                                <Skeleton width={120} height={16} baseColor={baseColor} highlightColor={highlightColor} style={{ marginTop: 16, borderRadius: 4 }} />
                            </article>
                        ))}
                    </div>
                </section>
            </div>

            {message && <p className="badge-details__skeleton-text">{message}</p>}
        </div>
    );
}