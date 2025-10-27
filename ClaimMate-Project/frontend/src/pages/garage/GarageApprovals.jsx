import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardBody, Badge, Button, Modal, TextArea } from '../../components';

/**
 * GarageApprovals - หน้าคำขออนุมัติรายการเพิ่มเติม
 * แสดงรายการที่ขออนุมัติจากบริษัทประกันภัย และสามารถยกเลิกได้
 * * TODO: Backend Integration Points
 * 1. GET /api/garage/approval-requests - ดึงคำขออนุมัติทั้งหมด
 * 2. POST /api/garage/approval-requests - สร้างคำขออนุมัติใหม่
 * 3. DELETE /api/garage/approval-requests/:id - ยกเลิกคำขออนุมัติ
 * 4. GET /api/garage/approval-requests/:id - ดูรายละเอียดคำขอ
 */
const GarageApprovals = () => {
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');

  // TODO: Backend - Replace with real API call
  const approvalRequests = [
    {
      id: 'APR-2024-001',
      repairId: 'R-2024-001',
      claimId: 'CLM-2024-008',
      customerName: 'นายสมชาย ใจดี',
      carModel: 'Toyota Camry 2020',
      status: 'pending',
      submittedDate: '2024-10-26T10:30:00',
      originalEstimate: 45000,
      additionalItems: [
        { code: 'suspension', label: 'ซ่อมช่วงล่าง', reason: 'พบโช้คอัพชำรุด', cost: 15000 },
        { code: 'alignment', label: 'ตั้งศูนย์ล้อ', reason: 'จำเป็นหลังซ่อมช่วงล้อ', cost: 2000 },
      ],
      totalAdditional: 17000,
      totalCost: 62000,
      customerCoverage: 50000,
      customerExtraCost: 12000, // จำนวนที่ลูกค้าต้องจ่ายเพิ่ม
      notes: 'พบความเสียหายเพิ่มเติมขณะตรวจสอบ',
    },
    {
      id: 'APR-2024-002',
      repairId: 'R-2024-002',
      claimId: 'CLM-2024-007',
      customerName: 'นางสาววิภา สุขใจ',
      carModel: 'Honda Civic 2021',
      status: 'approved',
      submittedDate: '2024-10-25T14:20:00',
      approvedDate: '2024-10-26T09:15:00',
      originalEstimate: 28000,
      additionalItems: [
        { code: 'window_left', label: 'เปลี่ยนกระจกข้างซ้าย', reason: 'กระจกร้าวจากอุบัติเหตุ', cost: 8000 },
      ],
      totalAdditional: 8000,
      totalCost: 36000,
      customerCoverage: 40000,
      customerExtraCost: 0,
      notes: 'อนุมัติแล้ว ดำเนินการได้เลย',
    },
    {
      id: 'APR-2024-003',
      repairId: 'R-2024-004',
      claimId: 'CLM-2024-005',
      customerName: 'นายสุชาติ รวยดี',
      carModel: 'Ford Ranger 2022',
      status: 'rejected',
      submittedDate: '2024-10-24T16:45:00',
      rejectedDate: '2024-10-25T10:00:00',
      originalEstimate: 35000,
      additionalItems: [
        { code: 'tire_replace', label: 'เปลี่ยนยาง', reason: 'ยางสึกหรอ', cost: 12000 },
      ],
      totalAdditional: 12000,
      totalCost: 47000,
      customerCoverage: 40000,
      customerExtraCost: 7000,
      notes: 'ไม่อนุมัติ - ยางสึกหรอไม่เกี่ยวกับอุบัติเหตุ',
      rejectionReason: 'ยางสึกหรอเป็นการซ่อมบำรุงปกติ ไม่อยู่ในความคุ้มครอง',
    },
  ];

  // Status config
  const statusConfig = {
    pending: { label: 'รออนุมัติ', color: 'warning', icon: 'pending', textColor: 'text-warning', iconBg: 'bg-yellow-100' },
    approved: { label: 'อนุมัติแล้ว', color: 'success', icon: 'check_circle', textColor: 'text-success', iconBg: 'bg-green-100' },
    rejected: { label: 'ไม่อนุมัติ', color: 'error', icon: 'cancel', textColor: 'text-error', iconBg: 'bg-red-100' },
  };

  const getStatusBadge = (status) => {
    const config = statusConfig[status] || { label: status, color: 'neutral', icon: 'info' };
    return (
      <Badge variant={config.color} icon={config.icon} size="md">
        {config.label}
      </Badge>
    );
  };

  const handleCancelRequest = async () => {
    if (!cancelReason.trim()) {
      alert('กรุณาระบุเหตุผลในการยกเลิก');
      return;
    }

    setIsCancelling(true);
    
    // TODO: Backend - DELETE /api/garage/approval-requests/:id
    console.log('Cancelling request:', selectedRequest.id, 'reason:', cancelReason);
    
    // Simulate API call
    setTimeout(() => {
      setIsCancelling(false);
      setShowCancelModal(false);
      setSelectedRequest(null);
      setCancelReason('');
      alert(`✅ ยกเลิกคำขอ ${selectedRequest.id} แล้ว`);
    }, 1500);
  };

  // Filter by status
  const filteredRequests = filterStatus === 'all' 
    ? approvalRequests 
    : approvalRequests.filter(r => r.status === filterStatus);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-dark mb-2">
            คำขออนุมัติ
          </h1>
          <p className="text-neutral-500">
            รายการเพิ่มเติมที่ขออนุมัติจากบริษัทประกันภัย ({approvalRequests.length} รายการ)
          </p>
        </div>
      </div>

      {/* Stats Summary - ⭐ ปรับปรุง: ใช้ Card-hoverable ธรรมดาแทน Card มี Border สี */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.keys(statusConfig).map(status => {
          const config = statusConfig[status];
          const count = approvalRequests.filter(r => r.status === status).length;
          
          return (
            <Card key={status} className="hover:shadow-card-hover transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-neutral-500 text-sm mb-1">{config.label}</p>
                  <h3 className={`text-3xl font-bold ${config.textColor}`}>{count}</h3>
                  <p className="text-xs text-neutral-400 mt-1">รายการ</p>
                </div>
                <div className={`w-16 h-16 rounded-xl ${config.iconBg} ${config.textColor} flex items-center justify-center`}>
                  <span className="material-icons-round text-3xl">{config.icon}</span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <Card>
        <CardBody className="py-3">
          <div className="flex items-center gap-4">
            <span className="text-sm text-neutral-600 font-medium">กรองตามสถานะ:</span>
            <button 
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filterStatus === 'all' ? 'bg-primary-500 text-white shadow-button' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
              onClick={() => setFilterStatus('all')}
            >
              ทั้งหมด ({approvalRequests.length})
            </button>
            <button 
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filterStatus === 'pending' ? 'bg-warning text-white shadow-button' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
              onClick={() => setFilterStatus('pending')}
            >
              รออนุมัติ ({approvalRequests.filter(r => r.status === 'pending').length})
            </button>
            <button 
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filterStatus === 'approved' ? 'bg-success text-white shadow-button' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
              onClick={() => setFilterStatus('approved')}
            >
              อนุมัติแล้ว ({approvalRequests.filter(r => r.status === 'approved').length})
            </button>
          </div>
        </CardBody>
      </Card>

      {/* Approval Requests List - ⭐ ปรับปรุง: ลบ bgColor ออก เปลี่ยนเป็น Card ธรรมดา */}
      <div className="grid grid-cols-1 gap-6">
        {filteredRequests.length === 0 ? (
          <Card>
            <CardBody className="text-center py-12">
              <span className="material-icons-round text-6xl text-neutral-300 mb-4">inbox</span>
              <h3 className="text-xl font-semibold text-neutral-500 mb-2">
                ไม่มีคำขออนุมัติ
              </h3>
              <p className="text-neutral-400">
                ไม่พบคำขออนุมัติในสถานะนี้
              </p>
            </CardBody>
          </Card>
        ) : (
          filteredRequests.map((request) => (
            <Card key={request.id} className={`hover:shadow-card-hover`}> {/* ✅ ลบ bg-color ออก */}
              <CardBody>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-neutral-dark">
                        {request.carModel}
                      </h3>
                      {getStatusBadge(request.status)}
                    </div>
                    <p className="text-neutral-600 mb-1">
                      <span className="font-medium">ลูกค้า:</span> {request.customerName}
                    </p>
                    <p className="text-neutral-600">
                      <span className="font-medium">งาน:</span> {request.repairId} • เคส: {request.claimId}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-neutral-dark mb-1">
                      {request.id}
                    </p>
                    <p className="text-xs text-neutral-500">
                      ส่งเมื่อ: {new Date(request.submittedDate).toLocaleDateString('th-TH', { 
                        day: 'numeric', 
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                    {request.approvedDate && (
                      <p className="text-xs text-green-600 font-medium mt-1">
                        อนุมัติ: {new Date(request.approvedDate).toLocaleDateString('th-TH', { 
                          day: 'numeric', 
                          month: 'short'
                        })}
                      </p>
                    )}
                    {request.rejectedDate && (
                      <p className="text-xs text-red-600 font-medium mt-1">
                        ปฏิเสธ: {new Date(request.rejectedDate).toLocaleDateString('th-TH', { 
                          day: 'numeric', 
                          month: 'short'
                        })}
                      </p>
                    )}
                  </div>
                </div>

                {/* Additional Items */}
                <div className="mb-4 p-4 bg-neutral-50 rounded-lg border border-neutral-200"> {/* ✅ ใช้ bg-neutral-50 แทน bg-white */}
                  <h4 className="text-sm font-semibold text-neutral-700 mb-3">
                    รายการเพิ่มเติม:
                  </h4>
                  <div className="space-y-3">
                    {request.additionalItems.map((item, index) => (
                      <div key={index} className="pb-3 border-b border-neutral-200 last:border-0 last:pb-0"> {/* ✅ ใช้ border-neutral-200 แทน border-neutral-100 */}
                        <div className="flex items-start justify-between mb-1">
                          <p className="font-medium text-neutral-dark">{item.label}</p>
                          <p className="font-semibold text-neutral-dark">฿{item.cost.toLocaleString()}</p>
                        </div>
                        <p className="text-sm text-neutral-500">เหตุผล: {item.reason}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cost Summary */}
                <div className="mb-4 p-4 bg-primary-50 rounded-lg border-2 border-primary-200"> {/* ✅ เน้นด้วยสี Primary (Insurance Blue) */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-neutral-600">ประมาณการเดิม:</span>
                      <span className="text-neutral-dark">฿{request.originalEstimate.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-orange-600 font-medium">
                      <span>รายการเพิ่มเติม:</span>
                      <span>+฿{request.totalAdditional.toLocaleString()}</span>
                    </div>
                    <div className="pt-2 border-t border-primary-200 flex justify-between"> {/* ✅ ใช้ border-primary-200 */}
                      <span className="font-semibold text-neutral-700">ยอดรวมทั้งหมด:</span>
                      <span className="text-lg font-bold text-primary-600">฿{request.totalCost.toLocaleString()}</span>
                    </div>
                    <div className="pt-2 border-t border-primary-200 flex justify-between text-green-600"> {/* ✅ ใช้ border-primary-200 */}
                      <span>วงเงินคุ้มครอง:</span>
                      <span className="font-semibold">฿{request.customerCoverage.toLocaleString()}</span>
                    </div>
                    {request.customerExtraCost > 0 && (
                      <div className="flex justify-between text-red-600 font-semibold">
                        <span>ลูกค้าต้องจ่ายเพิ่ม:</span>
                        <span>฿{request.customerExtraCost.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Notes */}
                {request.notes && (
                  <div className="mb-4 p-3 bg-blue-50 border-l-4 border-blue-400 rounded">
                    <p className="text-sm text-neutral-700">
                      <span className="font-semibold">หมายเหตุ:</span> {request.notes}
                    </p>
                  </div>
                )}

                {/* Rejection Reason */}
                {request.rejectionReason && (
                  <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-400 rounded">
                    <p className="text-sm text-red-700">
                      <span className="font-semibold">เหตุผลที่ไม่อนุมัติ:</span> {request.rejectionReason}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center gap-3 pt-4 border-t border-neutral-200">
                  <Button
                    variant="outline"
                    className="flex-1"
                    icon="visibility"
                    onClick={() => {
                      setSelectedRequest(request);
                      setShowDetailModal(true);
                    }}
                  >
                    ดูรายละเอียด
                  </Button>
                  
                  {request.status === 'pending' && (
                    <Button
                      variant="outline"
                      className="flex-1 border-error text-error hover:bg-red-50"
                      icon="cancel"
                      onClick={() => {
                        setSelectedRequest(request);
                        setShowCancelModal(true);
                      }}
                    >
                      ยกเลิกคำขอ
                    </Button>
                  )}

                  {request.status === 'approved' && (
                    <Link
                      to={`/garage/repairs/${request.repairId}`}
                      className="flex-1 btn-primary flex items-center justify-center gap-2"
                    >
                      <span className="material-icons-round">build</span>
                      ดำเนินการซ่อม
                    </Link>
                  )}
                </div>
              </CardBody>
            </Card>
          ))
        )}
      </div>

      {/* Cancel Request Modal (ไม่เปลี่ยน) */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="ยกเลิกคำขออนุมัติ"
        size="md"
      >
        {selectedRequest && (
          <div className="space-y-4">
            <div className="p-4 bg-red-50 rounded-lg">
              <p className="text-sm text-neutral-700 mb-2">
                <span className="font-semibold">คำขอ:</span> {selectedRequest.id}
              </p>
              <p className="text-sm text-neutral-700">
                <span className="font-semibold">รถ:</span> {selectedRequest.carModel}
              </p>
            </div>

            <p className="text-neutral-600">
              คุณต้องการยกเลิกคำขออนุมัติรายการเพิ่มเติมนี้ใช่หรือไม่? 
              <br />
              (ตัวอย่างเช่น ลูกค้าโทรมาปฏิเสธการซ่อมเพิ่มเติม)
            </p>

            <TextArea
              label="เหตุผลในการยกเลิก"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="เช่น ลูกค้าไม่ประสงค์ซ่อมเพิ่มเติม"
              rows={3}
              required
            />

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                fullWidth
                onClick={() => setShowCancelModal(false)}
                disabled={isCancelling}
              >
                ยกเลิก
              </Button>
              <Button
                variant="primary"
                fullWidth
                icon="delete"
                onClick={handleCancelRequest}
                loading={isCancelling}
                className="bg-error hover:bg-red-600"
              >
                ยืนยันยกเลิกคำขอ
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Detail Modal (ไม่เปลี่ยน) */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="รายละเอียดคำขออนุมัติ"
        size="lg"
      >
        {selectedRequest && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-neutral-500 mb-1">เลขที่คำขอ</p>
                <p className="font-semibold text-neutral-dark">{selectedRequest.id}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-500 mb-1">สถานะ</p>
                {getStatusBadge(selectedRequest.status)}
              </div>
              <div>
                <p className="text-sm text-neutral-500 mb-1">ลูกค้า</p>
                <p className="font-semibold text-neutral-dark">{selectedRequest.customerName}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-500 mb-1">รถ</p>
                <p className="font-semibold text-neutral-dark">{selectedRequest.carModel}</p>
              </div>
            </div>

            <div className="divider"></div>

            <div>
              <h4 className="font-semibold text-neutral-dark mb-3">รายการเพิ่มเติม</h4>
              <div className="space-y-2">
                {selectedRequest.additionalItems.map((item, index) => (
                  <div key={index} className="p-3 bg-neutral-50 rounded-lg">
                    <div className="flex justify-between mb-1">
                      <p className="font-medium text-neutral-dark">{item.label}</p>
                      <p className="font-semibold text-primary-600">฿{item.cost.toLocaleString()}</p>
                    </div>
                    <p className="text-sm text-neutral-500">{item.reason}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="divider"></div>

            <div className="p-4 bg-neutral-50 rounded-lg">
              <h4 className="font-semibold text-neutral-dark mb-3">สรุปค่าใช้จ่าย</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>ประมาณการเดิม</span>
                  <span>฿{selectedRequest.originalEstimate.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-orange-600">
                  <span>รายการเพิ่มเติม</span>
                  <span>+฿{selectedRequest.totalAdditional.toLocaleString()}</span>
                </div>
                <div className="pt-2 border-t flex justify-between font-semibold">
                  <span>ยอดรวม</span>
                  <span className="text-primary-600">฿{selectedRequest.totalCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>วงเงินคุ้มครอง</span>
                  <span>฿{selectedRequest.customerCoverage.toLocaleString()}</span>
                </div>
                {selectedRequest.customerExtraCost > 0 && (
                  <div className="flex justify-between text-red-600 font-semibold">
                    <span>ลูกค้าต้องจ่ายเพิ่ม</span>
                    <span>฿{selectedRequest.customerExtraCost.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default GarageApprovals;