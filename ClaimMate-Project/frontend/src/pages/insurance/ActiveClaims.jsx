import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { StatusBadge } from '../../components';

/**
 * ActiveClaims - หน้าแสดงเคสที่กำลังดำเนินการ
 * 
 * จุดประสงค์:
 * - พนักงานลงพื้นที่เห็นเฉพาะเคสที่ตัวเองรับผิดชอบ
 * - แสดงเฉพาะสถานะที่ต้องดำเนินการ (เคสใหม่, กำลังตรวจสอบ, รอส่งรายงาน)
 * 
 * TODO: Backend Integration
 * - GET /api/insurance/claims/active?assignedTo={userId} - ดึงเคสที่กำลังดำเนินการ
 */
const ActiveClaims = () => {
  const [loading, setLoading] = useState(true);
  const [claims, setClaims] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const statusFilters = [
    { value: 'all', label: 'ทั้งหมด', icon: 'filter_list' },
    { value: 'new', label: 'เคสใหม่', icon: 'fiber_new', color: 'primary' },
    { value: 'inspecting', label: 'กำลังตรวจสอบ', icon: 'search', color: 'warning' },
    { value: 'pending_report', label: 'รอส่งรายงาน', icon: 'upload_file', color: 'info' },
  ];

  useEffect(() => {
    // TODO: Backend - ดึงเคสที่กำลังดำเนินการ
    // fetchActiveClaims();
    
    // Mock data
    setTimeout(() => {
      setClaims([
        {
          id: '1',
          claimNumber: 'CLM-2024-001',
          status: 'new',
          priority: 'normal',
          
          // ข้อมูลลูกค้า
          customerName: 'นายสมชาย ใจดี',
          customerPhone: '081-234-5678',
          
          // ข้อมูลรถ
          carBrand: 'Honda',
          carModel: 'City',
          carYear: 2020,
          licensePlate: 'กข 1234 กรุงเทพ',
          
          // สถานที่เกิดเหตุ
          location: '123 ถนนประชาราษฎร์ แขวงห้วยขวาง เขตห้วยขวาง กรุงเทพมหานคร',
          incidentDate: '2024-10-20 10:00',
          reportedDate: '2024-10-20 14:30',
          
          // พนักงานที่รับผิดชอบ
          assignedOfficer: 'นางสาววิภา ประกันภัย',
          assignedDate: '2024-10-20 15:00',
          
          // สถานะการดำเนินการ
          hasReport: false,
          reportProgress: 0,
        },
        {
          id: '2',
          claimNumber: 'CLM-2024-002',
          status: 'inspecting',
          priority: 'high',
          
          customerName: 'นางสุดา รักษ์ดี',
          customerPhone: '082-345-6789',
          
          carBrand: 'Toyota',
          carModel: 'Yaris',
          carYear: 2021,
          licensePlate: 'คง 5678 กรุงเทพ',
          
          location: '456 ถนนลาดพร้าว แขวงจันทรเกษม เขตจตุจักร กรุงเทพมหานคร',
          incidentDate: '2024-10-22 08:30',
          reportedDate: '2024-10-22 10:00',
          
          assignedOfficer: 'นางสาววิภา ประกันภัย',
          assignedDate: '2024-10-22 10:30',
          
          hasReport: false,
          reportProgress: 40, // มีการอัปโหลดรูปแล้ว แต่ยังไม่ส่งรายงาน
        },
        {
          id: '3',
          claimNumber: 'CLM-2024-003',
          status: 'pending_report',
          priority: 'urgent',
          
          customerName: 'นายประเสริฐ มั่นคง',
          customerPhone: '083-456-7890',
          
          carBrand: 'Mazda',
          carModel: 'CX-5',
          carYear: 2022,
          licensePlate: 'งง 9999 กรุงเทพ',
          
          location: '789 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพมหานคร',
          incidentDate: '2024-10-21 16:00',
          reportedDate: '2024-10-21 16:30',
          
          assignedOfficer: 'นางสาววิภา ประกันภัย',
          assignedDate: '2024-10-21 17:00',
          
          hasReport: true,
          reportProgress: 85, // อัปโหลดรูปและกรอกข้อมูลแล้ว รอส่งรายงาน
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
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        claim.claimNumber.toLowerCase().includes(term) ||
        claim.customerName.toLowerCase().includes(term) ||
        claim.licensePlate.toLowerCase().includes(term) ||
        claim.location.toLowerCase().includes(term)
      );
    }
    
    return true;
  });

  const getStatusConfig = (status) => {
    const config = {
      new: { 
        label: 'เคสใหม่', 
        color: 'primary', 
        icon: 'fiber_new',
        bgColor: 'bg-primary-50',
        textColor: 'text-primary-700'
      },
      inspecting: { 
        label: 'กำลังตรวจสอบ', 
        color: 'warning', 
        icon: 'search',
        bgColor: 'bg-warning/10',
        textColor: 'text-warning'
      },
      pending_report: { 
        label: 'รอส่งรายงาน', 
        color: 'info', 
        icon: 'upload_file',
        bgColor: 'bg-blue-50',
        textColor: 'text-info'
      },
    };
    return config[status] || config.new;
  };

  const getPriorityBadge = (priority) => {
    const config = {
      urgent: { label: 'ด่วนมาก', color: 'error', icon: 'priority_high' },
      high: { label: 'ด่วน', color: 'warning', icon: 'arrow_upward' },
      normal: { label: 'ปกติ', color: 'neutral', icon: 'remove' },
    };
    const { label, color, icon } = config[priority] || config.normal;
    
    return (
      <span className={`badge badge-${color} badge-sm flex items-center gap-1`}>
        <span className="material-icons-round text-xs">{icon}</span>
        {label}
      </span>
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
            เคสที่กำลังดำเนินการ
          </h1>
          <p className="text-neutral-500">
            เคสที่คุณรับผิดชอบ - {filteredClaims.length} รายการ
          </p>
        </div>
        <Link
          to="/insurance/claims/create"
          className="btn-primary flex items-center gap-2"
        >
          <span className="material-icons-round">add_circle</span>
          <span>เปิดเคสใหม่</span>
        </Link>
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
                placeholder="ค้นหาด้วยเลขเคลม, ชื่อลูกค้า, ทะเบียนรถ, สถานที่..."
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
                onClick={() => setFilterStatus(filter.value)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all duration-300
                  ${filterStatus === filter.value
                    ? 'bg-primary-500 text-white shadow-button'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }
                `}
              >
                <span className="material-icons-round text-sm">{filter.icon}</span>
                <span>{filter.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Claims List */}
      {filteredClaims.length === 0 ? (
        <div className="card-static text-center py-16">
          <span className="material-icons-round text-6xl text-neutral-300 mb-4">
            inbox
          </span>
          <p className="text-neutral-500 text-lg mb-2">
            ไม่มีเคสที่ต้องดำเนินการ
          </p>
          <p className="text-neutral-400 text-sm mb-6">
            {searchTerm ? 'ลองเปลี่ยนคำค้นหาหรือตัวกรอง' : 'เมื่อมีเคสใหม่จะแสดงที่นี่'}
          </p>
          <Link to="/insurance/claims/create" className="btn-primary inline-flex items-center gap-2">
            <span className="material-icons-round">add_circle</span>
            <span>เปิดเคสใหม่</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredClaims.map(claim => {
            const statusConfig = getStatusConfig(claim.status);
            
            return (
              <div key={claim.id} className="card hover:shadow-card-hover transition-all duration-300">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-neutral-dark">
                        {claim.claimNumber}
                      </h3>
                      {getPriorityBadge(claim.priority)}
                    </div>
                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${statusConfig.bgColor}`}>
                      <span className={`material-icons-round text-sm ${statusConfig.textColor}`}>
                        {statusConfig.icon}
                      </span>
                      <span className={`text-sm font-medium ${statusConfig.textColor}`}>
                        {statusConfig.label}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Customer & Car Info */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-3">
                    <span className="material-icons-round text-neutral-400 text-lg">person</span>
                    <div className="flex-1">
                      <p className="text-sm text-neutral-500">ลูกค้า</p>
                      <p className="font-medium text-neutral-dark">{claim.customerName}</p>
                    </div>
                    <a
                      href={`tel:${claim.customerPhone}`}
                      className="p-2 hover:bg-primary-50 rounded-lg transition-colors duration-200"
                      title="โทรหาลูกค้า"
                    >
                      <span className="material-icons-round text-primary-500">phone</span>
                    </a>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="material-icons-round text-neutral-400 text-lg">directions_car</span>
                    <div className="flex-1">
                      <p className="text-sm text-neutral-500">รถยนต์</p>
                      <p className="font-medium text-neutral-dark">
                        {claim.carBrand} {claim.carModel} ({claim.carYear})
                      </p>
                      <p className="text-sm text-neutral-600">
                        ทะเบียน: {claim.licensePlate}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="material-icons-round text-neutral-400 text-lg">location_on</span>
                    <div className="flex-1">
                      <p className="text-sm text-neutral-500">สถานที่เกิดเหตุ</p>
                      <p className="text-sm text-neutral-dark line-clamp-2">
                        {claim.location}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Progress Bar (if has started) */}
                {claim.reportProgress > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-neutral-600">ความคืบหน้ารายงาน</span>
                      <span className="font-semibold text-primary-600">{claim.reportProgress}%</span>
                    </div>
                    <div className="w-full h-2 bg-neutral-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-primary transition-all duration-500"
                        style={{ width: `${claim.reportProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Metadata */}
                <div className="pt-4 border-t border-neutral-200 flex items-center justify-between text-xs text-neutral-500">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <span className="material-icons-round text-xs">schedule</span>
                      {claim.incidentDate}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 flex gap-2">
                  {claim.status === 'new' && (
                    <Link
                      to={`/insurance/claims/${claim.id}`}
                      className="btn-primary flex-1 flex items-center justify-center gap-2"
                    >
                      <span className="material-icons-round text-sm">play_arrow</span>
                      <span>เริ่มตรวจสอบ</span>
                    </Link>
                  )}
                  
                  {(claim.status === 'inspecting' || claim.status === 'pending_report') && (
                    <>
                      <Link
                        to={`/insurance/claims/${claim.id}`}
                        className="btn-primary flex-1 flex items-center justify-center gap-2"
                      >
                        <span className="material-icons-round text-sm">edit</span>
                        <span>อัปโหลดรายงาน</span>
                      </Link>
                      <Link
                        to={`/insurance/claims/${claim.id}`}
                        className="btn-outline flex items-center justify-center gap-2"
                      >
                        <span className="material-icons-round text-sm">visibility</span>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ActiveClaims;