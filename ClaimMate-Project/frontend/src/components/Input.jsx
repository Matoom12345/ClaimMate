import React, { useState } from 'react';
import PropTypes from 'prop-types';

/**
 * Input Component - ช่องกรอกข้อมูลที่สวยงามและใช้งานง่าย
 * 
 * @param {string} type - ประเภท input: 'text', 'email', 'password', 'number', 'tel', 'url'
 * @param {string} label - ป้ายชื่อ (label)
 * @param {string} placeholder - ข้อความตัวอย่าง
 * @param {string} value - ค่าปัจจุบัน
 * @param {function} onChange - ฟังก์ชันเมื่อมีการเปลี่ยนแปลง
 * @param {string} error - ข้อความ error
 * @param {string} helperText - ข้อความช่วยเหลือ
 * @param {boolean} required - จำเป็นต้องกรอกหรือไม่
 * @param {boolean} disabled - ปิดการใช้งาน
 * @param {string} icon - Material Icon ด้านซ้าย
 * @param {string} iconRight - Material Icon ด้านขวา
 * @param {boolean} fullWidth - เต็มความกว้าง
 * @param {string} className - class เพิ่มเติม
 */
const Input = ({
  type = 'text',
  label = '',
  placeholder = '',
  value = '',
  onChange,
  error = '',
  helperText = '',
  required = false,
  disabled = false,
  icon = null,
  iconRight = null,
  fullWidth = true,
  className = '',
  name = '',
  id = '',
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Generate unique id if not provided
  const inputId = id || `input-${name}-${Math.random().toString(36).substr(2, 9)}`;

  // Determine if it's a password field
  const isPassword = type === 'password';
  const inputType = isPassword && showPassword ? 'text' : type;

  // Container classes
  const containerClasses = `${fullWidth ? 'w-full' : ''} ${className}`;

  // Input wrapper classes
  const wrapperClasses = `
    relative flex items-center
    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
  `.trim().replace(/\s+/g, ' ');

  // Input classes
  const inputClasses = `
    input-field
    ${icon ? 'pl-12' : ''}
    ${iconRight || isPassword ? 'pr-12' : ''}
    ${error ? '!border-error focus:!ring-error' : ''}
    ${disabled ? 'cursor-not-allowed bg-neutral-100' : ''}
  `.trim().replace(/\s+/g, ' ');

  // Icon classes
  const iconClasses = `
    absolute text-neutral-400 transition-colors duration-300
    ${isFocused ? 'text-primary-500' : ''}
    ${error ? '!text-error' : ''}
  `;

  return (
    <div className={containerClasses}>
      {/* Label */}
      {label && (
        <label
          htmlFor={inputId}
          className={`
            block mb-2 text-sm font-medium text-neutral-700 transition-colors duration-300
            ${isFocused ? 'text-primary-600' : ''}
            ${error ? '!text-error' : ''}
          `.trim().replace(/\s+/g, ' ')}
        >
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </label>
      )}

      {/* Input Wrapper */}
      <div className={wrapperClasses}>
        {/* Left Icon */}
        {icon && (
          <span className={`${iconClasses} left-4`}>
            <span className="material-icons-round text-xl">{icon}</span>
          </span>
        )}

        {/* Input Field */}
        <input
          id={inputId}
          name={name}
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={inputClasses}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />

        {/* Right Icon / Password Toggle */}
        {isPassword ? (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className={`${iconClasses} right-4 cursor-pointer hover:text-primary-600`}
            tabIndex={-1}
          >
            <span className="material-icons-round text-xl">
              {showPassword ? 'visibility_off' : 'visibility'}
            </span>
          </button>
        ) : iconRight ? (
          <span className={`${iconClasses} right-4`}>
            <span className="material-icons-round text-xl">{iconRight}</span>
          </span>
        ) : null}
      </div>

      {/* Helper Text / Error Message */}
      {(error || helperText) && (
        <p
          className={`
            mt-2 text-sm animate-slide-down
            ${error ? 'text-error' : 'text-neutral-500'}
          `.trim().replace(/\s+/g, ' ')}
        >
          {error || helperText}
        </p>
      )}
    </div>
  );
};

Input.propTypes = {
  type: PropTypes.oneOf(['text', 'email', 'password', 'number', 'tel', 'url']),
  label: PropTypes.string,
  placeholder: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func,
  error: PropTypes.string,
  helperText: PropTypes.string,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  icon: PropTypes.string,
  iconRight: PropTypes.string,
  fullWidth: PropTypes.bool,
  className: PropTypes.string,
  name: PropTypes.string,
  id: PropTypes.string,
};

/**
 * TextArea Component - สำหรับข้อความหลายบรรทัด
 */
export const TextArea = ({
  label = '',
  placeholder = '',
  value = '',
  onChange,
  error = '',
  helperText = '',
  required = false,
  disabled = false,
  rows = 4,
  fullWidth = true,
  className = '',
  name = '',
  id = '',
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const textareaId = id || `textarea-${name}-${Math.random().toString(36).substr(2, 9)}`;

  const containerClasses = `${fullWidth ? 'w-full' : ''} ${className}`;

  const textareaClasses = `
    input-field resize-none
    ${error ? '!border-error focus:!ring-error' : ''}
    ${disabled ? 'cursor-not-allowed bg-neutral-100' : ''}
  `.trim().replace(/\s+/g, ' ');

  return (
    <div className={containerClasses}>
      {/* Label */}
      {label && (
        <label
          htmlFor={textareaId}
          className={`
            block mb-2 text-sm font-medium text-neutral-700 transition-colors duration-300
            ${isFocused ? 'text-primary-600' : ''}
            ${error ? '!text-error' : ''}
          `.trim().replace(/\s+/g, ' ')}
        >
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </label>
      )}

      {/* TextArea */}
      <textarea
        id={textareaId}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        rows={rows}
        className={textareaClasses}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        {...props}
      />

      {/* Helper Text / Error Message */}
      {(error || helperText) && (
        <p
          className={`
            mt-2 text-sm animate-slide-down
            ${error ? 'text-error' : 'text-neutral-500'}
          `.trim().replace(/\s+/g, ' ')}
        >
          {error || helperText}
        </p>
      )}
    </div>
  );
};

TextArea.propTypes = {
  label: PropTypes.string,
  placeholder: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func,
  error: PropTypes.string,
  helperText: PropTypes.string,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  rows: PropTypes.number,
  fullWidth: PropTypes.bool,
  className: PropTypes.string,
  name: PropTypes.string,
  id: PropTypes.string,
};

export default Input;