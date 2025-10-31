import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Modal, TextArea } from '../../components';

/**
 * Approvals - หน้าจัดการคำขออนุมัติ
 * 
 * Features:
 * 1. แสดงคำขออนุมัติจากลูกค้า (ขออนุมัติซ่อมด่วน)
 * 2. แสดงคำขออนุมัติจากอู่ (ขออนุมัติรายการเพิ่มเติม)
 * 3. ประวัติคำขอที่อนุมัติ/ปฏิเสธแล้ว (พร้อมค้นหา)
 * 4. อนุมัติ/ปฏิเสธพร้อม logic ที่ถูกต้อง
 * 
 * Logic:
 * - อนุมัติคำขอซ่อมด่วนจากลูกค้า → ส่งต่อไปอู่ (รออู่ยืนยัน)
 * - ปฏิเสธคำขอซ่อมด่วนจากลูกค้า → จบ
 * - อนุมัติรายการเพิ่มเติมจากอู่ → เพิ่มวงเงิน
 * - ปฏิเสธรายการเพิ่มเติมจากอู่ → ขึ้น "ค่าเสียหายที่ต้องจ่ายเพิ่ม" ที่หน้าลูกค้า
 * 
 * TODO: Backend Integration
 * - GET /api/insurance/approvals?type={customer|garage}&status={pending|approved|rejected}
 * - POST /api/insurance/approvals/{id}/approve
 * - POST /api/insurance/approvals/{id}/reject
 */
