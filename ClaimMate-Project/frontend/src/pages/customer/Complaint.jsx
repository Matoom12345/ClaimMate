import React, { useState } from 'react';
import { Input, TextArea, Select, FileUpload, Modal } from '../../components';

/**
 * Complaint - หน้าแจ้งร้องเรียน
 * 
 * Features:
 * 1. ฟอร์มแจ้งร้องเรียน
 * 2. เลือกประเภทปัญหา
 * 3. อัปโหลดหลักฐาน
 * 4. ติดตามสถานะร้องเรียน
 * 
 * TODO: Backend Integration
 * - GET /api/customer/claims?status=active - ดึงเคลมที่กำลังดำเนินการ
 * - POST /api/customer/complaints - ส่งร้องเรียน
 * - GET /api/customer/complaints - ดูประวัติร้องเรียน
 */
const Complaint = () => {
  const [activeTab, setActiveTab] = useState('new'); // 'new' หรือ 'history'
  const [formData, setFormData] = useState({
    claimId: '',
    category: '',
    subject: '',
    description: '',
    files: [],
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // TODO: Backend - ดึงรายการเคลม
  const activeClaims = [
    { value: '1', label: 'CLM-2024-001 - ชนด้านหน้า', icon: 'description' },
    { value: '2', label: 'CLM-2024-002 - ชนด้านหลัง', icon: 'description' },
  ];

  const categories = [
    { value: 'service', label: 'การบริการ', icon: 'support_agent' },
    { value: 'garage', label: 'อู่ซ่อม', icon: 'build' },
    { value: 'cost', label: 'ค่าใช้จ่าย', icon: 'payments' },
    { value: 'delay', label: 'ความล่าช้า', icon: 'schedule' },
    { value: 'quality', label: 'คุณภาพงาน', icon: 'verified' },
    { value: 'other', label: 'อื่นๆ', icon: 'more_horiz' },
  ];

  // TODO: Backend - ดึงประวัติร้องเรียน
  const complaintHistory = [
    {
      id: '1',
      complaintNumber: 'COMP-2024-001',
      claimNumber: 'CLM-2024-001',
      category: 'delay',
      subject: 'การซ่อมล่าช้ากว่ากำหนด',
      status: 'resolved',
      createdAt: '2024-10-20',
      resolvedAt: '2024-10-22',
    },
  ];

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    
    if (files) {
      setFormData(prev => ({ ...prev, files: files }));
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
    if (!formData.category) {
      newErrors.category = 'กรุณาเลือกประเภทปัญหา';
    }
    if (!formData.subject || formData.subject.trim().length < 10) {
      newErrors.subject = 'กรุณาระบุหัวข้ออย่างน้อย 10 ตัวอักษร';
    }
    if (!formData.description || formData.description.trim().length < 20) {
      newErrors.description = 'กรุณาระบุรายละเอียดอย่างน้อย 20 ตัวอักษร';
    }
    
    return newErrors;
  };

  // TODO: Backend - ส่งร้องเรียน
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setSubmitting(true);
    
    setTimeout(() => {
      console.log('Submit complaint:', formData);
      setSubmitting(false);
      setShowSuccessModal(true);
      
      // Reset form
      setFormData({
        claimId: '',
        category: '',
        subject: '',
        description: '',
        files: [],
      });
    }, 1500);
  };

  const getCategoryLabel = (value) => {
    const cat = categories.find(c => c.value === value);
    return cat ? cat.label : value;
  };

  const getStatusBadge = (status) => {
    const config = {
      pending: { variant: 'warning', text: 'รอตรวจสอบ' },
      in_progress: { variant: 'primary', text: 'กำลังดำเนินการ' },
      resolved: { variant: 'success', text: 'แก้ไขแล้ว' },
      rejected: { variant: 'error', text: 'ปฏิเสธ' },
    };
    
    const { variant, text } = config[status] || config.pending;
    
    return (
      <span className={`badge badge-${variant}`}>
        {text}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-neutral-dark mb-2">
          แจ้งร้องเรียน
        </h1>
        <p className="text-neutral-500">
          แจ้งปัญหาหรือข้อร้องเรียนเกี่ยวกับการเคลมของคุณ
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-neutral-200">
        <div className="flex gap-8">
          <button
            onClick={() => setActiveTab('new')}
            className={`
              relative pb-4 font-medium transition-colors duration-300
              ${activeTab === 'new'
                ? 'text-primary-600'
                : 'text-neutral-500 hover:text-neutral-700'
              }
            `}
          >
            แจ้งร้องเรียนใหม่
            {activeTab === 'new' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`
              relative pb-4 font-medium transition-colors duration-300
              ${activeTab === 'history'
                ? 'text-primary-600'
                : 'text-neutral-500 hover:text-neutral-700'
              }
            `}
          >
            ประวัติการร้องเรียน
            {activeTab === 'history' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500"></div>
            )}
          </button>
        </div>
      </div>

      {/* New Complaint Form */}
      {activeTab === 'new' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="card space-y-6">
              {/* Select Claim */}
              <Select
                label="เลือกการเคลมที่เกี่ยวข้อง"
                name="claimId"
                value={formData.claimId}
                onChange={handleChange}
                options={activeClaims}
                icon="description"
                required
                error={errors.claimId}
                placeholder="เลือกการเคลม"
              />

              {/* Category */}
              <div>
                <label className="block mb-3 text-sm font-medium text-neutral-700">
                  ประเภทปัญหา <span className="text-error">*</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {categories.map(cat => (
                    <label
                      key={cat.value}
                      className={`
                        relative flex flex-col items-center gap-2 p-4 border-2 rounded-xl cursor-pointer transition-all duration-300
                        ${formData.category === cat.value
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-neutral-200 hover:border-primary-300'
                        }
                      `}
                    >
                      <input
                        type="radio"
                        name="category"
                        value={cat.value}
                        checked={formData.category === cat.value}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <span className={`
                        material-icons-round text-3xl
                        ${formData.category === cat.value
                          ? 'text-primary-600'
                          : 'text-neutral-400'
                        }
                      `}>
                        {cat.icon}
                      </span>
                      <span className={`
                        text-sm font-medium text-center
                        ${formData.category === cat.value
                          ? 'text-primary-700'
                          : 'text-neutral-700'
                        }
                      `}>
                        {cat.label}
                      </span>
                      {formData.category === cat.value && (
                        <span className="absolute top-2 right-2 material-icons-round text-primary-500 text-xl">
                          check_circle
                        </span>
                      )}
                    </label>
                  ))}
                </div>
                {errors.category && (
                  <p className="mt-2 text-sm text-error">{errors.category}</p>
                )}
              </div>

              {/* Subject */}
              <Input
                label="หัวข้อร้องเรียน"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="ระบุหัวข้อสั้นๆ เช่น การซ่อมล่าช้า, คุณภาพงานไม่ดี..."
                icon="title"
                required
                error={errors.subject}
              />

              {/* Description */}
              <TextArea
                label="รายละเอียด"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="อธิบายปัญหาหรือข้อร้องเรียนของคุณให้ละเอียด..."
                rows={6}
                required
                error={errors.description}
                helperText="กรุณาอธิบายให้ชัดเจนเพื่อให้เราสามารถช่วยเหลือคุณได้ดีที่สุด"
              />

              {/* File Upload */}
              <FileUpload
                label="แนบหลักฐาน (รูปภาพ, เอกสาร)"
                name="files"
                files={formData.files}
                onChange={handleChange}
                accept="image/*,.pdf"
                multiple
                maxSize={5}
              />

              {/* Submit */}
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
                      ส่งร้องเรียน
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="card bg-gradient-primary text-white">
              <span className="material-icons-round text-4xl mb-3">support_agent</span>
              <h3 className="font-semibold mb-2">เราพร้อมช่วยเหลือ</h3>
              <p className="text-sm text-white/80 mb-4">
                ทีมงานของเราจะตรวจสอบและดำเนินการแก้ไขปัญหาของคุณโดยเร็วที่สุด
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="material-icons-round text-sm">schedule</span>
                  <span>ตอบภายใน 24-48 ชั่วโมง</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-icons-round text-sm">verified_user</span>
                  <span>ข้อมูลเป็นความลับ</span>
                </div>
              </div>
            </div>

            <div className="card">
              <h3 className="font-semibold text-neutral-dark mb-3">
                ติดต่อด่วน
              </h3>
              <div className="space-y-3">
                <a
                  href="tel:02-123-4567"
                  className="flex items-center gap-3 p-3 hover:bg-neutral-50 rounded-lg transition-colors duration-200"
                >
                  <span className="material-icons-round text-primary-500">phone</span>
                  <div className="text-sm">
                    <p className="font-medium text-neutral-dark">02-123-4567</p>
                    <p className="text-xs text-neutral-500">จันทร์-ศุกร์ 8:00-18:00</p>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Complaint History */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          {complaintHistory.length === 0 ? (
            <div className="card text-center py-16">
              <span className="material-icons-round text-6xl text-neutral-300 mb-4">
                inbox
              </span>
              <p className="text-neutral-500 text-lg">
                ยังไม่มีประวัติการร้องเรียน
              </p>
            </div>
          ) : (
            complaintHistory.map(complaint => (
              <div key={complaint.id} className="card hover:shadow-card-hover transition-all duration-300">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-lg font-semibold text-neutral-dark">
                        {complaint.subject}
                      </h3>
                      {getStatusBadge(complaint.status)}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-neutral-500 mb-1">เลขที่ร้องเรียน</p>
                        <p className="font-medium text-neutral-dark">{complaint.complaintNumber}</p>
                      </div>
                      <div>
                        <p className="text-neutral-500 mb-1">การเคลมที่เกี่ยวข้อง</p>
                        <p className="font-medium text-neutral-dark">{complaint.claimNumber}</p>
                      </div>
                      <div>
                        <p className="text-neutral-500 mb-1">ประเภท</p>
                        <p className="font-medium text-neutral-dark">{getCategoryLabel(complaint.category)}</p>
                      </div>
                      <div>
                        <p className="text-neutral-500 mb-1">วันที่แจ้ง</p>
                        <p className="font-medium text-neutral-dark">{complaint.createdAt}</p>
                      </div>
                    </div>

                    {complaint.resolvedAt && (
                      <div className="mt-3 p-3 bg-green-50 rounded-lg flex items-center gap-2 text-sm">
                        <span className="material-icons-round text-success">check_circle</span>
                        <span className="text-neutral-700">
                          แก้ไขเรียบร้อยเมื่อ {complaint.resolvedAt}
                        </span>
                      </div>
                    )}
                  </div>

                  <button className="btn-ghost flex items-center gap-1">
                    <span>ดูรายละเอียด</span>
                    <span className="material-icons-round text-sm">arrow_forward</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Success Modal */}
      <Modal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="ส่งร้องเรียนเรียบร้อย"
        size="md"
        footer={
          <button
            onClick={() => setShowSuccessModal(false)}
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
            ส่งร้องเรียนสำเร็จ
          </p>
          <p className="text-neutral-600 mb-4">
            เราได้รับเรื่องร้องเรียนของคุณแล้ว ทีมงานจะตรวจสอบและติดต่อกลับภายใน 24-48 ชั่วโมง
          </p>
          <div className="p-4 bg-blue-50 rounded-lg text-left">
            <p className="text-sm text-neutral-700">
              <span className="material-icons-round text-sm mr-1 align-middle text-info">info</span>
              คุณสามารถติดตามสถานะได้ที่แท็บ "ประวัติการร้องเรียน"
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Complaint;