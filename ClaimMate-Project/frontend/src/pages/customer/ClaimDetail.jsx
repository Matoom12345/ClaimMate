import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ClaimTimeline, StatusBadge, Modal } from '../../components';

/**
 * ClaimDetail - หน้ารายละเอียดเคลมแบบเต็ม
 * * Features:
 * 1. ข้อมูลเคลมครบถ้วน
 * 2. Timeline ติดตามสถานะ
 * 3. รูปภาพเอกสารและความเสียหาย
 * 4. ดาวน์โหลดใบเคลม PDF
 * * TODO: Backend Integration
 * - GET /api/customer/claims/{id} - ดึงรายละเอียดเคลม
 * - GET /api/customer/claims/{id}/documents - ดึงเอกสาร/รูปภาพ
 * - GET /api/customer/claims/{id}/pdf - ดาวน์โหลด PDF
 */
const ClaimDetail = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [claim, setClaim] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);

  useEffect(() => {
    // TODO: Backend - ดึงรายละเอียดเคลม
    // fetchClaimDetail(id);
    
    // Mock data
    setTimeout(() => {
      setClaim({
        id: id,
        claimNumber: 'CLM-2024-001',
        title: 'ชนด้านหน้า - เขตห้วยขวาง',
        status: 'repairing',
        currentStep: 4,
        
        // ข้อมูลพื้นฐาน
        // reportDate: '2024-10-20 14:30', // ลบวันที่แจ้งเคลมออก
        incidentDate: '2024-10-20 10:00',
        location: '123 ถนนประชาราษฎร์ แขวงห้วยขวาง เขตห้วยขวาง กรุงเทพมหานคร 10310',
        description: 'ชนด้านหน้าจากรถที่วิ่งสวนทาง ความเสียหายบริเวณกันชนหน้า ไฟหน้า และฝากระโปรงหน้า',
        
        // ข้อมูลรถยนต์
        vehicle: {
          brand: 'Honda',
          model: 'City',
          year: 2020,
          licensePlate: 'กข 1234 กรุงเทพ',
          color: 'ขาว',
          chassisNumber: 'JHMC12345678',
        },
        
        // ข้อมูลการเคลม
        policyNumber: 'POL-2024-001234',
        coverage: 'ประกันภัยชั้น 1',
        estimatedCost: 25000,
        approvedAmount: 25000,
        deductible: 0,
        
        // อู่ซ่อม
        garage: {
          name: 'อู่สมชาย ห้วยขวาง',
          address: '456 ถนนรัชดาภิเษก แขวงห้วยขวาง เขตห้วยขวาง กรุงเทพมหานคร',
          phone: '02-123-4567',
          distance: '2.5 km',
        },
        
        // รูปภาพ
        images: [
          { id: 1, url: 'https://via.placeholder.com/400x300?text=Front+Damage+1', type: 'damage', caption: 'ความเสียหายด้านหน้า มุม 1' },
          { id: 2, url: 'https://via.placeholder.com/400x300?text=Front+Damage+2', type: 'damage', caption: 'ความเสียหายด้านหน้า มุม 2' },
          { id: 3, url: 'https://via.placeholder.com/400x300?text=Headlight+Damage', type: 'damage', caption: 'ไฟหน้าแตก' },
          { id: 4, url: 'https://via.placeholder.com/400x300?text=Hood+Damage', type: 'damage', caption: 'ฝากระโปรงบุบ' },
          { id: 5, url: 'https://via.placeholder.com/400x300?text=Car+Registration', type: 'document', caption: 'ทะเบียนรถ' },
          { id: 6, url: 'https://via.placeholder.com/400x300?text=Insurance+Card', type: 'document', caption: 'บัตรประกัน' },
        ],
        
        // Timeline data
        timeline: {
          reportedDate: '2024-10-20 10:00', // ใช้ incidentDate แทน reportedDate ใน mock
          inspectionDate: '2024-10-21 10:00',
          approvalDate: '2024-10-22 15:30',
          garageSelectedDate: '2024-10-23 09:00',
          repairStartDate: '2024-10-24 08:00',
          completedDate: '',
        },
        
        // เจ้าหน้าที่ที่ดูแล
        assignedOfficer: {
          name: 'นายสมศักดิ์ ใจดี',
          phone: '081-234-5678',
          email: 'somsak@insurance.com',
        },
      });
      setLoading(false);
    }, 500);
  }, [id]);

  const handleImageClick = (image) => {
    setSelectedImage(image);
    setShowImageModal(true);
  };

  // TODO: Backend - ดาวน์โหลด PDF
  const handleDownloadPDF = () => {
    console.log('Download PDF for claim:', id);
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
          ไม่พบข้อมูลเคลม
        </p>
        <Link to="/customer/claims" className="btn-primary">
          กลับไปหน้ารายการเคลม
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
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
            <h1 className="text-3xl font-bold text-neutral-dark">
              {claim.title}
            </h1>
            <StatusBadge status={claim.status} />
          </div>
          <p className="text-neutral-500">
            เลขที่เคลม: <span className="font-medium text-neutral-dark">{claim.claimNumber}</span>
          </p>
        </div>
        <button
          onClick={handleDownloadPDF}
          className="btn-primary flex items-center gap-2"
        >
          <span className="material-icons-round">download</span>
          <span>ดาวน์โหลด PDF</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card-static">
            <h2 className="text-xl font-semibold text-neutral-dark mb-4 flex items-center gap-2">
              <span className="material-icons-round text-primary-500 leading-none">info</span>
              <span>ข้อมูลการเคลม</span>
            </h2>
            
            <div className="grid grid-cols-2 gap-6">
              {/* ลบ 'วันที่แจ้งเคลม' คงไว้เฉพาะ 'วันเกิดเหตุ' */}
              <div>
                <p className="text-sm text-neutral-500 mb-1">วันเกิดเหตุ</p>
                <p className="font-medium text-neutral-dark">{claim.incidentDate}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-neutral-500 mb-1">สถานที่เกิดเหตุ</p>
                <p className="font-medium text-neutral-dark">{claim.location}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-neutral-500 mb-1">รายละเอียดเหตุการณ์</p>
                <p className="font-medium text-neutral-dark">{claim.description}</p>
              </div>
            </div>
          </div>

          {/* Vehicle Info */}
          <div className="card-static">
            <h2 className="text-xl font-semibold text-neutral-dark mb-4 flex items-center gap-2">
              <span className="material-icons-round text-primary-500 leading-none">directions_car</span>
              <span>ข้อมูลรถยนต์</span>
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
                <p className="font-medium text-neutral-dark">{claim.vehicle.licensePlate}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-500 mb-1">สี</p>
                <p className="font-medium text-neutral-dark">{claim.vehicle.color}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-500 mb-1">เลขตัวถัง</p>
                <p className="font-medium text-neutral-dark">{claim.vehicle.chassisNumber}</p>
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="card-static">
            <h2 className="text-xl font-semibold text-neutral-dark mb-4 flex items-center gap-2">
              <span className="material-icons-round text-primary-500 leading-none">photo_library</span>
              <span>รูปภาพและเอกสาร</span>
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {claim.images.map(image => (
                <div
                  key={image.id}
                  onClick={() => handleImageClick(image)}
                  className="relative aspect-video rounded-lg overflow-hidden cursor-pointer group"
                >
                  <img
                    src={image.url}
                    alt={image.caption}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <p className="text-white text-sm font-medium line-clamp-2">
                        {image.caption}
                      </p>
                    </div>
                  </div>
                  <div className="absolute top-2 right-2">
                    <span className={`
                      badge badge-sm
                      ${image.type === 'damage' ? 'badge-error' : 'badge-info'}
                    `}>
                      {image.type === 'damage' ? 'ความเสียหาย' : 'เอกสาร'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline */}
          <div className="card-static">
            <h2 className="text-xl font-semibold text-neutral-dark mb-6 flex items-center gap-2">
              <span className="material-icons-round text-primary-500 leading-none">timeline</span>
              <span>สถานะการดำเนินการ</span>
            </h2>
            
            <ClaimTimeline
              currentStep={claim.currentStep}
              claimData={claim.timeline}
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Cost Summary */}
          <div className="card-static">
            <h3 className="font-semibold text-neutral-dark mb-4 flex items-center gap-2">
              <span className="material-icons-round text-primary-500 leading-none">payments</span>
              <span>สรุปค่าใช้จ่าย</span>
            </h3>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-neutral-50 rounded-lg">
                <span className="text-neutral-600">ค่าซ่อมประเมิน</span>
                <span className="font-semibold text-neutral-dark">
                  ฿{claim.estimatedCost.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-primary-50 rounded-lg">
                <span className="text-primary-700">จำนวนเงินที่อนุมัติ</span>
                <span className="font-bold text-primary-700 text-lg">
                  ฿{claim.approvedAmount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-neutral-50 rounded-lg">
                <span className="text-neutral-600">ค่าเสียหายที่ต้องจ่ายเพิ่ม</span>
                <span className="font-semibold text-neutral-dark">
                  ฿{claim.deductible.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="divider"></div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-500">เลขกรมธรรม์</span>
                <span className="font-medium text-neutral-dark">{claim.policyNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">ประเภทความคุ้มครอง</span>
                <span className="font-medium text-neutral-dark">{claim.coverage}</span>
              </div>
            </div>
          </div>

          {/* Garage Info */}
          {claim.garage && (
            <div className="card-static">
              <h3 className="font-semibold text-neutral-dark mb-4 flex items-center gap-2">
                <span className="material-icons-round text-primary-500 leading-none">build_circle</span>
                <span>อู่ซ่อม</span>
              </h3>
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-neutral-500 mb-1">ชื่ออู่</p>
                  <p className="font-medium text-neutral-dark">{claim.garage.name}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-500 mb-1">ที่อยู่</p>
                  <p className="text-sm text-neutral-dark">{claim.garage.address}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-500 mb-1">เบอร์โทร</p>
                  <a
                    href={`tel:${claim.garage.phone}`}
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                    {claim.garage.phone}
                  </a>
                </div>
                <div>
                  <p className="text-sm text-neutral-500 mb-1">ระยะทาง</p>
                  <p className="text-sm font-medium text-neutral-dark">{claim.garage.distance}</p>
                </div>
              </div>

              <button className="btn-outline w-full mt-4">
                <span className="material-icons-round mr-2">map</span>
                ดูแผนที่
              </button>
            </div>
          )}

          {/* Officer Contact */}
          <div className="card bg-gradient-secondary text-white">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <span className="material-icons-round leading-none">support_agent</span>
              <span>เจ้าหน้าที่ผู้ดูแล</span>
            </h3>
            
            <div className="space-y-2 text-sm mb-4">
              <p><span className="opacity-80">ชื่อ:</span> <span className="font-medium">{claim.assignedOfficer.name}</span></p>
              <p><span className="opacity-80">โทร:</span> <a href={`tel:${claim.assignedOfficer.phone}`} className="font-medium hover:underline">{claim.assignedOfficer.phone}</a></p>
              <p><span className="opacity-80">อีเมล:</span> <a href={`mailto:${claim.assignedOfficer.email}`} className="font-medium hover:underline">{claim.assignedOfficer.email}</a></p>
            </div>

            <button className="btn-outline !border-white !text-white hover:!bg-white hover:!text-secondary-600 w-full">
              <span className="material-icons-round mr-2">phone</span>
              ติดต่อเจ้าหน้าที่
            </button>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <h3 className="font-semibold text-neutral-dark mb-4">
              การดำเนินการด่วน
            </h3>
            
            <div className="space-y-2">
              {/* 🆕 ข้อ 7B: ปุ่มเลือกอู่ซ่อม - แสดงเมื่อ status = approved และยังไม่มีอู่ */}
              {claim.status === 'approved' && !claim.garage && (
                <Link
                  to={`/customer/claims/${claim.id}/select-garage`}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  <span className="material-icons-round">build_circle</span>
                  <span>เลือกอู่ซ่อม</span>
                </Link>
              )}

              <Link
                to="/customer/urgent-request"
                className="btn-outline w-full flex items-center justify-center gap-2"
              >
                <span className="material-icons-round">priority_high</span>
                <span>ขออนุมัติซ่อมด่วน</span>
              </Link>
              <Link
                to="/customer/complaint"
                className="btn-ghost w-full flex items-center justify-center gap-2"
              >
                <span className="material-icons-round">report_problem</span>
                <span>แจ้งร้องเรียน</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {showImageModal && selectedImage && (
        <Modal
          isOpen={showImageModal}
          onClose={() => setShowImageModal(false)}
          title={selectedImage.caption}
          size="lg"
        >
          <img
            src={selectedImage.url}
            alt={selectedImage.caption}
            className="w-full rounded-lg"
          />
        </Modal>
      )}
    </div>
  );
};

export default ClaimDetail;