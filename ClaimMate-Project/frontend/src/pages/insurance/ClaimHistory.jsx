import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios'; // ⭐️ (1. Import axios)
import Cookies from 'js-cookie'; // ⭐️ (2. Import Cookies)

/**
 * ClaimHistory - หน้าประวัติการเคลมที่เสร็จสิ้นแล้ว
 * (... comment เดิม ...)
 */
const ClaimHistory = () => {
  const [loading, setLoading] = useState(true);
  const [claims, setClaims] = useState([]);
  const [filterMonth, setFilterMonth] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // (Mockup data เดิม - ลบทิ้ง)
  // const monthFilters = [...];

  // ⭐️ (3. แก้ไข useEffect ทั้งหมด)
  useEffect(() => {
    const fetchClaimHistory = async () => {
      setLoading(true);
      try {
        // ดึง Token จาก Cookie (เหมือนหน้า ActiveClaims)
        const token = Cookies.get('token');

        // TODO: Backend - ดึงประวัติเคลมที่เสร็จสิ้นแล้ว (<< ทำจริงแล้ว)
        const response = await axios.get('http://localhost:3000/api/claims/history', {
          headers: {
            Authorization: `Bearer ${token}` // ส่ง Token เพื่อยืนยันตัวตน
          }
        });

        // ( response.data คือ array ที่ backend ส่งมา)
        setClaims(response.data);

      } catch (error) {
        console.error('Error fetching claim history:', error);
        // (อาจจะ set error message ไปแสดงผล)
      } finally {
        setLoading(false);
      }
    };

    fetchClaimHistory(); // เรียกใช้งาน function
  }, []); // ทำงานครั้งเดียวเมื่อ Component โหลด

  // ⭐️ (4. สร้าง monthFilters แบบ Dynamic จากข้อมูลจริง)
  const monthFilters = React.useMemo(() => {
    const months = new Map();
    months.set('all', 'ทุกเดือน');

    claims.forEach(claim => {
      if (claim.completedDate) {
        const date = new Date(claim.completedDate);
        const monthKey = date.toISOString().substring(0, 7); // "YYYY-MM"
        const monthLabel = date.toLocaleString('th-TH', {
          month: 'long',
          year: 'numeric',
        });
        if (!months.has(monthKey)) {
          months.set(monthKey, monthLabel);
        }
      }
    });

    return Array.from(months, ([value, label]) => ({ value, label }));
  }, [claims]);


  // Filter claims (⭐️ 5. แก้ไข field ที่ใช้ filter)
  const filteredClaims = claims.filter(claim => {
    // Filter by month
    if (filterMonth !== 'all') {
      // (ใช้ completedDate แทน incidentDate เพื่อ filter)
      const claimMonth = claim.completedDate ? claim.completedDate.substring(0, 7) : '';
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

  // Calculate statistics (⭐️ 6. แก้ไข field ที่ใช้คำนวณ)
  const stats = {
    totalClaims: filteredClaims.length,
    totalAmount: filteredClaims.reduce((sum, claim) => sum + claim.approvedAmount, 0),
    averageAmount: filteredClaims.length > 0
        ? Math.round(filteredClaims.reduce((sum, claim) => sum + claim.approvedAmount, 0) / filteredClaims.length)
        : 0,
  };

  if (loading) {
    // (Loading UI เดิม)
    return (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <span className="material-icons-round animate-spin text-6xl text-primary-500 mb-4">refresh</span>
            <p className="text-neutral-500">กำลังโหลดข้อมูล...</p>
          </div>
        </div>
    );
  }

  // (Header UI เดิม)
  return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font.bold text-neutral-dark mb-2">
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

        {/* 📊 Stats Cards (⭐️ 7. แก้ไข field stats) */}
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
                {/* (แก้ไขให้ยืดหยุ่น) */}
                <p className="text-3xl font-bold text-neutral-dark">
                  ฿{stats.totalAmount > 1000000
                    ? `${(stats.totalAmount / 1000000).toFixed(1)}M`
                    : `${(stats.totalAmount / 1000).toFixed(0)}K`}
                </p>
                <p className="text-neutral-400 text-xs mt-1">
                  เฉลี่ย ฿{(stats.averageAmount / 1000).toFixed(0)}K
                </p>
              </div>
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                <span className="material-icons-round text-2xl text-primary-600">payments</span>
              </div>
            </div>
          </div>

          {/* This Month (⭐️ 8. แก้ไข logic) */}
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-neutral-500 text-sm mb-1">เดือนนี้</p>
                <p className="text-3xl font-bold text-neutral-dark">
                  {claims.filter(c =>
                      c.completedDate && c.completedDate.startsWith(new Date().toISOString().substring(0, 7))
                  ).length}
                </p>
                <p className="text-neutral-400 text-xs mt-1">รายการ</p>
              </div>
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                <span className="material-icons-round text-2xl text-primary-600">event_available</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filters (⭐️ 9. ใช้ monthFilters ที่สร้างใหม่) */}
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

        {/* Claims Table (⭐️ 10. แก้ไข field ให้ตรงกับ API) */}
        {filteredClaims.length === 0 ? (
            // (No data UI - เดิม)
            <div className="card-static text-center py-16">
              {/* ... */}
            </div>
        ) : (
            <div className="card-static overflow-x-auto">
              <table className="w-full">
                <thead>
                {/* (Header Table - เดิม) */}
                <tr className="border-b-2 border-neutral-200">
                  {/* ... */}
                  <th className="text-left py-4 px-4 font-semibold text-neutral-700">
                    <div className="flex items-center gap-2">
                      <span className="material-icons-round text-neutral-400 text-lg">receipt_long</span>
                      <span>เลขเคลม</span>
                    </div>
                  </th>
                  {/* ... */}
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
                          {claim.assignedOfficer} {/* ⬅️ (ใช้ field ใหม่) */}
                        </p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="font-medium text-neutral-dark">{claim.customerName}</p>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium text-neutral-dark">{claim.carModel}</p> {/* ⬅️ (ใช้ field ใหม่) */}
                          <p className="text-sm text-neutral-500">{claim.licensePlate}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <p className="text-sm text-neutral-600">
                            {/* ⬅️ (ใช้ field ใหม่ และ format) */}
                            <span className="text-xs text-neutral-400">เกิดเหตุ:</span> {claim.incidentDate ? new Date(claim.incidentDate).toLocaleDateString('th-TH') : 'N/A'}
                          </p>
                          <p className="text-sm text-neutral-600">
                            {/* ⬅️ (ใช้ field ใหม่ และ format) */}
                            <span className="text-xs text-neutral-400">เสร็จ:</span> {claim.completedDate ? new Date(claim.completedDate).toLocaleDateString('th-TH') : 'N/A'}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <p className="font-bold text-neutral-dark text-lg">
                          {/* ⬅️ (ใช้ field ใหม่) */}
                          ฿{claim.approvedAmount.toLocaleString()}
                        </p>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <Link
                            to={`/insurance/claims/${claim.id}`} // (Link เดิม)
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