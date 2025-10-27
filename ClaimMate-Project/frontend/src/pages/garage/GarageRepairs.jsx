import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardBody, Badge, Button, Modal, Select } from '../../components';

/**
 * GarageRepairs - หน้ารายการซ่อมทั้งหมด
 * แสดงงานซ่อมที่กำลังดำเนินการ พร้อมอัพเดตสถานะได้
 * 
 * Flow:
 * 1. ลูกค้าส่งใบเคลมมา -> อู่รับหรือปฏิเสธ
 * 2. หลังรับงาน -> อู่อัพเดตสถานะการซ่อม
 * 3. หากต้องการรายการเพิ่ม -> ขออนุมัติจากบริษัท
 * 
 * TODO: Backend Integration Points
 * 1. GET /api/garage/repairs - ดึงรายการซ่อมทั้งหมด (ที่ยอมรับแล้ว)
 * 2. GET /api/garage/pending - ดึงรายการรอยืนยัน
 * 3. PUT /api/garage/repairs/:id/status - อัพเดตสถานะงาน
 * 4. POST /api/garage/repairs/:id/accept - ยืนยันรับงาน
 * 5. POST /api/garage/repairs/:id/reject - ปฏิเสธงาน
 */
const GarageRepairs = () => {
  const [selectedRepair, setSelectedRepair] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');

  // TODO: Backend - Replace with real API call
  const repairs = [
    {
      id: 'R-2024-001',
      claimId: 'CLM-2024-008',
      customerName: 'นายสมชาย ใจดี',
      phone: '081-234-5678',
      carModel: 'Toyota Camry 2020',
      licensePlate: 'กข 1234 กรุงเทพฯ',
      status: 'repairing',
      progress: 65,
      startDate: '2024-10-25',
      estimatedCompletion: '2024-10-28',
      items: [
        { code: 'bumper_front', label: 'เปลี่ยนกันชนหน้า', status: 'completed' },
        { code: 'hood', label: 'ซ่อม/เปลี่ยนฝากระโปรงหน้า', status: 'in_progress' },
        { code: 'paint_front', label: 'พ่นสีด้านหน้า', status: 'pending' },
      ],
      notes: 'ลูกค้าต้องการรับรถวันที่ 28 ต.ค.',
    },
    {
      id: 'R-2024-002',
      claimId: 'CLM-2024-007',
      customerName: 'นางสาววิภา สุขใจ',
      phone: '089-876-5432',
      carModel: 'Honda Civic 2021',
      licensePlate: 'ฮค 5678 กรุงเทพฯ',
      status: 'parts_ordered',
      progress: 30,
      startDate: '2024-10-24',
      estimatedCompletion: '2024-10-30',
      items: [
        { code: 'door_rear_left', label: 'ซ่อมประตูหลังซ้าย', status: 'pending' },
        { code: 'paint_left', label: 'พ่นสีด้านซ้าย', status: 'pending' },
      ],
      notes: 'รออะไหล่ ประตู ETA: 29 ต.ค.',
    },
    {
      id: 'R-2024-003',
      claimId: 'CLM-2024-006',
      customerName: 'นายประเสริฐ มั่งมี',
      phone: '092-345-6789',
      carModel: 'Mazda CX-5 2019',
      licensePlate: 'งง 9876 กรุงเทพฯ',
      status: 'waiting_approval',
      progress: 10,
      startDate: '2024-10-26',
      estimatedCompletion: '2024-10-29',
      items: [
        { code: 'headlight', label: 'เปลี่ยนไฟหน้า', status: 'pending' },
        { code: 'fender_right', label: 'ซ่อมบังโคลนขวา', status: 'pending' },
      ],
      notes: 'รอบริษัทอนุมัติรายการเพิ่มเติม',
      needsApproval: true,
    },
    {
      id: 'R-2024-004',
      claimId: 'CLM-2024-005',
      customerName: 'นายสุชาติ รวยดี',
      phone: '098-765-4321',
      carModel: 'Ford Ranger 2022',
      licensePlate: 'จจ 4321 กรุงเทพฯ',
      status: 'quality_check',
      progress: 95,
      startDate: '2024-10-22',
      estimatedCompletion: '2024-10-27',
      items: [
        { code: 'bumper_rear', label: 'เปลี่ยนกันชนหลัง', status: 'completed' },
        { code: 'taillight', label: 'เปลี่ยนไฟท้าย', status: 'completed' },
        { code: 'paint_rear', label: 'พ่นสีด้านหลัง', status: 'completed' },
      ],
      notes: 'พร้อมส่งมอบ',
    },
  ];

  // Status options สำหรับการเปลี่ยนสถานะ
  const statusOptions = [
    { value: 'waiting_approval', label: 'รออนุมัติ', icon: 'pending' },
    { value: 'parts_ordered', label: 'สั่งอะไหล่แล้ว', icon: 'inventory_2' },
    { value: 'repairing', label: 'กำลังซ่อม', icon: 'build' },
    { value: 'quality_check', label: 'ตรวจสอบคุณภาพ', icon: 'verified' },
    { value: 'completed', label: 'เสร็จสิ้น', icon: 'task_alt' },
  ];

  // Status config สำหรับแสดงสถานะ
  const statusConfig = {
    waiting_approval: { label: 'รออนุมัติ', color: 'warning', icon: 'pending' },
    parts_ordered: { label: 'สั่งอะไหล่แล้ว', color: 'info', icon: 'inventory_2' },
    repairing: { label: 'กำลังซ่อม', color: 'primary', icon: 'build' },
    quality_check: { label: 'ตรวจสอบคุณภาพ', color: 'secondary', icon: 'verified' },
    completed: { label: 'เสร็จสิ้น', color: 'success', icon: 'task_alt' },
  };

  const getStatusBadge = (status) => {
    const config = statusConfig[status] || { label: status, color: 'neutral', icon: 'info' };
    return (
      <Badge variant={config.color} icon={config.icon} size="sm">
        {config.label}
      </Badge>
    );
  };

  const handleUpdateStatus = async () => {
    if (!newStatus) {
      alert('กรุณาเลือกสถานะใหม่');
      return;
    }

    setIsUpdating(true);
    
    // TODO: Backend - PUT /api/garage/repairs/:id/status
    console.log('Updating status:', selectedRepair.id, 'to', newStatus);
    
    // Simulate API call
    setTimeout(() => {
      setIsUpdating(false);
      setShowStatusModal(false);
      setSelectedRepair(null);
      setNewStatus('');
      alert(`✅ อัพเดตสถานะเป็น "${statusOptions.find(s => s.value === newStatus)?.label}" แล้ว`);
    }, 1500);
  };

  // Filter repairs by status
  const filteredRepairs = filterStatus === 'all' 
    ? repairs 
    : repairs.filter(r => r.status === filterStatus);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-dark mb-2">
            รายการซ่อม
          </h1>
          <p className="text-neutral-500">
            งานซ่อมทั้งหมดที่กำลังดำเนินการ ({repairs.length} รายการ)
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardBody className="py-3">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-sm text-neutral-600 font-medium">กรองตามสถานะ:</span>
            <button 
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filterStatus === 'all' ? 'bg-primary-100 text-primary-700' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
              onClick={() => setFilterStatus('all')}
            >
              ทั้งหมด ({repairs.length})
            </button>
            <button 
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filterStatus === 'repairing' ? 'bg-primary-100 text-primary-700' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
              onClick={() => setFilterStatus('repairing')}
            >
              กำลังซ่อม ({repairs.filter(r => r.status === 'repairing').length})
            </button>
            <button 
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filterStatus === 'parts_ordered' ? 'bg-primary-100 text-primary-700' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
              onClick={() => setFilterStatus('parts_ordered')}
            >
              สั่งอะไหล่แล้ว ({repairs.filter(r => r.status === 'parts_ordered').length})
            </button>
            <button 
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filterStatus === 'quality_check' ? 'bg-primary-100 text-primary-700' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
              onClick={() => setFilterStatus('quality_check')}
            >
              ตรวจสอบคุณภาพ ({repairs.filter(r => r.status === 'quality_check').length})
            </button>
          </div>
        </CardBody>
      </Card>

      {/* Repairs List */}
      <div className="grid grid-cols-1 gap-6">
        {filteredRepairs.length === 0 ? (
          <Card>
            <CardBody className="text-center py-12">
              <span className="material-icons-round text-6xl text-neutral-300 mb-4">inbox</span>
              <h3 className="text-xl font-semibold text-neutral-500 mb-2">
                ไม่มีงานซ่อม
              </h3>
              <p className="text-neutral-400">
                ไม่พบงานซ่อมในสถานะนี้
              </p>
            </CardBody>
          </Card>
        ) : (
          filteredRepairs.map((repair) => (
            <Card key={repair.id} className="hover:shadow-card-hover">
              <CardBody>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-neutral-dark">
                        {repair.carModel}
                      </h3>
                      {getStatusBadge(repair.status)}
                      {repair.needsApproval && (
                        <Badge variant="error" icon="priority_high" size="sm">
                          ต้องอนุมัติ
                        </Badge>
                      )}
                    </div>
                    <p className="text-neutral-600 mb-1">
                      <span className="font-medium">ลูกค้า:</span> {repair.customerName} • {repair.phone}
                    </p>
                    <p className="text-neutral-600">
                      <span className="font-medium">ทะเบียน:</span> {repair.licensePlate}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-neutral-dark mb-1">
                      {repair.id}
                    </p>
                    <p className="text-xs text-neutral-500 mb-1">
                      เคส: {repair.claimId}
                    </p>
                    <p className="text-xs text-neutral-500">
                      เริ่ม: {new Date(repair.startDate).toLocaleDateString('th-TH', { 
                        day: 'numeric', 
                        month: 'short'
                      })}
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-xs text-neutral-500 mb-2">
                    <span>ความคืบหน้า</span>
                    <span className="font-semibold text-neutral-dark">{repair.progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-neutral-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-500 rounded-full transition-all duration-500"
                      style={{ width: `${repair.progress}%` }}
                    />
                  </div>
                </div>

                {/* Repair Items */}
                <div className="mb-4 p-4 bg-neutral-50 rounded-lg">
                  <h4 className="text-sm font-semibold text-neutral-700 mb-3">
                    รายการซ่อม:
                  </h4>
                  <div className="space-y-2">
                    {repair.items.map((item, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <span className={`
                          material-icons-round text-sm
                          ${item.status === 'completed' ? 'text-success' : 
                            item.status === 'in_progress' ? 'text-primary-500' : 'text-neutral-400'}
                        `}>
                          {item.status === 'completed' ? 'check_circle' : 
                           item.status === 'in_progress' ? 'autorenew' : 'radio_button_unchecked'}
                        </span>
                        <span className={`
                          ${item.status === 'completed' ? 'line-through text-neutral-400' : 'text-neutral-600'}
                        `}>
                          {item.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                {repair.notes && (
                  <div className="mb-4 p-3 bg-blue-50 border-l-4 border-blue-400 rounded">
                    <p className="text-sm text-neutral-700">
                      <span className="font-semibold">หมายเหตุ:</span> {repair.notes}
                    </p>
                  </div>
                )}

                {/* Estimated Completion */}
                <div className="mb-4 flex items-center gap-2 text-sm text-neutral-500">
                  <span className="material-icons-round text-sm">schedule</span>
                  <span>
                    คาดว่าเสร็จ: {new Date(repair.estimatedCompletion).toLocaleDateString('th-TH', { 
                      day: 'numeric', 
                      month: 'short',
                      year: 'numeric'
                    })}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3 pt-4 border-t border-neutral-200">
                  <Link
                    to={`/garage/repairs/${repair.id}`}
                    className="flex-1 btn-outline flex items-center justify-center gap-2"
                  >
                    <span className="material-icons-round">visibility</span>
                    ดูรายละเอียด
                  </Link>
                  <Button
                    variant="primary"
                    className="flex-1"
                    icon="sync"
                    onClick={() => {
                      setSelectedRepair(repair);
                      setNewStatus(repair.status);
                      setShowStatusModal(true);
                    }}
                  >
                    อัพเดตสถานะ
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))
        )}
      </div>

      {/* Update Status Modal */}
      <Modal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        title="อัพเดตสถานะงาน"
        size="md"
      >
        {selectedRepair && (
          <div className="space-y-4">
            <div className="p-4 bg-neutral-50 rounded-lg">
              <p className="text-sm text-neutral-700 mb-2">
                <span className="font-semibold">งาน:</span> {selectedRepair.id}
              </p>
              <p className="text-sm text-neutral-700 mb-2">
                <span className="font-semibold">รถ:</span> {selectedRepair.carModel} • {selectedRepair.licensePlate}
              </p>
              <p className="text-sm text-neutral-700">
                <span className="font-semibold">สถานะปัจจุบัน:</span> {statusConfig[selectedRepair.status]?.label}
              </p>
            </div>

            <Select
              label="สถานะใหม่"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              options={statusOptions}
              required
            />

            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-neutral-600">
                <span className="material-icons-round text-sm mr-1 align-middle">info</span>
                การเปลี่ยนสถานะจะแจ้งไปยังลูกค้าและบริษัทประกันภัยทันที
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                fullWidth
                onClick={() => setShowStatusModal(false)}
                disabled={isUpdating}
              >
                ยกเลิก
              </Button>
              <Button
                variant="primary"
                fullWidth
                icon="check"
                onClick={handleUpdateStatus}
                loading={isUpdating}
              >
                บันทึกสถานะ
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default GarageRepairs;