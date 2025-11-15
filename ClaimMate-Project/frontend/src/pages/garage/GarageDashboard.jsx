import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardBody, Badge, Button } from '../../components';
import axios from 'axios';
import { format } from 'date-fns';

/**
 * GarageDashboard - หน้าภาพรวมสำหรับอู่ซ่อม
 * * Features:
 * 1. แสดงสถิติงานซ่อมปัจจุบัน
 * 2. ลิงก์ด่วนไปยังงานที่ต้องดำเนินการ
 * 3. รายการงานซ่อมที่ต้องอัพเดต/ใกล้เสร็จ
 */
const GarageDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);

useEffect(() => {
    // 1. สร้างฟังก์ชันสำหรับดึงข้อมูล
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        // 2. ยิง API ไปยัง Backend (เดี๋ยวเราจะไปแก้ Backend ให้ส่งข้อมูลนี้มา)
        const response = await axios.get('http://localhost:3000/api/garages/dashboard', {
          headers: { Authorization: `Bearer ${token}` }
        });

        // 3. ถ้าสำเร็จ, นำข้อมูลจริง (response.data.data) มาใส่ State
        if (response.data.success) {
          setDashboardData(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        alert('ไม่สามารถโหลดข้อมูล Dashboard ได้');
      } finally {
        // 4. ไม่ว่าจะสำเร็จหรือล้มเหลว ก็ให้หยุดหมุน
        setLoading(false);
      }
    };

    // 5. เรียกใช้งานฟังก์ชัน
    fetchDashboardData();
  }, []); // ทำงานครั้งเดียวตอนเปิดหน้า

  const getStatusConfig = (status) => {
    const config = {
      // ✅ (แก้ไข) สถานะสำหรับงานซ่อมที่ต้องติดตาม
      inprogress: { label: 'กำลังซ่อม', color: 'warning', icon: 'build' },
      completed: { label: 'เสร็จสิ้น', color: 'success', icon: 'task_alt' },
      
      // สถานะสำหรับ Approvals (คงเดิม)
      pending: { label: 'รออนุมัติ', color: 'warning', icon: 'pending' },
      approved: { label: 'อนุมัติแล้ว', color: 'success', icon: 'check_circle' },
    };
    return config[status] || { label: status, color: 'neutral', icon: 'info' };
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

  const { stats, activeRepairsList, recentApprovals } = dashboardData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-dark mb-2">
            ภาพรวมงานซ่อม
          </h1>
          <p className="text-neutral-500">
            ยินดีต้อนรับ! ติดตามและจัดการงานซ่อมทั้งหมด
          </p>
        </div>
        
        {/* ✅ ปุ่มที่มุมบนขวา (เปลี่ยนเป็นสี Primary) */}
        {stats.pendingClaims > 0 && (
          <Link to="/garage/pending">
            <Button 
              variant="primary" // ใช้สี Primary (ฟ้าหลัก)
              icon="pending_actions"
            >
              ดูรายการขอเข้าซ่อม ({stats.pendingClaims})
            </Button>
          </Link>
        )}
      </div>

      {/* Stats Cards & Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Card: งานรอยืนยัน (แสดงผลตามปกติ) */}
        <Link to="/garage/pending" className="card hover:shadow-card-hover transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="icon-container bg-error/20 text-error">
              <span className="material-icons-round">pending_actions</span>
            </div>
          </div>
          <p className="text-neutral-500 text-sm mb-1">งานรอยืนยัน</p>
          <h3 className="text-3xl font-bold text-error">{stats.pendingClaims}</h3>
        </Link>
        
        <Link to="/garage/repairs" className="card hover:shadow-card-hover transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="icon-container bg-warning/20 text-warning">
              <span className="material-icons-round">build_circle</span>
            </div>
          </div>
          <p className="text-neutral-500 text-sm mb-1">กำลังดำเนินการ</p>
          <h3 className="text-3xl font-bold text-warning">{stats.activeRepairs}</h3>
        </Link>
        
        <Link to="/garage/approvals" className="card hover:shadow-card-hover transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="icon-container bg-primary-100 text-primary-600">
              <span className="material-icons-round">request_quote</span>
            </div>
          </div>
          <p className="text-neutral-500 text-sm mb-1">รออนุมัติรายการเพิ่ม</p>
          <h3 className="text-3xl font-bold text-primary-600">{stats.approvalsPending}</h3>
        </Link>

        <div className="card hover:shadow-card-hover transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="icon-container bg-success/20 text-success">
              <span className="material-icons-round">task_alt</span>
            </div>
          </div>
          <p className="text-neutral-500 text-sm mb-1">เสร็จสิ้น</p>
          <h3 className="text-3xl font-bold text-success">{stats.completedToday}</h3>
        </div>
      </div>

      {/* Active Repairs & Approvals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Repairs List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-neutral-dark">
              งานซ่อมที่ต้องติดตาม
            </h2>
            <Link to="/garage/repairs" className="text-sm font-medium text-primary-600 hover:text-primary-700">ดูทั้งหมด</Link>
          </div>
          
          <div className="space-y-3">
            {activeRepairsList.map(repair => {
              const config = getStatusConfig(repair.status);
              return (
                <Link to={`/garage/repairs/${repair.id}`} key={repair.id} className="card-static p-4 hover:bg-neutral-50 flex items-center gap-4 transition-colors">
                  {/* ✅ (แก้ไข) ปรับให้ใช้ config.color เพื่อกำหนดสีพื้นหลังและสีไอคอน */}
                  <div className={`w-12 h-12 rounded-xl bg-${config.color}/20 flex items-center justify-center`}>
                    <span className={`material-icons-round text-2xl text-${config.color}`}>{config.icon}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <p className="font-medium text-neutral-dark line-clamp-1">{repair.carModel}</p>
                        <Badge variant={config.color} size="sm">{config.label}</Badge>
                    </div>
                    <p className="text-sm text-neutral-500">ทะเบียน: {repair.licensePlate}</p>
                  </div>
          
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recent Approvals */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-neutral-dark">
              คำขออนุมัติล่าสุด
            </h2>
            <Link to="/garage/approvals" className="text-sm font-medium text-primary-600 hover:text-primary-700">ดูทั้งหมด</Link>
          </div>
          
          <div className="space-y-3">
            {recentApprovals.map(approval => {
              const config = getStatusConfig(approval.type);
              return (
                <Link to="/garage/approvals" key={approval.id} className="card-static p-4 hover:bg-neutral-50 flex items-center gap-4 transition-colors">
                    <div className="flex-1">
                      <p className="font-medium text-neutral-dark">{approval.carModel}</p>
                      <p className="text-sm text-neutral-500">เคส: {approval.claimId}</p>
                    </div>
                    <Badge variant={config.color} size="md">
                        {config.label === 'pending' ? 'รออนุมัติ' : 'อนุมัติแล้ว'}
                    </Badge>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GarageDashboard;