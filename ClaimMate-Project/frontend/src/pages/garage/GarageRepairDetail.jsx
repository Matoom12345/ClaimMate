import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, CardBody, StatusBadge, Button, Modal, Input, TextArea, Select, Badge } from '../../components';

/**
 * GarageRepairDetail - หน้ารายละเอียดงานซ่อมและอัพเดตสถานะ
 * * Features:
 * 1. แสดงรายละเอียดงานซ่อม
 * 2. อัพเดตสถานะของแต่ละรายการซ่อม (Requirement B)
 * 3. ปุ่มขออนุมัติรายการเพิ่มเติม (Requirement C)
 * 4. ปุ่มแจ้งงานซ่อมเสร็จสิ้น (เปลี่ยนสถานะเป็น completed)
 */

const REPAIR_ITEMS_OPTIONS = [
  { value: 'เปลี่ยนกันชนหน้า', label: 'เปลี่ยนกันชนหน้า', category: 'ด้านหน้า' },
  { value: 'เปลี่ยนกันชนหลัง', label: 'เปลี่ยนกันชนหลัง', category: 'ด้านหลัง' },
  { value: 'ซ่อม/เปลี่ยนฝากระโปรงหน้า', label: 'ซ่อม/เปลี่ยนฝากระโปรงหน้า', category: 'ด้านหน้า' },
  { value: 'เปลี่ยนไฟหน้า', label: 'เปลี่ยนไฟหน้า', category: 'ด้านหน้า' },
  { value: 'เปลี่ยนไฟท้าย', label: 'เปลี่ยนไฟท้าย', category: 'ด้านหลัง' },
  { value: 'ซ่อมประตูหน้าซ้าย', label: 'ซ่อมประตูหน้าซ้าย', category: 'ด้านข้าง' },
  { value: 'ซ่อมประตูหน้าขวา', label: 'ซ่อมประตูหน้าขวา', category: 'ด้านข้าง' },
  { value: 'ซ่อมประตูหลังซ้าย', label: 'ซ่อมประตูหลังซ้าย', category: 'ด้านข้าง' },
  { value: 'ซ่อมประตูหลังขวา', label: 'ซ่อมประตูหลังขวา', category: 'ด้านข้าง' },
  { value: 'ซ่อมบังโคลนซ้าย', label: 'ซ่อมบังโคลนซ้าย', category: 'ด้านข้าง' },
  { value: 'ซ่อมบังโคลนขวา', label: 'ซ่อมบังโคลนขวา', category: 'ด้านข้าง' },
  { value: 'เปลี่ยนกระจกหน้า', label: 'เปลี่ยนกระจกหน้า', category: 'กระจก' },
  { value: 'เปลี่ยนกระจกหลัง', label: 'เปลี่ยนกระจกหลัง', category: 'กระจก' },
  { value: 'เปลี่ยนกระจกข้างซ้าย', label: 'เปลี่ยนกระจกข้างซ้าย', category: 'กระจก' },
  { value: 'เปลี่ยนกระจกข้างขวา', label: 'เปลี่ยนกระจกข้างขวา', category: 'กระจก' },
  { value: 'เปลี่ยนกระจกมองข้างซ้าย', label: 'เปลี่ยนกระจกมองข้างซ้าย', category: 'กระจก' },
  { value: 'เปลี่ยนกระจกมองข้างขวา', label: 'เปลี่ยนกระจกมองข้างขวา', category: 'กระจก' },
  { value: 'พ่นสีด้านหน้า', label: 'พ่นสีด้านหน้า', category: 'พ่นสี' },
  { value: 'พ่นสีด้านหลัง', label: 'พ่นสีด้านหลัง', category: 'พ่นสี' },
  { value: 'พ่นสีด้านซ้าย', label: 'พ่นสีด้านซ้าย', category: 'พ่นสี' },
  { value: 'พ่นสีด้านขวา', label: 'พ่นสีด้านขวา', category: 'พ่นสี' },
  { value: 'เปลี่ยนยาง', label: 'เปลี่ยนยาง', category: 'ล้อ/ยาง' },
  { value: 'เปลี่ยนล้อ', label: 'เปลี่ยนล้อ', category: 'ล้อ/ยาง' },
  { value: 'ซ่อมช่วงล่าง', label: 'ซ่อมช่วงล่าง', category: 'ช่วงล่าง' },
  { value: 'ตั้งศูนย์ล้อ', label: 'ตั้งศูนย์ล้อ', category: 'ช่วงล่าง' },
  { value: 'other', label: '🔧 อื่นๆ (ระบุ)', category: 'อื่นๆ' },
];


const GarageRepairDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [repair, setRepair] = useState(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // State สำหรับ Modal ขออนุมัติเพิ่มเติม
  const [newApproval, setNewApproval] = useState({
    reason: '',
    items: [{
      id: 1,
      type: '',              // dropdown value
      customDescription: '', // ถ้าเลือก 'other'
      cost: ''
    }],
  });

  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);

  const statusOptions = [
    { value: 'in_progress', label: 'กำลังดำเนินการ', icon: 'autorenew' },
    { value: 'completed', label: 'เสร็จสิ้น', icon: 'check_circle' },
  ];

  // TODO: Backend - ดึงรายละเอียดงานซ่อม
  // ✅ โหลดข้อมูล
  useEffect(() => {
    fetchRepairDetail();
  }, [id]);

  const fetchRepairDetail = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:3000/api/garages/repairs/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setRepair(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching repair detail:', error);
      alert('ไม่สามารถโหลดข้อมูลได้');
    } finally {
      setLoading(false);
    }
  };


  // ✅ อัปเดตสถานะรายการซ่อม
  const handleItemStatusChange = async (itemId, newStatus) => {
    setIsUpdatingStatus(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:3000/api/garages/repairs/${id}/items/${itemId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // อัปเดต UI
      setRepair(prev => ({
        ...prev,
        items: prev.items.map(item =>
          item.id === itemId ? { ...item, status: newStatus } : item
        ),
      }));

      alert('✅ อัปเดตสถานะสำเร็จ');
    } catch (error) {
      console.error('Error updating status:', error);
      alert('เกิดข้อผิดพลาดในการอัปเดตสถานะ');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // ✅ แก้ไข handleNewApprovalChange
  const handleNewApprovalChange = (index, field, value) => {
    const updatedItems = newApproval.items.map((item, i) => {
      if (i === index) {
        // ถ้าเปลี่ยน type และไม่ใช่ 'other' → ล้าง customDescription
        if (field === 'type' && value !== 'other') {
          return { ...item, type: value, customDescription: '' };
        }
        return { ...item, [field]: value };
      }
      return item;
    });
    setNewApproval(prev => ({ ...prev, items: updatedItems }));
  };

  // ✅ แก้ไข handleAddItem
  const handleAddItem = () => {
    setNewApproval(prev => ({
      ...prev,
      items: [...prev.items, {
        id: Date.now(),
        type: '',
        customDescription: '',
        cost: ''
      }]
    }));
  };
  const handleRemoveItem = (idToRemove) => {
    setNewApproval(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== idToRemove)
    }));
  };

  const calculateNewTotalCost = () => {
    // 🔥 ยอดปัจจุบัน = รายการที่อนุมัติแล้วทั้งหมด (ไม่ใช่ totalEstimate)
    const approvedCost = repair?.items
      .filter(item => item.status !== 'pending') // เฉพาะที่ไม่ใช่รออนุมัติ
      .reduce((sum, item) => sum + (item.cost || 0), 0) || 0;

    const additionalCost = newApproval.items.reduce((sum, item) =>
      sum + (parseFloat(item.cost) || 0), 0);

    return {
      base: approvedCost,
      additional: additionalCost,
      total: approvedCost + additionalCost
    };
  };

  const handleSendApprovalRequest = async () => {
    // Validation
    if (!newApproval.reason.trim()) {
      alert('กรุณาระบุเหตุผล');
      return;
    }

    // เช็คว่ากรอกครบหรือยัง
    for (const item of newApproval.items) {
      if (!item.type) {
        alert('กรุณาเลือกรายการซ่อม');
        return;
      }
      if (item.type === 'other' && !item.customDescription.trim()) {
        alert('กรุณาระบุรายละเอียดสำหรับรายการ "อื่นๆ"');
        return;
      }
      if (!item.cost || parseFloat(item.cost) <= 0) {
        alert('กรุณากรอกค่าใช้จ่ายที่ถูกต้อง');
        return;
      }
    }

    try {
      const token = localStorage.getItem('token');
      const claimIdNum = repair.claimId.replace('CLM-', '');

      // ✅ สร้าง payload ส่งไป Backend
      const itemsToSend = newApproval.items.map(item => ({
        label: item.type === 'other' ? item.customDescription : item.type,
        cost: parseFloat(item.cost)
      }));

      const response = await axios.post(
        'http://localhost:3000/api/garages/request-additional',
        {
          claimId: claimIdNum,
          items: itemsToSend,
          reason: newApproval.reason
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setShowApprovalModal(false);

      if (response.data.success) {
        alert(`✅ ${response.data.message}`);
        // Refresh ข้อมูล
        await fetchRepairDetail();
        // Reset form
        setNewApproval({
          reason: '',
          items: [{ id: 1, type: '', customDescription: '', cost: '' }]
        });
      }

    } catch (error) {
      console.error('Error sending approval request:', error);
      alert('เกิดข้อผิดพลาดในการส่งคำขอ: ' + (error.response?.data?.message || error.message));
    }
  };

  // Handle complete repair
  const handleCompleteRepair = async () => {
    try {
      const token = localStorage.getItem('token');
      const claimIdNum = repair.claimId.replace('CLM-', ''); // 🔥 ตัด prefix

      await axios.post(
        'http://localhost:3000/api/garages/complete-repair',
        { claimId: claimIdNum },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setShowCompleteModal(false);
      alert('✅ งานซ่อมเสร็จสิ้น! ลูกค้าจะได้รับการแจ้งเตือน');
      navigate('/garage/repairs');  // 🔥 กลับไปหน้ารายการซ่อม

    } catch (error) {
      console.error('Error completing repair:', error);
      alert('เกิดข้อผิดพลาดในการปิดงาน');
    }
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

  if (!repair) {
    return (
      <div className="text-center py-12">
        <span className="material-icons-round text-6xl text-neutral-300 mb-4">error_outline</span>
        <p className="text-neutral-500">ไม่พบข้อมูลงานซ่อม</p>
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
                <p className="font-medium text-neutral-dark">
                  {new Date(repair.startDate).toLocaleDateString('th-TH')}
                </p>
              </div>
            </div>
          </div>

          {/* Item Status Update */}
          <div className="card-static">
            <h2 className="text-xl font-semibold text-neutral-dark mb-4 flex items-center gap-2">
              <span className="material-icons-round text-primary-500">checklist</span>
              <span>รายการซ่อม ({repair.items.length})</span>
            </h2>

            <div className="space-y-4">
              {repair.items.map(item => {
                const currentStatus = statusOptions.find(s => s.value === item.status);
                // 🔥 เช็คสถานะการอนุมัติ
                const isPending = item.approvalStatus === 'pending' && !item.approved;
                const isRejected = item.approvalStatus === 'rejected' && !item.approved;
                const isLocked = isPending || isRejected;

                return (
                  <div
                    key={item.id}
                    className={`p-4 rounded-lg flex items-center justify-between ${isRejected
                        ? 'bg-error/5 border-2 border-error/20'
                        : isPending
                          ? 'bg-warning/5 border-2 border-warning/20'
                          : 'bg-neutral-50'
                      }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {/* 🔥 ขีดฆ่าถ้า rejected หรือ completed */}
                        <p className={`font-medium ${isRejected
                            ? 'line-through text-neutral-400'
                            : item.status === 'completed'
                              ? 'line-through text-neutral-500'
                              : 'text-neutral-dark'
                          }`}>
                          {item.label}
                        </p>

                        {/* 🔥 Badge แสดงสถานะพิเศษ */}
                        {isRejected && (
                          <Badge variant="error" size="sm">
                            <span className="material-icons-round text-xs mr-1">block</span>
                            ถูกปฏิเสธ
                          </Badge>
                        )}
                        {isPending && (
                          <Badge variant="warning" size="sm">
                            <span className="material-icons-round text-xs mr-1">schedule</span>
                            รออนุมัติ
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge variant={item.isAdditional ? 'secondary' : 'neutral'} size="sm">
                          {item.isAdditional ? 'รายการเพิ่มเติม' : 'รายการหลัก'}
                        </Badge>
                        <span className={`text-sm font-medium ${isRejected ? 'text-neutral-400 line-through' : 'text-primary-600'
                          }`}>
                          ฿{item.cost.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="ml-4 flex items-center gap-2">
                      {/* 🔥 แสดง Lock Box ถ้าเป็น pending/rejected */}
                      {isLocked ? (
                        <div className="w-40 px-3 py-2 bg-neutral-100 rounded-lg border border-neutral-200 flex items-center gap-2 text-sm text-neutral-500">
                          <span className="material-icons-round text-sm">lock</span>
                          <span>{isPending ? 'รออนุมัติ' : 'ถูกปฏิเสธ'}</span>
                        </div>
                      ) : (
                        <select
                          value={item.status}
                          onChange={(e) => handleItemStatusChange(item.id, e.target.value)}
                          className={`input-field w-40 text-sm py-2 ${currentStatus?.value === 'completed'
                              ? 'bg-success/10 border-success text-success'
                              : ''
                            }`}
                          disabled={isUpdatingStatus}
                        >
                          {statusOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      )}
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
              disabled={newApproval.items.some(item =>
                !item.type ||
                (item.type === 'other' && !item.customDescription) ||
                !item.cost
              )}
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
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              เหตุผลในการขออนุมัติเพิ่มเติม <span className="text-error">*</span>
            </label>
            <textarea
              value={newApproval.reason}
              onChange={(e) => setNewApproval(prev => ({ ...prev, reason: e.target.value }))}
              placeholder="ระบุเหตุผลที่พบความเสียหายเพิ่มเติม..."
              rows={3}
              className="input-field w-full"
              required
            />
          </div>

          {/* Additional Items List */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-neutral-dark">รายการซ่อมเพิ่มเติม</h4>
              <button
                type="button"
                onClick={handleAddItem}
                className="btn-secondary btn-sm flex items-center gap-1"
              >
                <span className="material-icons-round text-sm">add</span>
                <span>เพิ่มรายการ</span>
              </button>
            </div>

            <div className="space-y-3">
              {newApproval.items.map((item, index) => (
                <div key={item.id} className="p-4 bg-neutral-50 rounded-lg space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-neutral-600 mb-1">
                        รายการที่ {index + 1} <span className="text-error">*</span>
                      </label>
                      <select
                        value={item.type}
                        onChange={(e) => handleNewApprovalChange(index, 'type', e.target.value)}
                        className="input-field w-full"
                        required
                      >
                        <option value="">-- เลือกรายการซ่อม --</option>
                        {REPAIR_ITEMS_OPTIONS.map(opt => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="w-32">
                      <label className="block text-xs font-medium text-neutral-600 mb-1">
                        ค่าใช้จ่าย (บาท) <span className="text-error">*</span>
                      </label>
                      <input
                        type="number"
                        value={item.cost}
                        onChange={(e) => handleNewApprovalChange(index, 'cost', e.target.value)}
                        placeholder="0"
                        className="input-field w-full"
                        required
                      />
                    </div>

                    {newApproval.items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        className="w-8 h-8 mt-6 text-neutral-400 hover:text-error transition-colors"
                        title="ลบรายการ"
                      >
                        <span className="material-icons-round text-xl">delete</span>
                      </button>
                    )}
                  </div>

                  {item.type === 'other' && (
                    <div>
                      <label className="block text-xs font-medium text-neutral-600 mb-1">
                        ระบุรายละเอียด <span className="text-error">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="ระบุรายการซ่อมที่ไม่มีในตัวเลือก..."
                        value={item.customDescription}
                        onChange={(e) => handleNewApprovalChange(index, 'customDescription', e.target.value)}
                        className="input-field w-full"
                        required
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="p-4 bg-primary-50 rounded-lg space-y-2 text-sm font-medium">
            <div className="flex justify-between">
              <span className="text-neutral-600">ยอดอนุมัติปัจจุบัน</span>
              <span>฿{calculateNewTotalCost().base.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-warning">
              <span className="font-semibold">ขออนุมัติเพิ่ม</span>
              <span>+฿{calculateNewTotalCost().additional.toLocaleString()}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-primary-200 text-lg font-bold">
              <span className="text-primary-600">ยอดรวมหลังอนุมัติ</span>
              <span className="text-primary-600">
                ฿{calculateNewTotalCost().total.toLocaleString()}
              </span>
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
            <Button variant="primary" icon="task_alt" onClick={handleCompleteRepair}>ยืนยันเสร็จสิ้น</Button>
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