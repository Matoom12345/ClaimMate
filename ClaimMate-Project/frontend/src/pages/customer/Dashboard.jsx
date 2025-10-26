import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ClaimTimeline } from '../../components';
import axios from "axios";

/**
 * Customer Dashboard - หน้าแรกแสดงภาพรวมการเคลม
 * 
 * Features:
 * 1. สถิติการเคลมทั้งหมด
 * 2. การเคลมที่กำลังดำเนินการ (พร้อม Timeline)
 * 3. การแจ้งเตือนและ Quick Actions
 * 
 * TODO: Backend Integration
 * - GET /api/customer/dashboard - ดึงข้อมูล dashboard
 * - GET /api/customer/claims?status=active - เคลมที่กำลังดำเนินการ
 * - GET /api/customer/claims/stats - สถิติการเคลม
 */
const CustomerDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    // TODO: Backend - ดึงข้อมูล dashboard
    // fetchDashboardData();
    
    // Mock data
    setTimeout(() => {
      setDashboardData({
        stats: {
          total: 6,
          active: 3,
          completed: 3,
          pending: 0,
        },
        activeClaims: [
          {
            id: 'CLM-2024-001',
            claimNumber: 'CLM-2024-001',
            title: 'ชนด้านหน้า - เขตห้วยขวาง',
            date: '2024-10-20',
            currentStep: 4, // กำลังซ่อม
            status: 'repairing',
            estimatedCost: 25000,
            garage: 'อู่สมชาย ห้วยขวาง',
            carModel: 'Honda City 2020',
            licensePlate: 'กข 1234 กรุงเทพ',
          },
          // ✅ เพิ่ม: เคลมที่อนุมัติแล้ว รอเลือกอู่
          {
            id: 'CLM-2024-002',
            claimNumber: 'CLM-2024-002',
            title: 'ชนด้านหลัง - เขตบางกะปิ',
            date: '2024-10-22',
            currentStep: 2, // อนุมัติแล้ว
            status: 'approved',
            estimatedCost: 15000,
            garage: null, // ✅ ยังไม่มีอู่ = จะเห็นปุ่มเลือกอู่
            carModel: 'Toyota Yaris 2021',
            licensePlate: 'คง 5678 กรุงเทพ',
          },
          // ✅ เพิ่ม: เคลมที่เสร็จสิ้น รอประเมินความพึงพอใจ
          {
            id: 'CLM-2024-006',
            claimNumber: 'CLM-2024-006',
            title: 'เปลี่ยนกระจก - เขตสุขุมวิท',
            date: '2024-10-18',
            currentStep: 5, // เสร็จสิ้น
            status: 'completed',
            estimatedCost: 12000,
            garage: 'อู่กระจกพรีเมี่ยม สุขุมวิท',
            carModel: 'Honda City 2020',
            licensePlate: 'กข 1234 กรุงเทพ',
          },
        ],
        recentNotifications: [
          { id: 1, type: 'success', message: 'การเคลม CLM-2024-006 เสร็จสิ้นแล้ว', time: '10 นาทีที่แล้ว' },
          { id: 2, type: 'info', message: 'กรุณาเลือกอู่ซ่อม - CLM-2024-002', time: '2 ชั่วโมงที่แล้ว' },
          { id: 3, type: 'success', message: 'อู่ยืนยันรับซ่อมแล้ว - CLM-2024-001', time: '1 วันที่แล้ว' },
        ],
      });
      setLoading(false);
    }, 500);
  }, []);

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

  const { stats, activeClaims } = dashboardData;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-dark mb-2">
            ภาพรวมการเคลม
          </h1>
          <p className="text-neutral-500">
            ยินดีต้อนรับ! ติดตามสถานะการเคลมของคุณได้ที่นี่
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card hover:shadow-card-hover transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="icon-container bg-primary-100 text-primary-600">
              <span className="material-icons-round">description</span>
            </div>
          </div>
          <p className="text-neutral-500 text-sm mb-1">เคลมทั้งหมด</p>
          <h3 className="text-3xl font-bold text-neutral-dark">{stats.total}</h3>
        </div>

        <div className="card hover:shadow-card-hover transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="icon-container bg-warning/20 text-warning">
              <span className="material-icons-round">autorenew</span>
            </div>
          </div>
          <p className="text-neutral-500 text-sm mb-1">กำลังดำเนินการ</p>
          <h3 className="text-3xl font-bold text-warning">{stats.active}</h3>
        </div>

        <div className="card hover:shadow-card-hover transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="icon-container bg-success/20 text-success">
              <span className="material-icons-round">check_circle</span>
            </div>
          </div>
          <p className="text-neutral-500 text-sm mb-1">เสร็จสิ้น</p>
          <h3 className="text-3xl font-bold text-success">{stats.completed}</h3>
        </div>

        <div className="card hover:shadow-card-hover transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="icon-container bg-neutral-100 text-neutral-600">
              <span className="material-icons-round">schedule</span>
            </div>
          </div>
          <p className="text-neutral-500 text-sm mb-1">รอดำเนินการ</p>
          <h3 className="text-3xl font-bold text-neutral-600">{stats.pending}</h3>
        </div>
      </div>

      {/* Active Claims Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Active Claims */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-neutral-dark">
              การเคลมที่กำลังดำเนินการ
            </h2>
            <span className="text-sm text-neutral-500">
              {activeClaims.length} รายการ
            </span>
          </div>

          {activeClaims.length === 0 ? (
            <div className="card text-center py-12">
              <span className="material-icons-round text-6xl text-neutral-300 mb-4">
                inbox
              </span>
              <p className="text-neutral-500 mb-4">
                คุณไม่มีการเคลมที่กำลังดำเนินการ
              </p>
              <Link to="/customer/claims" className="btn-primary inline-flex items-center gap-2">
                <span>ดูประวัติการเคลม</span>
              </Link>
            </div>
          ) : (
            activeClaims.map((claim) => (
              <div key={claim.id} className="card">
                {/* Claim Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-neutral-dark">
                        {claim.title}
                      </h3>
                      <span className="badge badge-primary">{claim.claimNumber}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-neutral-500">
                      <span className="flex items-center gap-1">
                        <span className="material-icons-round text-sm">calendar_today</span>
                        {claim.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="material-icons-round text-sm">directions_car</span>
                        {claim.carModel}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="material-icons-round text-sm">pin</span>
                        {claim.licensePlate}
                      </span>
                    </div>
                  </div>
                  <Link
                    to={`/customer/claims/${claim.id}`}
                    className="btn-ghost flex items-center gap-1"
                  >
                    <span>ดูรายละเอียด</span>
                    <span className="material-icons-round text-sm">arrow_forward</span>
                  </Link>
                </div>

                {/* Claim Info */}
                <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-neutral-50 rounded-lg">
                  <div>
                    <p className="text-xs text-neutral-500 mb-1">ค่าซ่อมประเมิน</p>
                    <p className="text-lg font-semibold text-primary-600">
                      ฿{claim.estimatedCost.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500 mb-1">อู่ซ่อม</p>
                    <p className="font-medium text-neutral-dark">
                      {claim.garage || <span className="text-warning">รอเลือกอู่</span>}
                    </p>
                  </div>
                </div>

                {/* Timeline */}
                <ClaimTimeline
                  currentStep={claim.currentStep}
                  claimData={{
                    reportedDate: claim.date,
                    inspectionDate: claim.currentStep >= 1 ? '2024-10-21' : '',
                    approvalDate: claim.currentStep >= 2 ? '2024-10-22' : '',
                    garageSelectedDate: claim.currentStep >= 3 ? '2024-10-23' : '',
                    repairStartDate: claim.currentStep >= 4 ? '2024-10-24' : '',
                    completedDate: claim.currentStep >= 5 ? '2024-10-28' : '',
                  }}
                />
              </div>
            ))
          )}
        </div>

        {/* Sidebar - Quick Actions */}
        <div className="space-y-6">
          {/* Quick Actions - ✅ ข้อ 1: แก้ icon ให้กลมเหมือนกัน */}
          <div className="card">
            <h3 className="font-semibold text-neutral-dark mb-4">
              การดำเนินการด่วน
            </h3>
            <div className="space-y-3">
              <Link
                to="/customer/urgent-request"
                className="flex items-center gap-3 p-3 hover:bg-red-50 rounded-lg transition-colors duration-200"
              >
                {/* ✅ ข้อ 1: แก้ icon container */}
                <div className="w-12 h-12 rounded-xl bg-red-100 text-error flex items-center justify-center">
                  <span className="material-icons-round">priority_high</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-neutral-dark">ขออนุมัติซ่อมด่วน</p>
                  <p className="text-xs text-neutral-500">สำหรับกรณีฉุกเฉิน</p>
                </div>
                <span className="material-icons-round text-neutral-400">chevron_right</span>
              </Link>

              <Link
                to="/customer/complaint"
                className="flex items-center gap-3 p-3 hover:bg-neutral-50 rounded-lg transition-colors duration-200"
              >
                {/* ✅ ข้อ 1: แก้ icon container */}
                <div className="w-12 h-12 rounded-xl bg-neutral-100 text-neutral-600 flex items-center justify-center">
                  <span className="material-icons-round">report_problem</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-neutral-dark">แจ้งร้องเรียน</p>
                  <p className="text-xs text-neutral-500">แจ้งปัญหาหรือข้อร้องเรียน</p>
                </div>
                <span className="material-icons-round text-neutral-400">chevron_right</span>
              </Link>
            </div>
          </div>

          {/* Help Card */}
          <div className="card bg-gradient-secondary text-white">
            <span className="material-icons-round text-4xl mb-3">support_agent</span>
            <h3 className="font-semibold mb-2">ต้องการความช่วยเหลือ?</h3>
            <p className="text-sm text-white/80 mb-4">
              ติดต่อศูนย์บริการลูกค้าของเรา
            </p>
            <a
              href="tel:02-123-4567"
              className="btn-outline !border-white !text-white hover:!bg-white hover:!text-secondary-600"
            >
              <span className="material-icons-round mr-2">phone</span>
              โทร 02-123-4567
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;