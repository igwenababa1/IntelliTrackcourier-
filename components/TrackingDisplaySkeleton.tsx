import React from 'react';

const SkeletonElement = ({ className, style }: { className?: string, style?: React.CSSProperties }) => (
  <div className={`skeleton ${className || ''}`} style={style}></div>
);

const TimelineItemSkeleton = () => (
  <div className="timeline-item-skeleton">
    <SkeletonElement style={{ width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0 }} />
    <div className="timeline-content-skeleton">
      <SkeletonElement style={{ width: '60%', height: '20px', marginBottom: '0.5rem' }} />
      <SkeletonElement style={{ width: '40%', height: '16px' }} />
    </div>
  </div>
);

const TrackingDisplaySkeleton: React.FC = () => {
  return (
    <div className="tracking-display-container skeleton-container">
      <div className="advanced-header-container-skeleton">
        <SkeletonElement style={{ width: '150px', height: '40px' }} />
        <SkeletonElement style={{ width: '300px', height: '48px' }} />
        <SkeletonElement style={{ width: '180px', height: '60px' }} />
      </div>

      <div className="progress-bar-skeleton">
        <SkeletonElement style={{ width: '100%', height: '60px' }} />
      </div>

      <div className="tracking-body">
        <div className="main-content-panel">
          <div className="view-selector-skeleton">
            <SkeletonElement style={{ flex: 1, height: '48px' }} />
            <SkeletonElement style={{ flex: 1, height: '48px' }} />
            <SkeletonElement style={{ flex: 1, height: '48px' }} />
          </div>
          <div className="timeline-skeleton">
            <TimelineItemSkeleton />
            <TimelineItemSkeleton />
            <TimelineItemSkeleton />
            <TimelineItemSkeleton />
          </div>
        </div>
        
        <aside className="sidebar-panel">
          <SkeletonElement className="package-image-skeleton" />
          <SkeletonElement className="delivery-date-skeleton" />
          <SkeletonElement className="address-skeleton" />
          <SkeletonElement className="sidebar-section-skeleton" />
          <SkeletonElement className="sidebar-section-skeleton" />
        </aside>
      </div>
    </div>
  );
};

export default TrackingDisplaySkeleton;