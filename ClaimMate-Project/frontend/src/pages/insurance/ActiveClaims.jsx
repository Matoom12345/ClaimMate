import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { StatusBadge } from '../../components';
import axios from "axios";

/**
 * ActiveClaims - หน้าแสดงเคสที่กำลังดำเนินการ
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

  // (ลบ State ที่ไม่ได้ใช้ออก)
  // const [latestDates, setLatestDates] = useState({});

  useEffect(() => {
    const fetchActiveClaims = async () => {
      try {
        // ⭐️ (กลับมาใช้) 1. ดึง Object "claimmate_user"
        const user = JSON.parse(localStorage.getItem("claimmate_user"));
        // ⭐️ (กลับมาใช้) 2. ดึง insuranceID จาก Object นั้น
        const insuranceID = user?.insuranceID;

        // ⭐️ (กลับมาใช้) 3. ตรวจสอบ insuranceID
        if (!insuranceID) {
          console.error("ActiveClaims: ไม่พบ insuranceID ใน localStorage.");
          throw new Error("insuranceID is required");
        }

        // ⭐️ (กลับมาใช้) 4. ส่ง insuranceID ไปเป็น params
        const res = await axios.get('http://localhost:3000/api/claims/active', {
          params: { insuranceID }
        });

        const claimsData = res.data;
        setClaims(claimsData);

      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchActiveClaims();
  }, []); // (Dependency Array ว่าง ถูกต้องแล้ว)

  const filteredClaims = claims.filter(claim => {
    if (filterStatus !== 'all' && claim.status !== filterStatus) {
      return false;
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
          claim.claimNumber?.toLowerCase().includes(term) ||
          claim.customerName?.toLowerCase().includes(term) ||
          claim.licensePlate?.toLowerCase().includes(term) ||
          claim.location?.toLowerCase().includes(term)
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

  const getCoverageConfig = (insuranceClass) => {
    const config = {
      '1': { label: 'ชั้น 1', color: 'neutral', icon: 'verified' },
      '2+': { label: 'ชั้น 2+', color: 'neutral', icon: 'shield' },
      '2': { label: 'ชั้น 2', color: 'neutral', icon: 'shield' },
      '3+': { label: 'ชั้น 3+', color: 'neutral', icon: 'security' },
      '3': { label: 'ชั้น 3', color: 'neutral', icon: 'security' },
    };
    return config[insuranceClass] || config['3'];
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
              {/* ⭐️ (กลับมาใช้) เปลี่ยนข้อความเป็น "เคสของคุณ" */}
              เคสของคุณที่กำลังดำเนินการ - {filteredClaims.length} รายการ
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
                    <div key={claim.id} className="card hover:shadow-card-hover transition-all duration-300 relative">
                      {/* Badge ชั้นประกัน - มุมขวาบน */}
                      <div className="absolute top-4 right-4">
                        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-2 font-semibold text-sm ${getCoverageConfig(claim.insuranceClass).color}`}>
                          <span className="material-icons-round text-base">{getCoverageConfig(claim.insuranceClass).icon}</span>
                          <span>{getCoverageConfig(claim.insuranceClass).label}</span>
                        </div>
                      </div>

                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold text-neutral-dark">
                              {claim.claimNumber}
                            </h3>
                            <span className="text-sm font-light text-neutral-400">
                        {claim.policyNumber}
                      </span>
                            {getPriorityBadge(claim.priorityLevel)}
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

                      {/* Customer */}
                      <div className="space-y-3 mb-4">
                        <div className="flex items-center gap-3">
                          <span className="material-icons-round text-neutral-400 text-lg">person</span>
                          <div className="flex-1">
                            <p className="text-sm text-neutral-500">ลูกค้า</p>
                            <p className="font-medium text-neutral-dark">{claim.customerName}</p>
                            <p className="text-xs text-neutral-500 mt-0.5">
                            </p>
                          </div>
                          <a
                              href={`tel:${claim.customerPhone}`}
                              className="p-2 hover:bg-primary-50 rounded-lg transition-colors duration-200"
                              title="โทรหาลูกค้า"
                          >
                            <span className="material-icons-round text-primary-500">phone</span>
                          </a>
                        </div>

                        {/* Car */}
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

                        {/* Location */}
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

                      {/* Progress */}
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

                      <div className="pt-4 border-t border-neutral-200 flex items-center justify-between text-xs text-neutral-500">
                  <span className="flex items-center gap-1">
                    <span className="material-icons-round text-xs">schedule</span>
                    {/* ⭐️ (แก้ไข) แก้ไขการแสดงผลวันที่ให้สวยงาม (ถ้ามี) */}
                    {claim.incidentDate ? new Date(claim.incidentDate).toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' }) : 'N/A'}
                  </span>
                      </div>

                      {/* Actions — ✅ FIX claim.id → claim.claimNumber */}
                      <div className="mt-4 flex gap-2">

                        {/* Case ใหม่ */}
                        {claim.status === 'new' && (
                            <Link
                                to={`/insurance/claims/${claim.id}`}
                                className="btn-primary flex-1 flex items-center justify-center gap-2"
                            >
                              <span className="material-icons-round text-sm">play_arrow</span>
                              <span>เริ่มตรวจสอบ</span>
                            </Link>
                        )}

                        {/* เคสตรวจสอบ / pending report */}
                        {(claim.status === 'inspecting' || claim.status === 'pending_report') && (
                            <>
                              <Link
                                  to={`/insurance/claims/${claim.id}`}
                                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                              >
                                <span className="material-icons-round text-sm">edit</span>
                                <span>บันทึกข้อมูล</span>
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