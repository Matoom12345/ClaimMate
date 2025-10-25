import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Input, TextArea, FileUpload, Modal, ConfirmModal } from '../../components';

/**
 * ClaimDetail - หน้ารายละเอียดเคสและอัปโหลดรายงาน
 * 
 * จุดประสงค์หลัก:
 * - พนักงานลงพื้นที่อัปโหลดรูปภาพจากหลายมุม
 * - กรอกรายละเอียดความเสียหาย
 * - ประเมินค่าซ่อมและระบุรายการซ่อม
 * - ส่งรายงานและ Export เป็น PDF
 * 
 * TODO: Backend Integration
 * - GET /api/insurance/claims/{id} - ดึงข้อมูลเคส
 * - POST /api/insurance/claims/{id}/report - บันทึกรายงาน
 * - POST /api/insurance/claims/{id}/images - อัปโหลดรูปภาพ
 * - GET /api/insurance/claims/{id}/pdf - Export PDF
 */
const ClaimDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [claim, setClaim] = useState(null);
  
  // Form data for report
  const [reportData, setReportData] = useState({
    images: [],
    damageDescription: '',
    estimatedCost: '',
    repairItems: [],
  });
  
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

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
        
        // ข้อมูลลูกค้า
        customerName: 'นายสมชาย ใจดี',
        customerPhone: '081-234-5678',
        customerEmail: 'somchai@example.com',
        policyNumber: 'POL-2024-001234',
        
        // ข้อมูลรถยนต์
        vehicle: {
          brand: 'Honda',
          model: 'City',
          year: 2020,
          licensePlate: 'กข 1234 กรุงเทพ',
          chassisNumber: 'JHMC12345678',
          color: 'ขาว',
        },
        
        // ข้อมูลเหตุการณ์
        incidentDate: '2024-10-20 10:00',
        location: '123 ถนนประชาราษฎร์ แขวงห้วยขวาง เขตห้วยขวาง กรุงเทพมหานคร',
        description: 'ชนด้านหน้าจากรถที่วิ่งสวนทาง',
        reportedDate: '2024-10-20 14:30',
        
        // พนักงานที่รับผิดชอบ
        assignedOfficer: 'นางสาววิภา ประกันภัย',
        assignedDate: '2024-10-20 15:00',
        
        // รายงาน (ถ้ามี)
        report: null,
      });
      setLoading(false);
    }, 500);
  }, [id]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    
    if (files) {
      setReportData(prev => ({ ...prev, [name]: files }));
    } else {
      setReportData(prev => ({ ...prev, [name]: value }));
    }
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleAddRepairItem = () => {
    setReportData(prev => ({
      ...prev,
      repairItems: [
        ...prev.repairItems,
        { id: Date.now(), description: '', cost: '' }
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

  const validate = () => {
    const newErrors = {};
    
    if (reportData.images.length === 0) {
      newErrors.images = 'กรุณาอัปโหลดรูปภาพอย่างน้อย 1 รูป';
    }
    if (!reportData.damageDescription || reportData.damageDescription.trim().length < 20) {
      newErrors.damageDescription = 'กรุณาอธิบายความเสียหายอย่างน้อย 20 ตัวอักษร';
    }
    if (!reportData.estimatedCost || parseFloat(reportData.estimatedCost) <= 0) {
      newErrors.estimatedCost = 'กรุณาระบุค่าซ่อมประเมิน';
    }
    if (reportData.repairItems.length === 0) {
      newErrors.repairItems = 'กรุณาเพิ่มรายการซ่อมอย่างน้อย 1 รายการ';
    } else {
      const hasEmptyItem = reportData.repairItems.some(
        item => !item.description || !item.cost || parseFloat(item.cost) <= 0
      );
      if (hasEmptyItem) {
        newErrors.repairItems = 'กรุณากรอกรายการซ่อมให้ครบถ้วน';
      }
    }
    
    return newErrors;
  };

  // TODO: Backend - บันทึกร่าง
  const handleSaveDraft = async () => {
    setSaving(true);
    
    setTimeout(() => {
      console.log('Save draft:', reportData);
      setSaving(false);
      alert('บันทึกร่างสำเร็จ');
    }, 1000);
  };

  // TODO: Backend - ส่งรายงาน
  const handleSubmitReport = async () => {
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setShowSubmitModal(false);
      return;
    }
    
    setSaving(true);
    
    setTimeout(() => {
      console.log('Submit report:', reportData);
      setSaving(false);
      setShowSubmitModal(false);
      setShowSuccessModal(true);
    }, 1500);
  };

  // TODO: Backend - Export PDF
  const handleExportPDF = () => {
    console.log('Export PDF for claim:', id);
    // fetch(`/api/insurance/claims/${id}/pdf`)
    //   .then(response => response.blob())
    //   .then(blob => {
    //     const url = window.URL.createObjectURL(blob);
    //     const a = document.createElement('a');
    //     a.href = url;
    //     a.download = `claim-${id}.pdf`;
    //     a.click();
    //   });
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
        <span className="material-icons-round text-6xl text-neutral-300 mb-4">
          error_outline
        </span>
        <p className="text-neutral-500 text-lg mb-4">
          ไม่พบข้อมูลเคส
        </p>
        <button onClick={() => navigate(-1)} className="btn-primary">
          กลับ
        </button>
      </div>
    );
  }

  const totalCost = calculateTotalCost();

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
            <h1 className="text-3xl font-bold text-neutral-dark">
              {claim.claimNumber}
            </h1>
            <span className={`
              badge badge-sm
              ${claim.priority === 'urgent' ? 'badge-error' : 
                claim.priority === 'high' ? 'badge-warning' : 'badge-neutral'}
            `}>
              {claim.priority === 'urgent' ? 'ด่วนมาก' : 
               claim.priority === 'high' ? 'ด่วน' : 'ปกติ'}
            </span>
          </div>
          <p className="text-neutral-500">
            อัปโหลดรายงานจากการตรวจสอบพื้นที่
          </p>
        </div>
        <button
          onClick={handleExportPDF}
          className="btn-outline flex items-center gap-2"
        >
          <span className="material-icons-round">download</span>
          <span>Export PDF</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* ข้อมูลเคส */}
          <div className="card-static">
            <h2 className="text-xl font-semibold text-neutral-dark mb-4 flex items-center gap-2">
              <span className="material-icons-round text-primary-500">info</span>
              <span>ข้อมูลเคส</span>
            </h2>
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-neutral-500 mb-1">ลูกค้า</p>
                <p className="font-medium text-neutral-dark">{claim.customerName}</p>
                <a href={`tel:${claim.customerPhone}`} className="text-sm text-primary-600 hover:underline">
                  {claim.customerPhone}
                </a>
              </div>
              <div>
                <p className="text-sm text-neutral-500 mb-1">เลขกรมธรรม์</p>
                <p className="font-medium text-neutral-dark">{claim.policyNumber}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-500 mb-1">รถยนต์</p>
                <p className="font-medium text-neutral-dark">
                  {claim.vehicle.brand} {claim.vehicle.model} ({claim.vehicle.year})
                </p>
                <p className="text-sm text-neutral-600">
                  ทะเบียน: {claim.vehicle.licensePlate}
                </p>
              </div>
              <div>
                <p className="text-sm text-neutral-500 mb-1">วันเกิดเหตุ</p>
                <p className="font-medium text-neutral-dark">{claim.incidentDate}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-neutral-500 mb-1">สถานที่เกิดเหตุ</p>
                <p className="font-medium text-neutral-dark">{claim.location}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-neutral-500 mb-1">รายละเอียดจากลูกค้า</p>
                <p className="font-medium text-neutral-dark">{claim.description}</p>
              </div>
            </div>
          </div>

          {/* อัปโหลดรูปภาพ */}
          <div className="card-static">
            <h2 className="text-xl font-semibold text-neutral-dark mb-4 flex items-center gap-2">
              <span className="material-icons-round text-primary-500">photo_camera</span>
              <span>อัปโหลดรูปภาพความเสียหาย</span>
            </h2>
            
            <FileUpload
              label=""
              name="images"
              files={reportData.images}
              onChange={handleChange}
              accept="image/*"
              multiple
              maxSize={10}
              showPreview={true}
              error={errors.images}
            />
            
            <div className="mt-3 p-3 bg-blue-50 rounded-lg text-sm text-neutral-700">
              <span className="material-icons-round text-sm mr-1 align-middle text-info">info</span>
              ถ่ายรูปจากหลายมุม: ด้านหน้า, ด้านหลัง, ด้านข้าง, และส่วนที่เสียหายโดยละเอียด
            </div>
          </div>

          {/* รายละเอียดความเสียหาย */}
          <div className="card-static">
            <h2 className="text-xl font-semibold text-neutral-dark mb-4 flex items-center gap-2">
              <span className="material-icons-round text-primary-500">description</span>
              <span>รายละเอียดความเสียหาย</span>
            </h2>
            
            <TextArea
              label=""
              name="damageDescription"
              value={reportData.damageDescription}
              onChange={handleChange}
              placeholder="อธิบายความเสียหายโดยละเอียด เช่น กันชนหน้าบุบ ไฟหน้าซ้ายแตก ฝากระโปรงหน้าเบี้ยว..."
              rows={6}
              error={errors.damageDescription}
              helperText="อธิบายให้ละเอียดเพื่อประกอบการพิจารณาอนุมัติ"
            />
          </div>

          {/* รายการซ่อมและค่าใช้จ่าย */}
          <div className="card-static">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-neutral-dark flex items-center gap-2">
                <span className="material-icons-round text-primary-500">build</span>
                <span>รายการซ่อมและค่าใช้จ่าย</span>
              </h2>
              <button
                type="button"
                onClick={handleAddRepairItem}
                className="btn-outline btn-sm flex items-center gap-1"
              >
                <span className="material-icons-round text-sm">add</span>
                <span>เพิ่มรายการ</span>
              </button>
            </div>

            <div className="space-y-3 mb-4">
              {reportData.repairItems.length === 0 ? (
                <div className="text-center py-8 text-neutral-400">
                  <span className="material-icons-round text-4xl mb-2">add_circle_outline</span>
                  <p className="text-sm">คลิก "เพิ่มรายการ" เพื่อระบุรายการซ่อม</p>
                </div>
              ) : (
                reportData.repairItems.map((item, index) => (
                  <div key={item.id} className="flex items-start gap-3 p-4 bg-neutral-50 rounded-lg">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Input
                        label={`รายการที่ ${index + 1}`}
                        value={item.description}
                        onChange={(e) => handleRepairItemChange(item.id, 'description', e.target.value)}
                        placeholder="เช่น กันชนหน้า, ไฟหน้าซ้าย..."
                      />
                      <Input
                        label="ค่าใช้จ่าย (บาท)"
                        type="number"
                        value={item.cost}
                        onChange={(e) => handleRepairItemChange(item.id, 'cost', e.target.value)}
                        placeholder="0.00"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveRepairItem(item.id)}
                      className="mt-7 p-2 text-error hover:bg-red-50 rounded-lg transition-colors duration-200"
                      title="ลบรายการ"
                    >
                      <span className="material-icons-round">delete</span>
                    </button>
                  </div>
                ))
              )}
            </div>

            {errors.repairItems && (
              <p className="text-sm text-error mb-3">{errors.repairItems}</p>
            )}

            <div className="border-t border-neutral-200 pt-4">
              <div className="flex justify-between items-center text-lg font-semibold">
                <span className="text-neutral-700">รวมค่าซ่อมประเมิน</span>
                <span className="text-primary-600 text-2xl">
                  ฿{totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <Input
              label="ค่าซ่อมประเมินรวม (บาท)"
              name="estimatedCost"
              type="number"
              value={reportData.estimatedCost}
              onChange={handleChange}
              placeholder="0.00"
              icon="payments"
              error={errors.estimatedCost}
              className="mt-4"
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Progress */}
          <div className="card-static">
            <h3 className="font-semibold text-neutral-dark mb-4">
              ความคืบหน้า
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center
                  ${reportData.images.length > 0 ? 'bg-success text-white' : 'bg-neutral-200 text-neutral-400'}
                `}>
                  <span className="material-icons-round">
                    {reportData.images.length > 0 ? 'check' : 'photo_camera'}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-neutral-dark">รูปภาพ</p>
                  <p className="text-xs text-neutral-500">
                    {reportData.images.length} / ไม่จำกัด
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center
                  ${reportData.damageDescription ? 'bg-success text-white' : 'bg-neutral-200 text-neutral-400'}
                `}>
                  <span className="material-icons-round">
                    {reportData.damageDescription ? 'check' : 'description'}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-neutral-dark">รายละเอียด</p>
                  <p className="text-xs text-neutral-500">
                    {reportData.damageDescription ? 'เสร็จสิ้น' : 'รอกรอก'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center
                  ${reportData.repairItems.length > 0 ? 'bg-success text-white' : 'bg-neutral-200 text-neutral-400'}
                `}>
                  <span className="material-icons-round">
                    {reportData.repairItems.length > 0 ? 'check' : 'build'}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-neutral-dark">รายการซ่อม</p>
                  <p className="text-xs text-neutral-500">
                    {reportData.repairItems.length} รายการ
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="card-static">
            <h3 className="font-semibold text-neutral-dark mb-4">
              การดำเนินการ
            </h3>
            
            <div className="space-y-3">
              <button
                onClick={handleSaveDraft}
                className="btn-outline w-full flex items-center justify-center gap-2"
                disabled={saving}
              >
                <span className="material-icons-round">save</span>
                <span>บันทึกร่าง</span>
              </button>
              
              <button
                onClick={() => setShowSubmitModal(true)}
                className="btn-primary w-full flex items-center justify-center gap-2"
                disabled={saving}
              >
                <span className="material-icons-round">send</span>
                <span>ส่งรายงาน</span>
              </button>
            </div>
          </div>

          {/* Info */}
          <div className="card bg-gradient-secondary text-white">
            <span className="material-icons-round text-3xl mb-2">info</span>
            <h3 className="font-semibold mb-2">คำแนะนำ</h3>
            <ul className="text-sm text-white/90 space-y-2">
              <li className="flex items-start gap-2">
                <span className="material-icons-round text-sm mt-0.5">check</span>
                <span>ถ่ายรูปให้ชัดเจนจากทุกมุม</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="material-icons-round text-sm mt-0.5">check</span>
                <span>ระบุรายการซ่อมให้ครบถ้วน</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="material-icons-round text-sm mt-0.5">check</span>
                <span>ตรวจสอบข้อมูลก่อนส่ง</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      <ConfirmModal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        onConfirm={handleSubmitReport}
        title="ยืนยันการส่งรายงาน"
        message="คุณแน่ใจหรือไม่ที่จะส่งรายงานนี้? หลังจากส่งแล้วจะไม่สามารถแก้ไขได้"
        confirmText="ส่งรายงาน"
        cancelText="ยกเลิก"
        variant="primary"
        loading={saving}
      />

      {/* Success Modal */}
      <Modal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          navigate('/insurance/claims/active');
        }}
        title="ส่งรายงานสำเร็จ"
        size="md"
        footer={
          <button
            onClick={() => {
              setShowSuccessModal(false);
              navigate('/insurance/claims/active');
            }}
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
            ส่งรายงานสำเร็จ
          </p>
          <p className="text-neutral-600 mb-4">
            รายงานของคุณถูกส่งเรียบร้อยแล้ว ระบบจะดำเนินการต่อไป
          </p>
          <div className="p-4 bg-blue-50 rounded-lg text-left">
            <p className="text-sm text-neutral-700">
              <span className="material-icons-round text-sm mr-1 align-middle text-info">info</span>
              คุณสามารถดาวน์โหลด PDF ได้จากหน้ารายละเอียดเคส
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ClaimDetail;