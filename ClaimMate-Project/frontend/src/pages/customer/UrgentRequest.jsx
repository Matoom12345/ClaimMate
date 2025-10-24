import React, { useState } from 'react';
import { Input, TextArea, FileUpload, Modal } from '../../components';

/**
 * UrgentRequest - หน้าขออนุมัติซ่อมด่วน
 * 
 * Features:
 * 1. ฟอร์มขออนุมัติซ่อมด่วน
 * 2. อัปโหลดเอกสาร/รูปภาพประกอบ
 * 3. เลือกเหตุผลความเร่งด่วน
 * 
 * TODO: Backend Integration
 * - GET /api/customer/claims?status=active - ดึงเคลมที่กำลังดำเนินการ
 * - POST /api/customer/claims/{id}/urgent-request - ส่งคำขออนุมัติด่วน
 */
const UrgentRequest = () => {
  const [formData, setFormData] = useState({
    claimId: '',
    reason: '',
    description: '',
    files: [],
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // TODO: Backend - ดึงรายการเคลมที่กำลังดำเนินการ
  const activeClaims = [
    { id: '1', claimNumber: 'CLM-2024-001', title: 'ชนด้านหน้า - เขตห้วยขวาง' },
    { id: '2', claimNumber: 'CLM-2024-002', title: 'ชนด้านหลัง - เขตบางกะปิ' },
  ];

  const urgentReasons = [
    { value: 'work', label: 'ใช้รถเพื่อการทำงาน', icon: 'work' },
    { value: 'medical', label: 'เหตุฉุกเฉินทางการแพทย์', icon: 'local_hospital' },
    { value: 'travel', label: 'มีการเดินทางที่สำคัญ', icon: 'flight' },
    { value: 'daily', label: 'จำเป็นต่อการใช้ชีวิตประจำวัน', icon: 'home' },
    { value: 'other', label: 'อื่นๆ (โปรดระบุ)', icon: 'more_horiz' },
  ];

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    
    if (files) {
      setFormData(prev => ({ ...prev, files: files }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.claimId) {
      newErrors.claimId = 'กรุณาเลือกการเคลม';
    }
    if (!formData.reason) {
      newErrors.reason = 'กรุณาเลือกเหตุผล';
    }
    if (!formData.description || formData.description.trim().length < 20) {
      newErrors.description = 'กรุณาระบุรายละเอียดอย่างน้อย 20 ตัวอักษร';
    }
    
    return newErrors;
  };

  // TODO: Backend - ส่งคำขออนุมัติด่วน
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setSubmitting(true);
    
    // TODO: Backend - POST /api/customer/claims/{id}/urgent-request
    setTimeout(() => {
      console.log('Submit urgent request:', formData);
      setSubmitting(false);
      setShowSuccessModal(true);
      
      // Reset form
      setFormData({
        claimId: '',
        reason: '',
        description: '',
        files: [],
      });
    }, 1500);
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    // navigate('/customer/dashboard');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-neutral-dark mb-2">
          ขออนุมัติซ่อมด่วน
        </h1>
        <p className="text-neutral-500">
          สำหรับกรณีที่ต้องการให้เร่งการซ่อมเป็นพิเศษ
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="card space-y-6">
            {/* Alert */}
            <div className="p-4 bg-warning/10 border-l-4 border-warning rounded-lg">
              <div className="flex gap-3">
                <span className="material-icons-round text-warning">info</span>
                <div className="flex-1">
                  <p className="font-semibold text-neutral-dark mb-1">
                    ข้อมูลสำคัญ
                  </p>
                  <p className="text-sm text-neutral-600">
                    การขออนุมัติซ่อมด่วนจะถูกส่งไปยังบริษัทประกันเพื่อพิจารณา 
                    ซึ่งอาจมีค่าใช้จ่ายเพิ่มเติม กรุณาระบุเหตุผลที่ชัดเจน
                  </p>
                </div>
              </div>
            </div>

            {/* Select Claim */}
            <div>
              <label className="block mb-2 text-sm font-medium text-neutral-700">
                เลือกการเคลม <span className="text-error">*</span>
              </label>
              <select
                name="claimId"
                value={formData.claimId}
                onChange={handleChange}
                className={`input-field ${errors.claimId ? '!border-error' : ''}`}
              >
                <option value="">-- เลือกการเคลม --</option>
                {activeClaims.map(claim => (
                  <option key={claim.id} value={claim.id}>
                    {claim.claimNumber} - {claim.title}
                  </option>
                ))}
              </select>
              {errors.claimId && (
                <p className="mt-2 text-sm text-error">{errors.claimId}</p>
              )}
            </div>

            {/* Select Reason */}
            <div>
              <label className="block mb-3 text-sm font-medium text-neutral-700">
                เหตุผลที่ต้องการเร่งด่วน <span className="text-error">*</span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {urgentReasons.map(reason => (
                  <label
                    key={reason.value}
                    className={`
                      relative flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all duration-300
                      ${formData.reason === reason.value
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-neutral-200 hover:border-primary-300 hover:bg-neutral-50'
                      }
                      ${errors.reason ? 'border-error' : ''}
                    `}
                  >
                    <input
                      type="radio"
                      name="reason"
                      value={reason.value}
                      checked={formData.reason === reason.value}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div className={`
                      w-10 h-10 rounded-lg flex items-center justify-center
                      ${formData.reason === reason.value
                        ? 'bg-primary-500 text-white'
                        : 'bg-neutral-100 text-neutral-400'
                      }
                    `}>
                      <span className="material-icons-round">{reason.icon}</span>
                    </div>
                    <span className={`
                      flex-1 font-medium text-sm
                      ${formData.reason === reason.value
                        ? 'text-primary-700'
                        : 'text-neutral-700'
                      }
                    `}>
                      {reason.label}
                    </span>
                    {formData.reason === reason.value && (
                      <span className="material-icons-round text-primary-500">
                        check_circle
                      </span>
                    )}
                  </label>
                ))}
              </div>
              {errors.reason && (
                <p className="mt-2 text-sm text-error">{errors.reason}</p>
              )}
            </div>

            {/* Description */}
            <TextArea
              label="รายละเอียดเพิ่มเติม"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="กรุณาอธิบายเหตุผลที่ต้องการเร่งด่วนให้ละเอียด..."
              rows={6}
              required
              error={errors.description}
              helperText={`${formData.description.length}/20 ตัวอักษร (ขั้นต่ำ)`}
            />

            {/* File Upload */}
            <FileUpload
              label="เอกสาร/รูปภาพประกอบ (ถ้ามี)"
              name="files"
              files={formData.files}
              onChange={handleChange}
              accept="image/*,.pdf"
              multiple
              maxSize={5}
            />

            {/* Submit Button */}
            <div className="flex gap-3 pt-6 border-t border-neutral-200">
              <button
                type="button"
                onClick={() => window.history.back()}
                className="btn-outline flex-1"
                disabled={submitting}
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="btn-primary flex-1"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <span className="material-icons-round animate-spin mr-2">refresh</span>
                    กำลังส่ง...
                  </>
                ) : (
                  <>
                    <span className="material-icons-round mr-2">send</span>
                    ส่งคำขอ
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Sidebar - Info */}
        <div className="space-y-6">
          {/* Process Info */}
          <div className="card">
            <h3 className="font-semibold text-neutral-dark mb-4 flex items-center gap-2">
              <span className="material-icons-round text-primary-500">info</span>
              ขั้นตอนการพิจารณา
            </h3>
            
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-semibold text-sm flex-shrink-0">
                  1
                </div>
                <div>
                  <p className="font-medium text-neutral-dark text-sm mb-1">
                    ส่งคำขอ
                  </p>
                  <p className="text-xs text-neutral-500">
                    กรอกแบบฟอร์มและส่งคำขอ
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-semibold text-sm flex-shrink-0">
                  2
                </div>
                <div>
                  <p className="font-medium text-neutral-dark text-sm mb-1">
                    รอการพิจารณา
                  </p>
                  <p className="text-xs text-neutral-500">
                    ประมาณ 2-4 ชั่วโมงทำการ
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-semibold text-sm flex-shrink-0">
                  3
                </div>
                <div>
                  <p className="font-medium text-neutral-dark text-sm mb-1">
                    รับแจ้งผล
                  </p>
                  <p className="text-xs text-neutral-500">
                    ผ่านการแจ้งเตือนและอีเมล
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="card bg-gradient-secondary text-white">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <span className="material-icons-round">lightbulb</span>
              เคล็ดลับ
            </h3>
            
            <ul className="space-y-2 text-sm text-white/90">
              <li className="flex items-start gap-2">
                <span className="material-icons-round text-sm mt-0.5">check</span>
                <span>ระบุเหตุผลให้ชัดเจนและตรงไปตรงมา</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="material-icons-round text-sm mt-0.5">check</span>
                <span>แนบเอกสารประกอบ (ถ้ามี)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="material-icons-round text-sm mt-0.5">check</span>
                <span>ติดต่อได้ตลอดเวลาทำการ</span>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="card">
            <h3 className="font-semibold text-neutral-dark mb-3">
              ติดต่อสอบถาม
            </h3>
            <div className="space-y-3 text-sm">
              <a
                href="tel:02-123-4567"
                className="flex items-center gap-3 p-3 hover:bg-neutral-50 rounded-lg transition-colors duration-200"
              >
                <span className="material-icons-round text-primary-500">phone</span>
                <div>
                  <p className="font-medium text-neutral-dark">02-123-4567</p>
                  <p className="text-xs text-neutral-500">จันทร์-ศุกร์ 8:00-18:00</p>
                </div>
              </a>
              <a
                href="mailto:support@claimmate.com"
                className="flex items-center gap-3 p-3 hover:bg-neutral-50 rounded-lg transition-colors duration-200"
              >
                <span className="material-icons-round text-primary-500">email</span>
                <div>
                  <p className="font-medium text-neutral-dark">support@claimmate.com</p>
                  <p className="text-xs text-neutral-500">ตอบภายใน 24 ชม.</p>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <Modal
        isOpen={showSuccessModal}
        onClose={handleCloseSuccessModal}
        title="ส่งคำขอเรียบร้อย"
        size="md"
        footer={
          <button
            onClick={handleCloseSuccessModal}
            className="btn-primary w-full"
          >
            เข้าใจแล้ว
          </button>
        }
      >
        <div className="text-center py-4">
          <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-icons-round text-4xl text-success">
              check_circle
            </span>
          </div>
          <p className="text-lg font-semibold text-neutral-dark mb-2">
            ส่งคำขออนุมัติซ่อมด่วนสำเร็จ
          </p>
          <p className="text-neutral-600 mb-4">
            ทางบริษัทจะพิจารณาคำขอของคุณภายใน 2-4 ชั่วโมงทำการ 
            และจะแจ้งผลผ่านการแจ้งเตือนและอีเมล
          </p>
          <div className="p-4 bg-blue-50 rounded-lg text-left">
            <p className="text-sm text-neutral-700">
              <span className="material-icons-round text-sm mr-1 align-middle text-info">info</span>
              คุณสามารถตรวจสอบสถานะคำขอได้ที่หน้ารายละเอียดการเคลม
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default UrgentRequest;