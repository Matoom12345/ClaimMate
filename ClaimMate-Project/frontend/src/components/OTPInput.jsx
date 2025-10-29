import React, { useRef, useState, useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * OTPInput Component - Input OTP แบบแยกช่อง สวยงาม
 * 
 * Features:
 * ✅ แยกเป็น 6 ช่อง
 * ✅ Auto-focus ช่องถัดไปเมื่อกรอกเสร็จ
 * ✅ รองรับ Backspace ย้อนกลับ
 * ✅ รองรับ Paste OTP ทั้งหมด
 * ✅ Animation สวยงาม
 * 
 * @param {string} value - ค่า OTP (string 6 หลัก)
 * @param {function} onChange - ฟังก์ชันเมื่อเปลี่ยนค่า
 * @param {string} error - ข้อความ error
 * @param {boolean} disabled - ปิดการใช้งาน
 */
const OTPInput = ({ value = '', onChange, error = '', disabled = false }) => {
  const inputRefs = useRef([]);
  const [otp, setOtp] = useState(Array(6).fill(''));

  // Update otp state เมื่อ value prop เปลี่ยน
  useEffect(() => {
    if (value) {
      const otpArray = value.split('').slice(0, 6);
      setOtp([...otpArray, ...Array(6 - otpArray.length).fill('')]);
    } else {
      setOtp(Array(6).fill(''));
    }
  }, [value]);

  // Focus ช่องแรกเมื่อ component mount
  useEffect(() => {
    if (inputRefs.current[0] && !disabled) {
      inputRefs.current[0].focus();
    }
  }, [disabled]);

  // Handle input change
  const handleChange = (index, e) => {
    const val = e.target.value;

    // ยอมรับแค่ตัวเลข
    if (val && !/^\d$/.test(val)) return;

    const newOtp = [...otp];
    newOtp[index] = val;
    setOtp(newOtp);

    // Notify parent component
    onChange(newOtp.join(''));

    // Auto-focus ช่องถัดไป
    if (val && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle keydown (Backspace)
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        // ถ้าช่องว่างและกด Backspace → ย้อนกลับไปช่องก่อนหน้า
        inputRefs.current[index - 1]?.focus();
      } else if (otp[index]) {
        // ถ้ามีค่า → ลบค่า
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
        onChange(newOtp.join(''));
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle paste
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').trim();
    
    // ยอมรับแค่ตัวเลข 6 หลัก
    if (/^\d{6}$/.test(pastedData)) {
      const newOtp = pastedData.split('');
      setOtp(newOtp);
      onChange(pastedData);
      
      // Focus ช่องสุดท้าย
      inputRefs.current[5]?.focus();
    }
  };

  // Handle focus
  const handleFocus = (index) => {
    // Select ข้อความเมื่อ focus
    inputRefs.current[index]?.select();
  };

  return (
    <div className="w-full">
      {/* Label */}
      <label className="block mb-3 text-sm font-medium text-neutral-700">
        รหัส OTP
      </label>

      {/* OTP Input Fields */}
      <div className="flex items-center justify-center gap-2 sm:gap-3">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            onFocus={() => handleFocus(index)}
            disabled={disabled}
            className={`
              w-12 h-14 sm:w-14 sm:h-16
              text-center text-2xl sm:text-3xl font-bold
              border-2 rounded-xl
              transition-all duration-300
              focus:outline-none focus:ring-4
              ${error
                ? 'border-error bg-red-50 focus:border-error focus:ring-error/20'
                : 'border-neutral-300 bg-white focus:border-primary-500 focus:ring-primary-500/20'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary-400'}
              ${digit ? 'border-primary-500 bg-primary-50' : ''}
            `}
            autoComplete="off"
          />
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <p className="mt-3 text-sm text-error animate-slide-down flex items-center gap-2">
          <span className="material-icons-round text-lg">error</span>
          {error}
        </p>
      )}

      {/* Helper Text */}
      <p className="mt-3 text-xs text-center text-neutral-500 flex items-center justify-center gap-2">
        <span className="material-icons-round text-sm">info</span>
        กรอกรหัส OTP 6 หลัก หรือ Paste ได้เลย
      </p>
    </div>
  );
};

OTPInput.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  error: PropTypes.string,
  disabled: PropTypes.bool,
};

export default OTPInput;