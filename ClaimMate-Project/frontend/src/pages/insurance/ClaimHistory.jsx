import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { StatusBadge } from '../../components';

/**
 * ClaimHistory - หน้าประวัติการเคลมทั้งหมด
 * 
 * จุดประสงค์:
 * - ดูประวัติเคลมที่เสร็จสิ้นหรือยกเลิกแล้ว
 * - ค้นหาและ filter เคลม
 * - Export รายงาน
 * 
 * TODO: Backend Integration
 * - GET /api/insurance/claims/history?page={page}&status={status} - ดึงประวัติเคลม
 */
const ClaimHistory = () => {
  const [loading, setLoading] = useState(true);
  const [claims, setClaims] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterMonth, setFilterMonth] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const statusFilters = [
    { value: 'all', label: 'ทั้งหมด' },
    { value: 'completed', label: 'เสร็จสิ้น' },
    { value: 'cancelled', label: 'ยกเลิก' },
    { value: 'rejected', label: 'ไม่อนุมัติ' },
  ];

  const monthFilters = [
    { value: 'all', label: 'ทุกเดือน' },
    { value: '2024-10', label: 'ตุลาคม 2024' },
    { value: '2024-09', label: 'กันยายน 2024' },
    { value: '2024-08', label: 'สิงหาคม 2024' },
  ];

  useEffect(() => {
    // TODO: Backend - ดึงประวัติเคลม
    // fetchClaimHistory();
    
    // Mock data
    setTimeout(() => {
      setClaims([
        {
          id: '10',
          claimNumber: 'CLM-2024-010',
          status: 'completed',
          customerName: 'นายสมชาย ใจดี',
          carModel: 'Honda City',
          licensePlate: 'กข 1234 กรุงเทพ',
          incidentDate: '2024-10-20',
          completedDate: '2024-10-28',
          estimatedCost: 25000,
          approvedAmount: 25000,
          assignedOfficer: 'นางสาววิภา ประกันภัย',
        },
        {
          id: '9',
          claimNumber: 'CLM-2024-009',
          status: 'completed',
          customerName: 'นางสุดา รักษ์ดี',
          carModel: 'Toyota Yaris',
          licensePlate: 'คง 5678 กรุงเทพ',
          incidentDate: '2024-10-15',
          completedDate: '2024-10-22',
          estimatedCost: 15000,
          approvedAmount: 15000,
          assignedOfficer: 'นายสมชาย ตรวจสอบ',
        },
        {
          id: '8',
          claimNumber: 'CLM-2024-008',
          status: 'cancelled',
          customerName: 'นายประเสริฐ มั่นคง',
          carModel: 'Mazda CX-5',
          licensePlate: 'งง 9999 กรุงเทพ',
          incidentDate: '2024-09-28',
          completedDate: '2024-09-30',
          estimatedCost: 32000,
          approvedAmount: 0,
          assignedOfficer: 'นางสาววิภา ประกันภัย',
        },
        {
          id: '7',
          claimNumber: 'CLM-2024-007',
          status: 'completed',
          customerName: 'นางวิมล สุขสันต์',
          carModel: 'Honda CR-V',
          licensePlate: 'ฮฮ 7777 กรุงเทพ',
          incidentDate: '2024-09-10',
          completedDate: '2024-09-18',
          estimatedCost: 48000,
          approvedAmount: 45000,
          assignedOfficer: 'นางสุดา รายงาน',
        },
        {
          id: '6',
          claimNumber: 'CLM-2024-006',
          status: 'rejected',
          customerName: 'นายเจริญ พัฒนา',
          carModel: 'Toyota Fortuner',
          licensePlate: 'จจ 1111 กรุงเทพ',
          incidentDate: '2024-08-20',
          completedDate: '2024-08-22',
          estimatedCost: 80000,
          approvedAmount: 0,
          assignedOfficer: 'นายสมชาย ตรวจสอบ',
        },
      ]);
      setLoading(false);
    }, 500);
  }, []);

  // Filter claims
  const filteredClaims = claims.filter(claim => {
    // Filter by status
    if (filterStatus !== 'all' && claim.status !== filterStatus) {
      return false;
    }
    
    // Filter by month
    if (filterMonth !== 'all') {
      const claimMonth = claim.incidentDate.substring(0, 7);
      if (claimMonth !== filterMonth) {
        return false;
      }
    }
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        claim.claimNumber.toLowerCase().includes(term) ||
        claim.customerName.toLowerCase().includes(term) ||
        claim.licensePlate.toLowerCase().includes(term)
      );
    }
    
    return true;
  });

  const getStatusConfig = (status) => {
    const config = {
      completed: { label: 'เสร็จสิ้น', variant: 'success', icon: 'check_circle' },
      cancelled: { label: 'ยกเลิก', variant: 'neutral', icon: 'cancel' },
      rejected: { label: 'ไม่อนุมัติ', variant: 'error', icon: 'block' },
    };
    return config[status] || config.completed;
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-dark mb-2">
            ประวัติการเคลม
          </h1>
          <p className="text-neutral-500">
            เคลมที่เสร็จสิ้นหรือปิดไปแล้ว - {filteredClaims.length} รายการ
          </p>
        </div>
        <button className="btn-outline flex items-center gap-2">
          <span className="material-icons-round">file_download</span>
          <span>Export รายงาน</span>
        </button>
      </div>

      {/* Filters */}
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
                placeholder="ค้นหาด้วยเลขเคลม, ชื่อลูกค้า, ทะเบียนรถ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-12"
              />
            </div>
          </div>

          {/* Month Filter */}
          <select
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="input-field lg:w-56"
          >
            {monthFilters.map(filter => (
              <option key={filter.value} value={filter.value}>
                {filter.label}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <div className="flex gap-2 overflow-x-auto">
            {statusFilters.map(filter => (
              <button
                key={filter.value}
                onClick={() => setFilterStatus(filter.value)}
                className={`
                  px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all duration-300
                  ${filterStatus === filter.value
                    ? 'bg-primary-500 text-white shadow-button'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }
                `}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Claims Table */}
      {filteredClaims.length === 0 ? (
        <div className="card-static text-center py-16">
          <span className="material-icons-round text-6xl text-neutral-300 mb-4">
            search_off
          </span>
          <p className="text-neutral-500 text-lg mb-2">
            ไม่พบประวัติการเคลม
          </p>
          <p className="text-neutral-400 text-sm">
            ลองเปลี่ยนคำค้นหาหรือตัวกรอง
          </p>
        </div>
      ) : (
        <div className="card-static overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-200">
                <th className="text-left py-3 px-4 font-semibold text-neutral-700">เลขเคลม</th>
                <th className="text-left py-3 px-4 font-semibold text-neutral-700">ลูกค้า</th>
                <th className="text-left py-3 px-4 font-semibold text-neutral-700">รถยนต์</th>
                <th className="text-left py-3 px-4 font-semibold text-neutral-700">วันเกิดเหตุ</th>
                <th className="text-left py-3 px-4 font-semibold text-neutral-700">วันเสร็จสิ้น</th>
                <th className="text-right py-3 px-4 font-semibold text-neutral-700">ค่าซ่อม</th>
                <th className="text-center py-3 px-4 font-semibold text-neutral-700">สถานะ</th>
                <th className="text-center py-3 px-4 font-semibold text-neutral-700">การดำเนินการ</th>
              </tr>
            </thead>
            <tbody>
              {filteredClaims.map(claim => {
                const statusConfig = getStatusConfig(claim.status);
                
                return (
                  <tr key={claim.id} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors duration-200">
                    <td className="py-4 px-4">
                      <p className="font-semibold text-neutral-dark">{claim.claimNumber}</p>
                      <p className="text-xs text-neutral-500">{claim.assignedOfficer}</p>
                    </td>
                    <td className="py-4 px-4">
                      <p className="font-medium text-neutral-dark">{claim.customerName}</p>
                    </td>
                    <td className="py-4 px-4">
                      <p className="font-medium text-neutral-dark">{claim.carModel}</p>
                      <p className="text-xs text-neutral-500">{claim.licensePlate}</p>
                    </td>
                    <td className="py-4 px-4 text-sm text-neutral-600">
                      {claim.incidentDate}
                    </td>
                    <td className="py-4 px-4 text-sm text-neutral-600">
                      {claim.completedDate}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <p className="font-semibold text-neutral-dark">
                        ฿{claim.estimatedCost.toLocaleString()}
                      </p>
                      {claim.approvedAmount > 0 && (
                        <p className="text-xs text-success">
                          อนุมัติ ฿{claim.approvedAmount.toLocaleString()}
                        </p>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`badge badge-${statusConfig.variant} inline-flex items-center gap-1`}>
                        <span className="material-icons-round text-xs">{statusConfig.icon}</span>
                        {statusConfig.label}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <Link
                        to={`/insurance/claims/${claim.id}`}
                        className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-700 font-medium text-sm"
                      >
                        <span className="material-icons-round text-sm">visibility</span>
                        <span>ดูรายละเอียด</span>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ClaimHistory;