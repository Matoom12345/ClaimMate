import React from 'react';
import PropTypes from 'prop-types';

/**
 * Loading Component - แสดง loading spinner สวยงาม
 * 
 * @param {string} size - ขนาด: 'sm', 'md', 'lg', 'xl'
 * @param {string} variant - รูปแบบ: 'spinner', 'dots', 'pulse'
 * @param {string} color - สี: 'primary', 'secondary', 'white'
 * @param {string} text - ข้อความแสดงผล
 * @param {boolean} fullScreen - แสดงเต็มหน้าจอหรือไม่
 * @param {string} className - class เพิ่มเติม
 */
const Loading = ({
  size = 'md',
  variant = 'spinner',
  color = 'primary',
  text = '',
  fullScreen = false,
  className = '',
}) => {
  // Size classes
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  // Color classes
  const colorClasses = {
    primary: 'text-primary-500',
    secondary: 'text-secondary-500',
    white: 'text-white',
  };

  const LoadingSpinner = () => (
    <div className={`${sizeClasses[size]} ${colorClasses[color]} ${className}`}>
      <span className="material-icons-round animate-spin text-inherit" style={{ fontSize: 'inherit' }}>
        refresh
      </span>
    </div>
  );

  const LoadingDots = () => (
    <div className="flex items-center gap-2">
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className={`rounded-full ${colorClasses[color]}`}
          style={{
            width: size === 'sm' ? '6px' : size === 'md' ? '8px' : size === 'lg' ? '10px' : '12px',
            height: size === 'sm' ? '6px' : size === 'md' ? '8px' : size === 'lg' ? '10px' : '12px',
            backgroundColor: 'currentColor',
            animation: `bounce 1.4s infinite ease-in-out both`,
            animationDelay: `${index * 0.16}s`,
          }}
        />
      ))}
    </div>
  );

  const LoadingPulse = () => (
    <div className={`${sizeClasses[size]} rounded-full ${colorClasses[color]} animate-pulse-slow`}>
      <div className="w-full h-full rounded-full border-4 border-current opacity-25" />
    </div>
  );

  const renderLoading = () => {
    switch (variant) {
      case 'dots':
        return <LoadingDots />;
      case 'pulse':
        return <LoadingPulse />;
      default:
        return <LoadingSpinner />;
    }
  };

  const content = (
    <div className="flex flex-col items-center justify-center gap-3">
      {renderLoading()}
      {text && (
        <p className={`text-sm font-medium ${colorClasses[color]} animate-pulse`}>
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm animate-fade-in">
        {content}
      </div>
    );
  }

  return content;
};

Loading.propTypes = {
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl']),
  variant: PropTypes.oneOf(['spinner', 'dots', 'pulse']),
  color: PropTypes.oneOf(['primary', 'secondary', 'white']),
  text: PropTypes.string,
  fullScreen: PropTypes.bool,
  className: PropTypes.string,
};

/**
 * Skeleton Component - แสดง placeholder ขณะโหลดข้อมูล
 * 
 * @param {string} variant - รูปแบบ: 'text', 'circular', 'rectangular', 'card'
 * @param {string} width - ความกว้าง (CSS value)
 * @param {string} height - ความสูง (CSS value)
 * @param {number} count - จำนวน skeleton (สำหรับ text)
 * @param {string} className - class เพิ่มเติม
 */
export const Skeleton = ({
  variant = 'text',
  width = '100%',
  height = '',
  count = 1,
  className = '',
}) => {
  const baseClasses = 'skeleton';

  const variantClasses = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
    card: 'h-32 rounded-card',
  };

  const defaultHeights = {
    text: '1rem',
    circular: '3rem',
    rectangular: '8rem',
    card: '12rem',
  };

  const skeletonHeight = height || defaultHeights[variant];

  if (variant === 'text' && count > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: count }).map((_, index) => (
          <div
            key={index}
            className={`${baseClasses} ${variantClasses[variant]} ${className}`}
            style={{
              width: index === count - 1 ? '80%' : width,
              height: skeletonHeight,
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={{
        width: variant === 'circular' ? skeletonHeight : width,
        height: skeletonHeight,
      }}
    />
  );
};

Skeleton.propTypes = {
  variant: PropTypes.oneOf(['text', 'circular', 'rectangular', 'card']),
  width: PropTypes.string,
  height: PropTypes.string,
  count: PropTypes.number,
  className: PropTypes.string,
};

/**
 * SkeletonCard - Skeleton สำหรับ Card
 */
export const SkeletonCard = () => (
  <div className="card space-y-4">
    <div className="flex items-center gap-4">
      <Skeleton variant="circular" width="3rem" height="3rem" />
      <div className="flex-1 space-y-2">
        <Skeleton variant="text" width="60%" />
        <Skeleton variant="text" width="40%" />
      </div>
    </div>
    <Skeleton variant="text" count={3} />
  </div>
);

/**
 * SkeletonTable - Skeleton สำหรับ Table
 */
export const SkeletonTable = ({ rows = 5, columns = 4 }) => (
  <div className="space-y-4">
    {/* Header */}
    <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
      {Array.from({ length: columns }).map((_, index) => (
        <Skeleton key={index} variant="text" height="1.5rem" />
      ))}
    </div>
    
    {/* Rows */}
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, colIndex) => (
          <Skeleton key={colIndex} variant="text" />
        ))}
      </div>
    ))}
  </div>
);

SkeletonTable.propTypes = {
  rows: PropTypes.number,
  columns: PropTypes.number,
};

/**
 * SkeletonTimeline - Skeleton สำหรับ Timeline
 */
export const SkeletonTimeline = ({ items = 5 }) => (
  <div className="space-y-6">
    {Array.from({ length: items }).map((_, index) => (
      <div key={index} className="flex gap-4">
        <Skeleton variant="circular" width="2rem" height="2rem" />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" width="40%" />
          <Skeleton variant="text" width="80%" />
        </div>
      </div>
    ))}
  </div>
);

SkeletonTimeline.propTypes = {
  items: PropTypes.number,
};

export default Loading;