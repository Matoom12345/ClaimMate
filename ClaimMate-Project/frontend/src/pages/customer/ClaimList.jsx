import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { StatusBadge } from '../../components';

/**
 * ClaimList - หน้าแสดงรายการเคลมทั้งหมด
 * * Features:
 * 1. แสดงรายการเคลมทั้งหมด
 * 2. Filter ตาม status
 * 3. Search ตามเลขเคลม/รายละเอียด
 * 4. ดาวน์โหลดใบเคลม PDF
 * * TODO: Backend Integration
 * - GET /api/customer/claims?status={status}&search={keyword} - ดึงรายการเคลม
 * - GET /api/customer/claims/{id}/pdf - ดาวน์โหลด PDF
 */
const ClaimList = () => {
  const [loading, setLoading] = useState(true);
  const [claims, setClaims] = useState([]);
  const [filteredClaims, setFilteredClaims] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const statusFilters = [
    { value: 'all', label: 'ทั้งหมด', count: 0 },
    { value: 'pending', label: 'รอดำเนินการ', count: 0 },
    { value: 'in_progress', label: 'กำลังดำเนินการ', count: 0 },
    { value: 'completed', label: 'เสร็จสิ้น', count: 0 },
    { value: 'cancelled', label: 'ยกเลิก', count: 0 },
  ];

  useEffect(() => {
    // TODO: Backend - ดึงรายการเคลม
    // fetchClaims();
    
    // Mock data
    setTimeout(() => {
      const mockClaims = [
        {
          id: '1',
          claimNumber: 'CLM-2024-001',
          title: 'ชนด้านหน้า - เขตห้วยขวาง',
          date: '2024-10-20',
          status: 'repairing',
          estimatedCost: 25000,
          garage: 'อู่สมชาย ห้วยขวาง',
          carModel: 'Honda City 2020',
          licensePlate: 'กข 1234 กรุงเทพ',
          lastUpdate: '2024-10-24 14:30',
        },
        {
          id: '2',
          claimNumber: 'CLM-2024-002',
          title: 'ชนด้านหลัง - เขตบางกะปิ',
          date: '2024-10-22',
          status: 'waiting_approval',
          estimatedCost: 15000,
          garage: null,
          carModel: 'Toyota Yaris 2021',
          licensePlate: 'คง 5678 กรุงเทพ',
          lastUpdate: '2024-10-22 10:15',
        },
        {
          id: '3',
          claimNumber: 'CLM-2024-003',
          title: 'กระจกแตก - เขตลาดพร้าว',
          date: '2024-09-15',
          status: 'completed',
          estimatedCost: 8000,
          garage: 'อู่กระจกใส ลาดพร้าว',
          carModel: 'Honda City 2020',
          licensePlate: 'กข 1234 กรุงเทพ',
          lastUpdate: '2024-09-20 16:45',
        },
        {
          id: '4',
          claimNumber: 'CLM-2024-004',
          title: 'เคลมประตู - เขตสาทร',
          date: '2024-08-10',
          status: 'completed',
          estimatedCost: 18000,
          garage: 'อู่บางกอก สาทร',
          carModel: 'Honda City 2020',
          licensePlate: 'กข 1234 กรุงเทพ',
          lastUpdate: '2024-08-18 11:20',
        },
        {
          id: '5',
          claimNumber: 'CLM-2024-005',
          title: 'ชนด้านข้าง - เขตบางนา',
          date: '2024-07-05',
          status: 'completed',
          estimatedCost: 32000,
          garage: 'อู่มาสเตอร์ บางนา',
          carModel: 'Honda City 2020',
          licensePlate: 'กข 1234 กรุงเทพ',
          lastUpdate: '2024-07-15 09:30',
        },
      ];

      setClaims(mockClaims);
      setFilteredClaims(mockClaims);
      setLoading(false);
    }, 500);
  }, []);

  // Filter และ Search
  useEffect(() => {
    let result = claims;

    // Filter by status
    if (selectedStatus !== 'all') {
      result = result.filter(claim => claim.status === selectedStatus);
    }

    // Search
    if (searchTerm) {
      result = result.filter(claim =>
        claim.claimNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        claim.carModel.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredClaims(result);
  }, [selectedStatus, searchTerm, claims]);



  // Count claims by status
  const getStatusCount = (status) => {
    if (status === 'all') return claims.length;
    return claims.filter(claim => claim.status === status).length;
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
          การเคลมของฉัน
        </h1>
        <p className="text-neutral-500">
          รายการเคลมทั้งหมด {claims.length} รายการ
        </p>
      </div>

      {/* Filters */}
      <div className="card-static">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <span className="material-icons-round absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400">
                search
              </span>
              <input
                type="text"
                placeholder="ค้นหาด้วยเลขเคลม, รุ่นรถ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-12"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex gap-2 overflow-x-auto">
            {statusFilters.map(filter => (
              <button
                key={filter.value}
                onClick={() => setSelectedStatus(filter.value)}
                className={`
                  px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all duration-300
                  ${selectedStatus === filter.value
                    ? 'bg-primary-500 text-white shadow-button'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }
                `}
              >
                {filter.label}
                <span className="ml-2 opacity-75">
                  ({getStatusCount(filter.value)})
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Claims List */}
      {filteredClaims.length === 0 ? (
        <div className="card text-center py-16">
          <span className="material-icons-round text-6xl text-neutral-300 mb-4">
            search_off
          </span>
          <p className="text-neutral-500 text-lg mb-2">
            ไม่พบรายการเคลม
          </p>
          <p className="text-neutral-400 text-sm">
            ลองเปลี่ยนคำค้นหาหรือตัวกรองใหม่
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredClaims.map(claim => (
            <div key={claim.id} className="card hover:shadow-card-hover transition-all duration-300">
              <div className="flex items-start justify-between gap-4">
                {/* Left - Claim Info */}
                <div className="flex-1 min-w-0">
                  {/* ✅ ข้อ 1: แสดง claimNumber แทน title */}
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-lg font-semibold text-neutral-dark">
                      {claim.claimNumber}
                    </h3>
                    <StatusBadge status={claim.status} size="sm" />
                  </div>

                  {/* ✅ ข้อ 1: ลบคอลัมน์ "เลขที่เคลม" - เหลือแค่ 3 คอลัมน์ */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-neutral-500 mb-1">วันเกิดเหตุ</p>
                      <p className="font-medium text-neutral-dark">{claim.date}</p>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500 mb-1">รุ่นรถ</p>
                      <p className="font-medium text-neutral-dark">{claim.carModel}</p>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500 mb-1">ทะเบียน</p>
                      <p className="font-medium text-neutral-dark">{claim.licensePlate}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="material-icons-round text-sm text-neutral-400">payments</span>
                      <span className="text-neutral-600">
                        ค่าซ่อม: <span className="font-semibold text-primary-600">
                          ฿{claim.estimatedCost.toLocaleString()}
                        </span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="material-icons-round text-sm text-neutral-400">build</span>
                      <span className="text-neutral-600">
                        {claim.garage || <span className="text-warning">รอเลือกอู่</span>}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="material-icons-round text-sm text-neutral-400">schedule</span>
                      <span className="text-neutral-400 text-xs">
                        อัพเดต: {claim.lastUpdate}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right - Actions */}
                <div className="flex flex-col gap-2">
                  <Link
                    to={`/customer/claims/${claim.id}`}
                    className="btn-primary flex items-center gap-2 whitespace-nowrap"
                  >
                    <span className="material-icons-round text-sm">visibility</span>
                    <span>ดูรายละเอียด</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClaimList;