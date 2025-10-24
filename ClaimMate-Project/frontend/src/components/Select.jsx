import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * Select Component - Dropdown ที่สวยงามและใช้งานง่าย
 * 
 * @param {string} label - ป้ายชื่อ
 * @param {string} placeholder - ข้อความตัวอย่าง
 * @param {string} value - ค่าที่เลือก (value ของ option)
 * @param {function} onChange - ฟังก์ชันเมื่อเปลี่ยนตัวเลือก
 * @param {array} options - รายการตัวเลือก [{ value, label, icon? }]
 * @param {string} error - ข้อความ error
 * @param {string} helperText - ข้อความช่วยเหลือ
 * @param {boolean} required - จำเป็นต้องเลือกหรือไม่
 * @param {boolean} disabled - ปิดการใช้งาน
 * @param {string} icon - Material Icon ด้านซ้าย
 * @param {boolean} searchable - ค้นหาได้หรือไม่
 * @param {boolean} fullWidth - เต็มความกว้าง
 * @param {string} className - class เพิ่มเติม
 */
const Select = ({
  label = '',
  placeholder = 'เลือก...',
  value = '',
  onChange,
  options = [],
  error = '',
  helperText = '',
  required = false,
  disabled = false,
  icon = null,
  searchable = false,
  fullWidth = true,
  className = '',
  name = '',
  id = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const selectRef = useRef(null);

  const selectId = id || `select-${name}-${Math.random().toString(36).substr(2, 9)}`;

  // หา option ที่ถูกเลือก
  const selectedOption = options.find(opt => opt.value === value);

  // Filter options ตาม search term
  const filteredOptions = searchable
    ? options.filter(opt =>
        opt.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setHighlightedIndex(prev =>
            prev < filteredOptions.length - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setHighlightedIndex(prev => (prev > 0 ? prev - 1 : prev));
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredOptions[highlightedIndex]) {
            handleSelect(filteredOptions[highlightedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          setIsOpen(false);
          setSearchTerm('');
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, highlightedIndex, filteredOptions]);

  // Reset highlighted index when search term changes
  useEffect(() => {
    setHighlightedIndex(0);
  }, [searchTerm]);

  const handleSelect = (option) => {
    onChange({ target: { name, value: option.value } });
    setIsOpen(false);
    setSearchTerm('');
  };

  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const containerClasses = `${fullWidth ? 'w-full' : ''} ${className}`;

  const selectButtonClasses = `
    input-field
    cursor-pointer
    flex items-center justify-between
    ${icon ? 'pl-12' : ''}
    ${error ? '!border-error focus:!ring-error' : ''}
    ${disabled ? 'cursor-not-allowed bg-neutral-100' : ''}
    ${isOpen ? 'ring-2 ring-primary-500 border-transparent' : ''}
  `.trim().replace(/\s+/g, ' ');

  return (
    <div className={containerClasses} ref={selectRef}>
      {/* Label */}
      {label && (
        <label
          htmlFor={selectId}
          className={`
            block mb-2 text-sm font-medium text-neutral-700 transition-colors duration-300
            ${isOpen ? 'text-primary-600' : ''}
            ${error ? '!text-error' : ''}
          `.trim().replace(/\s+/g, ' ')}
        >
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </label>
      )}

      {/* Select Button */}
      <div className="relative">
        {/* Left Icon */}
        {icon && (
          <span className={`
            absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 transition-colors duration-300
            ${isOpen ? 'text-primary-500' : ''}
            ${error ? '!text-error' : ''}
          `.trim().replace(/\s+/g, ' ')}>
            <span className="material-icons-round text-xl">{icon}</span>
          </span>
        )}

        {/* Select Display */}
        <button
          type="button"
          id={selectId}
          className={selectButtonClasses}
          onClick={toggleDropdown}
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <span className={`flex items-center gap-2 ${!selectedOption ? 'text-neutral-400' : ''}`}>
            {selectedOption?.icon && (
              <span className="material-icons-round text-lg">{selectedOption.icon}</span>
            )}
            {selectedOption?.label || placeholder}
          </span>

          {/* Dropdown Arrow */}
          <span className={`material-icons-round text-xl transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
            expand_more
          </span>
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-2 bg-white rounded-lg shadow-card-hover border border-neutral-200 animate-slide-down max-h-60 overflow-hidden">
            {/* Search Input */}
            {searchable && (
              <div className="p-2 border-b border-neutral-200">
                <input
                  type="text"
                  className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="ค้นหา..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            )}

            {/* Options List */}
            <div className="overflow-y-auto max-h-48 custom-scrollbar">
              {filteredOptions.length === 0 ? (
                <div className="px-4 py-3 text-sm text-neutral-400 text-center">
                  ไม่พบข้อมูล
                </div>
              ) : (
                filteredOptions.map((option, index) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`
                      w-full px-4 py-3 text-left flex items-center gap-2
                      transition-colors duration-200
                      ${value === option.value ? 'bg-primary-50 text-primary-700' : 'hover:bg-neutral-50'}
                      ${index === highlightedIndex ? 'bg-neutral-100' : ''}
                    `.trim().replace(/\s+/g, ' ')}
                    onClick={() => handleSelect(option)}
                    role="option"
                    aria-selected={value === option.value}
                  >
                    {option.icon && (
                      <span className="material-icons-round text-lg">{option.icon}</span>
                    )}
                    <span>{option.label}</span>
                    {value === option.value && (
                      <span className="material-icons-round text-primary-500 ml-auto">check</span>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
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

Select.propTypes = {
  label: PropTypes.string,
  placeholder: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      icon: PropTypes.string,
    })
  ).isRequired,
  error: PropTypes.string,
  helperText: PropTypes.string,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  icon: PropTypes.string,
  searchable: PropTypes.bool,
  fullWidth: PropTypes.bool,
  className: PropTypes.string,
  name: PropTypes.string,
  id: PropTypes.string,
};

export default Select;