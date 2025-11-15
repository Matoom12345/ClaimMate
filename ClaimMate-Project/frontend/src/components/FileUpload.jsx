import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';

/**
 * FileUpload Component - อัปโหลดไฟล์พร้อม drag & drop
 *
 * @param {boolean} withDetails - เปิดโหมดอัปโหลดพร้อมรายละเอียด (caption + type)
 * @param {string|number} claimId - (⭐ NEW) ID ของเคสเคลม (จำเป็นสำหรับ withDetails)
 * @param {boolean} isReadOnly - (⭐ NEW) ปิดการแก้ไขและอัปโหลดทั้งหมด
 * ... (props อื่นๆ) ...
 */
const FileUpload = ({
                      withDetails = false,
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
                      onUpdateFiles = null,
                      claimId = null,
                      isReadOnly = false, // ⭐️ 1. เพิ่ม Prop isReadOnly
                    }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [editingImage, setEditingImage] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const fileInputRef = useRef(null);

  // (Format file size ... เหมือนเดิม)
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  // (Validate file ... เหมือนเดิม)
  const validateFile = (file) => {
    const maxSizeBytes = maxSize * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return `ไฟล์ ${file.name} มีขนาดใหญ่เกิน ${maxSize}MB`;
    }
    return null;
  };

  // (updateFilesState ... เหมือนเดิม)
  const updateFilesState = (newFiles, errorMsg = '') => {
    if (onUpdateFiles) {
      onUpdateFiles(newFiles);
    } else {
      onChange({ target: { name, files: newFiles, error: errorMsg } });
    }
  };

  // (handleFileChange ... เหมือนเดิม)
  const handleFileChange = (selectedFiles) => {
    if (isReadOnly) return; // ⭐️ (ป้องกัน)
    const fileArray = Array.from(selectedFiles);
    let errorMessage = '';

    for (const file of fileArray) {
      const error = validateFile(file);
      if (error) {
        errorMessage = error;
        break;
      }
    }
    if (errorMessage) {
      updateFilesState(files, errorMessage);
      return;
    }
    const filesWithPreview = fileArray.map((file, index) => ({
      id: Date.now() + index,
      file,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
      type: withDetails ? 'damage' : undefined,
      caption: withDetails ? '' : undefined,
      existing: false,
      uploaded: false,
    }));
    const newFiles = [...files, ...filesWithPreview];
    updateFilesState(newFiles);
    if (withDetails && filesWithPreview.length > 0) {
      setEditingImage(filesWithPreview[0]);
      setShowEditModal(true);
    }
  };

  // (handleInputChange ... เหมือนเดิม)
  const handleInputChange = (e) => {
    if (isReadOnly) return; // ⭐️ (ป้องกัน)
    if (e.target.files.length > 0) {
      handleFileChange(e.target.files);
    }
  };

  // (Drag events ... เหมือนเดิม)
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !isReadOnly) setIsDragging(true); // ⭐️ (ป้องกัน)
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
    if (!disabled && !isReadOnly && e.dataTransfer.files.length > 0) { // ⭐️ (ป้องกัน)
      handleFileChange(e.dataTransfer.files);
    }
  };

  // (handleEditImage ... เหมือนเดิม)
  const handleEditImage = (image) => {
    if (isReadOnly) return; // ⭐️ (ป้องกัน)
    setEditingImage({ ...image });
    setShowEditModal(true);
  };

  // (handleSaveEdit ... เหมือนเดิม)
  const handleSaveEdit = async () => {
    if (isReadOnly) return; // ⭐️ (ป้องกัน)
    if (!editingImage.caption.trim()) {
      alert('กรุณาใส่ชื่อ/คำอธิบายรูปภาพ');
      return;
    }
    if (editingImage.file) {
      if (!claimId) {
        alert('FileUpload Error: ไม่ได้รับ claimId prop (จำเป็นสำหรับการอัปโหลด)');
        return;
      }
      setIsUploading(true);
      const formData = new FormData();
      formData.append('photo', editingImage.file);
      formData.append('caption', editingImage.caption);
      formData.append('type', editingImage.type);
      try {
        const response = await axios.post(
            `http://localhost:3000/api/claims/photos/upload/${claimId}`,
            formData,
            { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        const uploadedPhoto = response.data;
        const updatedFiles = files.map(f =>
            f.id === editingImage.id ? uploadedPhoto : f
        );
        updateFilesState(updatedFiles);
        const nextFile = updatedFiles.find(file =>
            file.id !== uploadedPhoto.id && file.file
        );
        if (nextFile) {
          setEditingImage({ ...nextFile });
        } else {
          setShowEditModal(false);
          setEditingImage(null);
        }
      } catch (err) {
        console.error('Upload failed:', err);
        alert('เกิดข้อผิดพลาดในการอัปโหลด: ' + (err.response?.data?.message || err.message));
      } finally {
        setIsUploading(false);
      }
    } else {
      const updatedFiles = files.map(file =>
          file.id === editingImage.id ? editingImage : file
      );
      updateFilesState(updatedFiles);
      const nextFile = updatedFiles.find(file =>
          file.id !== editingImage.id && (file.file && !file.caption?.trim())
      );
      if (nextFile) {
        setEditingImage({ ...nextFile });
      } else {
        setShowEditModal(false);
        setEditingImage(null);
      }
    }
  };

  // (handleRemoveFile ... เหมือนเดิม)
  const handleRemoveFile = async (index) => {
    if (isReadOnly) return; // ⭐️ (ป้องกัน)
    const fileToRemove = files[index];
    if (!fileToRemove) return;
    if (fileToRemove.file && !fileToRemove.existing) {
      const newFiles = files.filter((_, i) => i !== index);
      updateFilesState(newFiles);
      if (editingImage && editingImage.id === fileToRemove.id) {
        const nextFile = newFiles.find(file => file.file);
        if (nextFile) {
          setEditingImage(nextFile);
        } else {
          setShowEditModal(false);
          setEditingImage(null);
        }
      }
      return;
    }
    const photoId = fileToRemove.id || fileToRemove._id;
    if (photoId) {
      if (!window.confirm('คุณต้องการลบรูปภาพนี้ออกจากระบบใช่หรือไม่?')) {
        return;
      }
      setDeletingId(photoId);
      if (editingImage && editingImage.id === photoId) {
        setIsUploading(true);
      }
      try {
        await axios.delete(`http://localhost:3000/api/claims/photos/${photoId}`);
        const newFiles = files.filter((_, i) => i !== index);
        updateFilesState(newFiles);
        if (editingImage && editingImage.id === photoId) {
          setShowEditModal(false);
          setEditingImage(null);
        }
      } catch (err) {
        console.error('Failed to delete photo:', err);
        alert('เกิดข้อผิดพลาดในการลบรูปภาพ: ' + (err.response?.data?.message || err.message));
      } finally {
        setDeletingId(null);
        setIsUploading(false);
      }
    }
  };

  // (handleClick ... เหมือนเดิม)
  const handleClick = () => {
    if (!disabled && !isReadOnly) { // ⭐️ (ป้องกัน)
      fileInputRef.current?.click();
    }
  };

  // (getFileIcon ... เหมือนเดิม)
  const getFileIcon = (file) => {
    const type = file.file.type;
    if (type.startsWith('image/')) return 'image';
    if (type.includes('pdf')) return 'picture_as_pdf';
    if (type.includes('word')) return 'description';
    if (type.includes('excel') || type.includes('spreadsheet')) return 'table_chart';
    return 'insert_drive_file';
  };

  // ⭐ Render withDetails mode (Grid Preview)
  if (withDetails) {
    return (
        <div className={`w-full ${className}`}>
          {label && (
              <label className="block mb-2 text-sm font-medium text-neutral-700">
                {label}
              </label>
          )}

          {/* ⭐️ 2. (ซ่อน) โซนอัปโหลดทั้งหมดถ้า ReadOnly */}
          {!isReadOnly && (
              <>
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
                            e.stopPropagation();
                            handleClick();
                          }}
                          className="btn-primary"
                          disabled={disabled}
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
              </>
          )}
          {/* ⭐️ (จบ) ซ่อนโซนอัปโหลด */}


          {/* Grid Preview (แสดงเสมอ) */}
          {files.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-neutral-dark mb-4">
                  รูปภาพที่อัปโหลด ({files.length})
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {files.map((fileItem, index) => {
                    const isDeleting = deletingId === (fileItem.id || fileItem._id);
                    const imageUrl = fileItem.photoURL || fileItem.preview;

                    return (
                        <div
                            key={fileItem.id || fileItem._id}
                            // ⭐️ (แก้ไข) ถ้า ReadOnly ให้ปิด cursor-pointer
                            className={`
                              relative group aspect-video rounded-lg overflow-hidden border-2 border-neutral-200 
                              ${isReadOnly ? '' : 'cursor-pointer hover:border-primary-400'} 
                              transition-all duration-300
                            `}
                        >
                          <img
                              src={imageUrl}
                              alt={fileItem.caption || 'รูปภาพ'}
                              className={`
                                w-full h-full object-cover 
                                ${isReadOnly ? '' : 'transition-transform duration-300 group-hover:scale-110'} 
                                ${isDeleting ? 'opacity-20' : ''}
                              `}
                          />

                          {/* Type Badge (แสดงเสมอ) */}
                          <div className="absolute top-2 right-2">
                            <span className={`px-2 py-1 text-xs font-semibold rounded ${fileItem.type === 'damage' ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'}`}>
                              {fileItem.type === 'damage' ? 'ความเสียหาย' : 'เอกสาร'}
                            </span>
                          </div>

                          {/* Warning (แสดงเสมอ) */}
                          {(!fileItem.caption?.trim()) && (
                              <div className="absolute top-2 left-2">
                                <span className="px-2 py-1 text-xs font-semibold rounded bg-yellow-500 text-white animate-pulse">
                                  {fileItem.file ? 'รอใส่ชื่อ' : 'ต้องใส่ชื่อ'}
                                </span>
                              </div>
                          )}

                          {/* Loading overlay (แสดงเสมอ) */}
                          {isDeleting && (
                              <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
                                 <span className="material-icons-round text-4xl text-error animate-spin">
                                   sync
                                 </span>
                              </div>
                          )}

                          {/* ⭐️ 3. (ซ่อน) Hover Overlay ทั้งหมด ถ้า ReadOnly */}
                          {!isReadOnly && !isDeleting && (
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
                                      disabled={isUploading}
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
                                      disabled={isUploading}
                                  >
                                    <span className="material-icons-round text-xl">delete</span>
                                  </button>
                                </div>
                              </div>
                          )}
                          {/* ⭐️ (จบ) ซ่อน Hover Overlay */}

                        </div>
                    )
                  })}
                </div>
              </div>
          )}

          {/* Edit Modal (Modal นี้ยังทำงานเหมือนเดิม เพราะมันจะถูกป้องกันไม่ให้เปิดโดย isReadOnly อยู่แล้ว) */}
          {showEditModal && editingImage && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-neutral-dark">
                        {editingImage.file ? 'เพิ่มรายละเอียดรูปภาพ' : 'แก้ไขรายละเอียด'}
                      </h3>
                      <button
                          onClick={() => setShowEditModal(false)}
                          className="w-8 h-8 rounded-full hover:bg-neutral-100 flex items-center justify-center"
                          disabled={isUploading}
                      >
                        <span className="material-icons-round text-neutral-500">close</span>
                      </button>
                    </div>

                    <div className="mb-6">
                      <img src={editingImage.photoURL || editingImage.preview} alt="Preview" className="w-full rounded-lg" />
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
                              disabled={isUploading}
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
                              disabled={isUploading}
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
                            disabled={isUploading}
                        />
                      </div>

                      {editingImage.type === 'damage' && (
                          <div>
                            <p className="text-sm font-medium text-neutral-700 mb-2">ตัวอย่าง:</p>
                            <div className="flex flex-wrap gap-2">
                              {['ความเสียหายด้านหน้า', 'กันชนบุบ', 'ไฟหน้าแตก'].map((s) => (
                                  <button key={s} type="button" onClick={() => setEditingImage({ ...editingImage, caption: s })} className="px-3 py-1.5 text-sm bg-neutral-100 hover:bg-primary-100 rounded-lg" disabled={isUploading}>{s}</button>
                              ))}
                            </div>
                          </div>
                      )}
                      {editingImage.type === 'document' && (
                          <div>
                            <p className="text-sm font-medium text-neutral-700 mb-2">ตัวอย่าง:</p>
                            <div className="flex flex-wrap gap-2">
                              {['บัตรประชาชน', 'ใบขับขี่', 'ทะเบียนรถ'].map((s) => (
                                  <button key={s} type="button" onClick={() => setEditingImage({ ...editingImage, caption: s })} className="px-3 py-1.5 text-sm bg-neutral-100 hover:bg-primary-100 rounded-lg" disabled={isUploading}>{s}</button>
                              ))}
                            </div>
                          </div>
                      )}

                    </div>

                    <div className="flex gap-3 mt-6">
                      <button
                          type="button"
                          onClick={handleSaveEdit}
                          className="btn-primary flex-1"
                          disabled={!editingImage.caption?.trim() || isUploading}
                      >
                        {isUploading ? (
                            <span className="material-icons-round animate-spin">sync</span>
                        ) : (
                            <span className="material-icons-round mr-2">check</span>
                        )}
                        {isUploading ? 'กำลังบันทึก...' : 'ยืนยัน'}
                      </button>
                      <button
                          type="button"
                          onClick={() => handleRemoveFile(files.findIndex(f => (f.id || f._id) === (editingImage.id || editingImage._id)))}
                          className="px-4 py-2 border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white rounded-lg"
                          disabled={isUploading}
                      >
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

        {/* ⭐️ (ซ่อน) โซนอัปโหลดทั้งหมดถ้า ReadOnly */}
        {!isReadOnly && (
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
        )}

        {error && !isReadOnly && ( // ⭐️ (ซ่อน Error ถ้า ReadOnly)
            <p className="mt-2 text-sm text-error animate-slide-down">
              {error}
            </p>
        )}

        {/* File List (Normal Mode) - (แสดงเสมอ) */}
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

                    {/* ⭐️ (ซ่อนปุ่มลบ ถ้า ReadOnly) */}
                    {!isReadOnly && (
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
                    )}
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
  onChange: PropTypes.func,
  accept: PropTypes.string,
  multiple: PropTypes.bool,
  maxSize: PropTypes.number,
  files: PropTypes.array,
  error: PropTypes.string,
  disabled: PropTypes.bool,
  showPreview: PropTypes.bool,
  className: PropTypes.string,
  name: PropTypes.string,
  onRemove: PropTypes.func,
  onUpdateFiles: PropTypes.func,
  claimId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  isReadOnly: PropTypes.bool, // ⭐️ 4. เพิ่ม propType
};

FileUpload.defaultProps = {
  files: [],
  onChange: () => {},
  onUpdateFiles: null,
  claimId: null,
  isReadOnly: false, // ⭐️ 5. เพิ่ม default
};

export default FileUpload;