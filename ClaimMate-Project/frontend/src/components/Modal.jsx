import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import Button from './Button';

/**
 * Modal Component - Dialog popup ที่สวยงามพร้อม animations
 * 
 * @param {boolean} isOpen - เปิด modal หรือไม่
 * @param {function} onClose - ฟังก์ชันเมื่อปิด modal
 * @param {string} title - หัวข้อ modal
 * @param {string} size - ขนาด: 'sm', 'md', 'lg', 'xl', 'full'
 * @param {boolean} showCloseButton - แสดงปุ่มปิดหรือไม่
 * @param {boolean} closeOnBackdropClick - ปิดเมื่อคลิกข้างนอกหรือไม่
 * @param {node} children - เนื้อหาภายใน modal
 * @param {node} footer - ส่วน footer (ปุ่มต่างๆ)
 */
const Modal = ({
  isOpen = false,
  onClose,
  title = '',
  size = 'md',
  showCloseButton = true,
  closeOnBackdropClick = true,
  children,
  footer = null,
  className = '',
}) => {
  // ป้องกันการ scroll เมื่อเปิด modal
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Size classes
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4',
  };

  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (closeOnBackdropClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-neutral-900/50 backdrop-blur-sm" />

      {/* Modal Content */}
      <div
        className={`
          relative w-full ${sizeClasses[size]}
          bg-white rounded-2xl shadow-2xl
          animate-slide-up
          max-h-[90vh] flex flex-col
          ${className}
        `.trim().replace(/\s+/g, ' ')}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200">
          <h3 className="text-2xl font-semibold text-neutral-dark">
            {title}
          </h3>
          
          {showCloseButton && (
            <button
              onClick={onClose}
              className="text-neutral-400 hover:text-neutral-600 transition-colors duration-300 hover:bg-neutral-100 rounded-lg p-2"
              aria-label="Close modal"
            >
              <span className="material-icons-round text-2xl">close</span>
            </button>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 p-6 border-t border-neutral-200">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl', 'full']),
  showCloseButton: PropTypes.bool,
  closeOnBackdropClick: PropTypes.bool,
  children: PropTypes.node.isRequired,
  footer: PropTypes.node,
  className: PropTypes.string,
};

/**
 * ConfirmModal - Modal พิเศษสำหรับการยืนยัน
 */
export const ConfirmModal = ({
  isOpen = false,
  onClose,
  onConfirm,
  title = 'ยืนยันการดำเนินการ',
  message = 'คุณแน่ใจหรือไม่ที่จะดำเนินการต่อ?',
  confirmText = 'ยืนยัน',
  cancelText = 'ยกเลิก',
  variant = 'primary', // 'primary', 'error', 'warning'
  loading = false,
}) => {
  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
  };

  // Icon based on variant
  const iconConfig = {
    primary: { icon: 'info', color: 'text-primary-500' },
    error: { icon: 'warning', color: 'text-error' },
    warning: { icon: 'error_outline', color: 'text-warning' },
  };

  const config = iconConfig[variant] || iconConfig.primary;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      closeOnBackdropClick={!loading}
    >
      <div className="text-center py-4">
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className={`w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center ${config.color}`}>
            <span className="material-icons-round text-4xl">{config.icon}</span>
          </div>
        </div>

        {/* Message */}
        <p className="text-neutral-700 text-lg mb-6">
          {message}
        </p>

        {/* Buttons */}
        <div className="flex gap-3 justify-center">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </Button>
          <Button
            variant={variant === 'error' ? 'error' : 'primary'}
            onClick={handleConfirm}
            loading={loading}
            className={variant === 'error' ? 'bg-error hover:bg-red-600' : ''}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

ConfirmModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func,
  title: PropTypes.string,
  message: PropTypes.string,
  confirmText: PropTypes.string,
  cancelText: PropTypes.string,
  variant: PropTypes.oneOf(['primary', 'error', 'warning']),
  loading: PropTypes.bool,
};

export default Modal;