import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Input, TextArea, FileUpload, Select } from '../../components';

/**
 * ClaimDetail - หน้ารายละเอียดเคสและอัปโหลดรายงาน (Insurance)
 * 
 * จุดประสงค์หลัก:
 * - พนักงานลงพื้นที่อัปโหลดรูปภาพจากหลายมุม (พร้อมชื่อและประเภท)
 * - กรอกรายละเอียดความเสียหาย
 * - เลือกรายการซ่อมจาก dropdown
 * - Auto-save บันทึกแบบร่างอัตโนมัติ
 * - บันทึกและส่งออก เมื่อข้อมูลครบถ้วน
 * 
 * TODO: Backend Integration
 * - GET /api/insurance/claims/{id} - ดึงข้อมูลเคส
 * - POST /api/insurance/claims/{id}/draft - บันทึกแบบร่าง (auto-save)
 * - POST /api/insurance/claims/{id}/submit - บันทึกและส่งออก
 * - POST /api/insurance/claims/{id}/images - อัปโหลดรูปภาพ
 * - GET /api/insurance/claims/{id}/pdf - Export PDF
 */

// รายการซ่อมที่เป็นไปได้ (ครอบคลุม)
const REPAIR_ITEMS_OPTIONS = [
  { value: 'bumper_front', label: 'เปลี่ยนกันชนหน้า', category: 'ด้านหน้า' },
  { value: 'bumper_rear', label: 'เปลี่ยนกันชนหลัง', category: 'ด้านหลัง' },
  { value: 'hood', label: 'ซ่อม/เปลี่ยนฝากระโปรงหน้า', category: 'ด้านหน้า' },
  { value: 'headlight', label: 'เปลี่ยนไฟหน้า', category: 'ด้านหน้า' },
  { value: 'taillight', label: 'เปลี่ยนไฟท้าย', category: 'ด้านหลัง' },
  { value: 'door_front_left', label: 'ซ่อมประตูหน้าซ้าย', category: 'ด้านข้าง' },
  { value: 'door_front_right', label: 'ซ่อมประตูหน้าขวา', category: 'ด้านข้าง' },
  { value: 'door_rear_left', label: 'ซ่อมประตูหลังซ้าย', category: 'ด้านข้าง' },
  { value: 'door_rear_right', label: 'ซ่อมประตูหลังขวา', category: 'ด้านข้าง' },
  { value: 'fender_left', label: 'ซ่อมบังโคลนซ้าย', category: 'ด้านข้าง' },
  { value: 'fender_right', label: 'ซ่อมบังโคลนขวา', category: 'ด้านข้าง' },
  { value: 'windshield_front', label: 'เปลี่ยนกระจกหน้า', category: 'กระจก' },
  { value: 'windshield_rear', label: 'เปลี่ยนกระจกหลัง', category: 'กระจก' },
  { value: 'window_left', label: 'เปลี่ยนกระจกข้างซ้าย', category: 'กระจก' },
  { value: 'window_right', label: 'เปลี่ยนกระจกข้างขวา', category: 'กระจก' },
  { value: 'mirror_left', label: 'เปลี่ยนกระจกมองข้างซ้าย', category: 'กระจก' },
  { value: 'mirror_right', label: 'เปลี่ยนกระจกมองข้างขวา', category: 'กระจก' },
  { value: 'paint_front', label: 'พ่นสีด้านหน้า', category: 'พ่นสี' },
  { value: 'paint_rear', label: 'พ่นสีด้านหลัง', category: 'พ่นสี' },
  { value: 'paint_left', label: 'พ่นสีด้านซ้าย', category: 'พ่นสี' },
  { value: 'paint_right', label: 'พ่นสีด้านขวา', category: 'พ่นสี' },
  { value: 'tire_replace', label: 'เปลี่ยนยาง', category: 'ล้อ/ยาง' },
  { value: 'rim_replace', label: 'เปลี่ยนล้อ', category: 'ล้อ/ยาง' },
  { value: 'suspension', label: 'ซ่อมช่วงล่าง', category: 'ช่วงล่าง' },
  { value: 'alignment', label: 'ตั้งศูนย์ล้อ', category: 'ช่วงล่าง' },
  { value: 'other', label: '🔧 อื่นๆ (ระบุ)', category: 'อื่นๆ' },
];

const ClaimDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [claim, setClaim] = useState(null);
  
  // Form data for report
  const [images, setImages] = useState([]);
  const [reportData, setReportData] = useState({
    inspectionDate: new Date().toISOString().split('T')[0],
    inspectionTime: new Date().toTimeString().slice(0, 5),
    damageDescription: '',
    repairItems: [],
  });
  
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [submitType, setSubmitType] = useState('draft'); // 'draft' or 'submit'

  useEffect(() => {
    // TODO: Backend - ดึงข้อมูลเคส
    // fetchClaimDetail(id);
    
    // Mock data
    setTimeout(() => {
      setClaim({
        id: id,
        claimNumber: 'CLM-2024-001',
        status: 'inspecting',
        priority: 'normal',
        customerName: 'นายสมชาย ใจดี',
        customerPhone: '081-234-5678',
        customerEmail: 'somchai@example.com',
        policyNumber: 'POL-2024-001234',
        vehicle: {
          brand: 'Honda',
          model: 'City',
          year: 2020,
          licensePlate: 'กข 1234 กรุงเทพ',
          chassisNumber: 'JHMC12345678',
          color: 'ขาว',
        },
        incidentDate: '2024-10-20 10:00',
        location: '123 ถนนประชาราษฎร์ แขวงห้วยขวาง',
        description: 'ชนด้านหน้าจากรถที่วิ่งสวนทาง',
        reportedDate: '2024-10-20 14:30',
        assignedOfficer: 'นางสาววิภา ประกันภัย',
        assignedDate: '2024-10-20 15:00',
        report: null,
      });
      setLoading(false);
    }, 500);
  }, [id]);

  // Auto-save ทุก 30 วินาที
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      if (reportData.damageDescription || images.length > 0 || reportData.repairItems.length > 0) {
        handleAutoSave();
      }
    }, 30000); // 30 seconds

    return () => clearInterval(autoSaveInterval);
  }, [reportData, images]);

  const handleAutoSave = async () => {
    setAutoSaving(true);
    // TODO: Backend - บันทึกแบบร่าง
    setTimeout(() => {
      setLastSaved(new Date());
      setAutoSaving(false);
    }, 500);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setReportData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImagesChange = (e) => {
    setImages(e.target.files);
    if (errors.images) {
      setErrors(prev => ({ ...prev, images: '' }));
    }
  };

  const handleAddRepairItem = () => {
    setReportData(prev => ({
      ...prev,
      repairItems: [
        ...prev.repairItems,
        { 
          id: Date.now(), 
          type: '', // dropdown value
          customDescription: '', // สำหรับ "อื่นๆ"
          cost: '' 
        }
      ]
    }));
  };

  const handleRemoveRepairItem = (itemId) => {
    setReportData(prev => ({
      ...prev,
      repairItems: prev.repairItems.filter(item => item.id !== itemId)
    }));
  };

  const handleRepairItemChange = (itemId, field, value) => {
    setReportData(prev => ({
      ...prev,
      repairItems: prev.repairItems.map(item =>
        item.id === itemId ? { ...item, [field]: value } : item
      )
    }));
  };

  const calculateTotalCost = () => {
    return reportData.repairItems.reduce((sum, item) => {
      return sum + (parseFloat(item.cost) || 0);
    }, 0);
  };

  const isFormComplete = () => {
    // ตรวจสอบว่าข้อมูลครบทุกช่องหรือยัง
    const hasImages = images.length > 0;
    const allImagesHaveCaption = images.every(img => img.caption?.trim());
    const hasDamageDescription = reportData.damageDescription.trim().length >= 20;
    const hasRepairItems = reportData.repairItems.length > 0;
    const allRepairItemsComplete = reportData.repairItems.every(item => {
      const hasType = item.type !== '';
      const hasCost = item.cost && parseFloat(item.cost) > 0;
      const hasCustomDesc = item.type !== 'other' || item.customDescription.trim();
      return hasType && hasCost && hasCustomDesc;
    });

    return hasImages && allImagesHaveCaption && hasDamageDescription && hasRepairItems && allRepairItemsComplete;
  };

  const validate = () => {
    const newErrors = {};
    
    if (images.length === 0) {
      newErrors.images = 'กรุณาอัปโหลดรูปภาพอย่างน้อย 1 รูป';
    }
    
    const imagesWithoutCaption = images.filter(img => !img.caption?.trim());
    if (imagesWithoutCaption.length > 0) {
      newErrors.images = `มีรูปภาพ ${imagesWithoutCaption.length} รูปที่ยังไม่ได้ใส่ชื่อ`;
    }
    
    if (!reportData.damageDescription || reportData.damageDescription.trim().length < 20) {
      newErrors.damageDescription = 'กรุณาอธิบายความเสียหายอย่างน้อย 20 ตัวอักษร';
    }
    
    if (reportData.repairItems.length === 0) {
      newErrors.repairItems = 'กรุณาเพิ่มรายการซ่อมอย่างน้อย 1 รายการ';
    } else {
      const hasEmptyItem = reportData.repairItems.some(item => {
        const noType = !item.type;
        const noCost = !item.cost || parseFloat(item.cost) <= 0;
        const noCustomDesc = item.type === 'other' && !item.customDescription.trim();
        return noType || noCost || noCustomDesc;
      });
      if (hasEmptyItem) {
        newErrors.repairItems = 'กรุณากรอกรายการซ่อมให้ครบถ้วน';
      }
    }
    
    return newErrors;
  };

  const handleSaveDraft = async () => {
    setSaving(true);
    setSubmitType('draft');
    
    // TODO: Backend - บันทึกแบบร่าง
    setTimeout(() => {
      console.log('Draft saved:', {
        claimId: id,
        images: images.map(img => ({
          type: img.type,
          caption: img.caption,
          file: img.file.name,
        })),
        ...reportData,
      });
      
      setLastSaved(new Date());
      setSaving(false);
      alert('บันทึกแบบร่างสำเร็จ');
    }, 1000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    
    setSaving(true);
    setSubmitType('submit');
    
    // TODO: Backend - บันทึกและส่งออก
    setTimeout(() => {
      console.log('Report submitted:', {
        claimId: id,
        images: images.map(img => ({
          type: img.type,
          caption: img.caption,
          file: img.file.name,
        })),
        ...reportData,
      });
      
      setSaving(false);
      setShowSuccessModal(true);
    }, 2000);
  };

  const handleExportPDF = () => {
    console.log('Export PDF for claim:', id);
    // TODO: Backend - Export PDF
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    navigate('/insurance');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <span className="material-icons-round animate-spin text-6xl text-primary-500 mb-4">refresh</span>
          <p className="text-neutral-500">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  if (!claim) {
    return (
      <div className="card-static text-center py-16">
        <span className="material-icons-round text-6xl text-neutral-300 mb-4">error_outline</span>
        <p className="text-neutral-500 text-lg mb-4">ไม่พบข้อมูลเคส</p>
        <button onClick={() => navigate(-1)} className="btn-primary">กลับ</button>
      </div>
    );
  }

  const totalCost = calculateTotalCost();
  const formComplete = isFormComplete();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-neutral-500 hover:text-primary-500 mb-3 transition-colors duration-300"
          >
            <span className="material-icons-round">arrow_back</span>
            <span>กลับ</span>
          </button>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-neutral-dark">{claim.claimNumber}</h1>
            <span className={`badge badge-sm ${claim.priority === 'urgent' ? 'badge-error' : claim.priority === 'high' ? 'badge-warning' : 'badge-neutral'}`}>
              {claim.priority === 'urgent' ? 'ด่วนมาก' : claim.priority === 'high' ? 'ด่วน' : 'ปกติ'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <p className="text-neutral-500">อัปโหลดรายงานจากการตรวจสอบพื้นที่</p>
            {lastSaved && (
              <p className="text-xs text-neutral-400">
                <span className="material-icons-round text-xs align-middle mr-1">check_circle</span>
                บันทึกล่าสุด: {lastSaved.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
              </p>
            )}
            {autoSaving && (
              <p className="text-xs text-primary-500">
                <span className="material-icons-round text-xs align-middle mr-1 animate-spin">sync</span>
                กำลังบันทึก...
              </p>
            )}
          </div>
        </div>
        <button onClick={handleExportPDF} className="btn-outline flex items-center gap-2">
          <span className="material-icons-round">download</span>
          <span>Export PDF</span>
        </button>
      </div>

      {/* Claim Info Summary */}
      <div className="card-static bg-primary-50 border-2 border-primary-200">
        <div className="flex items-center gap-3 mb-4">
          <span className="material-icons-round text-3xl text-primary-600">assignment</span>
          <div>
            <h2 className="text-lg font-semibold text-neutral-dark">ข้อมูลเคลม</h2>
            <p className="text-sm text-neutral-600">{claim.claimNumber}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-neutral-500 mb-1">ลูกค้า</p>
            <p className="font-medium text-neutral-dark">{claim.customerName}</p>
          </div>
          <div>
            <p className="text-xs text-neutral-500 mb-1">รถยนต์</p>
            <p className="font-medium text-neutral-dark">{claim.vehicle.brand} {claim.vehicle.model}</p>
          </div>
          <div>
            <p className="text-xs text-neutral-500 mb-1">ทะเบียน</p>
            <p className="font-medium text-neutral-dark">{claim.vehicle.licensePlate}</p>
          </div>
          <div>
            <p className="text-xs text-neutral-500 mb-1">วันเกิดเหตุ</p>
            <p className="font-medium text-neutral-dark">{claim.incidentDate}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* อัปโหลดรูปภาพ */}
          <div className="card-static">
            <h2 className="text-xl font-semibold text-neutral-dark mb-4 flex items-center gap-2">
              <span className="material-icons-round text-primary-500">photo_camera</span>
              <span>อัปโหลดรูปภาพความเสียหาย</span>
            </h2>
            
            <FileUpload
              withDetails={true}
              accept="image/*"
              multiple
              files={images}
              onChange={handleImagesChange}
              error={errors.images}
            />
          </div>

          {/* รายละเอียดความเสียหาย */}
          <div className="card-static">
            <h2 className="text-xl font-semibold text-neutral-dark mb-4 flex items-center gap-2">
              <span className="material-icons-round text-primary-500">description</span>
              <span>รายละเอียดความเสียหาย</span>
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="วันที่ตรวจสอบ"
                  name="inspectionDate"
                  type="date"
                  value={reportData.inspectionDate}
                  onChange={handleChange}
                  icon="calendar_today"
                  required
                />
                
                <Input
                  label="เวลาตรวจสอบ"
                  name="inspectionTime"
                  type="time"
                  value={reportData.inspectionTime}
                  onChange={handleChange}
                  icon="schedule"
                  required
                />
              </div>

              <TextArea
                label="รายละเอียดความเสียหาย"
                name="damageDescription"
                value={reportData.damageDescription}
                onChange={handleChange}
                placeholder="อธิบายความเสียหายโดยละเอียด เช่น กันชนหน้าบุบ ไฟหน้าซ้ายแตก..."
                rows={6}
                required
                error={errors.damageDescription}
              />
            </div>
          </div>

          {/* รายการซ่อม */}
          <div className="card-static">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-neutral-dark flex items-center gap-2">
                <span className="material-icons-round text-primary-500">build</span>
                <span>รายการซ่อม</span>
              </h2>
              <button type="button" onClick={handleAddRepairItem} className="btn-primary btn-sm">
                <span className="material-icons-round mr-1">add</span>เพิ่มรายการ
              </button>
            </div>

            {errors.repairItems && (
              <div className="mb-4 p-4 bg-error/10 border border-error rounded-lg">
                <p className="text-error text-sm">{errors.repairItems}</p>
              </div>
            )}

            {reportData.repairItems.length === 0 ? (
              <div className="text-center py-12 bg-neutral-50 rounded-lg">
                <span className="material-icons-round text-5xl text-neutral-300 mb-3">construction</span>
                <p className="text-neutral-500">ยังไม่มีรายการซ่อม กรุณาเพิ่มรายการ</p>
              </div>
            ) : (
              <div className="space-y-3">
                {reportData.repairItems.map((item, index) => (
                  <div key={item.id} className="p-4 bg-neutral-50 rounded-lg space-y-3">
                    <div className="flex items-start justify-between">
                      <p className="text-sm font-medium text-neutral-700">รายการที่ {index + 1}</p>
                      <button
                        type="button"
                        onClick={() => handleRemoveRepairItem(item.id)}
                        className="text-neutral-400 hover:text-error transition-colors"
                      >
                        <span className="material-icons-round">delete</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* Dropdown รายการซ่อม */}
                      <div>
                        <label className="block text-xs font-medium text-neutral-600 mb-1">
                          ประเภทการซ่อม <span className="text-error">*</span>
                        </label>
                        <select
                          value={item.type}
                          onChange={(e) => handleRepairItemChange(item.id, 'type', e.target.value)}
                          className="input-field"
                        >
                          <option value="">-- เลือกรายการ --</option>
                          {REPAIR_ITEMS_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* ค่าใช้จ่าย */}
                      <div>
                        <label className="block text-xs font-medium text-neutral-600 mb-1">
                          ค่าใช้จ่าย (บาท) <span className="text-error">*</span>
                        </label>
                        <input
                          type="number"
                          placeholder="0"
                          value={item.cost}
                          onChange={(e) => handleRepairItemChange(item.id, 'cost', e.target.value)}
                          className="input-field"
                        />
                      </div>
                    </div>

                    {/* ถ้าเลือก "อื่นๆ" ให้แสดงช่องระบุ */}
                    {item.type === 'other' && (
                      <div>
                        <label className="block text-xs font-medium text-neutral-600 mb-1">
                          ระบุรายละเอียด <span className="text-error">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="ระบุรายการซ่อมที่ไม่มีในตัวเลือก..."
                          value={item.customDescription}
                          onChange={(e) => handleRepairItemChange(item.id, 'customDescription', e.target.value)}
                          className="input-field"
                        />
                      </div>
                    )}
                  </div>
                ))}

                {/* สรุปค่าใช้จ่ายรวม */}
                <div className="flex justify-between items-center p-4 bg-primary-50 rounded-lg border-2 border-primary-200">
                  <span className="font-semibold text-neutral-dark">ประเมินค่าใช้จ่ายโดยรวม</span>
                  <span className="text-2xl font-bold text-primary-600">฿{totalCost.toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Card */}
          {formComplete && (
            <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
              <div className="flex items-center gap-3 mb-3">
                <span className="material-icons-round text-3xl">check_circle</span>
                <div>
                  <h3 className="font-bold">พร้อมส่งออก</h3>
                  <p className="text-sm text-white/80">ข้อมูลครบถ้วนแล้ว</p>
                </div>
              </div>
              <p className="text-sm text-white/90">
                คุณสามารถบันทึกและส่งออกรายงานให้ลูกค้าได้แล้ว
              </p>
            </div>
          )}

          {/* Info Card */}
          <div className="card bg-gradient-primary text-white">
            <span className="material-icons-round text-4xl mb-3">info</span>
            <h3 className="font-semibold mb-2">ขั้นตอนการอัปโหลด</h3>
            <ol className="text-sm text-white/80 space-y-2 list-decimal list-inside">
              <li>อัปโหลดรูปภาพ (ใส่ชื่อทุกรูป)</li>
              <li>กรอกรายละเอียดความเสียหาย</li>
              <li>เลือกรายการซ่อม + ใส่ราคา</li>
              <li>บันทึกแบบร่าง หรือส่งออก</li>
            </ol>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {/* บันทึกและส่งออก (ถ้าข้อมูลครบ) */}
            {formComplete ? (
              <button 
                type="submit" 
                className="btn-primary w-full flex items-center justify-center gap-2"
                disabled={saving}
              >
                {saving && submitType === 'submit' ? (
                  <>
                    <span className="material-icons-round animate-spin">refresh</span>
                    <span>กำลังส่งออก...</span>
                  </>
                ) : (
                  <>
                    <span className="material-icons-round">send</span>
                    <span>บันทึกและส่งออก</span>
                  </>
                )}
              </button>
            ) : (
              <button 
                type="button"
                onClick={handleSaveDraft}
                className="btn-primary w-full flex items-center justify-center gap-2"
                disabled={saving}
              >
                {saving && submitType === 'draft' ? (
                  <>
                    <span className="material-icons-round animate-spin">refresh</span>
                    <span>กำลังบันทึก...</span>
                  </>
                ) : (
                  <>
                    <span className="material-icons-round">save</span>
                    <span>บันทึกแบบร่าง</span>
                  </>
                )}
              </button>
            )}

            {/* ยกเลิก */}
            <button 
              type="button" 
              onClick={() => navigate(-1)} 
              className="btn-outline w-full" 
              disabled={saving}
            >
              ยกเลิก
            </button>
          </div>

          {/* Auto-save Info */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-neutral-700">
              <span className="material-icons-round text-sm mr-1 align-middle text-info">info</span>
              ระบบจะบันทึกแบบร่างอัตโนมัติทุก 30 วินาที
            </p>
          </div>
        </div>
      </form>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full animate-scale-in">
            <div className="text-center">
              <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-icons-round text-5xl text-success">check_circle</span>
              </div>
              <h2 className="text-2xl font-bold text-neutral-dark mb-2">บันทึกและส่งออกสำเร็จ!</h2>
              <p className="text-neutral-600 mb-6">รายงานถูกส่งให้ลูกค้าแล้ว</p>
              <div className="p-4 bg-blue-50 rounded-lg text-left mb-6">
                <p className="text-sm text-neutral-700">
                  <span className="material-icons-round text-sm mr-1 align-middle text-info">info</span>
                  ลูกค้าสามารถดูรายละเอียดและดาวน์โหลดใบเคลม PDF ได้แล้ว
                </p>
              </div>
              <button onClick={handleCloseSuccessModal} className="btn-primary w-full">เข้าใจแล้ว</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClaimDetail;