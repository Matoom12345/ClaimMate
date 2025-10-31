import React, { useState, useEffect } from 'react';
import { Input, TextArea, FileUpload, Modal } from '../../components';
// ⭐️ (แก้ไข) Import axios
import axios from 'axios';
// ⭐️ (ลบ) ลบ import ที่ไม่ได้ใช้ออก
// import { api } from '../../services/api';
// import { useAuth } from '../../context/AuthContext';


/**
 * UrgentRequest - หน้าขออนุมัติซ่อมด่วน
 * * Features:
 * 1. ฟอร์มขออนุมัติซ่อมด่วน
 * 2. อัปโหลดเอกสาร/รูปภาพประกอบ
 * 3. เลือกเหตุผลความเร่งด่วน
 * * TODO: Backend Integration
 * - GET /api/claims/customer/:customerID/repair-claims - (เรียบร้อย)
 * - POST /api/urgent-request/ - (เรียบร้อย)
 */
const UrgentRequest = () => {
  // ⭐️ (แก้ไข) ดึง customerID จาก localStorage (จะถูกใช้ใน useEffect)
  const [customerID, setCustomerID] = useState(null);

  const [formData, setFormData] = useState({
    claimId: '',
    reason: '',
    description: '',
    file: null,
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [repairClaims, setRepairClaims] = useState([]);

  // ⭐️ (แก้ไข) ดึง customerID จาก localStorage เมื่อ component โหลด
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("claimmate_user"));
    if (user && user.customerID) {
      setCustomerID(user.customerID);
    }
  }, []);

  // ✅ (แก้ไข) ดึงข้อมูลเคลม (state: "repair") เมื่อเปิดหน้า
  useEffect(() => {
    const fetchRepairClaims = async () => {
      // ⭐️ (แก้ไข) ถ้ายังไม่มี customerID ไม่ต้องทำอะไร
      if (!customerID) return;

      try {
        // ⭐️ (แก้ไข) เรียก API
        const response = await axios.get(
            `http://localhost:3000/api/claims/customer/${customerID}/repair-claims`
        );

        if (response.data.success) {
          setRepairClaims(response.data.claims);
        }

        // ⭐️ (ลบ) Mockup
        // console.log("Fetching repair claims for customer:", customerID);
        // ... (Mockup code deleted) ...

      } catch (error) {
        console.error("Error fetching repair claims:", error);
        setErrors(prev => ({ ...prev, form: "ไม่สามารถดึงข้อมูลเคลมได้" }));
      }
    };

    fetchRepairClaims();
  }, [customerID]); // ⭐️ (แก้ไข) ทำงานเมื่อ customerID (จาก localStorage) เปลี่ยน


  const urgentReasons = [
    { value: 'ใช้รถเพื่อการทำงาน', label: 'ใช้รถเพื่อการทำงาน', icon: 'work' },
    { value: 'เหตุฉุกเฉินทางการแพทย์', label: 'เหตุฉุกเฉินทางการแพทย์', icon: 'local_hospital' },
    { value: 'มีการเดินทางที่สำคัญ', label: 'มีการเดินทางที่สำคัญ', icon: 'flight' },
    { value: 'จำเป็นต่อการใช้ชีวิตประจำวัน', label: 'จำเป็นต่อการใช้ชีวิตประจำวัน', icon: 'home' },
    { value: 'อื่นๆ', label: 'อื่นๆ (โปรดระบุ)', icon: 'more_horiz' },
  ];

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (files) {
      const selectedFile = files[0] || null;
      setFormData(prev => ({ ...prev, file: selectedFile }));
      if (errors.file) {
        setErrors(prev => ({ ...prev, file: '' }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

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
    if (!formData.file) {
      newErrors.file = 'กรุณาแนบไฟล์ประกอบ';
    }

    return newErrors;
  };

  // ✅ (แก้ไข) ฟังก์ชันส่งข้อมูล
  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);

    const data = new FormData();
    data.append("claimNumber", formData.claimId);
    data.append("type", formData.reason);
    data.append("detail", formData.description);
    data.append("file", formData.file.file);

    try {
      // ⭐️ (แก้ไข) เรียก API
      const response = await axios.post(
          "http://localhost:3000/api/urgent-request/",
          data,
          {
            headers: { 'Content-Type': 'multipart/form-data' }
          }
      );

      // ⭐️ (แก้ไข) ตรวจสอบ response
      if (response.data.success) {
        setSubmitting(false);
        setShowSuccessModal(true);

        // Reset form
        setFormData({
          claimId: '',
          reason: '',
          description: '',
          file: null,
        });
        setErrors({});
      } else {
        throw new Error(response.data.message || "เกิดข้อผิดพลาด");
      }

      // ⭐️ (ลบ) Mockup
      // console.log('Submitting urgent request with FormData:');
      // ... (Mockup code deleted) ...

    } catch (error) {
      console.error('Submit urgent request error:', error);
      setSubmitting(false);

      // ✅ (คงเดิม) Handle specific unique error
      if (error.response && error.response.data && error.response.data.code === 11000) {
        setErrors(prev => ({
          ...prev,
          claimId: "คุณได้ส่งคำขอสำหรับใบเคลมนี้ไปแล้ว"
        }));
      } else {
        setErrors(prev => ({
          ...prev,
          form: error.message || "เกิดข้อผิดพลาดในการส่งข้อมูล"
        }));
      }
    }
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
                    // ⭐️ (เพิ่ม) ปิดการใช้งานถ้าไม่มีเคลม
                    disabled={repairClaims.length === 0}
                >
                  {/* ⭐️ (เพิ่ม) เปลี่ยนข้อความตามสถานะการโหลด */}
                  <option value="">
                    {repairClaims.length > 0
                        ? '-- เลือกการเคลม --'
                        : (customerID ? 'ไม่พบเคลมที่กำลังซ่อม' : 'กำลังโหลดข้อมูล...')}
                  </option>

                  {/* ✅ (คงเดิม) Map ข้อมูลเคลมที่ดึงมา */}
                  {repairClaims.map(claim => (
                      <option key={claim.claimNumber} value={claim.claimNumber}>
                        {claim.display}
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
                  name="file"
                  files={formData.file ? [formData.file] : []}
                  onChange={handleChange}
                  accept="image/*,.pdf"
                  multiple={false}
                  maxSize={5}
                  error={errors.file}
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