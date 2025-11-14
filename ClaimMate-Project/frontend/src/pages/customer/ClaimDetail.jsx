import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { ClaimTimeline, StatusBadge, Modal } from "../../components";

const ClaimDetail = () => {
  const { id } = useParams(); // ✅ id = claimNumber
  const [loading, setLoading] = useState(true);
  const [claim, setClaim] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);

  // ✅ ข้อ 5: State สำหรับจัดการ Modal ปฏิเสธรายการ
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [repairItems, setRepairItems] = useState([]);

  // ✅ Priority Badge Helper (ข้อ 1: แสดง priority แทน title)
  const getPriorityBadge = (priority) => {
    const config = {
      urgent: { label: 'ด่วนมาก', color: 'error', icon: 'priority_high' },
      high: { label: 'ด่วน', color: 'warning', icon: 'arrow_upward' },
      normal: { label: 'ปกติ', color: 'neutral', icon: 'remove' },
    };
    const { label, color, icon } = config[priority] || config.normal;

    return (
      <span className={`badge badge-${color} badge-sm flex items-center gap-1`}>
        <span className="material-icons-round text-xs">{icon}</span>
        {label}
      </span>
    );
  };

  useEffect(() => {
    loadClaimData();
  }, [id]);

  // ⭐️ (เพิ่ม) Function สำหรับแปลง DB State เป็น UI Step (ที่ Timeline/GarageDisplay คาดหวัง)
  const mapStateToStep = (state) => {
    const mapping = {
      'open_case': 'reported',        // Maps to reportedDate
      'survey': 'inspected',        // Maps to inspectionDate
      'approved': 'approved',         // Maps to approvalDate
      'garage_selected': 'garage_selected', // Maps to garageSelectedDate
      'repair': 'repair',             // Maps to repairStartDate (ต้องเช็คชื่อใน Component Timeline)
      'completed': 'completed'        // Maps to completedDate
    };
    // ⭐️ (ปรับ) ถ้า ClaimTimeline ของคุณใช้ key 'repair_in_progress' ให้แก้ตรงนี้
    if (state === 'repair') return 'repair';
    return mapping[state] || 'reported'; // Default
  };


  const loadClaimData = async () => {
    try {
      // ⭐️ 1. ดึงข้อมูลจาก 2 endpoints พร้อมกัน
      const [detailRes, fullDetailRes] = await Promise.all([
        axios.get(`http://localhost:3000/api/claims/detail/${id}`),
        axios.get(`http://localhost:3000/api/claims/full-detail/${id}`)
      ]);


      // ⭐️ 2. ใช้ข้อมูลจาก /detail/ (เหมือนเดิม)
      if (!detailRes.data.claim) {
        setClaim(null);
        setLoading(false);
        return;
      }
      const c = detailRes.data.claim; // 'c' คือข้อมูลที่ join แล้ว

      // ⭐️ 3. ดึงข้อมูล photos และ repairItems จาก /full-detail/
      const fullData = fullDetailRes.data || {};
      const rawClaim = fullData.claim || {}; // ข้อมูล Claim ดิบ
      const rawPhotos = fullData.photos || [];
      const rawRepairItems = fullData.repairItems || [];


      // ✅ สร้าง vehicle object ให้ UI ใช้เหมือน mock (ใช้ข้อมูลจาก 'c' เหมือนเดิม)
      const vehicle = {
        brand: c.carBrand || "",
        model: c.carModel || "",
        color: c.carColor || "",
        year: c.carYear,
        licensePlate: c.licensePlate || "",
        chassisNumber: c.engineID || "",
      };

      // ✅ garage object (ถ้ามี) (ใช้ข้อมูลจาก 'c' เหมือนเดิม)
      const garage = c.garageName
        ? {
          name: c.garageName,
          phone: c.garagePhone,
          email: c.garageEmail,
          address: "-",
          distance: "-",
        }
        : null;

      // ✅ assigned officer จาก backend (ใช้ข้อมูลจาก 'c' เหมือนเดิม)
      const assignedOfficer = {
        name: c.insuranceFirstName + " " + c.insuranceLastName || "",
        phone: c.insurancePhone || "",
        email: c.insuranceEmail || ""
      };

      // ✅ timeline mapping (ใช้ข้อมูลจาก 'c' เหมือนเดิม)
      const timeline = {
        reportedDate: c.reportedDate || "",
        inspectionDate: c.inspectionDate || "",
        approvalDate: c.approvalDate || "",
        garageSelectedDate: c.garageSelectedDate || "",
        repairStartDate: c.repairStartDate || "",
        completedDate: c.completedDate || "",
      };

      // ⭐️ 4. แปลง 'rawPhotos' (จาก DB) ให้เป็น 'images' (ที่ UI ใช้)
      const images = rawPhotos.map(p => ({
        id: p._id,
        url: p.photoURL, // ⭐️Backend ส่งมาเป็น photoURL
        caption: p.caption || '',
        type: p.type || 'damage'
      }));

      // ⭐️ 5. แปลง 'rawRepairItems' (จาก DB) ให้เป็น 'items' (ที่ UI ใช้)
      const items = rawRepairItems.map(item => ({
        id: item._id,
        name: item.type, // ⭐️ Backend เก็บชื่อรายการซ่อมไว้ใน field 'type'
        cost: item.cost || 0
      }));

      setRepairItems(items); // ⭐️ อัปเดต State รายการซ่อม

      // ⭐️ 6. (ย้ายมาคำนวณก่อน)
      const totalRepairCost = items.reduce((sum, item) => sum + item.cost, 0);
      const insuranceCoverage = rawClaim.insuranceBalance || 25000;
      const extraCost = Math.max(0, totalRepairCost - insuranceCoverage);

      // ⭐️ 7. (แก้ไข) Map state 'survey' (DB) ไปเป็น 'inspected' (UI)
      const uiStep = mapStateToStep(c.state);

      // ⭐️ 8. (แก้ไข) กำหนดว่า 'เกินงบ' หรือไม่
      // (จะแสดงปุ่มใน Sidebar ต่อเมื่อ state เป็น 'survey' และมี 'extraCost')
      const exceedsBudget = (c.state === 'survey' && extraCost > 0);

      setClaim({
        id: c.id,
        claimNumber: c.claimNumber,
        detail: c.detail,
        location: c.location,
        status: c.state, // ⭐️ DB State (e.g., 'survey')
        currentStep: uiStep, // ⭐️ UI Step String (e.g., 'inspected')
        priority: rawClaim.priorityLevel || 'normal',

        incidentDate: c.incidentDate,
        estimatedCost: c.estimatedCost || 0,
        approvedAmount: c.approvedCost || 0,
        deductible: c.additionalCost || 0,

        insuranceCoverage: insuranceCoverage,

        vehicle,
        garage,
        timeline,
        assignedOfficer,

        images, // ⭐️ อัปเดต State รูปภาพ (ที่แปลงแล้ว)

        // ⭐️ (แก้ไข) ใช้ตัวแปร exceedsBudget ที่คำนวณไว้
        approvalFailed: false, // (ลบตรรกะเดิม)
        exceedsBudget: exceedsBudget,
      });

      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  // ✅ ข้อ 4: จัดการคลิกรูปภาพ
  const handleImageClick = (image) => {
    setSelectedImage(image);
    setShowImageModal(true);
  };

  const handleDownloadPDF = () => {
    console.log("Generate PDF Later", id);
  };

  // ✅ ข้อ 2: ตรวจสอบว่าควรแสดงอะไรในส่วนอู่ซ่อม
  const getGarageDisplay = () => {

    // ⭐️ (1) ดึง currentStep (ตัวเลข) ออกมาจาก ClaimStatus
    const step = claim?.ClaimStatus?.currentStep;

    // (ถ้ายังไม่มีข้อมูล claim หรือ step ก็ไม่ต้องแสดงอะไรเลย)
    if (!step) {
      return { show: false };
    }

    // ⭐️ (2) ขั้นตอนที่ไม่ควรแสดงอู่: 1 (เปิดเคส), 2 (สำรวจ)
    // (เราจะเริ่มแสดงผลส่วนนี้ตั้งแต่ Step 3 (approved) เป็นต้นไป)
    if (step < 3) {
      return { show: true, type: 'placeholder', message: '-' };
    }

    // ⭐️ (3) ขั้นตอนที่ 3 (approved) หรือ 4 (choose_garage)
    //    และ ยังไม่มีอู่ (claim.Garage เป็น null)
    if ((step === 3 || step === 4) && !claim.Garage) {
      return { show: true, type: 'action', message: 'เลือกอู่ซ่อม' };
    }

    // ถ้ามีอู่แล้ว (Join มาเจอ) ให้แสดงข้อมูลอู่
    // (จะเกิดขึ้นใน step 4 (หลังเลือก) หรือ 5 (repair))
    if (claim.Garage) {
      // ⭐️ (4) แก้ไข: ให้ส่งข้อมูลจาก claim.Garage (ที่เรา Join มา)
      return { show: true, type: 'info', garage: claim.Garage };
    }

    // default (กรณีอื่นๆ ที่ไม่เข้าเงื่อนไข)
    return { show: true, type: 'placeholder', message: '-' };
  };

  // ✅ ข้อ 5.1: ยืนยันรับผิดชอบส่วนเกิน
  const handleAcceptExtraCost = async () => {
    console.log('ยืนยันรับผิดชอบส่วนเกิน');

    try {
      // ⭐️ 1. เรียก Endpoint ใหม่ที่เราเพิ่งสร้างใน claimRoute.js
      await axios.post(`http://localhost:3000/api/claims/${id}/accept-extra-cost`, {
        extraCost: getExtraCost() // ⭐️ 2. ส่งค่าส่วนเกินที่คำนวณได้ไปให้ Backend
      });

      // ✅ 3. อัปเดต UI ทันที (ตามที่คุณต้องการ)
      setClaim(prev => ({
        ...prev,
        deductible: getExtraCost(),
        status: 'approved', // ⭐️ เปลี่ยน DB สถานะ
        currentStep: 'approved', // ⭐️ เปลี่ยน UI Step (สำหรับ Timeline)
        exceedsBudget: false, // ⭐️ ซ่อนปุ่ม/Card แจ้งเตือน
        approvedAmount: getTotalRepairCost() - getExtraCost(),
      }));

      alert('ยืนยันรับผิดชอบส่วนเกินสำเร็จ');

    } catch (err) {
      console.error('Accept extra cost failed:', err);
      alert('เกิดข้อผิดพลาด: ' + (err.response?.data?.message || err.message));
    }
  };

  // ✅ ข้อ 5.2: ปฏิเสธ - เปิด Modal เลือกรายการ
  const handleRejectExtraCost = () => {
    setShowRejectModal(true);
  };

  // ✅ ข้อ 5.2: ลบรายการซ่อม
  const handleDeleteRepairItem = (itemId) => {
    const updatedItems = repairItems.filter(item => item.id !== itemId);
    setRepairItems(updatedItems);
  };

  // ✅ ข้อ 5.2: คำนวณยอดรวมรายการซ่อม
  const getTotalRepairCost = () => {
    return repairItems.reduce((sum, item) => sum + item.cost, 0);
  };

  // ✅ ข้อ 5.2: คำนวณยอดที่เกินวงเงิน
  const getExtraCost = () => {
    const total = getTotalRepairCost();
    const coverage = claim?.insuranceCoverage || 0;
    return Math.max(0, total - coverage);
  };

  // ✅ ข้อ 5.2: ยืนยันการปฏิเสธรายการ
  const handleConfirmReject = async () => {
    console.log('บันทึกรายการที่ถูกลบ', repairItems);
    // TODO: Backend - บันทึกรายการใหม่ที่ลดลง
    // await axios.post(`/api/claims/${id}/update-repair-items`, { items: repairItems });
    setShowRejectModal(false);

    alert("บันทึกรายการซ่อมใหม่สำเร็จ (จำลอง)");
    setClaim(prev => ({
      ...prev,
      exceedsBudget: false,
      status: 'approved', // (สมมติว่าอนุมัติเลย)
      currentStep: 'approved', // (สมมติว่าอนุมัติเลย)
    }));
    // loadClaimData(); // (หรือจะ Reload ข้อมูลจริง)
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <span className="material-icons-round animate-spin text-6xl text-primary-500 mb-4">
            refresh
          </span>
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
        <p className="text-neutral-500 text-lg mb-4">ไม่พบข้อมูลเคลม</p>
        <Link to="/customer/claims" className="btn-primary">
          กลับไปหน้ารายการเคลม
        </Link>
      </div>
    );
  }

  const garageDisplay = getGarageDisplay();

  // ⭐️ (คำนวณค่าใช้จ่ายจาก State ที่ดึงมา)
  const totalRepairCost = getTotalRepairCost();
  const insuranceCoverage = claim.insuranceCoverage;
  const extraCost = Math.max(0, totalRepairCost - insuranceCoverage);

  return (
    <div className="space-y-6">
      {/* ✅ Header - ข้อ 1: แสดง claimNumber แทน title และแสดง priority badge */}
      <div className="flex items-start justify-between">
        <div>
          <Link
            to="/customer/claims"
            className="inline-flex items-center gap-2 text-neutral-500 hover:text-primary-500 mb-3 transition-colors duration-300"
          >
            <span className="material-icons-round">arrow_back</span>
            <span>กลับ</span>
          </Link>

          <div className="flex items-center gap-3 mb-2">
            {/* ✅ ข้อ 1: แสดง claimNumber แทน title */}
            <h1 className="text-3xl font-bold text-neutral-dark">
              {claim.claimNumber}
            </h1>
            <StatusBadge status={claim.status} />
          </div>
        </div>

        <button
          onClick={handleDownloadPDF}
          className="btn-primary flex items-center gap-2"
        >
          <span className="material-icons-round">download</span>
          <span>ดาวน์โหลด PDF</span>
        </button>
      </div>

      {/* ⭐️ (ลบ) Card "อนุมัติเคลมไม่สำเร็จ" ขนาดใหญ่ออกจากตรงนี้ */}


      {/* ✅ Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* ✅ Claim Info */}
          <div className="card-static">
            <h2 className="text-xl font-semibold text-neutral-dark mb-4 flex items-center gap-2">
              <span className="material-icons-round text-primary-500 leading-none">
                info
              </span>
              ข้อมูลการเคลม
            </h2>

            {/* ✅ ข้อ 1: ลบ "เลขที่เคลม" ออกจาก grid */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-neutral-500 mb-1">วันเกิดเหตุ</p>
                <p className="font-medium text-neutral-dark">
                  {claim.incidentDate}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-neutral-500 mb-1">สถานที่เกิดเหตุ</p>
                <p className="font-medium text-neutral-dark">
                  {claim.location}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-neutral-500 mb-1">
                  รายละเอียดเหตุการณ์
                </p>
                <p className="font-medium text-neutral-dark">
                  {claim.detail || claim.description}
                </p>
              </div>
            </div>
          </div>

          {/* ✅ Vehicle */}
          <div className="card-static">
            <h2 className="text-xl font-semibold text-neutral-dark mb-4 flex items-center gap-2">
              <span className="material-icons-round text-primary-500 leading-none">
                directions_car
              </span>
              ข้อมูลรถยนต์
            </h2>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-neutral-500 mb-1">ยี่ห้อ/รุ่น</p>
                <p className="font-medium text-neutral-dark">
                  {claim.vehicle.brand} {claim.vehicle.model} ({claim.vehicle.year})
                </p>
              </div>

              <div>
                <p className="text-sm text-neutral-500 mb-1">ทะเบียนรถ</p>
                <p className="font-medium text-neutral-dark">
                  {claim.vehicle.licensePlate}
                </p>
              </div>

              <div>
                <p className="text-sm text-neutral-500 mb-1">สี</p>
                <p className="font-medium text-neutral-dark">
                  {claim.vehicle.color}
                </p>
              </div>

              <div>
                <p className="text-sm text-neutral-500 mb-1">เลขตัวถัง</p>
                <p className="font-medium text-neutral-dark">
                  {claim.vehicle.chassisNumber}
                </p>
              </div>
            </div>
          </div>
          {/* ⭐️ ✅ ข้อ 4: รูปภาพความเสียหายและเอกสารประกอบ (ดึงจาก State 'claim.images') */}
          <div className="card-static">
            <h2 className="text-xl font-semibold text-neutral-dark mb-4 flex items-center gap-2">
              <span className="material-icons-round text-primary-500 leading-none">
                photo_library
              </span>
              รูปภาพความเสียหายและเอกสารประกอบ
            </h2>

            {!claim.images || claim.images.length === 0 ? (
              <div className="text-center py-12 bg-neutral-50 rounded-lg">
                <span className="material-icons-round text-6xl text-neutral-300 mb-3">
                  photo_library
                </span>
                <p className="text-neutral-500">ยังไม่มีรูปภาพ</p>
                <p className="text-neutral-400 text-sm mt-1">
                  รอบริษัทประกันภัยอัปโหลดรูปภาพจากการตรวจสอบพื้นที่
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {claim.images.map((image, index) => (
                  <div
                    key={image.id || index} // ⭐️ (ใช้ image.id ที่มาจาก DB)
                    className="relative group cursor-pointer"
                    onClick={() => handleImageClick(image)}
                  >
                    <div className="aspect-square rounded-lg overflow-hidden bg-neutral-100">
                      <img
                        src={image.url} // ⭐️ (UI เดิมใช้ .url)
                        alt={image.caption}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                    </div>
                    {/* ✅ ข้อ 4: แสดงชื่อรูปเมื่อ hover */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-300 rounded-lg flex items-end p-3">
                      <p className="text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        {image.caption}
                      </p>
                    </div>
                    {/* ✅ ข้อ 4: ไอคอนความเสียหาย (ไม่มีปุ่มลบ) */}
                    {/* ⭐️ (เพิ่ม Logic แสดงตาม Type) */}
                    <div className={`absolute top-2 left-2 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 ${image.type === 'document' ? 'bg-info' : 'bg-error'
                      }`}>
                      <span className="material-icons-round text-xs">
                        {image.type === 'document' ? 'description' : 'priority_high'}
                      </span>
                      {image.type === 'document' ? 'เอกสาร' : 'ความเสียหาย'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ⭐️ ✅ รายการซ่อม (Read-only สำหรับลูกค้า) (ดึงจาก State 'repairItems') */}
          <div className="card-static">
            <h2 className="text-xl font-semibold text-neutral-dark mb-4 flex items-center gap-2">
              <span className="material-icons-round text-primary-500 leading-none">
                build
              </span>
              รายการซ่อม
            </h2>

            {!repairItems || repairItems.length === 0 ? (
              <div className="text-center py-12 bg-neutral-50 rounded-lg">
                <span className="material-icons-round text-5xl text-neutral-300 mb-3">
                  construction
                </span>
                <p className="text-neutral-500">ยังไม่มีรายการซ่อม</p>
                <p className="text-neutral-400 text-sm mt-1">
                  รอบริษัทประกันภัยตรวจสอบและระบุรายการซ่อม
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-3 mb-4">
                  {repairItems.map((item, index) => (
                    <div
                      key={item.id} // ⭐️ (ใช้ item.id ที่มาจาก DB)
                      className="p-4 bg-neutral-50 rounded-lg border border-neutral-200"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-neutral-500">
                          รายการที่ {index + 1}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <div>
                          <p className="text-xs text-neutral-500 mb-1">รายการ</p>
                          <p className="font-medium text-neutral-dark">{item.name}</p>
                        </div>

                        <div>
                          <p className="text-xs text-neutral-500 mb-1">ค่าใช้จ่าย</p>
                          <p className="font-semibold text-primary-600">
                            ฿{item.cost.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* ✅ สรุปยอดเงิน */}
                <div className="space-y-2 pt-4 border-t">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-neutral-600">วงเงินประกัน</span>
                    <span className="font-semibold text-primary-600">
                      {/* ⭐️ (ใช้ insuranceCoverage จาก State) */}
                      ฿{insuranceCoverage.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-primary-50 rounded-lg">
                    <span className="text-primary-700 font-medium">ประเมินค่าใช้จ่ายโดยรวม</span>
                    <span className="font-bold text-primary-700 text-xl">
                      {/* ⭐️ (ใช้ totalRepairCost จาก State) */}
                      ฿{totalRepairCost.toLocaleString()}
                    </span>
                  </div>

                  {/* ✅ ค่าใช้จ่ายเพิ่มเติม (ถ้าเกิน) */}
                  {/* ⭐️ (ใช้ extraCost จาก State) */}
                  {extraCost > 0 && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-error">ค่าใช้จ่ายเพิ่มเติม (เกินวงเงิน)</span>
                      <span className="font-bold text-error text-lg">
                        ฿{extraCost.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>


        </div>

        {/* ✅ Sidebar */}
        <div className="space-y-6">
          {/* ✅ Cost Summary */}
          <div className="card-static">
            <h3 className="font-semibold text-neutral-dark mb-4 flex items-center gap-2">
              <span className="material-icons-round text-primary-500 leading-none">
                payments
              </span>
              สรุปค่าใช้จ่าย
            </h3>

            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-neutral-50 rounded-lg">
                <span className="text-neutral-600">ค่าซ่อมประเมิน</span>
                <span className="font-semibold text-neutral-dark">
                  {/* ⭐️ (ใช้ totalRepairCost) */}
                  ฿{totalRepairCost.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-primary-50 rounded-lg">
                <span className="text-primary-700">จำนวนเงินที่อนุมัติ</span>
                <span className="font-bold text-primary-700 text-lg">
                  {/* ⭐️ (ถ้ายังไม่อนุมัติ/เกินงบ ให้แสดง 0) */}
                  ฿{claim.status === 'approved' ? (totalRepairCost - extraCost).toLocaleString() : 0}
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-neutral-50 rounded-lg">
                <span className="text-neutral-600">ค่าใช้จ่ายเพิ่มเติม (เกินวงเงิน)</span>
                <span className="font-semibold text-neutral-dark">
                  {/* ⭐️ (ถ้ายังไม่อนุมัติ/เกินงบ ให้แสดง extraCost) */}
                  ฿{claim.status === 'approved' ? claim.deductible.toLocaleString() : extraCost.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* ⭐️ (ย้าย) Card "เกินวงเงินประกัน" มาไว้ใน Sidebar (ตาม UI เดิม) */}
          {/* ⭐️ (ใช้ claim.exceedsBudget ที่คำนวณไว้ใน loadClaimData) */}
          {claim.exceedsBudget && (
            <div className="card bg-warning-50 border-2 border-warning">
              <div className="flex items-start gap-3">
                <span className="material-icons-round text-warning text-2xl">
                  warning
                </span>
                <div className="flex-1">
                  <h3 className="font-semibold text-warning-dark mb-2">
                    เกินวงเงินประกัน
                  </h3>
                  <p className="text-neutral-700 text-sm mb-3">
                    ค่าซ่อมเกินวงเงินคุ้มครอง ฿{extraCost.toLocaleString()}
                  </p>

                  <div className="space-y-2">
                    <button
                      onClick={handleAcceptExtraCost}
                      className="btn-primary w-full text-sm"
                    >
                      <span className="material-icons-round mr-1 text-sm">check_circle</span>
                      ยืนยันรับผิดชอบส่วนเกิน
                    </button>

                    <button
                      onClick={handleRejectExtraCost}
                      className="btn-outline w-full text-sm"
                    >
                      <span className="material-icons-round mr-1 text-sm">cancel</span>
                      ปฏิเสธรายการ
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ✅ Garage Info - แสดงตาม logic ที่กำหนด */}
          {garageDisplay.show && (
            <div className="card-static">
              <h3 className="font-semibold text-neutral-dark mb-4 flex items-center gap-2">
                <span className="material-icons-round text-primary-500 leading-none">
                  build_circle
                </span>
                อู่ซ่อม
              </h3>

              {garageDisplay.type === 'placeholder' && (
                <div className="text-center py-4">
                  <p className="text-neutral-400 text-lg">{garageDisplay.message}</p>
                </div>
              )}

              {garageDisplay.type === 'action' && (
                <div className="text-center py-4">
                  <p className="text-warning font-medium mb-3">{garageDisplay.message}</p>
                  <Link
                    // ⭐️ (5) แก้ไข: Link ควรอ้างอิงด้วย claim.id (PK) ไม่ใช่ claimNumber
                    to={`/customer/select-garage/${claim.id}`}
                    className="btn-primary inline-flex items-center gap-2"
                  >
                    <span className="material-icons-round">store</span> {/* ⭐️ (แก้ไข) ใช้ icon ที่ตรงกับปุ่มด้านล่าง */}
                    ไปที่หน้าเลือกอู่ซ่อม
                  </Link>
                </div>
              )}

              {garageDisplay.type === 'info' && (
                <>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-neutral-500 mb-1">ชื่ออู่</p>
                      <p className="font-medium text-neutral-dark">
                        {/* ⭐️ (6) แก้ไข: ดึงชื่อจาก Model Garage.js */}
                        {garageDisplay.garage.garageName}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-neutral-500 mb-1">เบอร์โทร</p>
                      <a
                        // ⭐️ (7) (ต้องเช็ค Model) สมมติว่าใน Garage Model มี 'phoneNumber'
                        href={`tel:${garageDisplay.garage.phoneNumber || ''}`}
                        className="text-primary-600 hover:text-primary-700 font-medium"
                      >
                        {garageDisplay.garage.phoneNumber || 'N/A'}
                      </a>
                    </div>
                  </div>

                  {/* (ปุ่มดูแผนที่ - ต้องมี googleMapsUrl ใน Model) */}
                  <a
                    href={garageDisplay.garage.googleMapsUrl || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-outline w-full mt-4"
                  >
                    <span className="material-icons-round mr-2">map</span>
                    ดูแผนที่
                  </a>
                </>
              )}
            </div>
          )}

          {/* ✅ Assigned Officer */}
          <div className="card bg-gradient-secondary text-white">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <span className="material-icons-round leading-none">
                support_agent
              </span>
              เจ้าหน้าที่ผู้ดูแล
            </h3>

            <div className="space-y-2 text-sm mb-4">
              <p>
                <span className="opacity-80">ชื่อ:</span>{" "}
                <span className="font-medium">{claim.assignedOfficer.name}</span>
              </p>

              <p>
                <span className="opacity-80">โทร:</span>{" "}
                <a
                  href={`tel:${claim.assignedOfficer.phone}`}
                  className="font-medium hover:underline"
                >
                  {claim.assignedOfficer.phone}
                </a>
              </p>

              <p>
                <span className="opacity-80">อีเมล:</span>{" "}
                <a
                  href={`mailto:${claim.assignedOfficer.email}`}
                  className="font-medium hover:underline"
                >
                  {claim.assignedOfficer.email}
                </a>
              </p>
            </div>

            <button className="btn-outline !border-white !text-white hover:!bg-white hover:!text-secondary-600 w-full">
              <span className="material-icons-round mr-2">phone</span>
              ติดต่อเจ้าหน้าที่
            </button>
          </div>

          {/* ✅ ข้อ 3: Quick Actions - ปุ่มเลือกอู่ซ่อมมีอยู่แล้ว */}
          <div className="card">
            <h3 className="font-semibold text-neutral-dark mb-4">
              การดำเนินการด่วน
            </h3>

            <div className="space-y-2">
              {/* ✅ (8) แก้ไข: ปุ่มเลือกอู่ซ่อม (แสดงเมื่อ step 3 หรือ 4 และยังไม่มีอู่) */}
              {(claim?.ClaimStatus?.currentStep === 3 || claim?.ClaimStatus?.currentStep === 4) && !claim.Garage && (
                <Link
                  // ⭐️ (9) แก้ไข: Link ควรอ้างอิงด้วย claim.id (PK)
                  to={`/customer/select-garage/${claim.id}`}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  <span className="material-icons-round">store</span> {/* ⭐️ (แก้ไข) ใช้ icon ที่ตรงกัน */}
                  เลือกอู่ซ่อม
                </Link>
              )}

              {/* (ปุ่มขอซ่อมด่วน - คงไว้) */}
              <Link
                to="/customer/urgent-request" // (อาจจะต้องส่ง claim.id ไปด้วย)
                className="btn-outline w-full flex items-center justify-center gap-2"
              >
                <span className="material-icons-round">priority_high</span>
                ขออนุมัติซ่อมด่วน
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ ข้อ 4: Image Modal - ลูกค้าดูได้อย่างเดียว (ไม่มีปุ่มลบ) */}
      {showImageModal && selectedImage && (
        <Modal
          isOpen={showImageModal}
          onClose={() => setShowImageModal(false)}
          title={selectedImage.caption}
          size="lg"
        >
          <div className="space-y-4">
            <img
              src={selectedImage.url}
              alt={selectedImage.caption}
              className="w-full rounded-lg"
            />

            {/* แสดงรายละเอียดเพิ่มเติม */}
            <div className="bg-neutral-50 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-neutral-500 mb-1">ประเภทรูปภาพ</p>
                  <p className="font-medium text-neutral-dark">
                    {/* ⭐️ (ปรับการแสดงผล) */}
                    {selectedImage.type === 'document' ? 'เอกสาร' : 'ความเสียหาย'}
                  </p>
                </div>
                <div>
                  <p className="text-neutral-500 mb-1">ชื่อไฟล์/คำบรรยาย</p>
                  <p className="font-medium text-neutral-dark">
                    {selectedImage.caption}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* ✅ ข้อ 5.2: Modal สำหรับปฏิเสธและลบรายการซ่อม */}
      {showRejectModal && (
        <Modal
          isOpen={showRejectModal}
          onClose={() => setShowRejectModal(false)}
          title="ปฏิเสธรายการซ่อม"
          size="lg"
        >
          <div className="space-y-4">
            <div className="bg-warning-50 border border-warning p-4 rounded-lg">
              <p className="text-neutral-700 text-sm">
                กรุณาเลือกปฏิเสธบางรายการซ่อมให้อยู่ในวงเงินเพื่อดำเนินการต่อ
              </p>
            </div>

            {/* ✅ รายการซ่อม */}
            <div className="space-y-3">
              <h3 className="font-semibold text-neutral-dark flex items-center gap-2">
                <span className="material-icons-round text-primary-500">build</span>
                รายการซ่อม
              </h3>

              {repairItems.length === 0 ? (
                <p className="text-neutral-500 text-center py-8">ไม่มีรายการซ่อม</p>
              ) : (
                repairItems.map((item, index) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg border border-neutral-200 hover:border-primary-300 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="text-sm text-neutral-500 mb-1">รายการที่ {index + 1}</p>
                      <p className="font-medium text-neutral-dark">{item.name}</p>
                      <p className="text-sm text-neutral-600 mt-1">
                        ฿{item.cost.toLocaleString()}
                      </p>
                    </div>

                    {/* ✅ ข้อ 5.2: ปุ่มลบรายการ */}
                    <button
                      onClick={() => handleDeleteRepairItem(item.id)}
                      className="p-2 text-error hover:bg-error-50 rounded-lg transition-colors"
                      title="ลบรายการ"
                    >
                      <span className="material-icons-round">delete</span>
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* ✅ สรุปยอดเงิน */}
            <div className="space-y-2 pt-4 border-t">
              {/* ✅ ข้อ 5.2 (เพิ่มเติม): วงเงินประกัน */}
              <div className="flex justify-between items-center text-sm">
                <span className="text-neutral-600">วงเงินประกัน</span>
                <span className="font-semibold text-primary-600">
                  ฿{insuranceCoverage.toLocaleString()}
                </span>
              </div>

              {/* ✅ ประเมินค่าใช้จ่ายโดยรวม */}
              <div className="flex justify-between items-center p-3 bg-primary-50 rounded-lg">
                <span className="text-primary-700 font-medium">ประเมินค่าใช้จ่ายโดยรวม</span>
                <span className="font-bold text-primary-700 text-xl">
                  {/* ⭐️ (ใช้ TotalCost จาก State) */}
                  ฿{getTotalRepairCost().toLocaleString()}
                </span>
              </div>

              {/* ✅ ข้อ 5.2: ค่าใช้จ่ายเพิ่มเติม */}
              {getExtraCost() > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-error">ค่าใช้จ่ายเพิ่มเติม (เกินวงเงิน)</span>
                  <span className="font-bold text-error text-lg">
                    {/* ⭐️ (ใช้ ExtraCost จาก State) */}
                    ฿{getExtraCost().toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            {/* ✅ ปุ่มยืนยัน */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setShowRejectModal(false)}
                className="btn-ghost flex-1"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleConfirmReject}
                className="btn-primary flex-1"
                disabled={getExtraCost() > 0}
              >
                <span className="material-icons-round mr-2">check</span>
                ยืนยัน
              </button>
            </div>

            {getExtraCost() > 0 && (
              <p className="text-error text-sm text-center">
                * ยังคงเกินวงเงิน กรุณาลบรายการเพิ่มเติม
              </p>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ClaimDetail;