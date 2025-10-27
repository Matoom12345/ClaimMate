import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardBody, StatusBadge } from '../../components';

/**
 * GarageHistory - หน้าประวัติงานซ่อมที่เสร็จสิ้น/ปิดเคสแล้ว
 * * TODO: Backend Integration
 * - GET /api/garage/history?status={status}&search={keyword} - ดึงรายการงานซ่อม
 */
const GarageHistory = () => {
  const [loading, setLoading] = useState(true);
  const [repairs, setRepairs] = useState([]);
  const [filteredRepairs, setFilteredRepairs] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const statusFilters = [
    { value: 'all', label: 'ทั้งหมด' },
    { value: 'completed', label: 'เสร็จสิ้น' },
    { value: 'rejected', label: 'ถูกปฏิเสธ' },
  ];

  useEffect(() => {
    // TODO: Backend - ดึงประวัติงานซ่อม
    
    // Mock data
    setTimeout(() => {
      const mockRepairs = [
        {
          id: 'R-2024-005',
          claimId: 'CLM-2024-005',
          customerName: 'นายสุชาติ รวยดี',
          carModel: 'Ford Ranger 2022',
          licensePlate: 'จจ 4321 กรุงเทพฯ',
          status: 'completed',
          startDate: '2024-08-10',
          completionDate: '2024-08-18',
          totalCost: 32000,
          approvedAmount: 32000,
        },
        {
          id: 'R-2024-006',
          claimId: 'CLM-2024-006',
          customerName: 'นายเจริญ พัฒนา',
          carModel: 'Toyota Fortuner',
          licensePlate: 'จจ 1111 กรุงเทพ',
          status: 'rejected',
          startDate: '2024-09-01',
          completionDate: '2024-09-02', // วันที่ถูกปฏิเสธ
          totalCost: 80000,
          approvedAmount: 0,
        },
        {
          id: 'R-2024-007',
          claimId: 'CLM-2024-007',
          customerName: 'นางสาววิภา สุขใจ',
          carModel: 'Honda Civic 2021',
          licensePlate: 'ฮค 5678 กรุงเทพฯ',
          status: 'completed',
          startDate: '2024-10-24',
          completionDate: '2024-10-30',
          totalCost: 36000,
          approvedAmount: 36000,
        },
      ];

      setRepairs(mockRepairs);
      setFilteredRepairs(mockRepairs);
      setLoading(false);
    }, 500);
  }, []);

  // Filter และ Search Logic
  useEffect(() => {
    let result = repairs;

    if (selectedStatus !== 'all') {
      result = result.filter(repair => repair.status === selectedStatus);
    }

    if (searchTerm) {
      result = result.filter(repair =>
        repair.claimId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        repair.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        repair.carModel.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredRepairs(result);
  }, [selectedStatus, searchTerm, repairs]);

  // Count repairs by status
  const getStatusCount = (status) => {
    if (status === 'all') return repairs.length;
    return repairs.filter(repair => repair.status === status).length;
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
          รายการงานซ่อมที่เสร็จสิ้นหรือปิดไปแล้ว ({repairs.length} รายการ)
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
                placeholder="ค้นหาด้วยเลขงานซ่อม, ชื่อลูกค้า, รุ่นรถ..."
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

      {/* Claims Table (ใช้ Table เพื่อความเป็นระเบียบ) */}
      {filteredRepairs.length === 0 ? (
        <div className="card-static text-center py-16">
          <span className="material-icons-round text-6xl text-neutral-300 mb-4">
            search_off
          </span>
          <p className="text-neutral-500 text-lg mb-2">
            ไม่พบประวัติงานซ่อม
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
                <th className="text-left py-3 px-4 font-semibold text-neutral-700">เลขงานซ่อม</th>
                <th className="text-left py-3 px-4 font-semibold text-neutral-700">รถยนต์</th>
                <th className="text-left py-3 px-4 font-semibold text-neutral-700">ลูกค้า</th>
                <th className="text-left py-3 px-4 font-semibold text-neutral-700">วันที่เสร็จสิ้น</th>
                <th className="text-right py-3 px-4 font-semibold text-neutral-700">ยอดเงิน</th>
                <th className="text-center py-3 px-4 font-semibold text-neutral-700">สถานะ</th>
                <th className="text-center py-3 px-4 font-semibold text-neutral-700">การดำเนินการ</th>
              </tr>
            </thead>
            <tbody>
              {filteredRepairs.map(repair => (
                <tr key={repair.id} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors duration-200">
                  <td className="py-4 px-4">
                    <p className="font-semibold text-neutral-dark">{repair.id}</p>
                    <p className="text-xs text-neutral-500">เคส: {repair.claimId}</p>
                  </td>
                  <td className="py-4 px-4">
                    <p className="font-medium text-neutral-dark">{repair.carModel}</p>
                    <p className="text-xs text-neutral-500">{repair.licensePlate}</p>
                  </td>
                  <td className="py-4 px-4 text-sm text-neutral-600">
                    {repair.customerName}
                  </td>
                  <td className="py-4 px-4 text-sm text-neutral-600">
                    {repair.completionDate}
                  </td>
                  <td className="py-4 px-4 text-right">
                    <p className="font-semibold text-neutral-dark">
                      ฿{repair.totalCost.toLocaleString()}
                    </p>
                    {repair.approvedAmount > 0 && repair.approvedAmount !== repair.totalCost && (
                       <p className="text-xs text-warning">
                          (อนุมัติ ฿{repair.approvedAmount.toLocaleString()})
                       </p>
                    )}
                  </td>
                  <td className="py-4 px-4 text-center">
                    <StatusBadge status={repair.status} size="sm" />
                  </td>
                  <td className="py-4 px-4 text-center">
                    <Link
                      to={`/garage/history/${repair.id}`}
                      className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-700 font-medium text-sm"
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

export default GarageHistory;