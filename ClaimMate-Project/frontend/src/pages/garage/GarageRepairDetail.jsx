import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card, CardBody, StatusBadge, Button, Modal, Input, TextArea, Select, Badge } from '../../components';

/**
 * GarageRepairDetail - หน้ารายละเอียดงานซ่อมและอัพเดตสถานะ
 * * Features:
 * 1. แสดงรายละเอียดงานซ่อม
 * 2. อัพเดตสถานะของแต่ละรายการซ่อม (Requirement B)
 * 3. ปุ่มขออนุมัติรายการเพิ่มเติม (Requirement C)
 * 4. ปุ่มแจ้งงานซ่อมเสร็จสิ้น (เปลี่ยนสถานะเป็น completed)
 */
const GarageRepairDetail = () => {
  const { id } = useParams(); // id คือ R-2024-xxx
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [repair, setRepair] = useState(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  
  // State สำหรับ Modal ขออนุมัติเพิ่มเติม
  const [newApproval, setNewApproval] = useState({
    reason: '',
    items: [{ id: 1, label: '', cost: '' }],
  });

  const statusOptions = [
    { value: 'pending', label: 'รอดำเนินการ', icon: 'radio_button_unchecked' },
    { value: 'in_progress', label: 'กำลังดำเนินการ', icon: 'autorenew' },
    { value: 'completed', label: 'เสร็จสิ้น', icon: 'check_circle' },
  ];

  // TODO: Backend - ดึงรายละเอียดงานซ่อม
  useEffect(() => {
    // Mock data based on R-2024-001 from GarageRepairs.jsx
    setTimeout(() => {
      setRepair({
        id: id,
        claimId: 'CLM-2024-008',
        customerName: 'นายสมชาย ใจดี',
        phone: '081-234-5678',
        carModel: 'Toyota Camry 2020',
        licensePlate: 'กข 1234 กรุงเทพฯ',
        currentStatus: 'repairing',
        progress: 65,
        startDate: '2024-10-25',
        estimatedCompletion: '2024-10-28',
        totalEstimate: 45000,
        approvedAmount: 45000,
        items: [
          { id: 1, label: 'เปลี่ยนกันชนหน้า', status: 'completed', cost: 15000 },
          { id: 2, label: 'ซ่อม/เปลี่ยนฝากระโปรงหน้า', status: 'in_progress', cost: 12000 },
          { id: 3, label: 'พ่นสีด้านหน้า', status: 'pending', cost: 18000 },
          { id: 4, label: 'เปลี่ยนโลโก้ใหม่', status: 'pending', cost: 2000, isAdditional: true },
        ],
        notes: 'ลูกค้าต้องการรับรถวันที่ 28 ต.ค.',
      });
      setLoading(false);
    }, 500);
  }, [id]);

  // Handle individual item status update
  const handleItemStatusChange = (itemId, newStatus) => {
    // TODO: Backend - POST /api/garage/repairs/{id}/items/{itemId}/status
    setIsUpdatingStatus(true);
    setTimeout(() => {
      setRepair(prev => ({
        ...prev,
        items: prev.items.map(item =>
          item.id === itemId ? { ...item, status: newStatus } : item
        ),
      }));
      setIsUpdatingStatus(false);
    }, 500);
  };
  
  // Handle Additional Item Form
  const handleNewApprovalChange = (index, field, value) => {
    const updatedItems = newApproval.items.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    setNewApproval(prev => ({ ...prev, items: updatedItems }));
  };

  const handleAddItem = () => {
    setNewApproval(prev => ({ 
        ...prev, 
        items: [...prev.items, { id: Date.now(), label: '', cost: '' }] 
    }));
  };

  const handleRemoveItem = (idToRemove) => {
      setNewApproval(prev => ({ 
          ...prev, 
          items: prev.items.filter(item => item.id !== idToRemove) 
      }));
  };

  const calculateNewTotalCost = () => {
    const baseCost = repair?.totalEstimate || 0;
    const additionalCost = newApproval.items.reduce((sum, item) => sum + (parseFloat(item.cost) || 0), 0);
    return {
        base: baseCost,
        additional: additionalCost,
        total: baseCost + additionalCost
    };
  };

  const handleSendApprovalRequest = () => {
    // TODO: Validation & Backend - POST /api/garage/approval-requests
    console.log('Sending approval request:', {
        repairId: repair.id,
        claimId: repair.claimId,
        newApproval
    });
    setShowApprovalModal(false);
    alert('✅ ส่งคำขออนุมัติรายการเพิ่มเติมไปยังบริษัทประกันแล้ว');
    // Navigate to approval list or update UI
    navigate('/garage/approvals');
  };

  // Handle complete repair
  const handleCompleteRepair = () => {
    // TODO: Backend - PUT /api/garage/repairs/{id}/status (to 'completed')
    setShowCompleteModal(false);
    alert('✅ งานซ่อมเสร็จสิ้น! ลูกค้าจะได้รับการแจ้งเตือน');
    // Navigate back to history
    navigate('/garage/history');
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

  const allItemsCompleted = repair.items.every(item => item.status === 'completed');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          to="/garage/repairs"
          className="inline-flex items-center gap-2 text-neutral-500 hover:text-primary-500 mb-3 transition-colors duration-300"
        >
          <span className="material-icons-round">arrow_back</span>
          <span>กลับไปรายการซ่อม</span>
        </Link>
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-neutral-dark">{repair.carModel}</h1>
                <StatusBadge status={repair.currentStatus} />
            </div>
            <div className="flex gap-2">
                <Button 
                    variant="secondary"
                    icon="add"
                    onClick={() => setShowApprovalModal(true)}
                >
                    ขออนุมัติรายการเพิ่มเติม
                </Button>
                <Button 
                    variant="primary"
                    icon="task_alt"
                    onClick={() => setShowCompleteModal(true)}
                    disabled={!allItemsCompleted}
                    className={!allItemsCompleted ? 'opacity-70 cursor-not-allowed' : ''}
                >
                    แจ้งงานเสร็จสิ้น
                </Button>
            </div>
        </div>
        <p className="text-neutral-500">
          งานซ่อม: <span className="font-medium text-neutral-dark">{repair.id}</span> • เคส: {repair.claimId}
        </p>
      </div>

      {/* Summary Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
            <div className="card-static bg-primary-50 border-2 border-primary-200">
                <h2 className="text-xl font-semibold text-neutral-dark mb-4">ข้อมูลลูกค้าและรถ</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                        <p className="text-xs text-neutral-500 mb-1">ลูกค้า</p>
                        <p className="font-medium text-neutral-dark">{repair.customerName}</p>
                    </div>
                    <div>
                        <p className="text-xs text-neutral-500 mb-1">ทะเบียน</p>
                        <p className="font-medium text-neutral-dark">{repair.licensePlate}</p>
                    </div>
                    <div>
                        <p className="text-xs text-neutral-500 mb-1">เริ่มซ่อม</p>
                        <p className="font-medium text-neutral-dark">{repair.startDate}</p>
                    </div>
                    <div>
                        <p className="text-xs text-neutral-500 mb-1">คาดว่าเสร็จ</p>
                        <p className="font-medium text-neutral-dark">{repair.estimatedCompletion}</p>
                    </div>
                </div>
            </div>
            
            {/* Progress Bar */}
            <Card className="p-4">
                <div className="flex items-center justify-between text-sm text-neutral-500 mb-2">
                    <span>ความคืบหน้าโดยรวม</span>
                    <span className="font-semibold text-neutral-dark">{repair.progress}%</span>
                </div>
                <div className="w-full h-2 bg-neutral-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-500 rounded-full transition-all duration-500"
                      style={{ width: `${repair.progress}%` }}
                    />
                </div>
            </Card>

            {/* Item Status Update */}
            <div className="card-static">
                <h2 className="text-xl font-semibold text-neutral-dark mb-4 flex items-center gap-2">
                    <span className="material-icons-round text-primary-500">checklist</span>
                    <span>รายการซ่อม ({repair.items.length})</span>
                </h2>
                
                <div className="space-y-4">
                    {repair.items.map(item => {
                        const currentStatus = statusOptions.find(s => s.value === item.status);
                        return (
                            <div key={item.id} className="p-4 bg-neutral-50 rounded-lg flex items-center justify-between">
                                <div className="flex-1">
                                    <p className={`font-medium text-neutral-dark ${item.status === 'completed' ? 'line-through text-neutral-500' : ''}`}>
                                        {item.label}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <Badge variant={item.isAdditional ? 'secondary' : 'neutral'} size="sm">
                                            {item.isAdditional ? 'รายการเพิ่มเติม' : 'รายการหลัก'}
                                        </Badge>
                                        <span className="text-sm text-primary-600 font-medium">฿{item.cost.toLocaleString()}</span>
                                    </div>
                                </div>
                                <div className="ml-4 flex items-center gap-2">
                                    {/* Dropdown Update Status */}
                                    <select
                                        value={item.status}
                                        onChange={(e) => handleItemStatusChange(item.id, e.target.value)}
                                        className={`input-field w-40 text-sm py-2 ${currentStatus.value === 'completed' ? 'bg-success/10 border-success text-success' : ''}`}
                                        disabled={isUpdatingStatus}
                                    >
                                        {statusOptions.map(opt => (
                                            <option key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

          {/* Notes */}
          {repair.notes && (
            <div className="card-static p-4 bg-blue-50 border-l-4 border-blue-400 rounded">
                <p className="text-sm text-neutral-700">
                    <span className="font-semibold">หมายเหตุจากลูกค้า:</span> {repair.notes}
                </p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
            {/* Cost Summary */}
            <div className="card-static">
                <h3 className="font-semibold text-neutral-dark mb-4">
                    สรุปค่าใช้จ่าย
                </h3>
                <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                        <span className="text-neutral-500">ยอดอนุมัติเบื้องต้น</span>
                        <span className="font-medium text-neutral-dark">
                            ฿{repair.totalEstimate.toLocaleString()}
                        </span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-neutral-500">ยอดอนุมัติเพิ่มเติม</span>
                        <span className="font-medium text-warning">
                             +฿{repair.items.filter(i => i.isAdditional).reduce((sum, i) => sum + i.cost, 0).toLocaleString()}
                        </span>
                    </div>
                    <div className="flex justify-between pt-3 border-t font-semibold">
                        <span className="text-neutral-700">ยอดรวมทั้งหมด</span>
                        <span className="text-xl text-primary-600">
                            ฿{repair.items.reduce((sum, i) => sum + i.cost, 0).toLocaleString()}
                        </span>
                    </div>
                    <p className="text-xs text-neutral-500 pt-2 border-t">
                        สถานะล่าสุด: {repair.currentStatus}
                    </p>
                </div>
            </div>
            
            {/* Quick Actions */}
            <div className="card">
                <h3 className="font-semibold text-neutral-dark mb-4">
                    การดำเนินการด่วน
                </h3>
                
                <div className="space-y-2">
                    <Button 
                        variant="secondary"
                        icon="request_quote"
                        fullWidth
                        onClick={() => setShowApprovalModal(true)}
                    >
                        ขออนุมัติรายการเพิ่มเติม
                    </Button>
                    <Link
                        to="/garage/approvals"
                        className="btn-outline w-full flex items-center justify-center gap-2"
                    >
                        <span className="material-icons-round">visibility</span>
                        <span>ดูคำขออนุมัติทั้งหมด</span>
                    </Link>
                </div>
            </div>
            
            {/* Complete Status Warning */}
            {!allItemsCompleted && (
                <div className="p-4 bg-warning/10 border-l-4 border-warning rounded-lg">
                    <p className="text-sm text-neutral-700">
                        <span className="material-icons-round text-sm mr-1 align-middle text-warning">info</span>
                        กรุณาอัพเดตสถานะรายการซ่อมให้เป็น **เสร็จสิ้น** ทั้งหมด ก่อนแจ้งงานซ่อมเสร็จ
                    </p>
                </div>
            )}
        </div>
      </div>
      
      {/* Modal - ขออนุมัติรายการเพิ่มเติม */}
      <Modal
        isOpen={showApprovalModal}
        onClose={() => setShowApprovalModal(false)}
        title="ยื่นคำขออนุมัติรายการเพิ่มเติม"
        size="lg"
        footer={
            <>
                <Button variant="outline" onClick={() => setShowApprovalModal(false)}>ยกเลิก</Button>
                <Button 
                    variant="primary" 
                    onClick={handleSendApprovalRequest}
                    disabled={newApproval.items.some(item => !item.label || !item.cost)}
                >
                    <span className="material-icons-round mr-2">send</span>
                    ยื่นคำขอ ({calculateNewTotalCost().additional.toLocaleString()} บาท)
                </Button>
            </>
        }
      >
        <div className="space-y-6">
            {/* Warning */}
            <div className="p-4 bg-warning/10 border-l-4 border-warning rounded-lg">
                <p className="text-sm text-neutral-700">
                    <span className="material-icons-round text-sm mr-1 align-middle text-warning">info</span>
                    รายการนี้จะถูกส่งไปให้บริษัทประกันภัยเพื่อพิจารณาอนุมัติ
                </p>
            </div>
            
            {/* Reason */}
            <TextArea
                label="เหตุผลในการขออนุมัติเพิ่มเติม"
                value={newApproval.reason}
                onChange={(e) => setNewApproval(prev => ({ ...prev, reason: e.target.value }))}
                placeholder="ระบุเหตุผลที่พบความเสียหายเพิ่มเติม..."
                rows={3}
                required
            />
            
            {/* Additional Items List */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-neutral-dark">รายการซ่อมเพิ่มเติม</h4>
                    <Button variant="secondary" size="sm" icon="add" onClick={handleAddItem}>
                        เพิ่มรายการ
                    </Button>
                </div>
                
                <div className="space-y-3">
                    {newApproval.items.map((item, index) => (
                        <div key={item.id} className="p-3 bg-neutral-50 rounded-lg flex items-end gap-3">
                            <Input 
                                label={`รายการที่ ${index + 1}`}
                                value={item.label}
                                onChange={(e) => handleNewApprovalChange(index, 'label', e.target.value)}
                                placeholder="เช่น เปลี่ยนโช้คอัพหลัง"
                                className="flex-1"
                                required
                            />
                            <Input 
                                label="ค่าใช้จ่าย (บาท)"
                                type="number"
                                value={item.cost}
                                onChange={(e) => handleNewApprovalChange(index, 'cost', e.target.value)}
                                placeholder="0"
                                className="w-32"
                                required
                            />
                             <button
                                type="button"
                                onClick={() => handleRemoveItem(item.id)}
                                className="w-10 h-10 mb-0.5 text-neutral-400 hover:text-error transition-colors"
                             >
                                <span className="material-icons-round">delete</span>
                             </button>
                        </div>
                    ))}
                </div>
            </div>
            
            {/* Summary */}
            <div className="p-4 bg-primary-50 rounded-lg space-y-2 text-sm font-medium">
                <div className="flex justify-between">
                    <span className="text-neutral-600">ประมาณการเดิม</span>
                    <span>฿{calculateNewTotalCost().base.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-warning">
                    <span className="font-semibold">เพิ่มรายการนี้</span>
                    <span>+฿{calculateNewTotalCost().additional.toLocaleString()}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-primary-200 text-lg font-bold">
                    <span className="text-primary-600">ยอดรวมทั้งหมด</span>
                    <span className="text-primary-600">฿{calculateNewTotalCost().total.toLocaleString()}</span>
                </div>
            </div>
        </div>
      </Modal>

      {/* Modal - แจ้งงานซ่อมเสร็จสิ้น */}
      <Modal
        isOpen={showCompleteModal}
        onClose={() => setShowCompleteModal(false)}
        title="ยืนยันงานซ่อมเสร็จสิ้น"
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowCompleteModal(false)}>ยกเลิก</Button>
            <Button variant="success" icon="task_alt" onClick={handleCompleteRepair}>ยืนยันเสร็จสิ้น</Button>
          </>
        }
      >
        <div className="text-center py-4">
          <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-icons-round text-4xl text-success">
              task_alt
            </span>
          </div>
          <p className="text-lg font-semibold text-neutral-dark mb-4">
            คุณแน่ใจหรือไม่ว่างานซ่อมเสร็จสมบูรณ์แล้ว?
          </p>
          <p className="text-neutral-600 mb-4">
            ระบบจะแจ้งให้ลูกค้าและบริษัทประกันภัยทราบ และลูกค้าจะสามารถเข้ามารับรถได้
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default GarageRepairDetail;