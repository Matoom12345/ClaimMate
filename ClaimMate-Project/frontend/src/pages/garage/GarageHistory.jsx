import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardBody, Badge, Button, Modal } from '../../components';
import { format } from 'date-fns';

const GarageHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Status config
  const statusConfig = {
    completed: { label: 'เสร็จสิ้น', color: 'success', icon: 'task_alt' }
  };

  const getStatusBadge = (status) => {
    const config = statusConfig[status] || { label: status, color: 'neutral', icon: 'info' };
    return (
      <Badge variant={config.color} icon={config.icon} size="sm">
        {config.label}
      </Badge>
    );
  };

  // ✅ โหลดประวัติ
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3000/api/garages/history', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setHistory(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
      alert('ไม่สามารถโหลดประวัติได้');
    } finally {
      setLoading(false);
    }
  };

  // ✅ ดูรายละเอียด
  const handleViewDetail = async (claim) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:3000/api/garages/repairs/R-${claim.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setSelectedClaim(response.data.data);
        setShowDetailModal(true);
      }
    } catch (error) {
      console.error('Error fetching detail:', error);
      alert('ไม่สามารถโหลดรายละเอียดได้');
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-neutral-dark mb-2">
          ประวัติการซ่อม
        </h1>
        <p className="text-neutral-500">
          งานซ่อมที่เสร็จสิ้นแล้วทั้งหมด ({history.length} รายการ)
        </p>
      </div>

      {/* Empty State */}
      {history.length === 0 ? (
        <div className="card-static text-center py-16">
          <span className="material-icons-round text-6xl text-neutral-300 mb-4">
            history
          </span>
          <p className="text-neutral-500 text-lg mb-2">
            ยังไม่มีประวัติการซ่อม
          </p>
          <p className="text-neutral-400 text-sm">
            เมื่อมีงานซ่อมเสร็จสิ้น รายการจะปรากฏที่นี่
          </p>
        </div>
      ) : (
        <div className="card-static overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    รหัสงาน
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    ลูกค้า
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    รถยนต์
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    วันที่เสร็จสิ้น
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    ยอดรวม
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    สถานะ
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    การดำเนินการ
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-200">
                {history.map((claim) => (
                  <tr key={claim.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-neutral-900">
                        R-{claim.id}
                      </div>
                      <div className="text-xs text-neutral-500">
                        CLM-{claim.id}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-neutral-900">
                        {claim.Customer?.User?.firstName} {claim.Customer?.User?.lastName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-neutral-900">
                        {claim.Car?.brand} {claim.Car?.model}
                      </div>
                      <div className="text-xs text-neutral-500">
                        {claim.Car?.licensePlate}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">
                      {claim.ClaimStatus?.completedDate
                        ? format(new Date(claim.ClaimStatus.completedDate), 'dd/MM/yyyy')
                        : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-primary-600">
                        ฿{(claim.approvedCost || claim.estimateCost || 0).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge('completed')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => handleViewDetail(claim)}
                        className="text-primary-600 hover:text-primary-800 font-medium text-sm"
                      >
                        ดูรายละเอียด
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: รายละเอียดงานซ่อม */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedClaim(null);
        }}
        title="รายละเอียดงานซ่อม"
        size="lg"
      >
        {selectedClaim ? (
          <div className="space-y-4">
            {/* ข้อมูลหลัก */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-neutral-50 rounded-lg">
              <div>
                <p className="text-xs text-neutral-500">รหัสงาน</p>
                <p className="font-medium text-neutral-dark">{selectedClaim.id}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500">เคส</p>
                <p className="font-medium text-neutral-dark">{selectedClaim.claimId}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500">ลูกค้า</p>
                <p className="font-medium text-neutral-dark">{selectedClaim.customerName}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500">รถยนต์</p>
                <p className="font-medium text-neutral-dark">{selectedClaim.carModel}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500">ทะเบียน</p>
                <p className="font-medium text-neutral-dark">{selectedClaim.licensePlate}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500">วันที่เสร็จสิ้น</p>
                <p className="font-medium text-neutral-dark">
                  {selectedClaim.startDate
                    ? format(new Date(selectedClaim.startDate), 'dd/MM/yyyy')
                    : '-'}
                </p>
              </div>
            </div>

            {/* รายการซ่อม */}
            <div className="card-static">
              <h4 className="font-semibold text-neutral-dark mb-3 flex items-center gap-2">
                <span className="material-icons-round text-primary-500">build</span>
                รายการซ่อมทั้งหมด ({selectedClaim.items?.length || 0})
              </h4>
              <div className="space-y-2">
                {selectedClaim.items && selectedClaim.items.length > 0 ? (
                  selectedClaim.items.map((item, index) => (
                    <div key={item.id} className="flex justify-between items-center p-3 bg-neutral-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="material-icons-round text-success text-lg">
                          check_circle
                        </span>
                        <div>
                          <p className="text-xs text-neutral-500">รายการที่ {index + 1}</p>
                          <p className="font-medium text-neutral-dark">{item.label}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-primary-600">
                          ฿{item.cost.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-neutral-500 text-center py-4">ไม่มีรายการซ่อม</p>
                )}

                {/* ยอดรวม */}
                {selectedClaim.items && selectedClaim.items.length > 0 && (
                  <div className="flex justify-between items-center p-4 bg-primary-50 rounded-lg font-semibold border-t-2 border-primary-200 mt-3">
                    <span className="text-primary-700">ยอดรวมทั้งหมด</span>
                    <span className="text-xl text-primary-700">
                      ฿{selectedClaim.items.reduce((sum, item) => sum + item.cost, 0).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* หมายเหตุ */}
            {selectedClaim.notes && (
              <div className="p-4 bg-blue-50 border-l-4 border-blue-400 rounded">
                <p className="text-sm text-neutral-700">
                  <span className="font-semibold">หมายเหตุ:</span> {selectedClaim.notes}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <span className="material-icons-round animate-spin text-4xl text-primary-500 mb-4">
              refresh
            </span>
            <p className="text-neutral-500">กำลังโหลด...</p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default GarageHistory;