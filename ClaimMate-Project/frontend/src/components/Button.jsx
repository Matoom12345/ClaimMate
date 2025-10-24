import React from 'react';
import PropTypes from 'prop-types';

/**
 * Button Component - ปุ่มที่มีหลาย variants พร้อม animations
 * 
 * @param {string} variant - รูปแบบของปุ่ม: 'primary', 'secondary', 'outline', 'ghost'
 * @param {string} size - ขนาดของปุ่ม: 'sm', 'md', 'lg'
 * @param {boolean} fullWidth - ปุ่มเต็มความกว้างหรือไม่
 * @param {boolean} loading - แสดง loading state
 * @param {boolean} disabled - ปิดการใช้งานปุ่ม
 * @param {string} icon - ชื่อ Material Icon (ถ้ามี)
 * @param {string} iconPosition - ตำแหน่ง icon: 'left', 'right'
 * @param {function} onClick - ฟังก์ชันเมื่อกดปุ่ม
 * @param {string} className - class เพิ่มเติม
 * @param {node} children - เนื้อหาภายในปุ่ม
 */
const Button = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled = false,
  icon = null,
  iconPosition = 'left',
  onClick,
  className = '',
  children,
  type = 'button',
  ...props
}) => {
  // Base classes
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none';
  
  // Variant classes
  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    outline: 'btn-outline',
    ghost: 'btn-ghost',
  };
  
  // Size classes
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm rounded-button',
    md: 'px-6 py-3 text-base rounded-button',
    lg: 'px-8 py-4 text-lg rounded-xl',
  };
  
  // Width class
  const widthClass = fullWidth ? 'w-full' : '';
  
  // Combine all classes
  const buttonClasses = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${widthClass}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <button
      type={type}
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
    >
      {/* Loading Spinner */}
      {loading && (
        <span className="material-icons-round animate-spin mr-2">
          refresh
        </span>
      )}
      
      {/* Icon (Left) */}
      {!loading && icon && iconPosition === 'left' && (
        <span className="material-icons-round mr-2">
          {icon}
        </span>
      )}
      
      {/* Button Text */}
      {children}
      
      {/* Icon (Right) */}
      {!loading && icon && iconPosition === 'right' && (
        <span className="material-icons-round ml-2">
          {icon}
        </span>
      )}
    </button>
  );
};

Button.propTypes = {
  variant: PropTypes.oneOf(['primary', 'secondary', 'outline', 'ghost']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  fullWidth: PropTypes.bool,
  loading: PropTypes.bool,
  disabled: PropTypes.bool,
  icon: PropTypes.string,
  iconPosition: PropTypes.oneOf(['left', 'right']),
  onClick: PropTypes.func,
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
};

export default Button;