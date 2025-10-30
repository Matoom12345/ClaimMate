import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';

/**
 * FileUpload Component - อัปโหลดไฟล์พร้อม drag & drop
 *
 * @param {boolean} withDetails - เปิดโหมดอัปโหลดพร้อมรายละเอียด (caption + type)
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
 * @param name
 * @param onRemove
 * @param onUpdateFiles
 */
const FileUpload = ({
  withDetails = false, // ⭐ NEW: โหมดอัปโหลดพร้อมรายละเอียด
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
                      onRemove = null,
                      onUpdateFiles = null, // <-- ✅ เพิ่มบรรทัดนี้
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [editingImage, setEditingImage] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
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
    const filesWithPreview = fileArray.map((file, index) => ({
      id: Date.now() + index,
      file,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
      // ⭐ NEW: เพิ่ม fields สำหรับ withDetails mode
      type: withDetails ? 'damage' : undefined,
      caption: withDetails ? '' : undefined,
      uploaded: false,
    }));

    onChange({ target: { name, files: filesWithPreview, error: '' } });
    
    // ⭐ NEW: ถ้าเป็น withDetails mode ให้เปิด modal แก้ไขรูปแรก
    if (withDetails && filesWithPreview.length > 0) {
      setEditingImage(filesWithPreview[0]);
      setShowEditModal(true);
    }
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

  // ⭐ NEW: Handle edit image (withDetails mode)
  const handleEditImage = (image) => {
    setEditingImage({ ...image });
    setShowEditModal(true);
  };

  // ⭐ NEW: Handle save edit (withDetails mode)
  const handleSaveEdit = () => {
    if (!editingImage.caption.trim()) {
      alert('กรุณาใส่ชื่อ/คำอธิบายรูปภาพ');
      return;
    }

    const updatedFiles = files.map(file =>
        file.id === editingImage.id ? editingImage : file
    );

    // --- ✅ START FIX ---
    if (onUpdateFiles) {
      // เรียก setImages ใน ClaimDetail โดยตรง
      onUpdateFiles(updatedFiles);
    } else {
      // Fallback (ถ้าหน้าอื่นเอาไปใช้)
      onChange({ target: { name, files: updatedFiles, error: '' } });
    }
    // --- ✅ END FIX ---

    // หา file ถัดไปที่ยังไม่มี caption (ใช้ updatedFiles ตัวแปรล่าสุด)
    const nextFile = updatedFiles.find(file =>
        file.id !== editingImage.id && !file.caption?.trim()
    );

    if (nextFile) {
      setEditingImage({ ...nextFile });
    } else {
      setShowEditModal(false); // ✅ บรรทัดนี้จะทำงานได้ถูกต้องแล้ว
      setEditingImage(null);
    }
  };

  // Handle remove file
  const handleRemoveFile = (index) => {
    const fileToRemove = files[index]; // ดึง object ที่จะลบออกมาก่อน

    if (onRemove) {
      // ถ้ามี prop onRemove (จาก ClaimDetail) ให้เรียกใช้ตัวนั้น
      onRemove(fileToRemove);
    } else {
      // ถ้าไม่มี (เช่น หน้ารอื่นใช้) ให้ใช้พฤติกรรมเดิม
      const newFiles = files.filter((_, i) => i !== index);
      onChange({ target: { name, files: newFiles, error: '' } });
    }

    // ปิด modal ถ้ากำลังแก้ไขไฟล์นี้อยู่
    if (editingImage && editingImage.id === fileToRemove.id) {
      setShowEditModal(false);
      setEditingImage(null);
    }
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

  // ⭐ Render withDetails mode (Grid Preview)
  if (withDetails && files.length > 0) {
    return (
      <div className={`w-full ${className}`}>
        {label && (
          <label className="block mb-2 text-sm font-medium text-neutral-700">
            {label}
          </label>
        )}

        {/* Upload Zone */}
        <div
          className={`
            relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 cursor-pointer
            ${isDragging ? 'border-primary-500 bg-primary-50' : 'border-neutral-300 hover:border-primary-400'}
            ${error ? '!border-error bg-red-50' : ''}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={handleClick}
        >
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

          <div className="space-y-4">
            <div className="w-20 h-20 mx-auto bg-primary-100 rounded-full flex items-center justify-center">
              <span className="material-icons-round text-4xl text-primary-500">cloud_upload</span>
            </div>

            <div>
              <p className="text-lg font-semibold text-neutral-dark mb-2">
                ลากและวางไฟล์ หรือคลิกเพื่อเลือกไฟล์
              </p>
              <p className="text-sm text-neutral-500 mb-4">
                รองรับไฟล์ image/* (สูงสุด 20 รูป)
              </p>
              <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation(); // <-- ✅ เพิ่มบรรทัดนี้เพื่อหยุด Event
                    handleClick();
                  }}
                  className="btn-primary"
              >
                <span className="material-icons-round mr-2">photo_library</span>
                เลือกรูปภาพ
              </button>
            </div>
          </div>
        </div>

        {/* Helper Text */}
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-neutral-700">
            <span className="material-icons-round text-sm mr-1 align-middle text-info">info</span>
            ถ่ายรูปหลากหลายมุม: ด้านหน้า, ด้านหลัง, ด้านข้าง และส่วนที่เสียหาย
          </p>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-error/10 border border-error rounded-lg">
            <p className="text-error text-sm">{error}</p>
          </div>
        )}

        {/* Grid Preview */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-neutral-dark mb-4">
            รูปภาพที่อัปโหลด ({files.length})
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {files.map((fileItem, index) => (
              <div
                key={fileItem.id}
                className="relative group aspect-video rounded-lg overflow-hidden cursor-pointer border-2 border-neutral-200 hover:border-primary-400 transition-all duration-300"
              >
                <img
                  src={fileItem.preview}
                  alt={fileItem.caption || 'รูปภาพ'}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />

                {/* Type Badge */}
                <div className="absolute top-2 right-2">
                  <span className={`px-2 py-1 text-xs font-semibold rounded ${fileItem.type === 'damage' ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'}`}>
                    {fileItem.type === 'damage' ? 'ความเสียหาย' : 'เอกสาร'}
                  </span>
                </div>

                {/* Warning */}
                {!fileItem.caption?.trim() && (
                  <div className="absolute top-2 left-2">
                    <span className="px-2 py-1 text-xs font-semibold rounded bg-yellow-500 text-white animate-pulse">
                      ต้องใส่ชื่อ
                    </span>
                  </div>
                )}

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    {fileItem.caption ? (
                      <p className="text-white text-sm font-medium line-clamp-2">{fileItem.caption}</p>
                    ) : (
                      <p className="text-white/60 text-sm italic">คลิกเพื่อเพิ่มชื่อรูป</p>
                    )}
                  </div>

                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditImage(fileItem);
                      }}
                      className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-primary-500 hover:text-white transition-colors duration-300"
                    >
                      <span className="material-icons-round text-xl">edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFile(index);
                      }}
                      className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors duration-300"
                    >
                      <span className="material-icons-round text-xl">delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Edit Modal */}
        {showEditModal && editingImage && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-neutral-dark">เพิ่มรายละเอียดรูปภาพ</h3>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="w-8 h-8 rounded-full hover:bg-neutral-100 flex items-center justify-center"
                  >
                    <span className="material-icons-round text-neutral-500">close</span>
                  </button>
                </div>

                <div className="mb-6">
                  <img src={editingImage.preview} alt="Preview" className="w-full rounded-lg" />
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      ประเภทรูปภาพ <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setEditingImage({ ...editingImage, type: 'damage' })}
                        className={`p-4 rounded-lg border-2 transition-all ${editingImage.type === 'damage' ? 'border-red-500 bg-red-50' : 'border-neutral-200'}`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`material-icons-round text-2xl ${editingImage.type === 'damage' ? 'text-red-500' : 'text-neutral-400'}`}>car_crash</span>
                          <div className="text-left">
                            <p className={`font-semibold ${editingImage.type === 'damage' ? 'text-red-600' : 'text-neutral-700'}`}>ความเสียหาย</p>
                            <p className="text-xs text-neutral-500">รูปจุดเสียหาย</p>
                          </div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setEditingImage({ ...editingImage, type: 'document' })}
                        className={`p-4 rounded-lg border-2 transition-all ${editingImage.type === 'document' ? 'border-blue-500 bg-blue-50' : 'border-neutral-200'}`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`material-icons-round text-2xl ${editingImage.type === 'document' ? 'text-blue-500' : 'text-neutral-400'}`}>description</span>
                          <div className="text-left">
                            <p className={`font-semibold ${editingImage.type === 'document' ? 'text-blue-600' : 'text-neutral-700'}`}>เอกสาร</p>
                            <p className="text-xs text-neutral-500">เอกสารประกอบ</p>
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      ชื่อ/คำอธิบายรูปภาพ <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={editingImage.caption}
                      onChange={(e) => setEditingImage({ ...editingImage, caption: e.target.value })}
                      placeholder="เช่น ความเสียหายด้านหน้า มุม 1"
                      className="input-field"
                      autoFocus
                    />
                  </div>

                  {editingImage.type === 'damage' && (
                    <div>
                      <p className="text-sm font-medium text-neutral-700 mb-2">ตัวอย่าง:</p>
                      <div className="flex flex-wrap gap-2">
                        {['ความเสียหายด้านหน้า', 'กันชนบุบ', 'ไฟหน้าแตก'].map((s) => (
                          <button key={s} type="button" onClick={() => setEditingImage({ ...editingImage, caption: s })} className="px-3 py-1.5 text-sm bg-neutral-100 hover:bg-primary-100 rounded-lg">{s}</button>
                        ))}
                      </div>
                    </div>
                  )}

                  {editingImage.type === 'document' && (
                    <div>
                      <p className="text-sm font-medium text-neutral-700 mb-2">ตัวอย่าง:</p>
                      <div className="flex flex-wrap gap-2">
                        {['บัตรประชาชน', 'ใบขับขี่', 'ทะเบียนรถ'].map((s) => (
                          <button key={s} type="button" onClick={() => setEditingImage({ ...editingImage, caption: s })} className="px-3 py-1.5 text-sm bg-neutral-100 hover:bg-primary-100 rounded-lg">{s}</button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 mt-6">
                  <button type="button" onClick={handleSaveEdit} className="btn-primary flex-1" disabled={!editingImage.caption?.trim()}>
                    <span className="material-icons-round mr-2">check</span>ยืนยัน
                  </button>
                  <button type="button" onClick={() => handleRemoveFile(files.findIndex(f => f.id === editingImage.id))} className="px-4 py-2 border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white rounded-lg">
                    <span className="material-icons-round">delete</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ⭐ Render Normal mode (เดิม)
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

        <p className="text-neutral-700 font-medium mb-2">
          {isDragging ? 'วางไฟล์ที่นี่' : 'ลากและวางไฟล์ หรือคลิกเพื่อเลือกไฟล์'}
        </p>
        <p className="text-sm text-neutral-500">
          รองรับไฟล์ขนาดไม่เกิน {maxSize}MB
          {accept !== '*' && ` (${accept})`}
        </p>
      </div>

      {error && (
        <p className="mt-2 text-sm text-error animate-slide-down">
          {error}
        </p>
      )}

      {/* File List (Normal Mode) */}
      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          {files.map((fileItem, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors duration-300 animate-slide-in-right"
            >
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

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-700 truncate">
                  {fileItem.file.name}
                </p>
                <p className="text-xs text-neutral-500">
                  {formatFileSize(fileItem.file.size)}
                </p>
              </div>

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
  withDetails: PropTypes.bool,
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