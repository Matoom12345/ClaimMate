import React from 'react';
import PropTypes from 'prop-types';

/**
 * Badge Component - แสดง status หรือ label ที่สวยงาม
 * 
 * @param {string} variant - สีของ badge: 'primary', 'secondary', 'success', 'warning', 'error', 'neutral'
 * @param {string} size - ขนาด: 'sm', 'md', 'lg'
 * @param {string} icon - ชื่อ Material Icon (ถ้ามี)
 * @param {boolean} dot - แสดงจุดสีหรือไม่
 * @param {string} className - class เพิ่มเติม
 * @param {node} children - ข้อความใน badge
 */
const Badge = ({
  variant = 'primary',
  size = 'md',
  icon = null,
  dot = false,
  className = '',
  children,
  ...props
}) => {
  // Base classes
  const baseClasses = 'badge inline-flex items-center gap-1.5 font-medium transition-all duration-300';
  
  // Variant classes (ใช้จาก index.css)
  const variantClasses = {
    primary: 'badge-primary',
    secondary: 'badge-secondary',
    success: 'badge-success',
    warning: 'badge-warning',
    error: 'badge-error',
    neutral: 'badge-neutral',
  };
  
  // Size classes
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };
  
  // Icon size based on badge size
  const iconSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };
  
  // Dot size based on badge size
  const dotSizeClasses = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5',
  };
  
  // Combine all classes
  const badgeClasses = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <span className={badgeClasses} {...props}>
      {/* Dot Indicator */}
      {dot && (
        <span className={`${dotSizeClasses[size]} rounded-full bg-current opacity-60`} />
      )}
      
      {/* Icon */}
      {icon && (
        <span className={`material-icons-round ${iconSizeClasses[size]}`}>
          {icon}
        </span>
      )}
      
      {/* Badge Text */}
      {children}
    </span>
  );
};

Badge.propTypes = {
  variant: PropTypes.oneOf(['primary', 'secondary', 'success', 'warning', 'error', 'neutral']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  icon: PropTypes.string,
  dot: PropTypes.bool,
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
};

/**
 * Status Badge - Badge พิเศษสำหรับแสดงสถานะการเคลม
 * มี mapping สถานะไปยังสีและไอคอนที่เหมาะสม
 */
export const StatusBadge = ({ status, size = 'md', className = '' }) => {
  const statusConfig = {
    // สถานะสำหรับลูกค้า
    'pending': { variant: 'warning', icon: 'schedule', text: 'รอดำเนินการ' },
    'in_progress': { variant: 'primary', icon: 'autorenew', text: 'กำลังดำเนินการ' },
    'approved': { variant: 'success', icon: 'check_circle', text: 'อนุมัติแล้ว' },
    'completed': { variant: 'success', icon: 'task_alt', text: 'เสร็จสิ้น' },
    'rejected': { variant: 'error', icon: 'cancel', text: 'ไม่อนุมัติ' },
    'cancelled': { variant: 'neutral', icon: 'block', text: 'ยกเลิก' },
    
    // สถานะสำหรับอู่
    'waiting_approval': { variant: 'warning', icon: 'pending', text: 'รออนุมัติ' },
    'repairing': { variant: 'primary', icon: 'build', text: 'กำลังซ่อม' },
    'parts_ordered': { variant: 'secondary', icon: 'inventory_2', text: 'สั่งอะไหล่แล้ว' },
    'quality_check': { variant: 'primary', icon: 'verified', text: 'ตรวจสอบคุณภาพ' },
  };

  const config = statusConfig[status] || { 
    variant: 'neutral', 
    icon: 'info', 
    text: status 
  };

  return (
    <Badge
      variant={config.variant}
      size={size}
      icon={config.icon}
      className={className}
    >
      {config.text}
    </Badge>
  );
};

StatusBadge.propTypes = {
  status: PropTypes.string.isRequired,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  className: PropTypes.string,
};

export default Badge;