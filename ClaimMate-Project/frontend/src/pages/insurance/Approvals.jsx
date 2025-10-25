import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Modal, ConfirmModal, TextArea } from '../../components';

/**
 * Approvals - หน้าจัดการคำขออนุมัติ
 * 
 * Features:
 * 1. แสดงคำขออนุมัติจากลูกค้า (ขออนุมัติซ่อมด่วน)
 * 2. แสดงคำขออนุมัติจากอู่ (ขออนุมัติรายการเพิ่มเติม)
 * 3. อนุมัติ/ปฏิเสธพร้อมเหตุผล
 * 
 * TODO: Backend Integration
 * - GET /api/insurance/approvals?type={customer|garage}&status=pending
 * - POST /api/insurance/approvals/{id}/approve
 * - POST /api/insurance/approvals/{id}/reject
 */
const Approvals = () => {
  const [activeTab, setActiveTab] = useState('customer'); // 'customer' or 'garage'
  const [loading, setLoading] = useState(true);
  const [approvals, setApprovals] = useState({ customer: [], garage: [] });
  const [selectedApproval, setSelectedApproval] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    // TODO: Backend - ดึงคำขออนุมัติ
    // fetchApprovals();
    
    // Mock data
    setTimeout(() => {
      setApprovals({
        customer: [
          {
            id: '1',
            type: 'urgent_repair',
            claimNumber: 'CLM-2024-001',
            claimId: '1',
            
            customerName: 'นายสมชาย ใจดี',
            customerPhone: '081-234-5678',
            
            carModel: 'Honda City 2020',
            licensePlate: 'กข 1234 กรุงเทพ',
            
            reason: 'work', // ใช้รถเพื่อการทำงาน
            description: 'ต้องใช้รถเพื่อการทำงานเร่งด่วน ไม่สามารถรอได้ กรุณาเร่งดำเนินการ',
            attachments: ['document1.pdf', 'photo1.jpg'],
            
            requestedDate: '2024-10-26 09:30',
            status: 'pending',
            priority: 'high',
          },
          {
            id: '2',
            type: 'urgent_repair',
            claimNumber: 'CLM-2024-003',
            claimId: '3',
            
            customerName: 'นางสุดา รักษ์ดี',
            customerPhone: '082-345-6789',
            
            carModel: 'Toyota Yaris 2021',
            licensePlate: 'คง 5678 กรุงเทพ',
            
            reason: 'medical',
            description: 'มีการนัดหมายพบแพทย์สำคัญ จำเป็นต้องใช้รถด่วน',
            attachments: [],
            
            requestedDate: '2024-10-26 10:15',
            status: 'pending',
            priority: 'urgent',
          },
        ],
        garage: [
          {
            id: '3',
            type: 'additional_cost',
            claimNumber: 'CLM-2024-002',
            claimId: '2',
            
            garageName: 'อู่สมชาย ห้วยขวาง',
            garagePhone: '02-123-4567',
            
            customerName: 'นายประเสริฐ มั่นคง',
            carModel: 'Mazda CX-5 2022',
            licensePlate: 'งง 9999 กรุงเทพ',
            
            originalAmount: 25000,
            additionalAmount: 8000,
            totalAmount: 33000,
            
            reason: 'พบความเสียหายเพิ่มเติมภายใน',
            additionalItems: [
              { description: 'เปลี่ยนแหนบเฟืองมุม', cost: 5000 },
              { description: 'ซ่อมระบบกันสะเทือน', cost: 3000 },
            ],
            attachments: ['additional_damage1.jpg', 'additional_damage2.jpg'],
            
            requestedDate: '2024-10-26 11:00',
            status: 'pending',
            priority: 'normal',
          },
        ],
      });
      setLoading(false);
    }, 500);
  }, []);

  const handleViewDetail = (approval) => {
    setSelectedApproval(approval);
    setShowDetailModal(true);
  };

  const handleApprove = (approval) => {
    setSelectedApproval(approval);
    setShowApproveModal(true);
  };

  const handleReject = (approval) => {
    setSelectedApproval(approval);
    setRejectReason('');
    setShowRejectModal(true);
  };

  // TODO: Backend - อนุมัติ
  const confirmApprove = async () => {
    setProcessing(true);
    
    setTimeout(() => {
      console.log('Approve:', selectedApproval.id);
      
      // Remove from list
      setApprovals(prev => ({
        ...prev,
        [activeTab]: prev[activeTab].filter(a => a.id !== selectedApproval.id)
      }));
      
      setProcessing(false);
      setShowApproveModal(false);
      alert('อนุมัติสำเร็จ');
    }, 1000);
  };

  // TODO: Backend - ปฏิเสธ
  const confirmReject = async () => {
    if (!rejectReason || rejectReason.trim().length < 10) {
      alert('กรุณาระบุเหตุผลอย่างน้อย 10 ตัวอักษร');
      return;
    }
    
    setProcessing(true);
    
    setTimeout(() => {
      console.log('Reject:', selectedApproval.id, 'Reason:', rejectReason);
      
      // Remove from list
      setApprovals(prev => ({
        ...prev,
        [activeTab]: prev[activeTab].filter(a => a.id !== selectedApproval.id)
      }));
      
      setProcessing(false);
      setShowRejectModal(false);
      alert('ปฏิเสธสำเร็จ');
    }, 1000);
  };

  const getReasonLabel = (reason) => {
    const reasons = {
      work: 'ใช้รถเพื่อการทำงาน',
      medical: 'เหตุฉุกเฉินทางการแพทย์',
      travel: 'มีการเดินทางที่สำคัญ',
      daily: 'จำเป็นต่อการใช้ชีวิตประจำวัน',
      other: 'อื่นๆ',
    };
    return reasons[reason] || reason;
  };

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

  const currentApprovals = approvals[activeTab];
  const pendingCount = {
    customer: approvals.customer.length,
    garage: approvals.garage.length,
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-neutral-dark mb-2">
          คำขออนุมัติ
        </h1>
        <p className="text-neutral-500">
          จัดการคำขออนุมัติจากลูกค้าและอู่ซ่อม
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card hover:shadow-card-hover transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-500 text-sm mb-1">คำขอจากลูกค้า</p>
              <h3 className="text-3xl font-bold text-primary-600">{pendingCount.customer}</h3>
              <p className="text-xs text-neutral-400 mt-1">รออนุมัติ</p>
            </div>
            <div className="w-16 h-16 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center">
              <span className="material-icons-round text-3xl">person</span>
            </div>
          </div>
        </div>

        <div className="card hover:shadow-card-hover transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-500 text-sm mb-1">คำขอจากอู่</p>
              <h3 className="text-3xl font-bold text-secondary-600">{pendingCount.garage}</h3>
              <p className="text-xs text-neutral-400 mt-1">รออนุมัติ</p>
            </div>
            <div className="w-16 h-16 rounded-xl bg-secondary-100 text-secondary-600 flex items-center justify-center">
              <span className="material-icons-round text-3xl">build</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="card-static">
        <div className="flex gap-4 border-b border-neutral-200">
          <button
            onClick={() => setActiveTab('customer')}
            className={`
              relative pb-4 px-2 font-medium transition-colors duration-300 flex items-center gap-2
              ${activeTab === 'customer'
                ? 'text-primary-600'
                : 'text-neutral-500 hover:text-neutral-700'
              }
            `}
          >
            <span className="material-icons-round">person</span>
            <span>คำขอจากลูกค้า</span>
            {pendingCount.customer > 0 && (
              <span className="badge badge-error badge-sm">{pendingCount.customer}</span>
            )}
            {activeTab === 'customer' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab('garage')}
            className={`
              relative pb-4 px-2 font-medium transition-colors duration-300 flex items-center gap-2
              ${activeTab === 'garage'
                ? 'text-primary-600'
                : 'text-neutral-500 hover:text-neutral-700'
              }
            `}
          >
            <span className="material-icons-round">build</span>
            <span>คำขอจากอู่</span>
            {pendingCount.garage > 0 && (
              <span className="badge badge-error badge-sm">{pendingCount.garage}</span>
            )}
            {activeTab === 'garage' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500"></div>
            )}
          </button>
        </div>
      </div>

      {/* Approvals List */}
      {currentApprovals.length === 0 ? (
        <div className="card-static text-center py-16">
          <span className="material-icons-round text-6xl text-neutral-300 mb-4">
            check_circle
          </span>
          <p className="text-neutral-500 text-lg mb-2">
            ไม่มีคำขออนุมัติ
          </p>
          <p className="text-neutral-400 text-sm">
            {activeTab === 'customer' 
              ? 'ไม่มีคำขออนุมัติจากลูกค้าในขณะนี้'
              : 'ไม่มีคำขออนุมัติจากอู่ในขณะนี้'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {currentApprovals.map(approval => (
            <div key={approval.id} className="card hover:shadow-card-hover transition-all duration-300">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Link
                      to={`/insurance/claims/${approval.claimId}`}
                      className="text-lg font-semibold text-primary-600 hover:text-primary-700"
                    >
                      {approval.claimNumber}
                    </Link>
                    {getPriorityBadge(approval.priority)}
                  </div>
                  <p className="text-sm text-neutral-500">
                    <span className="material-icons-round text-xs align-middle mr-1">schedule</span>
                    แจ้งเมื่อ {approval.requestedDate}
                  </p>
                </div>
              </div>

              {/* Content - Customer Requests */}
              {activeTab === 'customer' && (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="material-icons-round text-neutral-400">person</span>
                    <div className="flex-1">
                      <p className="font-medium text-neutral-dark">{approval.customerName}</p>
                      <p className="text-sm text-neutral-500">{approval.customerPhone}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="material-icons-round text-neutral-400">directions_car</span>
                    <div className="flex-1">
                      <p className="font-medium text-neutral-dark">{approval.carModel}</p>
                      <p className="text-sm text-neutral-500">{approval.licensePlate}</p>
                    </div>
                  </div>

                  <div className="p-4 bg-warning/5 border-l-4 border-warning rounded">
                    <p className="text-sm font-semibold text-neutral-dark mb-1">
                      ประเภท: {getReasonLabel(approval.reason)}
                    </p>
                    <p className="text-sm text-neutral-700 line-clamp-2">
                      {approval.description}
                    </p>
                  </div>
                </div>
              )}

              {/* Content - Garage Requests */}
              {activeTab === 'garage' && (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="material-icons-round text-neutral-400">build</span>
                    <div className="flex-1">
                      <p className="font-medium text-neutral-dark">{approval.garageName}</p>
                      <p className="text-sm text-neutral-500">{approval.garagePhone}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="material-icons-round text-neutral-400">person</span>
                    <div className="flex-1">
                      <p className="font-medium text-neutral-dark">{approval.customerName}</p>
                      <p className="text-sm text-neutral-500">{approval.carModel} • {approval.licensePlate}</p>
                    </div>
                  </div>

                  <div className="p-4 bg-info/5 border-l-4 border-info rounded">
                    <div className="grid grid-cols-3 gap-4 mb-3">
                      <div>
                        <p className="text-xs text-neutral-500">ค่าซ่อมเดิม</p>
                        <p className="font-semibold text-neutral-dark">
                          ฿{approval.originalAmount.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-neutral-500">ค่าใช้จ่ายเพิ่ม</p>
                        <p className="font-semibold text-warning">
                          +฿{approval.additionalAmount.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-neutral-500">รวมทั้งหมด</p>
                        <p className="font-semibold text-primary-600 text-lg">
                          ฿{approval.totalAmount.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-neutral-700 mb-2">
                      <strong>เหตุผล:</strong> {approval.reason}
                    </p>
                    <div className="text-sm">
                      <p className="font-medium text-neutral-700 mb-1">รายการเพิ่มเติม:</p>
                      <ul className="list-disc list-inside space-y-1">
                        {approval.additionalItems.map((item, idx) => (
                          <li key={idx} className="text-neutral-600">
                            {item.description} - ฿{item.cost.toLocaleString()}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Attachments */}
              {approval.attachments.length > 0 && (
                <div className="mt-3 pt-3 border-t border-neutral-200">
                  <p className="text-sm text-neutral-500 mb-2">
                    <span className="material-icons-round text-xs align-middle mr-1">attach_file</span>
                    เอกสารแนบ: {approval.attachments.length} ไฟล์
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="mt-4 pt-4 border-t border-neutral-200 flex gap-2">
                <button
                  onClick={() => handleViewDetail(approval)}
                  className="btn-ghost flex-1 flex items-center justify-center gap-2"
                >
                  <span className="material-icons-round text-sm">visibility</span>
                  <span>รายละเอียด</span>
                </button>
                <button
                  onClick={() => handleReject(approval)}
                  className="btn-outline flex-1 flex items-center justify-center gap-2 !border-error !text-error hover:!bg-red-50"
                >
                  <span className="material-icons-round text-sm">close</span>
                  <span>ปฏิเสธ</span>
                </button>
                <button
                  onClick={() => handleApprove(approval)}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  <span className="material-icons-round text-sm">check</span>
                  <span>อนุมัติ</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedApproval && (
        <Modal
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          title="รายละเอียดคำขออนุมัติ"
          size="lg"
        >
          <div className="space-y-4">
            <div>
              <p className="text-sm text-neutral-500 mb-1">เลขที่เคลม</p>
              <Link
                to={`/insurance/claims/${selectedApproval.claimId}`}
                className="font-semibold text-primary-600 hover:underline"
              >
                {selectedApproval.claimNumber}
              </Link>
            </div>
            
            {activeTab === 'customer' ? (
              <>
                <div>
                  <p className="text-sm text-neutral-500 mb-1">ลูกค้า</p>
                  <p className="font-medium">{selectedApproval.customerName}</p>
                  <p className="text-sm text-neutral-600">{selectedApproval.customerPhone}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-500 mb-1">รถยนต์</p>
                  <p className="font-medium">{selectedApproval.carModel}</p>
                  <p className="text-sm text-neutral-600">{selectedApproval.licensePlate}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-500 mb-1">ประเภทคำขอ</p>
                  <p className="font-medium">{getReasonLabel(selectedApproval.reason)}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-500 mb-1">รายละเอียด</p>
                  <p className="text-neutral-700">{selectedApproval.description}</p>
                </div>
              </>
            ) : (
              <>
                <div>
                  <p className="text-sm text-neutral-500 mb-1">อู่ซ่อม</p>
                  <p className="font-medium">{selectedApproval.garageName}</p>
                  <p className="text-sm text-neutral-600">{selectedApproval.garagePhone}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-500 mb-1">ลูกค้า</p>
                  <p className="font-medium">{selectedApproval.customerName}</p>
                </div>
                <div className="grid grid-cols-3 gap-4 p-4 bg-neutral-50 rounded-lg">
                  <div>
                    <p className="text-sm text-neutral-500 mb-1">ค่าซ่อมเดิม</p>
                    <p className="font-semibold text-lg">฿{selectedApproval.originalAmount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500 mb-1">ค่าใช้จ่ายเพิ่ม</p>
                    <p className="font-semibold text-lg text-warning">+฿{selectedApproval.additionalAmount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500 mb-1">รวมทั้งหมด</p>
                    <p className="font-semibold text-xl text-primary-600">฿{selectedApproval.totalAmount.toLocaleString()}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-neutral-500 mb-2">รายการเพิ่มเติม</p>
                  {selectedApproval.additionalItems.map((item, idx) => (
                    <div key={idx} className="flex justify-between p-2 bg-neutral-50 rounded mb-2">
                      <span>{item.description}</span>
                      <span className="font-semibold">฿{item.cost.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </Modal>
      )}

      {/* Approve Confirmation Modal */}
      <ConfirmModal
        isOpen={showApproveModal}
        onClose={() => setShowApproveModal(false)}
        onConfirm={confirmApprove}
        title="ยืนยันการอนุมัติ"
        message="คุณแน่ใจหรือไม่ที่จะอนุมัติคำขอนี้?"
        confirmText="อนุมัติ"
        cancelText="ยกเลิก"
        variant="primary"
        loading={processing}
      />

      {/* Reject Modal */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        title="ปฏิเสธคำขออนุมัติ"
        size="md"
        footer={
          <>
            <button
              onClick={() => setShowRejectModal(false)}
              className="btn-outline"
              disabled={processing}
            >
              ยกเลิก
            </button>
            <button
              onClick={confirmReject}
              className="btn-primary !bg-error hover:!bg-red-600"
              disabled={processing}
            >
              {processing ? 'กำลังดำเนินการ...' : 'ปฏิเสธ'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="p-4 bg-red-50 border-l-4 border-error rounded">
            <p className="text-sm text-neutral-700">
              <span className="material-icons-round text-sm mr-1 align-middle text-error">warning</span>
              กรุณาระบุเหตุผลในการปฏิเสธเพื่อแจ้งให้{activeTab === 'customer' ? 'ลูกค้า' : 'อู่'}ทราบ
            </p>
          </div>
          
          <TextArea
            label="เหตุผลในการปฏิเสธ"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="ระบุเหตุผลอย่างละเอียด..."
            rows={5}
            required
          />
        </div>
      </Modal>
    </div>
  );
};

export default Approvals;