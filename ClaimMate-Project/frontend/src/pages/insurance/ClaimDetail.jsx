import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Input, TextArea, FileUpload, Select } from '../../components';

// (REPAIR_ITEMS_OPTIONS ... คงไว้เหมือนเดิม)
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
  const { id } = useParams(); // id = claimNumber
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [claim, setClaim] = useState(null);

  // รูปภาพทั้งหมดที่หน้า UI ใช้แสดง (รวมของเดิมจาก DB + ของใหม่ temp)
  const [images, setImages] = useState([]);

  // ⭐️ แก้ไข: (ลบ isUploading ออกจากที่นี่ เพราะเราจะไม่อัปโหลดทันที)
  // const isUploading = images.some(img => img.loading === true);

  // ฟอร์มรายงาน
  const [reportData, setReportData] = useState({
    inspectionDate: new Date().toISOString().split('T')[0],
    inspectionTime: new Date().toTimeString().slice(0, 5),
    damageDescription: '',
    repairItems: [], // [{ id, type, customDescription, cost, existing, _id? }]
  });

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [submitType, setSubmitType] = useState('draft'); // 'draft' | 'submit'
  const [showExceedBudgetModal, setShowExceedBudgetModal] = useState(false); // ✅ Modal เกินวงเงิน

  // โหลดข้อมูล: ใช้ทั้ง /detail เพื่อเอา header summary (join) และ /full-detail เพื่อเอา photos + repairItems
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);

        // (แก้ไข) ⭐️ เรียก API แค่ครั้งเดียว
        const res = await axios.get(`http://localhost:3000/api/claims/detail-report/${id}`);

        // (แก้ไข) ⭐️ แยกข้อมูลจาก Response ใหม่
        const detail = res.data.claim || null;         // (ข้อมูล Header UI)
        const full = res.data || {};
        const rawClaim = full.claimRaw || {};          // (ข้อมูล Raw Form)
        const rawPhotos = full.photos || [];         // (ข้อมูลรูป)
        const rawItems = full.repairItems || [];       // (ข้อมูลรายการซ่อม)


        if (!detail || !rawClaim) {
          throw new Error('Claim data not found in response');
        }

        // 1) (แก้ไข) ประกอบ object claim สำหรับ header/summary UI
        const claimForUI = {
          id: detail.id,
          claimNumber: detail.claimNumber,
          status: detail.status,
          // (คำสั่ง 1: priority ถูกตัดออก)

          customerName: detail.customerFirstName + " " + detail.customerLastName || '-',
          customerPhone: detail.customerPhone || '-',
          customerEmail: detail.customerEmail || '-',

          policyNumber: detail.policyNumber || '-',
          vehicle: {
            brand: detail.carBrand || '',
            model: detail.carModel || '',
            year: detail.carYear || '',
            licensePlate: detail.licensePlate || '',
            chassisNumber: detail.engineID || '',
            color: detail.carColor || '',
            insuranceCoverage: detail.insuranceBalance || 0,
          },
          incidentDate: detail.incidentDate || '',
          location: detail.location || '',
          description: detail.detail || '',

          // (คำสั่ง 2: assignedOfficer)
          assignedOfficer: detail.assignedOfficer?.name || 'N/A',
          // (คำสั่ง 3: assignedDate)
          assignedDate: detail.assignedDate || '', // (Map มาจาก reportedDate)
          report: null,
        };
        setClaim(claimForUI);

        // 2) (แก้ไข) ตั้งค่าเริ่มต้นของแบบฟอร์ม
        const initialDamageDesc = rawClaim.detail || '';

        let initialDate = new Date().toISOString().split('T')[0];
        let initialTime = new Date().toTimeString().slice(0, 5);



        setReportData(prev => ({
          ...prev,
          inspectionDate: initialDate,
          inspectionTime: initialTime,
          damageDescription: initialDamageDesc,
          repairItems: [
            // (คำสั่ง 5: โหลดรายการจาก DB)
            ...rawItems.map(x => ({
              id: x.id,
              _id: x._id,
              existing: true,
              type: x.type || '', // (Type ที่เรา map มา)
              customDescription: x.customDescription || '', // (customDesc ที่เรา map มา)
              cost: x.cost ?? '',
            })),
          ],
        }));

        // 3) (แก้ไข) รวมรูปจาก DB
        const existingImages = rawPhotos.map(p => ({
          id: p.id,
          _id: p._id,
          existing: true,
          preview: p.photoURL,
          type: p.type || 'damage',
          caption: p.caption || '',
          file: null
        }));
        setImages(existingImages);

      } catch (err) {
        console.error('Load Claim failed:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  // ⭐️ ห่อ (Wrap) buildInspectionDateTime ด้วย useCallback (เผื่อ AutoSave ในอนาคต)
  const buildInspectionDateTime = useCallback(() => {
    // รวม yyyy-mm-dd + hh:mm → "yyyy-mm-dd hh:mm"
    const d = reportData.inspectionDate || new Date().toISOString().split('T')[0];
    const t = reportData.inspectionTime || new Date().toTimeString().slice(0, 5);
    return `${d} ${t}`;
  }, [reportData.inspectionDate, reportData.inspectionTime]);

  // ⭐️ (AutoSave) - (ลบ Logic ออกตามคำขอ แต่คงไว้เผื่ออนาคต)
  const handleAutoSave = useCallback(async () => {
    // (ไม่ทำอะไรตามคำขอ)
  }, []);

  // ⭐️ (AutoSave) - (ลบ Logic ออกตามคำขอ)
  useEffect(() => {
    // (ไม่ทำอะไรตามคำขอ)
  }, [handleAutoSave]);


  const handleChange = (e) => {
    const { name, value } = e.target || {};
    setReportData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleUpdateImages = (newFiles) => {
    setImages(newFiles);
  };

  // ⭐️⭐️⭐️ (แก้ไข) ⭐️⭐️⭐️
  // (โค้ดนี้จะแค่เพิ่ม File object เข้าไปใน State)
  const handleImagesChange = async (e) => {
    const selected = Array.from(e?.target?.files || []);
    if (!selected.length) return;

    // 1. (FIX) เพิ่มไฟล์ทั้งหมดเข้า State ทันที
    const newImageEntries = selected.map(item => ({
      id: item.id,
      existing: false,
      file: item.file,         // ⭐️ เก็บ File object
      preview: item.preview,
      fileName: item.file.name,
      type: item.type || 'damage',
      caption: item.caption || '',
      loading: false,          // ⭐️ ไม่ loading แล้ว
    }));

    setImages(prev => [...prev, ...newImageEntries]);
    if (errors.images) setErrors(prev => ({ ...prev, images: '' }));

  };

  // (โค้ดนี้คือเวอร์ชันที่แก้ "ลบทั้งหมด" แล้ว)
  const handleRemoveImage = async (img) => {
    // img.id จะมีค่าเสมอ (ถ้าเป็นรูปเก่า id=x._id, รูปใหม่ id=temp_...)
    setImages(prev => prev.filter(x => x.id !== img.id));

    try {
      if (img.existing && img._id) {
        await axios.delete(`http://localhost:3000/api/claims/photos/${img._id}`);
      }
    } catch (err) {
      console.error('Delete photo failed (but UI was updated):', err);
    }
  };

  const handleAddRepairItem = () => {
    setReportData(prev => ({
      ...prev,
      repairItems: [
        ...prev.repairItems,
        {
          id: Date.now(), existing: false,
          type: '', customDescription: '', cost: '',
        },
      ],
    }));
  };

  // ลบรายการซ่อม (ถ้า existing → ลบ DB)
  const handleRemoveRepairItem = async (itemId) => {
    const target = (reportData.repairItems || []).find(x => x.id === itemId);
    if (target?.existing && target?._id) {
      try {
        await axios.delete(`http://localhost:3000/api/claims/repair-item/${target._id}`);
      } catch (err) {
        console.error('Delete repair-item failed:', err);
      }
    }
    setReportData(prev => ({
      ...prev,
      repairItems: prev.repairItems.filter(item => item.id !== itemId),
    }));
  };

  const handleRepairItemChange = (itemId, field, value) => {

    // ⭐️ 1. เพิ่ม Logic Validation สำหรับช่อง 'cost'
    if (field === 'cost') {

      // 1.1 ไม่อนุญาตให้กรอก 'e', 'E', '+', '-'
      if (['e', 'E', '+', '-'].some(char => value.includes(char))) {
        return; // ไม่ต้องอัปเดต State
      }

      // 1.2 แปลงเป็นตัวเลข
      const num = parseFloat(value);

      // 1.3 ถ้าค่าเกิน 100,000
      if (num > 100000) {
        alert("ไม่สามารถกรอกค่าซ่อมเกิน 100,000 บาท");
        value = "100000"; // (บังคับค่าสูงสุด)
      }

      // 1.4 (เผื่อไว้) ถ้าค่าน้อยกว่า 0
      if (num < 0) {
        value = "0";
      }
    }

    // ⭐️ 2. (โค้ดเดิม) อัปเดต State
    setReportData(prev => ({
      ...prev,
      repairItems: prev.repairItems.map(item =>
          item.id === itemId ? { ...item, [field]: value } : item
      ),
    }));
  };

  const calculateTotalCost = useMemo(() => {
    return (reportData.repairItems || []).reduce((sum, item) => sum + (parseFloat(item.cost) || 0), 0);
  }, [reportData.repairItems]);

  const isFormComplete = () => {
    // เกณฑ์เดิม: มีภาพ+caption, รายละเอียด >= 20 ตัว, repairItems ครบ
    const newOrExistingImages = images || [];
    const hasImages = newOrExistingImages.length > 0;
    const allImagesHaveCaption = newOrExistingImages.every(img => (img.caption || '').toString().trim());
    const hasDamageDescription = (reportData.damageDescription || '').trim().length >= 20;
    const hasRepairItems = (reportData.repairItems || []).length > 0;
    const allRepairItemsComplete = (reportData.repairItems || []).every(item => {
      const hasType = !!item.type;
      const hasCost = !!item.cost && parseFloat(item.cost) > 0;
      const hasCustomDesc = item.type !== 'other' || (item.customDescription || '').trim();
      return hasType && hasCost && hasCustomDesc;
    });
    return hasImages && allImagesHaveCaption && hasDamageDescription && hasRepairItems && allRepairItemsComplete;
  };

  const validate = () => {
    const newErrors = {};
    if ((images || []).length === 0) newErrors.images = 'กรุณาอัปโหลดรูปภาพอย่างน้อย 1 รูป';

    const imagesWithoutCaption = (images || []).filter(img => !(img.caption || '').toString().trim());
    if (imagesWithoutCaption.length > 0) {
      newErrors.images = `มีรูปภาพ ${imagesWithoutCaption.length} รูปที่ยังไม่ได้ใส่ชื่อ`;
    }

    if (!reportData.damageDescription || reportData.damageDescription.trim().length < 20) {
      newErrors.damageDescription = 'กรุณาอธิบายความเสียหายอย่างน้อย 20 ตัวอักษร';
    }

    if ((reportData.repairItems || []).length === 0) {
      newErrors.repairItems = 'กรุณาเพิ่มรายการซ่อมอย่างน้อย 1 รายการ';
    } else {
      const hasEmptyItem = reportData.repairItems.some(item => {
        const noType = !item.type;
        const noCost = !item.cost || parseFloat(item.cost) <= 0;
        const noCustomDesc = item.type === 'other' && !(item.customDescription || '').trim();
        return noType || noCost || noCustomDesc;
      });
      if (hasEmptyItem) newErrors.repairItems = 'กรุณากรอกรายการซ่อมให้ครบถ้วน';
    }
    return newErrors;
  };

  // ⭐️⭐️⭐️ (แก้ไข) ⭐️⭐️⭐️
  // (ฟังก์ชันสร้าง FormData สำหรับส่ง)
  const buildFormData = (mode = 'draft') => {
    // 1. สร้าง FormData
    const formData = new FormData();

    // 2. แยกรูปใหม่ (ที่มี File) และรูปเก่า
    const newImages = images.filter(x => !x.existing && x.file);
    const photosToUpdate = images.filter(x => x.existing);

    // 3. ใส่ข้อมูล Text (และ JSON ที่แปลงเป็น String)
    formData.append("damageDescription", reportData.damageDescription || '');
    formData.append("inspectionDate", buildInspectionDateTime());
    formData.append("mode", mode); // ⭐️ (draft หรือ submit)

    formData.append("photosToUpdate", JSON.stringify(
        photosToUpdate.map(p => ({ _id: p._id, type: p.type, caption: p.caption }))
    ));

    formData.append("repairItems", JSON.stringify(
        reportData.repairItems.map(x => ({
          _id: x.existing ? x._id : null,
          type: x.type,
          cost: Number(x.cost) || 0,
          customDescription: x.customDescription || '',

          // ⭐️⭐️⭐️ (เพิ่ม 2 บรรทัดนี้) ⭐️⭐️⭐️
          existing: x.existing, // 1. ส่ง Flag 'existing'
          frontendId: x.id      // 2. ส่ง ID ที่ Frontend ใช้ (ไม่ว่าจะเป็น temp หรือ dbId)
        }))
    ));

    // 4. ใส่ไฟล์ใหม่ (และ Metadata) เป็น Array คู่ขนาน
    newImages.forEach(img => {
      formData.append("newPhotos", img.file, img.fileName); // File
      formData.append("newPhotoCaptions", img.caption); // String
      formData.append("newPhotoTypes", img.type);     // String
    });

    // 5. ⭐️⭐️⭐️ (เพิ่ม Logic ใหม่) ⭐️⭐️⭐️
    // คำนวณและเพิ่ม additionalCost
    const totalCost = calculateTotalCost;
    const insuranceCoverage = claim?.vehicle?.insuranceCoverage || 0;
    const calculatedAdditionalCost = Math.max(0, totalCost - insuranceCoverage);

    formData.append("additionalCost", calculatedAdditionalCost);
    // ⭐️⭐️⭐️ (จบ Logic ใหม่) ⭐️⭐️⭐️

    return formData;
  }

  // ⭐️⭐️⭐️ (แก้ไข) ⭐️⭐️⭐️
  const handleSaveDraft = async () => {
    try {
      setSaving(true);
      setSubmitType('draft');

      // 1. ⭐️ (แก้ไข) เรียกใช้ Function buildFormData
      const formData = buildFormData('draft');

      // 2. ส่ง Request แบบ multipart/form-data
      await axios.post(
          `http://localhost:3000/api/claims/save/${id}`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
      );

      setLastSaved(new Date());

      alert('บันทึกแบบร่างสำเร็จ');

      // ⭐️ (สำคัญ) โหลดหน้าซ้ำหลังจากบันทึกสำเร็จ
      window.location.reload();

    } catch (err) {
      console.error('Save draft failed:', err);
      alert('บันทึกแบบร่างไม่สำเร็จ');
    } finally {
      setSaving(false);
    }
  };

  // ⭐️⭐️⭐️ (แก้ไข) ⭐️⭐️⭐️
  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // ✅ (Logic เดิม) เช็คว่าเกินวงเงินหรือไม่
    const insuranceCoverage = claim?.vehicle?.insuranceCoverage || 0;
    const totalCost = calculateTotalCost; // (ดึงจาก useMemo)

    if (totalCost > insuranceCoverage) {
      // (ถ้าเกิน ➔ แสดง modal ยืนยัน)
      setShowExceedBudgetModal(true);
      // (หยุดการ submit ปกติ)
      return;
    }

    // (ถ้าไม่เกิน ➔ submit ปกติ)
    await submitClaimData();
  };

  // ⭐️⭐️⭐️ (เพิ่ม Function ใหม่) ⭐️⭐️⭐️
  // (Function สำหรับการ Submit จริง)
  const submitClaimData = async () => {
    try {
      setSaving(true);
      setSubmitType('submit');

      // 1. ⭐️ (แก้ไข) เรียกใช้ Function buildFormData
      const formData = buildFormData('submit');

      // 2. ส่ง Request แบบ multipart/form-data
      await axios.post(
          `http://localhost:3000/api/claims/save/${id}`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
      );

      setShowSuccessModal(true);

    } catch (err) {
      console.error('Submit failed:', err);
      alert('ส่งออกไม่สำเร็จ');
    } finally {
      setSaving(false);
    }
  }


  const handleExportPDF = () => {
    // placeholder
    console.log('Export PDF for claim:', id);
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    navigate('/insurance');
  };

  // ====== UI เดิมทั้งหมดด้านล่าง — ไม่แก้ layout/คลาส/โครง DOM ======
  // (isUploading ถูกลบออกจาก <button> (บรรทัด 724, 741) เพราะเราไม่อัปโหลดทันที)

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

  const totalCost = calculateTotalCost;
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
            {/* ✅ [เพิ่ม] ส่วนที่ 1: เลขกรมธรรม์ */}
            <div>
              <p className="text-xs text-neutral-500 mb-1">เลขกรมธรรม์</p>
              <p className="font-medium text-neutral-dark">
                {/* (ใช้ '?' เพื่อป้องกัน error หาก 'vehicle' หรือ 'policyNumber' ไม่มีข้อมูล) */}
                {claim.vehicle?.policyNumber || '-'}
              </p>
            </div>
            {/* ✅ [เพิ่ม] ส่วนที่ 2: ประเภทประกัน */}
            <div>
              <p className="text-xs text-neutral-500 mb-1">ประเภทประกัน</p>
              <p className="font-medium text-neutral-dark">
                ชั้น {claim.vehicle?.insuranceClass || 'N/A'}
              </p>
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
                <span>อัปโหลดรูปภาพความเสียหายและเอกสารประกอบ</span>
              </h2>

              {/* ใช้ FileUpload ตัวเดิม แต่เราจะผูก onChange -> upload-temp + push เข้า images */}
              <FileUpload
                  withDetails={true}
                  accept="image/*"
                  multiple
                  files={images}
                  onUpdateFiles={setImages}
                  error={errors.images}
                  claimId={claim.id} // ⬅️ ⭐️ ต้องส่ง ID ของเคสไปด้วย
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
                      disabled
                  />

                  <Input
                      label="เวลาตรวจสอบ"
                      name="inspectionTime"
                      type="time"
                      value={reportData.inspectionTime}
                      onChange={handleChange}
                      icon="schedule"
                      required
                      disabled
                  />
                </div>

                <TextArea
                    label="รายละเอียดเหตุการณ์และความเสียหาย"
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
                                  min="0" // ⭐️ 1. ป้องกันค่าติดลบ
                                  step="any" // ⭐️ 2. อนุญาตทศนิยม
                                  // ⭐️ 3. ดักจับการพิมพ์ 'e', '+', '-'
                                  onKeyDown={(e) => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault()}
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

                    {/* สรุปค่าใช้จ่าย */}
                    <div className="space-y-2">
                      {/* วงเงินประกัน */}
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-neutral-600">วงเงินประกัน</span>
                        <span className="font-semibold text-primary-600">
                      ฿{(claim?.vehicle?.insuranceCoverage || 0).toLocaleString()}
                    </span>
                      </div>

                      {/* ประเมินค่าใช้จ่ายโดยรวม */}
                      <div className="flex justify-between items-center p-4 bg-primary-50 rounded-lg border-2 border-primary-200">
                        <span className="font-semibold text-neutral-dark">ประเมินค่าใช้จ่ายโดยรวม</span>
                        <span className="text-2xl font-bold text-primary-600">฿{totalCost.toLocaleString()}</span>
                      </div>

                      {/* ค่าใช้จ่ายเพิ่มเติม (ถ้าเกิน) */}
                      {totalCost > (claim?.vehicle?.insuranceCoverage || 0) && (
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-error">ค่าใช้จ่ายเพิ่มเติม (เกินวงเงิน)</span>
                            <span className="font-bold text-error text-lg">
                        ฿{(totalCost - (claim?.vehicle?.insuranceCoverage || 0)).toLocaleString()}
                      </span>
                          </div>
                      )}
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
                      disabled={saving} // ⭐️ ลบ isUploading
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
                      disabled={saving} // ⭐️ ลบ isUploading
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

        {/* ✅ Modal แจ้งเตือนเกินวงเงิน */}
        {showExceedBudgetModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl p-8 max-w-md w-full">
                <div className="text-center">
                  <div className="w-20 h-20 bg-warning/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-icons-round text-5xl text-warning">
                  warning
                </span>
                  </div>

                  <h2 className="text-2xl font-bold mb-2 text-neutral-dark">
                    เกินวงเงินประกัน
                  </h2>

                  <div className="bg-neutral-50 p-4 rounded-lg mb-4 text-left">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-neutral-600">ค่าซ่อมประเมิน</span>
                        <span className="font-bold text-neutral-dark">
                      ฿{totalCost.toLocaleString()}
                    </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-600">วงเงินคุ้มครอง</span>
                        <span className="font-bold text-primary-600">
                      ฿{(claim?.vehicle?.insuranceCoverage || 0).toLocaleString()}
                    </span>
                      </div>
                      <div className="border-t border-neutral-200 pt-2 flex justify-between">
                        <span className="text-error font-medium">ส่วนเกิน</span>
                        <span className="font-bold text-error text-lg">
                      ฿{(totalCost - (claim?.vehicle?.insuranceCoverage || 0)).toLocaleString()}
                    </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-neutral-600 mb-6">
                    รอลูกค้ายอมรับความยินยอม<br />
                    รับผิดชอบส่วนเกินวงเงิน
                  </p>

                  <div className="flex gap-3">
                    <button
                        onClick={() => setShowExceedBudgetModal(false)}
                        className="btn-outline flex-1"
                    >
                      ยกเลิก
                    </button>
                    <button
                        onClick={async () => {
                          // ⭐️ (แก้ไข) ให้กดปุ่มนี้แล้ว Submit จริง
                          setShowExceedBudgetModal(false);
                          await submitClaimData(); // ⭐️ เรียกใช้ Function Submit จริง
                        }}
                        className="btn-primary flex-1"
                    >
                      ส่งให้ลูกค้าอนุมัติ
                    </button>
                  </div>
                </div>
              </div>
            </div>
        )}
      </div>
  );
};

export default ClaimDetail;