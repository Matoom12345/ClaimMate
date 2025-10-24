import React from 'react';
import PropTypes from 'prop-types';

/**
 * Timeline Component - แสดงขั้นตอนการเคลมแบบ vertical timeline
 * 
 * @param {array} items - รายการ timeline items
 * @param {string} className - class เพิ่มเติม
 */
const Timeline = ({ items = [], className = '' }) => {
  return (
    <div className={`relative ${className}`}>
      {items.map((item, index) => (
        <TimelineItem
          key={index}
          {...item}
          isLast={index === items.length - 1}
        />
      ))}
    </div>
  );
};

/**
 * Timeline Item - แต่ละขั้นตอนใน timeline
 * 
 * @param {string} title - หัวข้อ
 * @param {string} description - รายละเอียด
 * @param {string} date - วันที่/เวลา
 * @param {string} status - สถานะ: 'done', 'active', 'pending'
 * @param {string} icon - Material Icon
 * @param {boolean} isLast - เป็นรายการสุดท้ายหรือไม่
 */
const TimelineItem = ({
  title = '',
  description = '',
  date = '',
  status = 'pending',
  icon = 'circle',
  isLast = false,
  additionalInfo = null,
}) => {
  // กำหนดสถานะ CSS classes
  const statusClasses = {
    done: 'is-done',
    active: 'is-active',
    pending: 'is-pending',
  };

  const dotClass = statusClasses[status] || 'is-pending';

  // สีข้อความตามสถานะ
  const textColorClasses = {
    done: 'text-neutral-600',
    active: 'text-neutral-900',
    pending: 'text-neutral-400',
  };

  const textColor = textColorClasses[status] || 'text-neutral-400';

  return (
    <div className={`timeline-item ${isLast ? 'border-l-0' : ''}`}>
      {/* Timeline Dot with Icon */}
      <div className={`timeline-dot ${dotClass}`}>
        <span className="material-icons-round text-sm">
          {status === 'done' ? 'check' : icon}
        </span>
      </div>

      {/* Content */}
      <div className="animate-slide-in-right">
        {/* Title & Date */}
        <div className="flex items-start justify-between mb-2">
          <h4 className={`font-semibold ${textColor} transition-colors duration-300`}>
            {title}
          </h4>
          {date && (
            <span className="text-xs text-neutral-400 ml-4 whitespace-nowrap">
              {date}
            </span>
          )}
        </div>

        {/* Description */}
        {description && (
          <p className={`text-sm ${textColor} mb-2 transition-colors duration-300`}>
            {description}
          </p>
        )}

        {/* Additional Info */}
        {additionalInfo && (
          <div className="mt-3">
            {additionalInfo}
          </div>
        )}
      </div>
    </div>
  );
};

Timeline.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      description: PropTypes.string,
      date: PropTypes.string,
      status: PropTypes.oneOf(['done', 'active', 'pending']),
      icon: PropTypes.string,
      additionalInfo: PropTypes.node,
    })
  ).isRequired,
  className: PropTypes.string,
};

TimelineItem.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  date: PropTypes.string,
  status: PropTypes.oneOf(['done', 'active', 'pending']),
  icon: PropTypes.string,
  isLast: PropTypes.bool,
  additionalInfo: PropTypes.node,
};

/**
 * ClaimTimeline - Timeline พิเศษสำหรับการเคลมประกัน
 * มีขั้นตอนที่กำหนดไว้แล้ว
 */
export const ClaimTimeline = ({ currentStep = 0, claimData = {} }) => {
  // ขั้นตอนมาตรฐานของการเคลม
  const steps = [
    {
      title: 'แจ้งเคลม',
      description: 'แจ้งเหตุกับบริษัทประกันภัย',
      icon: 'phone_in_talk',
      date: claimData.reportedDate || '',
    },
    {
      title: 'ตรวจสอบพื้นที่',
      description: 'เจ้าหน้าที่ออกตรวจสอบความเสียหาย',
      icon: 'search',
      date: claimData.inspectionDate || '',
    },
    {
      title: 'อนุมัติเคลม',
      description: 'บริษัทพิจารณาอนุมัติเคลม',
      icon: 'task_alt',
      date: claimData.approvalDate || '',
    },
    {
      title: 'เลือกอู่ซ่อม',
      description: 'ลูกค้าเลือกอู่และนำรถเข้าซ่อม',
      icon: 'build',
      date: claimData.garageSelectedDate || '',
    },
    {
      title: 'กำลังซ่อม',
      description: 'อู่ดำเนินการซ่อมแซม',
      icon: 'handyman',
      date: claimData.repairStartDate || '',
    },
    {
      title: 'เสร็จสิ้น',
      description: 'ซ่อมเสร็จและส่งมอบรถ',
      icon: 'celebration',
      date: claimData.completedDate || '',
    },
  ];

  // กำหนดสถานะของแต่ละ step
  const itemsWithStatus = steps.map((step, index) => {
    let status = 'pending';
    if (index < currentStep) {
      status = 'done';
    } else if (index === currentStep) {
      status = 'active';
    }

    return {
      ...step,
      status,
    };
  });

  return <Timeline items={itemsWithStatus} />;
};

ClaimTimeline.propTypes = {
  currentStep: PropTypes.number,
  claimData: PropTypes.shape({
    reportedDate: PropTypes.string,
    inspectionDate: PropTypes.string,
    approvalDate: PropTypes.string,
    garageSelectedDate: PropTypes.string,
    repairStartDate: PropTypes.string,
    completedDate: PropTypes.string,
  }),
};

export default Timeline;