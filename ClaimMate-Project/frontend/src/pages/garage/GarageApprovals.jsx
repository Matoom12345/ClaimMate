import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardBody, Badge, Button, Modal, TextArea } from '../../components';
import axios from 'axios';

/**
 * GarageApprovals - หน้าคำขอซ่อมด่วนที่ลูกค้าส่งมา
 * รออู่อนุมัติหรือปฏิเสธ
 */
const GarageApprovals = () => {
  const [urgentRequests, setUrgentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchUrgentRequests();
  }, []);

  const fetchUrgentRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3000/api/garages/urgent-requests', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data.success) {
        setUrgentRequests(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching urgent requests:', err);
      setError(err.response?.data?.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedRequest) return;

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:3000/api/garages/urgent-requests/${selectedRequest.urgentRequestId}/approve`,
        {},
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      alert('✅ อนุมัติคำขอซ่อมด่วนสำเร็จ');
      setShowApproveModal(false);
      setSelectedRequest(null);
      fetchUrgentRequests(); // Refresh data
    } catch (err) {
      console.error('Error approving:', err);
      alert(err.response?.data?.message || 'เกิดข้อผิดพลาด');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest || !rejectReason.trim()) {
      alert('กรุณาระบุเหตุผลในการปฏิเสธ');
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:3000/api/garages/urgent-requests/${selectedRequest.urgentRequestId}/reject`,
        { reason: rejectReason },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      alert('✅ ปฏิเสธคำขอสำเร็จ');
      setShowRejectModal(false);
      setSelectedRequest(null);
      setRejectReason('');
      fetchUrgentRequests(); // Refresh data
    } catch (err) {
      console.error('Error rejecting:', err);
      alert(err.response?.data?.message || 'เกิดข้อผิดพลาด');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Status config
  const statusConfig = {
    pending: { label: 'รออนุมัติ', color: 'warning', icon: 'pending', textColor: 'text-warning', iconBg: 'bg-yellow-100' },
    approved: { label: 'อนุมัติแล้ว', color: 'success', icon: 'check_circle', textColor: 'text-success', iconBg: 'bg-green-100' },
    rejected: { label: 'ปฏิเสธ', color: 'error', icon: 'cancel', textColor: 'text-error', iconBg: 'bg-red-100' },
  };

  const getStatusBadge = (status) => {
    const config = statusConfig[status] || { label: status, color: 'neutral', icon: 'info' };
    return (
      <Badge variant={config.color} icon={config.icon} size="md">
        {config.label}
      </Badge>
    );
  };

  // Filter by status
  const filteredRequests = filterStatus === 'all' 
    ? urgentRequests 
    : urgentRequests.filter(r => r.status === filterStatus);

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

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <span className="material-icons-round text-6xl text-error mb-4">error_outline</span>
          <p className="text-error font-medium mb-2">{error}</p>
          <Button onClick={fetchUrgentRequests} variant="primary">ลองอีกครั้ง</Button>
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
            คำขอซ่อมด่วน
          </h1>
          <p className="text-neutral-500">
            คำขอซ่อมด่วนจากลูกค้า รออนุมัติจากอู่ ({urgentRequests.length} รายการ)
          </p>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.keys(statusConfig).map(status => {
          const config = statusConfig[status];
          const count = urgentRequests.filter(r => r.status === status).length;
          
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
              ทั้งหมด ({urgentRequests.length})
            </button>
            <button 
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filterStatus === 'pending' ? 'bg-warning text-white shadow-button' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
              onClick={() => setFilterStatus('pending')}
            >
              รออนุมัติ ({urgentRequests.filter(r => r.status === 'pending').length})
            </button>
            <button 
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filterStatus === 'approved' ? 'bg-success text-white shadow-button' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
              onClick={() => setFilterStatus('approved')}
            >
              อนุมัติแล้ว ({urgentRequests.filter(r => r.status === 'approved').length})
            </button>
          </div>
        </CardBody>
      </Card>

      {/* Urgent Requests List */}
      <div className="grid grid-cols-1 gap-6">
        {filteredRequests.length === 0 ? (
          <Card>
            <CardBody className="text-center py-12">
              <span className="material-icons-round text-6xl text-neutral-300 mb-4">inbox</span>
              <h3 className="text-xl font-semibold text-neutral-500 mb-2">
                ไม่มีคำขอซ่อมด่วน
              </h3>
              <p className="text-neutral-400">
                ไม่พบคำขอซ่อมด่วนในสถานะนี้
              </p>
            </CardBody>
          </Card>
        ) : (
          filteredRequests.map((request) => (
            <Card key={request.id} className="hover:shadow-card-hover">
              <CardBody>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="material-icons-round text-2xl text-error">
                        warning
                      </span>
                      <h3 className="text-xl font-bold text-neutral-dark">
                        คำขอซ่อมด่วน
                      </h3>
                      {getStatusBadge(request.status)}
                    </div>
                    <p className="text-neutral-600 mb-1">
                      <span className="font-medium">ลูกค้า:</span> {request.customerName}
                      {request.customerPhone && ` • ${request.customerPhone}`}
                    </p>
                    <p className="text-neutral-600 mb-1">
                      <span className="font-medium">รถ:</span> {request.carModel}
                      {request.licensePlate && ` • ทะเบียน: ${request.licensePlate}`}
                    </p>
                    <p className="text-neutral-600">
                      <span className="font-medium">เคส:</span> {request.claimId}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-neutral-dark mb-1">
                      {request.id}
                    </p>
                    <p className="text-xs text-neutral-500">
                      ส่งเมื่อ: {new Date(request.requestDate).toLocaleDateString('th-TH', { 
                        day: 'numeric', 
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                    {request.approvalDate && (
                      <p className={`text-xs font-medium mt-1 ${
                        request.status === 'approved' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {request.status === 'approved' ? 'อนุมัติ' : 'ปฏิเสธ'}: {new Date(request.approvalDate).toLocaleDateString('th-TH', { 
                          day: 'numeric', 
                          month: 'short'
                        })}
                      </p>
                    )}
                  </div>
                </div>

                {/* Request Detail */}
                {request.detail && (
                  <div className="mb-4 p-4 bg-amber-50 border-l-4 border-amber-400 rounded">
                    <p className="text-sm font-semibold text-neutral-700 mb-1">
                      รายละเอียดคำขอ:
                    </p>
                    <p className="text-sm text-neutral-700">
                      {request.detail}
                    </p>
                  </div>
                )}

                {/* File Attachment */}
                {request.fileUrl && (
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg flex items-center gap-3">
                    <span className="material-icons-round text-blue-600">attach_file</span>
                    <a 
                      href={request.fileUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline flex-1"
                    >
                      ดูไฟล์แนบ
                    </a>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center gap-3 pt-4 border-t border-neutral-200">
                  {request.status === 'pending' ? (
                    <>
                      <Button
                        variant="primary"
                        className="flex-1"
                        icon="check_circle"
                        onClick={() => {
                          setSelectedRequest(request);
                          setShowApproveModal(true);
                        }}
                      >
                        อนุมัติ
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 border-error text-error hover:bg-red-50"
                        icon="cancel"
                        onClick={() => {
                          setSelectedRequest(request);
                          setShowRejectModal(true);
                        }}
                      >
                        ปฏิเสธ
                      </Button>
                    </>
                  ) : (
                    <Link
                      to={`/garage/repairs/${request.claimId.replace('CLM-', 'R-')}`}
                      className="flex-1 btn-outline flex items-center justify-center gap-2"
                    >
                      <span className="material-icons-round">visibility</span>
                      ดูรายละเอียดงาน
                    </Link>
                  )}
                </div>
              </CardBody>
            </Card>
          ))
        )}
      </div>

      {/* Approve Modal */}
      <Modal
        isOpen={showApproveModal}
        onClose={() => setShowApproveModal(false)}
        title="ยืนยันการอนุมัติ"
        size="md"
      >
        {selectedRequest && (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-neutral-700 mb-2">
                <span className="font-semibold">คำขอ:</span> {selectedRequest.id}
              </p>
              <p className="text-sm text-neutral-700 mb-2">
                <span className="font-semibold">ลูกค้า:</span> {selectedRequest.customerName}
              </p>
              <p className="text-sm text-neutral-700">
                <span className="font-semibold">รถ:</span> {selectedRequest.carModel}
              </p>
            </div>

            <p className="text-neutral-600">
              คุณต้องการอนุมัติคำขอซ่อมด่วนนี้ใช่หรือไม่?
              <br />
              อู่จะสามารถเริ่มดำเนินการซ่อมได้ทันที
            </p>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                fullWidth
                onClick={() => setShowApproveModal(false)}
                disabled={isSubmitting}
              >
                ยกเลิก
              </Button>
              <Button
                variant="primary"
                fullWidth
                icon="check_circle"
                onClick={handleApprove}
                loading={isSubmitting}
                className="bg-success hover:bg-green-600"
              >
                ยืนยันอนุมัติ
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Reject Modal */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        title="ปฏิเสธคำขอ"
        size="md"
      >
        {selectedRequest && (
          <div className="space-y-4">
            <div className="p-4 bg-red-50 rounded-lg">
              <p className="text-sm text-neutral-700 mb-2">
                <span className="font-semibold">คำขอ:</span> {selectedRequest.id}
              </p>
              <p className="text-sm text-neutral-700 mb-2">
                <span className="font-semibold">ลูกค้า:</span> {selectedRequest.customerName}
              </p>
              <p className="text-sm text-neutral-700">
                <span className="font-semibold">รถ:</span> {selectedRequest.carModel}
              </p>
            </div>

            <p className="text-neutral-600">
              คุณต้องการปฏิเสธคำขอซ่อมด่วนนี้ใช่หรือไม่?
            </p>

            <TextArea
              label="เหตุผลในการปฏิเสธ"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="เช่น ไม่สามารถซ่อมได้ในเวลาที่กำหนด, ต้องการอะไหล่พิเศษ"
              rows={3}
              required
            />

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                fullWidth
                onClick={() => setShowRejectModal(false)}
                disabled={isSubmitting}
              >
                ยกเลิก
              </Button>
              <Button
                variant="primary"
                fullWidth
                icon="cancel"
                onClick={handleReject}
                loading={isSubmitting}
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

export default GarageApprovals;