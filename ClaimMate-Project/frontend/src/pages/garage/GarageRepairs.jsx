import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
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
  const [repairs, setRepairs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedRepair, setSelectedRepair] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const statusOptions = [
    { value: 'in_progress', label: 'กำลังดำเนินการ' },
    { value: 'completed', label: 'เสร็จสิ้น' },
  ];
  

  // Status config
  const statusConfig = {
    in_progress: { label: 'กำลังซ่อม', color: 'primary', icon: 'build' },
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

  useEffect(() => {
    fetchRepairs();
  }, []);

  const fetchRepairs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3000/api/garages/repairs', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setRepairs(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching repairs:', error);
      alert('ไม่สามารถโหลดรายการซ่อมได้');
    } finally {
      setLoading(false);
    }
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
              className={`px-4 py-2 rounded-lg text-sm font-medium ${filterStatus === 'all' ? 'bg-primary-100 text-primary-700' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              onClick={() => setFilterStatus('all')}
            >
              ทั้งหมด ({repairs.length})
            </button>
            <button
              className={`px-4 py-2 rounded-lg text-sm font-medium ${filterStatus === 'in_progress' ? 'bg-primary-100 text-primary-700' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              onClick={() => setFilterStatus('in_progress')}
            >
              กำลังซ่อม ({repairs.filter(r => r.status === 'in_progress').length})
            </button>
            <button
              className={`px-4 py-2 rounded-lg text-sm font-medium ${filterStatus === 'completed' ? 'bg-primary-100 text-primary-700' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              onClick={() => setFilterStatus('completed')}
            >
              ซ่อมเสร็จสิ้น ({repairs.filter(r => r.status === 'completed').length})
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


                {/* Action Buttons */}
                  <Link
                    to={`/garage/repairs/${repair.id}`}
                    className="flex-1 flex items-center justify-center gap-2">
                    <Button
                      variant="primary"
                      className="flex-1"
                      icon="sync"
                      onClick={() => {
                        setSelectedRepair(repair);
                        setNewStatus(repair.status);
                        setShowStatusModal(true);
                      }}>อัพเดตสถานะ</Button>
                  </Link>
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