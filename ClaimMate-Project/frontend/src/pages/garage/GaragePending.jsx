// นำเข้า components ที่ใช้
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardBody, Badge, Button, Modal } from '../../components';

/**
 * GaragePending - หน้ารอรับงาน
 * แสดงคำขอซ่อมใหม่จากลูกค้า (ทั้งหมดจะมาจากบริษัทประกันภัยเท่านั้น)
 * * TODO: Backend Integration Points
 * 1. GET /api/garage/pending-claims - ดึงรายการคำขอใหม่
 * 2. POST /api/garage/claims/:id/accept - ยืนยันรับงาน
 * 3. POST /api/garage/claims/:id/reject - ปฏิเสธงาน
 * 4. GET /api/garage/claims/:id/details - ดูรายละเอียดเคลม
 */
const GaragePending = () => {
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);

  // TODO: Backend - Replace with real API call
  const pendingClaims = [
    {
      id: 'CLM-2024-009',
      customerName: 'นายสมชาย รักดี',
      phone: '081-234-5678',
      carModel: 'Toyota Fortuner 2022',
      licensePlate: 'กข 1234 กรุงเทพฯ',
      incidentDate: '2024-10-26',
      submittedDate: '2024-10-27',
      // ✅ เปลี่ยน: ให้เป็น customer_selected เท่านั้น
      source: 'customer_selected', 
      estimatedCost: 45000,
      urgentRequest: true,
      damageItems: [
        { code: 'bumper_front', label: 'เปลี่ยนกันชนหน้า', estimated: 15000 },
        { code: 'headlight', label: 'เปลี่ยนไฟหน้า', estimated: 12000 },
        { code: 'paint_front', label: 'พ่นสีด้านหน้า', estimated: 18000 },
      ],
      images: [
        { id: 1, url: '/placeholder-damage.jpg', caption: 'ความเสียหายด้านหน้า' },
        { id: 2, url: '/placeholder-damage2.jpg', caption: 'กันชนบุบ' },
      ],
      notes: 'ลูกค้าต้องการให้ซ่อมด่วน เนื่องจากต้องใช้รถในการทำงาน',
    },
    {
      id: 'CLM-2024-010',
      customerName: 'นางสาววิภา สุขใจ',
      phone: '089-876-5432',
      carModel: 'Honda Civic 2021',
      licensePlate: 'ฮค 5678 กรุงเทพฯ',
      incidentDate: '2024-10-25',
      submittedDate: '2024-10-27',
      // ✅ เปลี่ยน: ให้เป็น customer_selected เท่านั้น
      source: 'customer_selected', 
      estimatedCost: 28000,
      urgentRequest: false,
      damageItems: [
        { code: 'door_rear_left', label: 'ซ่อมประตูหลังซ้าย', estimated: 15000 },
        { code: 'paint_left', label: 'พ่นสีด้านซ้าย', estimated: 13000 },
      ],
      images: [
        { id: 1, url: '/placeholder-door.jpg', caption: 'ประตูบุบ' },
      ],
      notes: 'เคสที่บริษัทประกันภัยส่งมา',
    },
    {
      id: 'CLM-2024-011',
      customerName: 'นายประเสริฐ มั่งมี',
      phone: '092-345-6789',
      carModel: 'Mazda CX-5 2020',
      licensePlate: 'งง 9876 กรุงเทพฯ',
      incidentDate: '2024-10-27',
      submittedDate: '2024-10-27',
      source: 'customer_selected',
      estimatedCost: 18000,
      urgentRequest: false,
      damageItems: [
        { code: 'mirror_right', label: 'เปลี่ยนกระจกมองข้างขวา', estimated: 8000 },
        { code: 'fender_right', label: 'ซ่อมบังโคลนขวา', estimated: 10000 },
      ],
      images: [],
      notes: 'ติดต่อกลับทางเบอร์โทรศัพท์',
    },
  ];

  const handleAcceptClaim = async () => {
    setIsAccepting(true);
    
    // TODO: Backend - POST /api/garage/claims/:id/accept
    console.log('Accepting claim:', selectedClaim.id);
    
    // Simulate API call
    setTimeout(() => {
      setIsAccepting(false);
      setShowAcceptModal(false);
      setSelectedClaim(null);
      alert(`✅ ยืนยันรับงาน ${selectedClaim.id} เรียบร้อยแล้ว`);
    }, 1500);
  };

  const handleRejectClaim = () => {
    // TODO: Backend - POST /api/garage/claims/:id/reject
    console.log('Rejecting claim:', selectedClaim.id);
    setShowRejectModal(false);
    setSelectedClaim(null);
    alert(`❌ ปฏิเสธงาน ${selectedClaim.id} แล้ว`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-dark mb-2">
            รอยืนยัน
          </h1>
          <p className="text-neutral-500">
            คำขอซ่อมที่ลูกค้าส่งมา รอการยืนยันจากอู่ ({pendingClaims.length} รายการ)
          </p>
        </div>
      </div>

      {/* Filters (Optional) */}
      <Card>
        <CardBody className="py-3">
          <div className="flex items-center gap-4">
            <span className="text-sm text-neutral-600 font-medium">กรองตาม:</span>
            <button className="px-4 py-2 bg-primary-100 text-primary-700 rounded-lg text-sm font-medium">
              ทั้งหมด ({pendingClaims.length})
            </button>
            <button className="px-4 py-2 bg-neutral-100 text-neutral-600 rounded-lg text-sm font-medium hover:bg-neutral-200">
              ลูกค้าเลือกอู่ ({pendingClaims.filter(c => c.source === 'customer_selected').length})
            </button>
            {/* ❌ ลบ Filter Walk-in ออก */}
            <button className="px-4 py-2 bg-neutral-100 text-neutral-600 rounded-lg text-sm font-medium hover:bg-neutral-200">
              งานด่วน ({pendingClaims.filter(c => c.urgentRequest).length})
            </button>
          </div>
        </CardBody>
      </Card>

      {/* Pending Claims List */}
      <div className="grid grid-cols-1 gap-6">
        {pendingClaims.length === 0 ? (
          <Card>
            <CardBody className="text-center py-12">
              <span className="material-icons-round text-6xl text-neutral-300 mb-4">inbox</span>
              <h3 className="text-xl font-semibold text-neutral-500 mb-2">
                ไม่มีคำขอใหม่
              </h3>
              <p className="text-neutral-400">
                ขณะนี้ไม่มีคำขอซ่อมที่รอการยืนยัน
              </p>
            </CardBody>
          </Card>
        ) : (
          pendingClaims.map((claim) => (
            <Card key={claim.id} className="hover:shadow-card-hover">
              <CardBody>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-neutral-dark">
                        {claim.carModel}
                      </h3>
                      {claim.urgentRequest && (
                        <Badge variant="error" icon="priority_high" size="md">
                          ด่วน
                        </Badge>
                      )}
                      {/* ❌ ลบการแสดง Badge Walk-in ออก - แสดงแค่ว่าลูกค้าเลือกมาแล้ว หรือมาจากระบบ */}
                      <Badge 
                        variant='primary' // ใช้ primary สำหรับเคสที่มาจากระบบ/ลูกค้าเลือก
                        size="sm"
                      >
                        คำขอจากระบบ
                      </Badge>
                    </div>
                    <p className="text-neutral-600 mb-1">
                      <span className="font-medium">ลูกค้า:</span> {claim.customerName} • {claim.phone}
                    </p>
                    <p className="text-neutral-600">
                      <span className="font-medium">ทะเบียน:</span> {claim.licensePlate}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-neutral-dark mb-1">
                      {claim.id}
                    </p>
                    <p className="text-xs text-neutral-500">
                      แจ้งเมื่อ: {new Date(claim.submittedDate).toLocaleDateString('th-TH', { 
                        day: 'numeric', 
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>

                {/* Damage Items (ละไว้ ไม่มีการเปลี่ยนแปลง) */}
                <div className="mb-4 p-4 bg-neutral-50 rounded-lg">
                  <h4 className="text-sm font-semibold text-neutral-700 mb-3">
                    รายการซ่อม:
                  </h4>
                  <div className="space-y-2">
                    {claim.damageItems.map((item, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span className="text-neutral-600">• {item.label}</span>
                        <span className="font-semibold text-neutral-dark">
                          ฿{item.estimated.toLocaleString()}
                        </span>
                      </div>
                    ))}
                    <div className="pt-2 mt-2 border-t border-neutral-200 flex items-center justify-between">
                      <span className="font-semibold text-neutral-700">ยอดประมาณการ:</span>
                      <span className="text-lg font-bold text-primary-600">
                        ฿{claim.estimatedCost.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Notes (ละไว้ ไม่มีการเปลี่ยนแปลง) */}
                {claim.notes && (
                  <div className="mb-4 p-3 bg-blue-50 border-l-4 border-blue-400 rounded">
                    <p className="text-sm text-neutral-700">
                      <span className="font-semibold">หมายเหตุ:</span> {claim.notes}
                    </p>
                  </div>
                )}

                {/* Images Preview (ละไว้ ไม่มีการเปลี่ยนแปลง) */}
                {claim.images.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-semibold text-neutral-700 mb-2">
                      รูปภาพความเสียหาย ({claim.images.length} รูป):
                    </p>
                    <div className="flex gap-2">
                      {claim.images.slice(0, 3).map((image) => (
                        <div key={image.id} className="w-24 h-24 bg-neutral-200 rounded-lg flex items-center justify-center">
                          <span className="material-icons-round text-neutral-400">image</span>
                        </div>
                      ))}
                      {claim.images.length > 3 && (
                        <div className="w-24 h-24 bg-neutral-100 rounded-lg flex items-center justify-center text-neutral-500 text-sm">
                          +{claim.images.length - 3}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Buttons (ละไว้ ไม่มีการเปลี่ยนแปลง) */}
                <div className="flex items-center gap-3 pt-4 border-t border-neutral-200">
                  <Link
                    to={`/garage/pending/${claim.id}`}
                    className="flex-1 btn-outline flex items-center justify-center gap-2"
                  >
                    <span className="material-icons-round">visibility</span>
                    ดูรายละเอียด
                  </Link>
                  <Button
                    variant="primary"
                    className="flex-1"
                    icon="check_circle"
                    onClick={() => {
                      setSelectedClaim(claim);
                      setShowAcceptModal(true);
                    }}
                  >
                    ยืนยันรับงาน
                  </Button>
                  <Button
                    variant="outline"
                    className="border-error text-error hover:bg-red-50"
                    icon="cancel"
                    onClick={() => {
                      setSelectedClaim(claim);
                      setShowRejectModal(true);
                    }}
                  >
                    ปฏิเสธ
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))
        )}
      </div>

      {/* Accept Modal (ละไว้ ไม่มีการเปลี่ยนแปลง) */}
      <Modal
        isOpen={showAcceptModal}
        onClose={() => setShowAcceptModal(false)}
        title="ยืนยันรับงาน"
        size="md"
      >
        {selectedClaim && (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-neutral-700 mb-2">
                <span className="font-semibold">เคส:</span> {selectedClaim.id}
              </p>
              <p className="text-sm text-neutral-700 mb-2">
                <span className="font-semibold">ลูกค้า:</span> {selectedClaim.customerName}
              </p>
              <p className="text-sm text-neutral-700">
                <span className="font-semibold">รถ:</span> {selectedClaim.carModel} • {selectedClaim.licensePlate}
              </p>
            </div>

            <p className="text-neutral-600">
              คุณต้องการยืนยันรับงานซ่อมนี้ใช่หรือไม่? 
              <br />
              เมื่อยืนยันแล้ว ระบบจะแจ้งให้ลูกค้าและบริษัทประกันภัยทราบทันที
            </p>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                fullWidth
                onClick={() => setShowAcceptModal(false)}
                disabled={isAccepting}
              >
                ยกเลิก
              </Button>
              <Button
                variant="primary"
                fullWidth
                icon="check_circle"
                onClick={handleAcceptClaim}
                loading={isAccepting}
              >
                ยืนยันรับงาน
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Reject Modal (ละไว้ ไม่มีการเปลี่ยนแปลง) */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        title="ปฏิเสธงาน"
        size="md"
      >
        {selectedClaim && (
          <div className="space-y-4">
            <div className="p-4 bg-red-50 rounded-lg">
              <p className="text-sm text-neutral-700">
                <span className="font-semibold">เคส:</span> {selectedClaim.id} - {selectedClaim.carModel}
              </p>
            </div>

            <p className="text-neutral-600">
              คุณต้องการปฏิเสธงานซ่อมนี้ใช่หรือไม่?
              <br />
              ลูกค้าจะได้รับการแจ้งเตือนและสามารถเลือกอู่อื่นได้
            </p>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                fullWidth
                onClick={() => setShowRejectModal(false)}
              >
                ยกเลิก
              </Button>
              <Button
                variant="primary"
                fullWidth
                icon="cancel"
                onClick={handleRejectClaim}
                className="bg-error hover:bg-red-600"
              >
                ยืนยันปฏิเสธ
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default GaragePending;