const Approvals = () => {
  const [activeTab, setActiveTab] = useState('customer'); // 'customer', 'garage', 'history'
  const [loading, setLoading] = useState(true);
  const [approvals, setApprovals] = useState({
    customer: [],
    garage: [],
    history: []
  });
  const [selectedApproval, setSelectedApproval] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const [actionType, setActionType] = useState(null); // 'approve' or 'reject'
  const [rejectReason, setRejectReason] = useState('');
  const [processing, setProcessing] = useState(false);

  // ⭐ Search & Filter for History
  const [searchTerm, setSearchTerm] = useState('');
  const [historyFilter, setHistoryFilter] = useState('all'); // 'all', 'approved', 'rejected'

  useEffect(() => {
    // TODO: Backend - ดึงคำขออนุมัติ
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
            reason: 'work',
            description: 'ต้องใช้รถเพื่อการทำงานเร่งด่วน ไม่สามารถรอได้',
            attachments: ['https://picsum.photos/800/600?random=1', // รูปภาพหลัก
              'https://picsum.photos/400/300?random=2',], // mock นะ
            requestedDate: '2024-10-26 09:30',
            status: 'pending',
            garageName: 'อู่สมชาย ห้วยขวาง', // อู่ที่จะส่งต่อไป
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
            coverageLimit: 50000, // วงเงินคุ้มครอง
            currentUsed: 25000, // ใช้ไปแล้ว
            remaining: 25000, // เหลือ
            reason: 'พบความเสียหายเพิ่มเติมภายใน',
            additionalItems: [
              { description: 'เปลี่ยนแหนบเฟืองมุม', cost: 5000 },
              { description: 'ซ่อมระบบกันสะเทือน', cost: 3000 },
            ],
            attachments: ['additional_damage1.jpg'],
            requestedDate: '2024-10-26 11:00',
            status: 'pending',
          },
        ],
        history: [
          {
            id: '100',
            type: 'urgent_repair',
            claimNumber: 'CLM-2024-010',
            claimId: '10',
            customerName: 'นางสุดา รักษ์ดี',
            carModel: 'Toyota Yaris 2021',
            licensePlate: 'คง 5678 กรุงเทพ',
            reason: 'medical',
            description: 'มีการนัดหมายพบแพทย์สำคัญ',
            requestedDate: '2024-10-20 10:00',
            status: 'approved',
            approvedBy: 'นางสาววิภา ประกันภัย',
            approvedDate: '2024-10-20 10:30',
            garageName: 'อู่ประเสริฐ จตุจักร',
            garageStatus: 'confirmed', // อู่ยืนยันรับแล้ว
          },
          {
            id: '101',
            type: 'additional_cost',
            claimNumber: 'CLM-2024-009',
            claimId: '9',
            garageName: 'อู่ประเสริฐ จตุจักร',
            customerName: 'นายวิชัย สุขสันต์',
            carModel: 'Honda CR-V 2020',
            originalAmount: 15000,
            additionalAmount: 5000,
            totalAmount: 20000,
            reason: 'พบสาเหตุเพิ่มเติม',
            requestedDate: '2024-10-18 14:00',
            status: 'rejected',
            rejectedBy: 'นางสาววิภา ประกันภัย',
            rejectedDate: '2024-10-18 15:00',
            rejectReason: 'รายการเพิ่มเติมไม่อยู่ในความคุ้มครอง',
            customerExtraCost: 5000, // ลูกค้าต้องจ่ายเพิ่ม
          },
          {
            id: '102',
            type: 'urgent_repair',
            claimNumber: 'CLM-2024-008',
            claimId: '8',
            customerName: 'นายพิชัย มั่งคั่ง',
            carModel: 'BMW X5 2023',
            licensePlate: 'ฮฮ 1111 กรุงเทพ',
            reason: 'work',
            description: 'ต้องใช้รถด่วน',
            requestedDate: '2024-10-15 09:00',
            status: 'rejected',
            rejectedBy: 'นางสาววิภา ประกันภัย',
            rejectedDate: '2024-10-15 10:00',
            rejectReason: 'ไม่ผ่านเงื่อนไขการซ่อมด่วน',
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
    setActionType('approve');
    setShowConfirmModal(true);
  };

  const handleReject = (approval) => {
    setSelectedApproval(approval);
    setActionType('reject');
    setRejectReason('');
    setShowConfirmModal(true);
  };

  const handleImagePreview = (url) => {
    setImagePreviewUrl(url);
    setShowImageModal(true);
  };

  const confirmAction = async () => {
    if (actionType === 'reject' && (!rejectReason || rejectReason.trim().length < 10)) {
      alert('กรุณาระบุเหตุผลอย่างน้อย 10 ตัวอักษร');
      return;
    }

    setProcessing(true);

    // TODO: Backend - อนุมัติ/ปฏิเสธ
    setTimeout(() => {
      const isCustomer = selectedApproval.type === 'urgent_repair';
      const sourceTab = isCustomer ? 'customer' : 'garage';

      let historyItem = {
        ...selectedApproval,
        status: actionType === 'approve' ? 'approved' : 'rejected',
        [`${actionType}dBy`]: 'นางสาววิภา ประกันภัย',
        [`${actionType}dDate`]: new Date().toLocaleString('th-TH'),
      };

      // ⭐ Logic สำหรับแต่ละกรณี
      if (actionType === 'approve') {
        if (isCustomer) {
          // อนุมัติคำขอซ่อมด่วนจากลูกค้า → ส่งต่อไปอู่
          historyItem.garageStatus = 'pending_confirmation'; // รออู่ยืนยัน
          console.log('✅ อนุมัติคำขอซ่อมด่วน → ส่งต่อไปอู่:', selectedApproval.garageName);
        } else {
          // อนุมัติรายการเพิ่มเติมจากอู่
          const canApprove = selectedApproval.additionalAmount <= selectedApproval.remaining;
          if (canApprove) {
            console.log('✅ อนุมัติรายการเพิ่มเติม → เพิ่มวงเงิน');
          } else {
            alert('วงเงินไม่เพียงพอ ไม่สามารถอนุมัติได้');
            setProcessing(false);
            return;
          }
        }
      } else {
        // Reject
        historyItem.rejectReason = rejectReason;

        if (isCustomer) {
          // ปฏิเสธคำขอซ่อมด่วนจากลูกค้า → จบ
          console.log('❌ ปฏิเสธคำขอซ่อมด่วน → แจ้งลูกค้า');
        } else {
          // ปฏิเสธรายการเพิ่มเติมจากอู่ → ขึ้นค่าเสียหายที่ลูกค้าต้องจ่ายเพิ่ม
          historyItem.customerExtraCost = selectedApproval.additionalAmount;
          console.log('❌ ปฏิเสธรายการเพิ่มเติม → ลูกค้าต้องจ่ายเพิ่ม:', selectedApproval.additionalAmount, 'บาท');
        }
      }

      // ย้ายไปประวัติ
      setApprovals(prev => ({
        ...prev,
        [sourceTab]: prev[sourceTab].filter(a => a.id !== selectedApproval.id),
        history: [historyItem, ...prev.history],
      }));

      setProcessing(false);
      setShowConfirmModal(false);
      alert(actionType === 'approve' ? 'อนุมัติสำเร็จ' : 'ปฏิเสธสำเร็จ');
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

  const getStatusBadge = (status, garageStatus) => {
    if (status === 'approved' && garageStatus === 'pending_confirmation') {
      return (
        <span className="badge badge-info flex items-center gap-1">
          <span className="material-icons-round text-xs">schedule</span>
          รออู่ยืนยัน
        </span>
      );
    }

    const config = {
      pending: { label: 'รออนุมัติ', color: 'warning', icon: 'schedule' },
      approved: { label: 'อนุมัติแล้ว', color: 'success', icon: 'check_circle' },
      rejected: { label: 'ปฏิเสธแล้ว', color: 'error', icon: 'cancel' },
    };
    const { label, color, icon } = config[status] || config.pending;

    return (
      <span className={`badge badge-${color} flex items-center gap-1`}>
        <span className="material-icons-round text-xs">{icon}</span>
        {label}
      </span>
    );
  };

  // ⭐ Filter & Search for History
  const filteredHistory = approvals.history.filter(approval => {
    // Filter by status
    if (historyFilter === 'approved' && approval.status !== 'approved') return false;
    if (historyFilter === 'rejected' && approval.status !== 'rejected') return false;

    // Search
    if (!searchTerm) return true;

    const term = searchTerm.toLowerCase();
    return (
      approval.claimNumber.toLowerCase().includes(term) ||
      approval.customerName.toLowerCase().includes(term) ||
      approval.licensePlate?.toLowerCase().includes(term) ||
      approval.garageName?.toLowerCase().includes(term)
    );
  });

  const currentApprovals = activeTab === 'history' ? filteredHistory : approvals[activeTab];
  const pendingCount = {
    customer: approvals.customer.length,
    garage: approvals.garage.length,
    history: approvals.history.length,
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
        <h1 className="text-3xl font-bold text-neutral-dark mb-2">คำขออนุมัติ</h1>
        <p className="text-neutral-500">จัดการคำขออนุมัติจากลูกค้าและอู่ซ่อม</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card hover:shadow-card-hover transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-500 text-sm mb-1">รอดำเนินการ</p>
              <h3 className="text-3xl font-bold text-warning">{pendingCount.customer + pendingCount.garage}</h3>
              <p className="text-xs text-neutral-400 mt-1">ลูกค้า + อู่</p>
            </div>
            <div className="w-16 h-16 rounded-xl bg-warning/10 text-warning flex items-center justify-center">
              <span className="material-icons-round text-3xl">schedule</span>
            </div>
          </div>
        </div>

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
            className={`relative pb-4 px-2 font-medium transition-colors duration-300 flex items-center gap-2 ${activeTab === 'customer' ? 'text-primary-600' : 'text-neutral-500 hover:text-neutral-700'}`}
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
            className={`relative pb-4 px-2 font-medium transition-colors duration-300 flex items-center gap-2 ${activeTab === 'garage' ? 'text-primary-600' : 'text-neutral-500 hover:text-neutral-700'}`}
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

          <button
            onClick={() => setActiveTab('history')}
            className={`relative pb-4 px-2 font-medium transition-colors duration-300 flex items-center gap-2 ${activeTab === 'history' ? 'text-primary-600' : 'text-neutral-500 hover:text-neutral-700'}`}
          >
            <span className="material-icons-round">history</span>
            <span>ประวัติ</span>
            {activeTab === 'history' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500"></div>
            )}
          </button>
        </div>
      </div>

      {/* ⭐ Search & Filter for History */}
      {activeTab === 'history' && (
        <div className="card-static">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <span className="material-icons-round absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400">
                  search
                </span>
                <input
                  type="text"
                  placeholder="ค้นหาด้วยเลขเคลม, ชื่อลูกค้า, ทะเบียนรถ, อู่..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field pl-12"
                />
              </div>
            </div>

            {/* Filter */}
            <div className="flex gap-2">
              <button
                onClick={() => setHistoryFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all duration-300 ${historyFilter === 'all' ? 'bg-primary-500 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}
              >
                ทั้งหมด
              </button>
              <button
                onClick={() => setHistoryFilter('approved')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all duration-300 ${historyFilter === 'approved' ? 'bg-success text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}
              >
                <span className="material-icons-round text-sm">check_circle</span>
                <span>อนุมัติแล้ว</span>
              </button>
              <button
                onClick={() => setHistoryFilter('rejected')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all duration-300 ${historyFilter === 'rejected' ? 'bg-error text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}
              >
                <span className="material-icons-round text-sm">cancel</span>
                <span>ปฏิเสธแล้ว</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Approvals List */}
      {currentApprovals.length === 0 ? (
        <div className="card-static text-center py-16">
          <span className="material-icons-round text-6xl text-neutral-300 mb-4">
            {activeTab === 'history' ? 'history' : 'check_circle'}
          </span>
          <p className="text-neutral-500 text-lg mb-2">
            {activeTab === 'history' ? 'ไม่พบผลลัพธ์' : 'ไม่มีคำขออนุมัติ'}
          </p>
          <p className="text-neutral-400 text-sm">
            {activeTab === 'customer' ? 'ไม่มีคำขออนุมัติจากลูกค้าในขณะนี้' :
              activeTab === 'garage' ? 'ไม่มีคำขออนุมัติจากอู่ในขณะนี้' :
                searchTerm ? 'ลองเปลี่ยนคำค้นหาหรือ filter' : 'ประวัติการอนุมัติ/ปฏิเสธจะแสดงที่นี่'}
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
                    {getStatusBadge(approval.status, approval.garageStatus)}
                  </div>
                  <p className="text-sm text-neutral-500">
                    <span className="material-icons-round text-xs align-middle mr-1">schedule</span>
                    แจ้งเมื่อ {approval.requestedDate}
                  </p>
                </div>
              </div>

              {/* Content - Customer Requests */}
              {approval.type === 'urgent_repair' && (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="material-icons-round text-neutral-400">person</span>
                    <div className="flex-1">
                      <p className="font-medium text-neutral-dark">{approval.customerName}</p>
                      <p className="text-sm text-neutral-500">{approval.customerPhone || '-'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="material-icons-round text-neutral-400">directions_car</span>
                    <div className="flex-1">
                      <p className="font-medium text-neutral-dark">{approval.carModel}</p>
                      <p className="text-sm text-neutral-500">{approval.licensePlate}</p>
                    </div>
                  </div>

                  {approval.garageName && (
                    <div className="flex items-center gap-3">
                      <span className="material-icons-round text-neutral-400">build</span>
                      <div className="flex-1">
                        <p className="font-medium text-neutral-dark">{approval.garageName}</p>
                        {approval.garageStatus === 'pending_confirmation' && (
                          <p className="text-xs text-info">รออู่ยืนยันรับเคส</p>
                        )}
                        {approval.garageStatus === 'confirmed' && (
                          <p className="text-xs text-success">✓ อู่ยืนยันรับแล้ว</p>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="p-4 bg-blue-50 border-l-4 border-info rounded">
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
              {approval.type === 'additional_cost' && (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="material-icons-round text-neutral-400">build</span>
                    <div className="flex-1">
                      <p className="font-medium text-neutral-dark">{approval.garageName}</p>
                      <p className="text-sm text-neutral-500">{approval.garagePhone || '-'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="material-icons-round text-neutral-400">person</span>
                    <div className="flex-1">
                      <p className="font-medium text-neutral-dark">{approval.customerName}</p>
                      <p className="text-sm text-neutral-500">{approval.carModel} • {approval.licensePlate}</p>
                    </div>
                  </div>

                  <div className="p-4 bg-amber-50 border-l-4 border-warning rounded">
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

                    {/* แสดงวงเงินคุ้มครอง (สำหรับ pending) */}
                    {approval.status === 'pending' && approval.coverageLimit && (
                      <div className="mb-3 p-3 bg-white rounded">
                        <p className="text-xs text-neutral-500 mb-1">วงเงินคุ้มครอง</p>
                        <div className="flex justify-between text-sm">
                          <span>ใช้ไป: ฿{approval.currentUsed.toLocaleString()}</span>
                          <span className={`font-semibold ${approval.remaining >= approval.additionalAmount ? 'text-success' : 'text-error'}`}>
                            เหลือ: ฿{approval.remaining.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    )}

                    <p className="text-sm text-neutral-700 mb-2">
                      <strong>เหตุผล:</strong> {approval.reason}
                    </p>
                    {approval.additionalItems && (
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
                    )}
                  </div>

                  {/* แสดงค่าเสียหายที่ลูกค้าต้องจ่าย (ถ้าปฏิเสธ) */}
                  {approval.customerExtraCost > 0 && (
                    <div className="p-4 bg-red-50 border-l-4 border-error rounded">
                      <p className="text-sm font-semibold text-error mb-1">
                        💰 ลูกค้าต้องจ่ายเพิ่ม: ฿{approval.customerExtraCost.toLocaleString()}
                      </p>
                      <p className="text-xs text-neutral-600">
                        หมายเหตุ: หากลูกค้าไม่ต้องการซ่อม ให้โทรหาอู่เพื่อยกเลิกคำขอ
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* History Info */}
              {activeTab === 'history' && (
                <div className="mt-3 pt-3 border-t border-neutral-200">
                  <p className="text-sm text-neutral-600">
                    <span className="material-icons-round text-xs align-middle mr-1">
                      {approval.status === 'approved' ? 'check_circle' : 'cancel'}
                    </span>
                    {approval.status === 'approved' ? 'อนุมัติโดย' : 'ปฏิเสธโดย'}:
                    <strong> {approval.approvedBy || approval.rejectedBy}</strong>
                    {' '}• {approval.approvedDate || approval.rejectedDate}
                  </p>
                  {approval.rejectReason && (
                    <div className="mt-2 p-3 bg-red-50 rounded">
                      <p className="text-sm text-neutral-700">
                        <strong>เหตุผล:</strong> {approval.rejectReason}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Actions - Only for pending items */}
              {activeTab !== 'history' && (
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
              )}
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

            {selectedApproval.type === 'urgent_repair' ? (
              <>

                <div>
                  <p className="text-sm text-neutral-500 mb-1">ลูกค้า</p>
                  <p className="font-medium">{selectedApproval.customerName}</p>
                  {selectedApproval.customerPhone && (
                    <p className="text-sm text-neutral-600">{selectedApproval.customerPhone}</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-neutral-500 mb-1">รถยนต์</p>
                  <p className="font-medium">{selectedApproval.carModel}</p>
                  <p className="text-sm text-neutral-600">{selectedApproval.licensePlate}</p>
                </div>
                {selectedApproval.garageName && (
                  <div>
                    <p className="text-sm text-neutral-500 mb-1">อู่ที่จะส่งต่อ</p>
                    <p className="font-medium">{selectedApproval.garageName}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-neutral-500 mb-1">ประเภทคำขอ</p>
                  <p className="font-medium">{getReasonLabel(selectedApproval.reason)}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-500 mb-1">รายละเอียด</p>
                  <p className="text-neutral-700">{selectedApproval.description}</p>
                </div>
                {/* ⭐️ (เพิ่ม) ส่วนแสดงรูปภาพและลิงก์ */}
                {selectedApproval.attachments && selectedApproval.attachments.length > 0 && (
                  <div>
                    <p className="text-sm text-neutral-500 mb-2">เอกสาร/รูปภาพประกอบ</p>
                    <div className="grid grid-cols-4 gap-2">
                      {selectedApproval.attachments.map((url, index) => (
                        <div key={index}
                          onClick={() => handleImagePreview(url)}
                          className="relative w-full aspect-square rounded-lg overflow-hidden cursor-pointer group hover:opacity-90 transition-opacity duration-200"
                        >
                          <img
                            src={url}
                            alt={`Attachment ${index + 1}`}
                            className="object-cover w-full h-full"
                          />
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <span className="material-icons-round text-white text-3xl">zoom_in</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                <div>
                  <p className="text-sm text-neutral-500 mb-1">อู่ซ่อม</p>
                  <p className="font-medium">{selectedApproval.garageName}</p>
                  {selectedApproval.garagePhone && (
                    <p className="text-sm text-neutral-600">{selectedApproval.garagePhone}</p>
                  )}
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
                {selectedApproval.additionalItems && (
                  <div>
                    <p className="text-sm text-neutral-500 mb-2">รายการเพิ่มเติม</p>
                    {selectedApproval.additionalItems.map((item, idx) => (
                      <div key={idx} className="flex justify-between p-2 bg-neutral-50 rounded mb-2">
                        <span>{item.description}</span>
                        <span className="font-semibold">฿{item.cost.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </Modal>
      )}

      {/* Approve/Reject Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title={actionType === 'approve' ? 'ยืนยันการอนุมัติ' : 'ปฏิเสธคำขออนุมัติ'}
        size="md"
        footer={
          <>
            <button
              onClick={() => setShowConfirmModal(false)}
              className="btn-outline"
              disabled={processing}
            >
              ยกเลิก
            </button>
            <button
              onClick={confirmAction}
              className={`btn-primary ${actionType === 'reject' ? '!bg-error hover:!bg-red-600' : ''}`}
              disabled={processing}
            >
              {processing ? 'กำลังดำเนินการ...' : actionType === 'approve' ? 'อนุมัติ' : 'ปฏิเสธ'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          {actionType === 'approve' ? (
            <>
              <div className="p-4 bg-green-50 border-l-4 border-success rounded">
                <p className="text-sm text-neutral-700">
                  <span className="material-icons-round text-sm mr-1 align-middle text-success">check_circle</span>
                  คุณแน่ใจหรือไม่ที่จะอนุมัติคำขอนี้?
                </p>
              </div>

              {selectedApproval?.type === 'urgent_repair' && (
                <div className="p-4 bg-blue-50 rounded">
                  <p className="text-sm text-info mb-2">
                    <strong>หมายเหตุ:</strong>
                  </p>
                  <p className="text-sm text-neutral-700">
                    • คำขอนี้จะถูกส่งต่อไปที่อู่: <strong>{selectedApproval.garageName}</strong>
                  </p>
                  <p className="text-sm text-neutral-700">
                    • อู่จะต้องยืนยันรับหรือปฏิเสธคำขอนี้
                  </p>
                </div>
              )}

              {selectedApproval?.type === 'additional_cost' && (
                <div className="p-4 bg-blue-50 rounded">
                  <p className="text-sm text-info mb-2">
                    <strong>หมายเหตุ:</strong>
                  </p>
                  <p className="text-sm text-neutral-700">
                    • วงเงินจะเพิ่มจาก ฿{selectedApproval.currentUsed.toLocaleString()}
                    {' '}→ ฿{selectedApproval.totalAmount.toLocaleString()}
                  </p>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="p-4 bg-red-50 border-l-4 border-error rounded">
                <p className="text-sm text-neutral-700">
                  <span className="material-icons-round text-sm mr-1 align-middle text-error">warning</span>
                  กรุณาระบุเหตุผลในการปฏิเสธเพื่อแจ้งให้
                  {selectedApproval?.type === 'urgent_repair' ? 'ลูกค้า' : 'อู่'}ทราบ
                </p>
              </div>

              {selectedApproval?.type === 'additional_cost' && (
                <div className="p-4 bg-amber-50 rounded">
                  <p className="text-sm text-warning mb-2">
                    <strong>⚠️ หมายเหตุ:</strong>
                  </p>
                  <p className="text-sm text-neutral-700">
                    • ลูกค้าจะต้องจ่ายค่าเสียหายเพิ่ม: <strong>฿{selectedApproval.additionalAmount.toLocaleString()}</strong>
                  </p>
                  <p className="text-sm text-neutral-700">
                    • หากลูกค้าไม่ต้องการ ให้โทรหาอู่เพื่อยกเลิกคำขอ
                  </p>
                </div>
              )}

              <TextArea
                label="เหตุผลในการปฏิเสธ"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="ระบุเหตุผลอย่างละเอียด..."
                rows={5}
                required
              />
            </>
          )}
        </div>
      </Modal>
      <Modal
        isOpen={showImageModal}
        onClose={() => setShowImageModal(false)}
        title="รายละเอียดรูปภาพ"
        size="2xl" // ปรับขนาดให้ใหญ่ขึ้นสำหรับรูปภาพ
        className="!p-0" // ลบ padding ออกจาก Modal content
        contentClassName="!p-0"
      >
        {imagePreviewUrl && (
          <div className="relative w-full h-[80vh] overflow-hidden">
            <img
              src={imagePreviewUrl}
              alt="Attachment Preview"
              className="object-contain w-full h-full"
            />
            {/* ⭐️ (เพิ่ม) ปุ่มปิดตามรูปตัวอย่าง (ตำแหน่งขวาบน) */}
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-4 right-4 z-50 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
            >
              <span className="material-icons-round">close</span>
            </button>
          </div>
        )}
      </Modal>

    </div>
  );
};

export default Approvals;