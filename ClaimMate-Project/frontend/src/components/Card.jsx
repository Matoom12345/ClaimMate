import React from 'react';
import PropTypes from 'prop-types';

/**
 * Card Component - การ์ดสวยงามพร้อม hover effects
 * 
 * @param {string} variant - รูปแบบการ์ด: 'default', 'glass', 'gradient'
 * @param {boolean} hoverable - มี hover effect หรือไม่
 * @param {boolean} clickable - คลิกได้หรือไม่
 * @param {function} onClick - ฟังก์ชันเมื่อคลิก (ถ้า clickable = true)
 * @param {string} className - class เพิ่มเติม
 * @param {node} children - เนื้อหาภายในการ์ด
 */
const Card = ({
  variant = 'default',
  hoverable = true,
  clickable = false,
  onClick,
  className = '',
  children,
  ...props
}) => {
  // Base classes
  const baseClasses = 'rounded-card p-6 transition-all duration-300';
  
  // Variant classes
  const variantClasses = {
    default: 'card', // ใช้ class จาก index.css
    glass: 'card-glass', // Glass morphism effect
    gradient: 'bg-gradient-primary text-white shadow-card', // Gradient background
  };
  
  // Hover classes
  const hoverClass = hoverable ? '' : '!hover:shadow-card !hover:translate-y-0';
  
  // Clickable classes
  const clickableClass = clickable ? 'cursor-pointer' : '';
  
  // Combine all classes
  const cardClasses = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${hoverClass}
    ${clickableClass}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  // Handle click
  const handleClick = () => {
    if (clickable && onClick) {
      onClick();
    }
  };

  return (
    <div
      className={cardClasses}
      onClick={handleClick}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyPress={clickable ? (e) => e.key === 'Enter' && handleClick() : undefined}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * Card Header - ส่วนหัวของการ์ด
 */
export const CardHeader = ({ children, className = '', ...props }) => (
  <div className={`mb-4 ${className}`} {...props}>
    {children}
  </div>
);

/**
 * Card Title - หัวข้อการ์ด
 */
export const CardTitle = ({ children, className = '', ...props }) => (
  <h3 className={`text-xl font-semibold text-neutral-dark ${className}`} {...props}>
    {children}
  </h3>
);

/**
 * Card Body - เนื้อหาหลักของการ์ด
 */
export const CardBody = ({ children, className = '', ...props }) => (
  <div className={`${className}`} {...props}>
    {children}
  </div>
);

/**
 * Card Footer - ส่วนท้ายของการ์ด
 */
export const CardFooter = ({ children, className = '', ...props }) => (
  <div className={`mt-4 pt-4 border-t border-neutral-200 ${className}`} {...props}>
    {children}
  </div>
);

Card.propTypes = {
  variant: PropTypes.oneOf(['default', 'glass', 'gradient']),
  hoverable: PropTypes.bool,
  clickable: PropTypes.bool,
  onClick: PropTypes.func,
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
};

CardHeader.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

CardTitle.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

CardBody.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

CardFooter.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

export default Card;