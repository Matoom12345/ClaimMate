import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

/**
 * ClaimHistory - หน้าประวัติการเคลมที่เสร็จสิ้นแล้ว
 *
 * จุดประสงค์:
 * - ดูประวัติเคลมที่เสร็จสิ้นเท่านั้น
 * - ค้นหาและ filter เคลม
 * - Export รายงาน
 * - แสดงสถิติและข้อมูลที่น่าสนใจ
 */
const ClaimHistory = () => {
  const [loading, setLoading] = useState(true);
  const [claims, setClaims] = useState([]);
  const [filterMonth, setFilterMonth] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const monthFilters = [
    { value: 'all', label: 'ทุกเดือน' },
    { value: '2024-10', label: 'ตุลาคม 2024' },
    { value: '2024-09', label: 'กันยายน 2024' },
    { value: '2024-08', label: 'สิงหาคม 2024' },
  ];

  useEffect(() => {
    // TODO: Backend - ดึงประวัติเคลมที่เสร็จสิ้นแล้ว
    setTimeout(() => {
      setClaims([
        {
          id: '10',
          claimNumber: 'CLM-2024-010',
          customerName: 'นายสมชาย ใจดี',
          carModel: 'Honda City',
          licensePlate: 'กข 1234 กรุงเทพ',
          incidentDate: '2024-10-20',
          completedDate: '2024-10-28',
          estimatedCost: 25000,
          approvedAmount: 25000,
          satisfaction: 5,
          assignedOfficer: 'นางสาววิภา ประกันภัย',
        },
        {
          id: '9',
          claimNumber: 'CLM-2024-009',
          customerName: 'นางสุดา รักษ์ดี',
          carModel: 'Toyota Yaris',
          licensePlate: 'คง 5678 กรุงเทพ',
          incidentDate: '2024-10-15',
          completedDate: '2024-10-22',
          estimatedCost: 15000,
          approvedAmount: 15000,
          satisfaction: 4,
          assignedOfficer: 'นายสมชาย ตรวจสอบ',
        },
        {
          id: '8',
          claimNumber: 'CLM-2024-008',
          customerName: 'นายประเสริฐ มั่นคง',
          carModel: 'Mazda CX-5',
          licensePlate: 'งง 9999 กรุงเทพ',
          incidentDate: '2024-09-28',
          completedDate: '2024-10-08',
          estimatedCost: 32000,
          approvedAmount: 30000,
          satisfaction: 3,
          assignedOfficer: 'นางสาววิภา ประกันภัย',
        },
        {
          id: '7',
          claimNumber: 'CLM-2024-007',
          customerName: 'นางวิมล สุขสันต์',
          carModel: 'Honda CR-V',
          licensePlate: 'ฮฮ 7777 กรุงเทพ',
          incidentDate: '2024-09-10',
          completedDate: '2024-09-18',
          estimatedCost: 48000,
          approvedAmount: 45000,
          satisfaction: 5,
          assignedOfficer: 'นางสุดา รายงาน',
        },
        {
          id: '6',
          claimNumber: 'CLM-2024-006',
          customerName: 'นายเจริญ พัฒนา',
          carModel: 'Toyota Fortuner',
          licensePlate: 'จจ 1111 กรุงเทพ',
          incidentDate: '2024-08-20',
          completedDate: '2024-09-05',
          estimatedCost: 55000,
          approvedAmount: 52000,
          satisfaction: 4,
          assignedOfficer: 'นายสมชาย ตรวจสอบ',
        },
      ]);
      setLoading(false);
    }, 500);
  }, []);

  // Filter claims
  const filteredClaims = claims.filter(claim => {
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

  // Calculate statistics
  const stats = {
    totalClaims: filteredClaims.length,
    totalAmount: filteredClaims.reduce((sum, claim) => sum + claim.approvedAmount, 0),
    averageSatisfaction: filteredClaims.length > 0
        ? (filteredClaims.reduce((sum, claim) => sum + claim.satisfaction, 0) / filteredClaims.length).toFixed(1)
        : 0,
    averageAmount: filteredClaims.length > 0
        ? Math.round(filteredClaims.reduce((sum, claim) => sum + claim.approvedAmount, 0) / filteredClaims.length)
        : 0,
  };

  // Render satisfaction stars
  const renderStars = (rating) => {
    return (
        <div className="flex items-center gap-0.5">
          {[1, 2, 3, 4, 5].map((star) => (
              <span
                  key={star}
                  className={`material-icons-round text-base ${
                      star <= rating ? 'text-yellow-400' : 'text-neutral-300'
                  }`}
              >
            star
          </span>
          ))}
        </div>
    );
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
              เคลมที่เสร็จสิ้นแล้ว - ทั้งหมด {claims.length} รายการ
            </p>
          </div>
          <button className="btn-outline flex items-center gap-2">
            <span className="material-icons-round">file_download</span>
            <span>Export รายงาน</span>
          </button>
        </div>

        {/* 📊 Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Total Claims */}
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-neutral-500 text-sm mb-1">เคลมทั้งหมด</p>
                <p className="text-3xl font-bold text-neutral-dark">{stats.totalClaims}</p>
                <p className="text-neutral-400 text-xs mt-1">รายการ</p>
              </div>
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                <span className="material-icons-round text-2xl text-primary-600">description</span>
              </div>
            </div>
          </div>

          {/* Total Amount */}
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-neutral-500 text-sm mb-1">ค่าซ่อมรวม</p>
                <p className="text-3xl font-bold text-neutral-dark">฿{(stats.totalAmount / 1000000).toFixed(1)}M</p>
                <p className="text-neutral-400 text-xs mt-1">
                  เฉลี่ย ฿{(stats.averageAmount / 1000).toFixed(0)}K
                </p>
              </div>
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                <span className="material-icons-round text-2xl text-primary-600">payments</span>
              </div>
            </div>
          </div>

          {/* Average Satisfaction */}
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-neutral-500 text-sm mb-1">ความพึงพอใจ</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-bold text-neutral-dark">{stats.averageSatisfaction}</p>
                  <p className="text-neutral-400 text-sm">/5.0</p>
                </div>
                <div className="flex gap-0.5 mt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                      <span key={star} className="material-icons-round text-xs text-yellow-400">
                    star
                  </span>
                  ))}
                </div>
              </div>
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                <span className="material-icons-round text-2xl text-primary-600">sentiment_satisfied</span>
              </div>
            </div>
          </div>

          {/* This Month */}
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-neutral-500 text-sm mb-1">เดือนนี้</p>
                <p className="text-3xl font-bold text-neutral-dark">
                  {claims.filter(c => c.completedDate.startsWith('2024-10')).length}
                </p>
                <p className="text-neutral-400 text-xs mt-1">รายการ</p>
              </div>
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                <span className="material-icons-round text-2xl text-primary-600">event_available</span>
              </div>
            </div>
          </div>
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
                className="input-field lg:w-64"
            >
              {monthFilters.map(filter => (
                  <option key={filter.value} value={filter.value}>
                    {filter.label}
                  </option>
              ))}
            </select>
          </div>
        </div>

        {/* Claims Table */}
        {filteredClaims.length === 0 ? (
            <div className="card-static text-center py-16">
              <div className="w-24 h-24 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-icons-round text-6xl text-neutral-300">
              search_off
            </span>
              </div>
              <p className="text-neutral-600 text-lg font-medium mb-2">
                ไม่พบประวัติการเคลม
              </p>
              <p className="text-neutral-400 text-sm">
                ลองเปลี่ยนคำค้นหาหรือเลือกเดือนอื่น
              </p>
            </div>
        ) : (
            <div className="card-static overflow-x-auto">
              <table className="w-full">
                <thead>
                <tr className="border-b-2 border-neutral-200">
                  <th className="text-left py-4 px-4 font-semibold text-neutral-700">
                    <div className="flex items-center gap-2">
                      <span className="material-icons-round text-neutral-400 text-lg">receipt_long</span>
                      <span>เลขเคลม</span>
                    </div>
                  </th>
                  <th className="text-left py-4 px-4 font-semibold text-neutral-700">
                    <div className="flex items-center gap-2">
                      <span className="material-icons-round text-neutral-400 text-lg">person</span>
                      <span>ลูกค้า</span>
                    </div>
                  </th>
                  <th className="text-left py-4 px-4 font-semibold text-neutral-700">
                    <div className="flex items-center gap-2">
                      <span className="material-icons-round text-neutral-400 text-lg">directions_car</span>
                      <span>รถยนต์</span>
                    </div>
                  </th>
                  <th className="text-left py-4 px-4 font-semibold text-neutral-700">
                    <div className="flex items-center gap-2">
                      <span className="material-icons-round text-neutral-400 text-lg">event</span>
                      <span>วันที่</span>
                    </div>
                  </th>
                  <th className="text-right py-4 px-4 font-semibold text-neutral-700">
                    <div className="flex items-center justify-end gap-2">
                      <span className="material-icons-round text-neutral-400 text-lg">payments</span>
                      <span>ค่าซ่อม</span>
                    </div>
                  </th>
                  <th className="text-center py-4 px-4 font-semibold text-neutral-700">
                    <div className="flex items-center justify-center gap-2">
                      <span className="material-icons-round text-yellow-400 text-lg">star</span>
                      <span>ความพึงพอใจ</span>
                    </div>
                  </th>
                  <th className="text-center py-4 px-4 font-semibold text-neutral-700">
                    การดำเนินการ
                  </th>
                </tr>
                </thead>
                <tbody>
                {filteredClaims.map((claim, index) => (
                    <tr
                        key={claim.id}
                        className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors duration-200"
                    >
                      <td className="py-4 px-4">
                        <p className="font-bold text-primary-600">{claim.claimNumber}</p>
                        <p className="text-xs text-neutral-400 mt-1">
                          {claim.assignedOfficer}
                        </p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="font-medium text-neutral-dark">{claim.customerName}</p>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium text-neutral-dark">{claim.carModel}</p>
                          <p className="text-sm text-neutral-500">{claim.licensePlate}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <p className="text-sm text-neutral-600">
                            <span className="text-xs text-neutral-400">เกิดเหตุ:</span> {claim.incidentDate}
                          </p>
                          <p className="text-sm text-neutral-600">
                            <span className="text-xs text-neutral-400">เสร็จ:</span> {claim.completedDate}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <p className="font-bold text-neutral-dark text-lg">
                          ฿{claim.approvedAmount.toLocaleString()}
                        </p>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-col items-center gap-1">
                          {renderStars(claim.satisfaction)}
                          <span className="text-xs font-medium text-neutral-600">
                        {claim.satisfaction}.0/5.0
                      </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <Link
                            to={`/insurance/claims/${claim.id}`}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium text-sm transition-all duration-300 hover:shadow-button"
                        >
                          <span className="material-icons-round text-sm">visibility</span>
                          <span>ดูรายละเอียด</span>
                        </Link>
                      </td>
                    </tr>
                ))}
                </tbody>
              </table>
            </div>
        )}
      </div>
  );
};

export default ClaimHistory;