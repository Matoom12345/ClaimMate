// นำเข้า components ที่ใช้
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardBody, Badge, Button, Modal, StatusBadge } from '../../components';
import { format } from 'date-fns';

/**
 * GaragePending - หน้ารายการขอเข้าซ่อม
 * Features:
 * 1. แสดงรายการเคลมที่รอยืนยัน (API Integration)
 * 2. การ์ดสวยงาม แสดงข้อมูลครบถ้วน
 * 3. Modal ดูรายละเอียดใบเคลม
 * 4. ปุ่มรับงาน/ปฏิเสธ พร้อม Confirmation Modal
 */
const GaragePending = () => {
  // ===== State Management =====
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Modal States
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  // Detail Modal States
  const [detailLoading, setDetailLoading] = useState(false);
  const [claimDetail, setClaimDetail] = useState(null);

  // ===== useEffect: โหลดข้อมูลครั้งแรก =====
  useEffect(() => {
    fetchPendingJobs();
  }, []);

  // ===== Function: ดึงข้อมูลรายการขอเข้าซ่อม =====
  const fetchPendingJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('ไม่พบ Token, กรุณาล็อกอินใหม่');
      }

      const response = await axios.get(
        'http://localhost:3000/api/garages/pending-requests',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setClaims(response.data);
    } catch (err) {
      console.error('เกิดข้อผิดพลาดในการดึงข้อมูล:', err);
      setError(err.response?.data?.message || err.message || 'ไม่สามารถดึงข้อมูลได้');
    } finally {
      setLoading(false);
    }
  };

  // ===== Function: ดูรายละเอียดใบเคลม =====
  const handleViewDetail = async (job) => {
    setDetailLoading(true);
    setShowDetailModal(true);
    
    try {
      const token = localStorage.getItem('token');
      const claimId = job.Claim?.claimNumber || job.Claim?.id;
      
      // ดึงข้อมูลเต็มจาก API (ใช้ endpoint เดียวกับลูกค้า)
      const [detailRes, fullDetailRes] = await Promise.all([
        axios.get(`http://localhost:3000/api/claims/detail/${claimId}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`http://localhost:3000/api/claims/full-detail/${claimId}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      if (!detailRes.data.claim) {
        throw new Error('ไม่พบข้อมูลเคลม');
      }

      const c = detailRes.data.claim;
      const fullData = fullDetailRes.data || {};
      const rawPhotos = fullData.photos || [];
      const rawRepairItems = fullData.repairItems || [];

      // สร้างข้อมูลรถยนต์
      const vehicle = {
        brand: c.carBrand || "",
        model: c.carModel || "",
        color: c.carColor || "",
        year: c.carYear,
        licensePlate: c.licensePlate || "",
        chassisNumber: c.engineID || "",
      };

      // สร้างข้อมูลอู่ (ถ้ามี)
      const garage = c.garageName
        ? {
            name: c.garageName,
            phone: c.garagePhone,
            email: c.garageEmail,
            address: c.garageAddress,
            googleMapsUrl: c.googleMapsUrl
          }
        : null;

      // สร้างข้อมูลเจ้าหน้าที่
      const assignedOfficer = {
        name: (c.insuranceFirstName || "") + " " + (c.insuranceLastName || ""),
        phone: c.insurancePhone || "",
        email: c.insuranceEmail || ""
      };

      // Timeline
      const timeline = {
        reportedDate: c.reportedDate || "",
        inspectionDate: c.inspectionDate || "",
        approvalDate: c.approvalDate || "",
        garageSelectedDate: c.garageSelectedDate || "",
        repairStartDate: c.repairStartDate || "",
        completedDate: c.completedDate || "",
      };

      // รูปภาพ
      const images = rawPhotos.map(p => ({
        id: p._id,
        url: p.photoUrl,
        caption: p.caption || '',
        type: p.type || 'damage'
      }));

      // รายการซ่อม
      const items = rawRepairItems.map(item => ({
        id: item._id,
        name: item.itemName,
        cost: item.cost || 0
      }));

      setClaimDetail({
        id: c.id,
        claimNumber: c.claimNumber,
        detail: c.detail,
        location: c.location,
        status: c.state,
        currentStep: c.currentStep,
        incidentDate: c.incidentDate,
        estimatedCost: c.estimatedCost || 0,
        approvedAmount: c.approvedCost || 0,
        vehicle,
        garage,
        timeline,
        assignedOfficer,
        images,
        repairItems: items
      });

    } catch (err) {
      console.error('Error loading claim detail:', err);
      alert('ไม่สามารถโหลดรายละเอียดได้');
      setShowDetailModal(false);
    } finally {
      setDetailLoading(false);
    }
  };

  // ===== Function: รับงาน =====
  const handleAcceptClaim = async () => {
    if (!selectedClaim) return;

    setSubmitting(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('ไม่พบ Token');

      await axios.post(
        `http://localhost:3000/api/garages/requests/${selectedClaim.id}/accept`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // สำเร็จ: เอารายการออกจาก list
      setClaims((prevJobs) =>
        prevJobs.filter((job) => job.id !== selectedClaim.id)
      );
      setShowAcceptModal(false);
      setSelectedClaim(null);
      alert('รับงานเรียบร้อยแล้ว!');

    } catch (err) {
      console.error('Error accepting job:', err);
      setError(err.response?.data?.message || 'เกิดข้อผิดพลาดในการรับงาน');
    } finally {
      setSubmitting(false);
    }
  };

  // ===== Function: ปฏิเสธงาน =====
  const handleRejectClaim = async () => {
    if (!selectedClaim) return;

    setSubmitting(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('ไม่พบ Token');

      await axios.post(
        `http://localhost:3000/api/garages/requests/${selectedClaim.id}/reject`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // สำเร็จ: เอารายการออกจาก list
      setClaims((prevJobs) =>
        prevJobs.filter((job) => job.id !== selectedClaim.id)
      );
      setShowRejectModal(false);
      setSelectedClaim(null);
      alert('ปฏิเสธงานเรียบร้อยแล้ว');

    } catch (err) {
      console.error('Error rejecting job:', err);
      setError(err.response?.data?.message || 'เกิดข้อผิดพลาดในการปฏิเสธงาน');
    } finally {
      setSubmitting(false);
    }
  };

  // ===== Modal Handlers =====
  const handleShowAcceptModal = (claim) => {
    setSelectedClaim(claim);
    setShowAcceptModal(true);
  };

  const handleShowRejectModal = (claim) => {
    setSelectedClaim(claim);
    setShowRejectModal(true);
  };

  // ===== Render: Loading State =====
  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-neutral-dark mb-2">
            รายการขอเข้าซ่อม
          </h1>
          <p className="text-neutral-500">กำลังโหลดข้อมูล...</p>
        </div>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <span className="material-icons-round animate-spin text-6xl text-primary-500 mb-4">refresh</span>
            <p className="text-neutral-500">กำลังโหลดรายการขอเข้าซ่อม...</p>
          </div>
        </div>
      </div>
    );
  }

  // ===== Render: Error State =====
  if (error && claims.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-neutral-dark mb-2">
            รายการขอเข้าซ่อม
          </h1>
          <p className="text-neutral-500">เกิดข้อผิดพลาด</p>
        </div>
        <div className="card-static bg-error/10 border border-error">
          <div className="text-center py-12">
            <span className="material-icons-round text-6xl text-error mb-4">error_outline</span>
            <p className="text-error font-semibold mb-2">เกิดข้อผิดพลาด</p>
            <p className="text-neutral-600 mb-4">{error}</p>
            <Button onClick={fetchPendingJobs} variant="primary">
              <span className="material-icons-round mr-2">refresh</span>
              ลองใหม่อีกครั้ง
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ===== Render: Main Content =====
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-neutral-dark mb-2">
          รายการขอเข้าซ่อม
        </h1>
        <p className="text-neutral-500">
          งานซ่อมที่รอการยืนยันจากอู่ ({claims.length} รายการ)
        </p>
      </div>

      {/* Error Alert (ถ้าเกิดขณะทำ action) */}
      {error && submitting && (
        <div className="card-static bg-error/10 border border-error">
          <div className="flex items-center gap-3">
            <span className="material-icons-round text-error">error</span>
            <p className="text-error">{error}</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {claims.length === 0 ? (
        <div className="card-static text-center py-16">
          <span className="material-icons-round text-6xl text-neutral-300 mb-4">
            inbox
          </span>
          <p className="text-neutral-500 text-lg mb-2">
            ไม่มีงานที่รอดำเนินการ
          </p>
          <p className="text-neutral-400 text-sm">
            เมื่อมีลูกค้าเลือกอู่ของคุณ รายการจะปรากฏที่นี่
          </p>
        </div>
      ) : (
        // Cards List
        <div className="space-y-4">
          {claims.map((job) => (
            <div
              key={job.id}
              className="card hover:shadow-card-hover transition-all duration-300"
            >
              <div className="flex flex-col lg:flex-row gap-6">
                {/* ส่วนซ้าย: ข้อมูลหลัก */}
                <div className="flex-1 space-y-4">
                  {/* Header: ข้อมูลรถ + Badge */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-xl bg-warning/20 flex items-center justify-center">
                        <span className="material-icons-round text-2xl text-warning">
                          directions_car
                        </span>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-neutral-dark">
                          {job.Claim?.Car?.brand} {job.Claim?.Car?.model}
                        </h3>
                        <p className="text-sm text-neutral-500">
                          {job.Claim?.Car?.color} • ปี {job.Claim?.Car?.year}
                        </p>
                      </div>
                    </div>
                    <Badge variant="warning" size="lg">
                      <span className="material-icons-round text-sm mr-1">pending</span>
                      รอดำเนินการ
                    </Badge>
                  </div>

                  {/* ข้อมูลเพิ่มเติม */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="material-icons-round text-neutral-400 text-lg">badge</span>
                      <div>
                        <p className="text-neutral-500 text-xs">เลขทะเบียน</p>
                        <p className="font-semibold text-neutral-dark">
                          {job.Claim?.Car?.licensePlate || 'N/A'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <span className="material-icons-round text-neutral-400 text-lg">person</span>
                      <div>
                        <p className="text-neutral-500 text-xs">ลูกค้า</p>
                        <p className="font-semibold text-neutral-dark">
                          {job.Claim?.Customer?.User?.firstName || ''} {job.Claim?.Customer?.User?.lastName || 'N/A'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <span className="material-icons-round text-neutral-400 text-lg">event</span>
                      <div>
                        <p className="text-neutral-500 text-xs">วันที่แจ้งเรื่อง</p>
                        <p className="font-semibold text-neutral-dark">
                          {job.createdAt
                            ? format(new Date(job.createdAt), 'dd/MM/yyyy HH:mm')
                            : 'N/A'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <span className="material-icons-round text-neutral-400 text-lg">assignment</span>
                      <div>
                        <p className="text-neutral-500 text-xs">เลขเคส</p>
                        <p className="font-semibold text-neutral-dark">
                          {job.Claim?.claimNumber || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* รายละเอียดเหตุการณ์ (ถ้ามี) */}
                  {job.Claim?.detail && (
                    <div className="pt-4 border-t border-neutral-200">
                      <p className="text-sm text-neutral-500 mb-1">รายละเอียดเหตุการณ์</p>
                      <p className="text-neutral-700 line-clamp-2">
                        {job.Claim.detail}
                      </p>
                    </div>
                  )}
                </div>

                {/* ส่วนขวา: ปุ่ม Actions */}
                <div className="flex lg:flex-col gap-3 justify-end lg:justify-center lg:w-48">
                  <button
                    onClick={() => handleViewDetail(job)}
                    className="btn-outline flex-1 lg:flex-none flex items-center justify-center gap-2"
                  >
                    <span className="material-icons-round text-lg">visibility</span>
                    <span className="hidden sm:inline">ดูรายละเอียด</span>
                  </button>

                  <button
                    onClick={() => handleShowAcceptModal(job)}
                    className="btn-primary flex-1 lg:flex-none flex items-center justify-center gap-2 bg-success hover:bg-success/90"
                  >
                    <span className="material-icons-round text-lg">check_circle</span>
                    <span className="hidden sm:inline">รับงาน</span>
                  </button>

                  <button
                    onClick={() => handleShowRejectModal(job)}
                    className="btn-outline !border-error !text-error hover:!bg-error hover:!text-white flex-1 lg:flex-none flex items-center justify-center gap-2"
                  >
                    <span className="material-icons-round text-lg">cancel</span>
                    <span className="hidden sm:inline">ปฏิเสธ</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ===== Modal: ดูรายละเอียด ===== */}
      {showDetailModal && (
        <Modal
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setClaimDetail(null);
          }}
          title="รายละเอียดใบเคลม"
          size="xl"
        >
          {detailLoading ? (
            <div className="text-center py-12">
              <span className="material-icons-round animate-spin text-6xl text-primary-500 mb-4">refresh</span>
              <p className="text-neutral-500">กำลังโหลดรายละเอียด...</p>
            </div>
          ) : claimDetail ? (
            <div className="space-y-6 max-h-[70vh] overflow-y-auto">
              {/* ข้อมูลเคลม */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-neutral-dark">
                      เคสเลขที่: {claimDetail.claimNumber}
                    </h3>
                    <StatusBadge status={claimDetail.status} size="md" />
                  </div>
                </div>

                {/* ข้อมูลรถยนต์ */}
                <div className="card-static bg-neutral-50">
                  <h4 className="font-semibold text-neutral-dark mb-3 flex items-center gap-2">
                    <span className="material-icons-round text-primary-500">directions_car</span>
                    ข้อมูลรถยนต์
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-neutral-500">ยี่ห้อ/รุ่น</p>
                      <p className="font-medium text-neutral-dark">
                        {claimDetail.vehicle.brand} {claimDetail.vehicle.model}
                      </p>
                    </div>
                    <div>
                      <p className="text-neutral-500">ทะเบียน</p>
                      <p className="font-medium text-neutral-dark">{claimDetail.vehicle.licensePlate}</p>
                    </div>
                    <div>
                      <p className="text-neutral-500">สี</p>
                      <p className="font-medium text-neutral-dark">{claimDetail.vehicle.color}</p>
                    </div>
                    <div>
                      <p className="text-neutral-500">ปี</p>
                      <p className="font-medium text-neutral-dark">{claimDetail.vehicle.year}</p>
                    </div>
                  </div>
                </div>

                {/* รายละเอียดเหตุการณ์ */}
                <div className="card-static bg-neutral-50">
                  <h4 className="font-semibold text-neutral-dark mb-3 flex items-center gap-2">
                    <span className="material-icons-round text-primary-500">description</span>
                    รายละเอียดเหตุการณ์
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <p className="text-neutral-500">สถานที่เกิดเหตุ</p>
                      <p className="font-medium text-neutral-dark">{claimDetail.location}</p>
                    </div>
                    <div>
                      <p className="text-neutral-500">รายละเอียด</p>
                      <p className="font-medium text-neutral-dark">{claimDetail.detail}</p>
                    </div>
                    <div>
                      <p className="text-neutral-500">วันที่เกิดเหตุ</p>
                      <p className="font-medium text-neutral-dark">
                        {claimDetail.incidentDate ? format(new Date(claimDetail.incidentDate), 'dd/MM/yyyy HH:mm') : '-'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* รูปภาพความเสียหาย */}
                {claimDetail.images && claimDetail.images.length > 0 && (
                  <div className="card-static bg-neutral-50">
                    <h4 className="font-semibold text-neutral-dark mb-3 flex items-center gap-2">
                      <span className="material-icons-round text-primary-500">photo_library</span>
                      รูปภาพความเสียหาย ({claimDetail.images.length})
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {claimDetail.images.map((image) => (
                        <div key={image.id} className="group relative aspect-video rounded-lg overflow-hidden border border-neutral-200">
                          <img
                            src={image.url}
                            alt={image.caption}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                            <p className="text-white text-xs line-clamp-1">{image.caption}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* รายการซ่อม */}
                {claimDetail.repairItems && claimDetail.repairItems.length > 0 && (
                  <div className="card-static bg-neutral-50">
                    <h4 className="font-semibold text-neutral-dark mb-3 flex items-center gap-2">
                      <span className="material-icons-round text-primary-500">build</span>
                      รายการซ่อม
                    </h4>
                    <div className="space-y-2">
                      {claimDetail.repairItems.map((item, index) => (
                        <div key={item.id} className="flex justify-between items-center p-3 bg-white rounded-lg">
                          <div>
                            <p className="text-xs text-neutral-500">รายการที่ {index + 1}</p>
                            <p className="font-medium text-neutral-dark">{item.name}</p>
                          </div>
                          <p className="font-semibold text-primary-600">
                            ฿{item.cost.toLocaleString()}
                          </p>
                        </div>
                      ))}
                      <div className="flex justify-between items-center p-3 bg-primary-50 rounded-lg font-semibold">
                        <span className="text-primary-700">รวมทั้งหมด</span>
                        <span className="text-primary-700 text-lg">
                          ฿{claimDetail.repairItems.reduce((sum, item) => sum + item.cost, 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* ข้อมูลเจ้าหน้าที่ */}
                <div className="card-static bg-neutral-50">
                  <h4 className="font-semibold text-neutral-dark mb-3 flex items-center gap-2">
                    <span className="material-icons-round text-primary-500">support_agent</span>
                    เจ้าหน้าที่ผู้รับผิดชอบ
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="text-neutral-500">ชื่อ:</span>{' '}
                      <span className="font-medium text-neutral-dark">{claimDetail.assignedOfficer.name}</span>
                    </p>
                    <p>
                      <span className="text-neutral-500">โทร:</span>{' '}
                      <a href={`tel:${claimDetail.assignedOfficer.phone}`} className="font-medium text-primary-600 hover:underline">
                        {claimDetail.assignedOfficer.phone}
                      </a>
                    </p>
                    <p>
                      <span className="text-neutral-500">อีเมล:</span>{' '}
                      <a href={`mailto:${claimDetail.assignedOfficer.email}`} className="font-medium text-primary-600 hover:underline">
                        {claimDetail.assignedOfficer.email}
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <span className="material-icons-round text-6xl text-neutral-300 mb-4">error_outline</span>
              <p className="text-neutral-500">ไม่สามารถโหลดข้อมูลได้</p>
            </div>
          )}
        </Modal>
      )}

      {/* ===== Modal: ยืนยันรับงาน ===== */}
      <Modal
        isOpen={showAcceptModal}
        onClose={() => setShowAcceptModal(false)}
        title="ยืนยันการรับงาน"
        size="md"
      >
        {selectedClaim && (
          <div className="space-y-4">
            <div className="p-4 bg-success/10 rounded-lg border border-success/30">
              <p className="text-sm text-neutral-700 mb-2">
                <span className="font-semibold">เคส:</span> {selectedClaim.Claim?.claimNumber}
              </p>
              <p className="text-sm text-neutral-700 mb-2">
                <span className="font-semibold">รถยนต์:</span> {selectedClaim.Claim?.Car?.brand} {selectedClaim.Claim?.Car?.model}
              </p>
              <p className="text-sm text-neutral-700">
                <span className="font-semibold">ลูกค้า:</span> {selectedClaim.Claim?.Customer?.User?.firstName} {selectedClaim.Claim?.Customer?.User?.lastName}
              </p>
            </div>

            {error && !submitting && (
              <div className="p-3 bg-error/10 rounded-lg border border-error">
                <p className="text-sm text-error">{error}</p>
              </div>
            )}

            <p className="text-neutral-600">
              คุณต้องการยืนยันรับงานซ่อมนี้หรือไม่?
              <br />
              <span className="text-sm text-neutral-500">
                เมื่อคุณยืนยันรับซ่อม ลูกค้าจะนำรถเข้าไปที่อู่ภายใน 3 วัน
              </span>
            </p>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setShowAcceptModal(false)}
                disabled={submitting}
                className="btn-ghost flex-1"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleAcceptClaim}
                disabled={submitting}
                className="btn-primary flex-1 bg-success hover:bg-success/90"
              >
                <span className="material-icons-round mr-2">check_circle</span>
                {submitting ? 'กำลังยืนยัน...' : 'ยืนยันรับงาน'}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ===== Modal: ยืนยันปฏิเสธ ===== */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        title="ปฏิเสธงาน"
        size="md"
      >
        {selectedClaim && (
          <div className="space-y-4">
            <div className="p-4 bg-error/10 rounded-lg border border-error/30">
              <p className="text-sm text-neutral-700 mb-2">
                <span className="font-semibold">เคส:</span> {selectedClaim.Claim?.claimNumber}
              </p>
              <p className="text-sm text-neutral-700">
                <span className="font-semibold">รถยนต์:</span> {selectedClaim.Claim?.Car?.brand} {selectedClaim.Claim?.Car?.model}
              </p>
            </div>

            {error && !submitting && (
              <div className="p-3 bg-error/10 rounded-lg border border-error">
                <p className="text-sm text-error">{error}</p>
              </div>
            )}

            <p className="text-neutral-600">
              คุณต้องการปฏิเสธงานซ่อมนี้ใช่หรือไม่?
              <br />
              <span className="text-sm text-neutral-500">
                ลูกค้าจะได้รับการแจ้งเตือนและสามารถเลือกอู่อื่นได้
              </span>
            </p>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setShowRejectModal(false)}
                disabled={submitting}
                className="btn-ghost flex-1"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleRejectClaim}
                disabled={submitting}
                className="btn-primary flex-1 !bg-error hover:!bg-error/90"
              >
                <span className="material-icons-round mr-2">cancel</span>
                {submitting ? 'กำลังปฏิเสธ...' : 'ยืนยันปฏิเสธ'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default GaragePending;