import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';

/**
 * FileUpload Component - อัปโหลดไฟล์พร้อม drag & drop
 * 
 * @param {string} label - ป้ายชื่อ
 * @param {function} onChange - ฟังก์ชันเมื่อเลือกไฟล์
 * @param {string} accept - ประเภทไฟล์ที่รับ (เช่น 'image/*', '.pdf')
 * @param {boolean} multiple - อัปโหลดหลายไฟล์หรือไม่
 * @param {number} maxSize - ขนาดไฟล์สูงสุด (MB)
 * @param {array} files - ไฟล์ที่เลือกแล้ว
 * @param {string} error - ข้อความ error
 * @param {boolean} disabled - ปิดการใช้งาน
 * @param {boolean} showPreview - แสดง preview รูปภาพหรือไม่
 * @param {string} className - class เพิ่มเติม
 */
const FileUpload = ({
  label = '',
  onChange,
  accept = '*',
  multiple = false,
  maxSize = 10, // MB
  files = [],
  error = '',
  disabled = false,
  showPreview = true,
  className = '',
  name = '',
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Validate file
  const validateFile = (file) => {
    const maxSizeBytes = maxSize * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return `ไฟล์ ${file.name} มีขนาดใหญ่เกิน ${maxSize}MB`;
    }
    return null;
  };

  // Handle file selection
  const handleFileChange = (selectedFiles) => {
    const fileArray = Array.from(selectedFiles);
    let errorMessage = '';

    // Validate each file
    for (const file of fileArray) {
      const error = validateFile(file);
      if (error) {
        errorMessage = error;
        break;
      }
    }

    if (errorMessage) {
      onChange({ target: { name, files: [], error: errorMessage } });
      return;
    }

    // Add preview URL for images
    const filesWithPreview = fileArray.map(file => ({
      file,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
    }));

    onChange({ target: { name, files: filesWithPreview, error: '' } });
  };

  // Handle input change
  const handleInputChange = (e) => {
    if (e.target.files.length > 0) {
      handleFileChange(e.target.files);
    }
  };

  // Handle drag events
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (!disabled && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files);
    }
  };

  // Handle remove file
  const handleRemoveFile = (index) => {
    const newFiles = files.filter((_, i) => i !== index);
    onChange({ target: { name, files: newFiles, error: '' } });
  };

  // Trigger file input click
  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  // Get file icon
  const getFileIcon = (file) => {
    const type = file.file.type;
    if (type.startsWith('image/')) return 'image';
    if (type.includes('pdf')) return 'picture_as_pdf';
    if (type.includes('word')) return 'description';
    if (type.includes('excel') || type.includes('spreadsheet')) return 'table_chart';
    return 'insert_drive_file';
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Label */}
      {label && (
        <label className="block mb-2 text-sm font-medium text-neutral-700">
          {label}
        </label>
      )}

      {/* Upload Area */}
      <div
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center
          transition-all duration-300 cursor-pointer
          ${isDragging ? 'border-primary-500 bg-primary-50' : 'border-neutral-300 hover:border-primary-400'}
          ${error ? '!border-error bg-red-50' : ''}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `.trim().replace(/\s+/g, ' ')}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        {/* Hidden Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleInputChange}
          disabled={disabled}
          className="hidden"
          name={name}
        />

        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className={`
            w-16 h-16 rounded-full flex items-center justify-center
            ${isDragging ? 'bg-primary-100 text-primary-600' : 'bg-neutral-100 text-neutral-400'}
            transition-colors duration-300
          `.trim().replace(/\s+/g, ' ')}>
            <span className="material-icons-round text-4xl">
              {isDragging ? 'file_download' : 'cloud_upload'}
            </span>
          </div>
        </div>

        {/* Text */}
        <p className="text-neutral-700 font-medium mb-2">
          {isDragging ? 'วางไฟล์ที่นี่' : 'ลากและวางไฟล์ หรือคลิกเพื่อเลือกไฟล์'}
        </p>
        <p className="text-sm text-neutral-500">
          รองรับไฟล์ขนาดไม่เกิน {maxSize}MB
          {accept !== '*' && ` (${accept})`}
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <p className="mt-2 text-sm text-error animate-slide-down">
          {error}
        </p>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          {files.map((fileItem, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors duration-300 animate-slide-in-right"
            >
              {/* Preview / Icon */}
              {showPreview && fileItem.preview ? (
                <img
                  src={fileItem.preview}
                  alt={fileItem.file.name}
                  className="w-12 h-12 object-cover rounded"
                />
              ) : (
                <div className="w-12 h-12 flex items-center justify-center bg-primary-100 text-primary-600 rounded">
                  <span className="material-icons-round">
                    {getFileIcon(fileItem)}
                  </span>
                </div>
              )}

              {/* File Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-700 truncate">
                  {fileItem.file.name}
                </p>
                <p className="text-xs text-neutral-500">
                  {formatFileSize(fileItem.file.size)}
                </p>
              </div>

              {/* Remove Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveFile(index);
                }}
                className="text-neutral-400 hover:text-error transition-colors duration-300"
                disabled={disabled}
              >
                <span className="material-icons-round">close</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

FileUpload.propTypes = {
  label: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  accept: PropTypes.string,
  multiple: PropTypes.bool,
  maxSize: PropTypes.number,
  files: PropTypes.array,
  error: PropTypes.string,
  disabled: PropTypes.bool,
  showPreview: PropTypes.bool,
  className: PropTypes.string,
  name: PropTypes.string,
};

export default FileUpload;