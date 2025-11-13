import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios'; // ⬅️ 1. IMPORT AXIOS

/**
 * FileUpload Component - อัปโหลดไฟล์พร้อม drag & drop
 *
 * @param {boolean} withDetails - เปิดโหมดอัปโหลดพร้อมรายละเอียด (caption + type)
 * @param {string} label - ป้ายชื่อ
 * @param {function} onChange - ฟังก์ชันเมื่อเลือกไฟล์ (ถ้าไม่มี onUpdateFiles)
 * @param {function} onUpdateFiles - (แนะนำ) ฟังก์ชันสำหรับอัปเดต State ใน Parent (เช่น setPhotos)
 * @param {function} onRemove - (เลิกใช้) prop นี้จะถูกแทนที่ด้วย onUpdateFiles
 * @param {string|number} claimId - (⭐ NEW) ID ของเคสเคลม (จำเป็นสำหรับ withDetails)
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
                      onRemove = null, // (จะถูก override โดย onUpdateFiles ถ้ามี)
                      onUpdateFiles = null, // <-- ✅ ควรใช้ตัวนี้
                      claimId = null, // ⬅️ 2. เพิ่ม Prop claimId
                    }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [editingImage, setEditingImage] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false); // ⬅️ 3. State สำหรับ Modal Upload
  const [deletingId, setDeletingId] = useState(null); // ⬅️ 3. State สำหรับ Grid Delete
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

  // (INTERNAL) ฟังก์ชันสำหรับอัปเดต State
  // (เพื่อให้ใช้ได้ทั้ง onUpdateFiles และ onChange)
  const updateFilesState = (newFiles, errorMsg = '') => {
    if (onUpdateFiles) {
      onUpdateFiles(newFiles);
    } else {
      // Fallback ถ้า Parent ไม่ได้ส่ง onUpdateFiles มา
      onChange({ target: { name, files: newFiles, error: errorMsg } });
    }
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
      updateFilesState(files, errorMessage); // ส่ง State เดิมกลับไปพร้อม Error
      return;
    }

    // Add preview URL for images
    const filesWithPreview = fileArray.map((file, index) => ({
      id: Date.now() + index, // ID ชั่วคราว
      file, // ⬅️ Object ไฟล์จริง (สำคัญ!)
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
      type: withDetails ? 'damage' : undefined,
      caption: withDetails ? '' : undefined,
      existing: false, // ⬅️ ระบุว่าเป็นไฟล์ใหม่
      uploaded: false,
    }));

    const newFiles = [...files, ...filesWithPreview]; // ⬅️ (แก้ไข) เพิ่มไฟล์ต่อจากของเดิม
    updateFilesState(newFiles);

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

  // ⭐ 4. (แก้ไข) Handle save edit (withDetails mode) - ทำให้เป็น Async
  const handleSaveEdit = async () => {
    if (!editingImage.caption.trim()) {
      alert('กรุณาใส่ชื่อ/คำอธิบายรูปภาพ');
      return;
    }

    // ⭐️ Case A: ไฟล์ใหม่ (มี File object) -> อัปโหลดทันที
    if (editingImage.file) {
      if (!claimId) {
        alert('FileUpload Error: ไม่ได้รับ claimId prop (จำเป็นสำหรับการอัปโหลด)');
        return;
      }

      setIsUploading(true);
      const formData = new FormData();
      formData.append('photo', editingImage.file); // 'photo' ต้องตรงกับ claimRoute.js
      formData.append('caption', editingImage.caption);
      formData.append('type', editingImage.type);

      try {
        // ⭐️ เรียก API อัปโหลด
        const response = await axios.post(
            `http://localhost:3000/api/claims/photos/upload/${claimId}`,
            formData,
            { headers: { 'Content-Type': 'multipart/form-data' } }
        );

        // ⭐️ response.data คือ object รูปภาพใหม่จาก DB (ตามที่ claimRoute.js ส่งกลับมา)
        const uploadedPhoto = response.data;

        // ⭐️ อัปเดตรายการไฟล์ โดยแทนที่ไฟล์ชั่วคราวด้วยไฟล์ถาวรจาก Server
        const updatedFiles = files.map(f =>
            f.id === editingImage.id ? uploadedPhoto : f
        );

        updateFilesState(updatedFiles); // ⭐️ ส่ง State ใหม่กลับไปให้ Parent

        // ⭐️ หาไฟล์ถัดไป (จากรายการที่อัปเดตแล้ว)
        const nextFile = updatedFiles.find(file =>
            file.id !== uploadedPhoto.id && file.file // ⭐️ หาไฟล์ใหม่ (ที่ยังมี file object)
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
      // ⭐️ Case B: ไฟล์เก่า (แค่แก้ caption/type) -> อัปเดต State ใน Frontend
      // (การบันทึกลง DB จริง จะเกิดขึ้นเมื่อกดยืนยันฟอร์มหลัก ผ่าน /api/claims/save/:id)

      const updatedFiles = files.map(file =>
          file.id === editingImage.id ? editingImage : file
      );

      updateFilesState(updatedFiles); // อัปเดต State ใน Parent

      // หา file ถัดไปที่ยังไม่มี caption (อาจจะเป็นไฟล์ใหม่)
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

  // ⭐ 5. (แก้ไข) Handle remove file - ทำให้เป็น Async
  const handleRemoveFile = async (index) => {
    const fileToRemove = files[index];
    if (!fileToRemove) return;

    // ⭐️ Case 1: ไฟล์ใหม่ (ยังไม่อัปโหลด, มี .file object)
    if (fileToRemove.file && !fileToRemove.existing) {
      const newFiles = files.filter((_, i) => i !== index);
      updateFilesState(newFiles);

      // ปิด modal ถ้ากำลังแก้ไขไฟล์นี้อยู่
      if (editingImage && editingImage.id === fileToRemove.id) {
        // หาไฟล์ใหม่ไฟล์ถัดไป (ถ้ามี)
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

    // ⭐️ Case 2: ไฟล์เก่า (อยู่บน Server, มี id หรือ _id)
    const photoId = fileToRemove.id || fileToRemove._id;
    if (photoId) {
      if (!window.confirm('คุณต้องการลบรูปภาพนี้ออกจากระบบใช่หรือไม่?')) {
        return;
      }

      setDeletingId(photoId); // ⬅️ แสดง Loading บน Grid
      if (editingImage && editingImage.id === photoId) {
        setIsUploading(true); // ⬅️ ใช้ State นี้เพื่อ disable Modal ด้วย
      }

      try {
        await axios.delete(`http://localhost:3000/api/claims/photos/${photoId}`);

        // ลบสำเร็จ
        const newFiles = files.filter((_, i) => i !== index);
        updateFilesState(newFiles);

        // ปิด modal ถ้ากำลังแก้ไขไฟล์นี้อยู่
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


  // Trigger file input click
  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  // Get file icon
  const getFileIcon = (file) => {
    // ... (โค้ดเดิม) ...
    const type = file.file.type;
    if (type.startsWith('image/')) return 'image';
    if (type.includes('pdf')) return 'picture_as_pdf';
    if (type.includes('word')) return 'description';
    if (type.includes('excel') || type.includes('spreadsheet')) return 'table_chart';
    return 'insert_drive_file';
  };

  // ⭐ Render withDetails mode (Grid Preview)
  if (withDetails) { // ⬅️ (แก้ไข) ให้แสดงโซนอัปโหลดเสมอ แม้ files.length === 0
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
                      e.stopPropagation();
                      handleClick();
                    }}
                    className="btn-primary"
                    disabled={disabled} // ⬅️ เพิ่ม disabled
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

          {/* Grid Preview (ต่อเมื่อมีไฟล์) */}
          {files.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-neutral-dark mb-4">
                  รูปภาพที่อัปโหลด ({files.length})
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {files.map((fileItem, index) => {
                    // ⬅️ 6. เพิ่ม Logic แสดง Loading ขณะลบ
                    const isDeleting = deletingId === (fileItem.id || fileItem._id);
                    // ⬅️ ใช้ photoURL ถ้ามี (จาก Server), ถ้าไม่มี ใช้ preview (Blob)
                    const imageUrl = fileItem.photoURL || fileItem.preview;

                    return (
                        <div
                            key={fileItem.id || fileItem._id} // ⬅️ ใช้ _id ถ้ามี
                            className="relative group aspect-video rounded-lg overflow-hidden cursor-pointer border-2 border-neutral-200 hover:border-primary-400 transition-all duration-300"
                        >
                          <img
                              src={imageUrl} // ⬅️ ใช้ URL ที่ถูกต้อง
                              alt={fileItem.caption || 'รูปภาพ'}
                              className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-110 ${isDeleting ? 'opacity-20' : ''}`}
                          />

                          {/* Type Badge */}
                          <div className="absolute top-2 right-2">
                      <span className={`px-2 py-1 text-xs font-semibold rounded ${fileItem.type === 'damage' ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'}`}>
                        {fileItem.type === 'damage' ? 'ความเสียหาย' : 'เอกสาร'}
                      </span>
                          </div>

                          {/* Warning (ถ้ายังไม่อัปโหลด หรือ อัปแล้วแต่ไม่มี caption) */}
                          {(!fileItem.caption?.trim()) && (
                              <div className="absolute top-2 left-2">
                        <span className="px-2 py-1 text-xs font-semibold rounded bg-yellow-500 text-white animate-pulse">
                          {fileItem.file ? 'รอใส่ชื่อ' : 'ต้องใส่ชื่อ'}
                        </span>
                              </div>
                          )}

                          {/* ⬅️ 6. Overlay ขณะลบ */}
                          {isDeleting && (
                              <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
                         <span className="material-icons-round text-4xl text-error animate-spin">
                           sync
                         </span>
                              </div>
                          )}

                          {/* Hover Overlay (ถ้าไม่กำลังลบ) */}
                          {!isDeleting && (
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
                                      disabled={isUploading} // ⬅️ ปิดขณะ Modal ทำงาน
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
                                      disabled={isUploading} // ⬅️ ปิดขณะ Modal ทำงาน
                                  >
                                    <span className="material-icons-round text-xl">delete</span>
                                  </button>
                                </div>
                              </div>
                          )}
                        </div>
                    )
                  })}
                </div>
              </div>
          )}

          {/* Edit Modal */}
          {showEditModal && editingImage && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                  {/* ⬅️ 7. ปรับ UI Modal ให้ Disabled ขณะ Uploading */}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-neutral-dark">
                        {editingImage.file ? 'เพิ่มรายละเอียดรูปภาพ' : 'แก้ไขรายละเอียด'}
                      </h3>
                      <button
                          onClick={() => setShowEditModal(false)}
                          className="w-8 h-8 rounded-full hover:bg-neutral-100 flex items-center justify-center"
                          disabled={isUploading} // ⬅️ ปิดปุ่ม
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
                              disabled={isUploading} // ⬅️ ปิดปุ่ม
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
                              disabled={isUploading} // ⬅️ ปิดปุ่ม
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
                            disabled={isUploading} // ⬅️ ปิดช่องกรอก
                        />
                      </div>

                      {/* ... (ส่วนปุ่มตัวอย่าง caption (ปิดการใช้งานด้วย)) ... */}
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
                          disabled={!editingImage.caption?.trim() || isUploading} // ⬅️ ปิดปุ่ม
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
                          // ⬅️ (แก้ไข) เรียก handleRemoveFile ด้วย index
                          onClick={() => handleRemoveFile(files.findIndex(f => (f.id || f._id) === (editingImage.id || editingImage._id)))}
                          className="px-4 py-2 border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white rounded-lg"
                          disabled={isUploading} // ⬅️ ปิดปุ่ม
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
                      key={index} // ⬅️ (โหมด Normal ใช้ index ได้)
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
                          // ⬅️ (แก้ไข) เรียก handleRemoveFile ที่เราแก้แล้ว
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
  onChange: PropTypes.func, // ⬅️ ไม่จำเป็นต้อง isRequired ถ้ามี onUpdateFiles
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
  onUpdateFiles: PropTypes.func, // ⬅️ 8. เพิ่ม propType
  claimId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]), // ⬅️ 8. เพิ่ม propType
};

// ⬅️ (แก้ไข) เพิ่ม defaultProps
FileUpload.defaultProps = {
  files: [],
  onChange: () => {}, // ใส่ dummy function
  onUpdateFiles: null,
  claimId: null,
};

export default FileUpload;