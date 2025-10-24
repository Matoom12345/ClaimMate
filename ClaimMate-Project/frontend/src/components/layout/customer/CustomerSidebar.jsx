import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';

/**
 * CustomerSidebar - Sidebar สำหรับลูกค้า
 * เมนูหลัก: ดูสถานะ, เลือกอู่, ขออนุมัติ, ร้องเรียน, ประเมิน
 * 
 * Props:
 * - collapsed: boolean - เมื่อเป็น true จะแสดงแค่ icon
 */
const CustomerSidebar = ({ collapsed = false }) => {
  const location = useLocation();

  const menuItems = [
    {
      id: 'dashboard',
      title: 'ภาพรวม',
      icon: 'dashboard',
      path: '/customer/dashboard',
      description: 'ดูสถานะการเคลมทั้งหมด'
    },
    {
      id: 'claims',
      title: 'การเคลมของฉัน',
      icon: 'description',
      path: '/customer/claims',
      description: 'รายการเคลมและสถานะ',
      badge: 2, // จำนวนเคลมที่กำลังดำเนินการ
    },
    // ❌ ลบ 'เลือกอู่ซ่อม' ออก (ข้อ 7)
    // ❌ ลบ 'ประเมินความพึงพอใจ' ออก (ข้อ 8)
    {
      id: 'urgent',
      title: 'ขออนุมัติซ่อมด่วน',
      icon: 'priority_high',
      path: '/customer/urgent-request',
      description: 'ขออนุมัติซ่อมด่วนฉุกเฉิน',
      // ❌ ลบ highlight: true (ข้อ 9)
    },
    {
      id: 'complaint',
      title: 'แจ้งร้องเรียน',
      icon: 'report_problem',
      path: '/customer/complaint',
      description: 'แจ้งปัญหาหรือข้อร้องเรียน'
    },
  ];

  // เช็คว่า path ปัจจุบันตรงกับ menu item หรือไม่
  const isActive = (path) => location.pathname === path;

  return (
    <aside className={`
      bg-white border-r border-neutral-200 h-screen sticky top-16 overflow-y-auto custom-scrollbar animate-slide-in-left transition-all duration-300
      ${collapsed ? 'w-20' : 'w-64'}
    `}>
      <div className={`${collapsed ? 'p-3' : 'p-6'}`}>
        
        {/* 🔹 โหมดย่อ - แสดงแค่ Icon */}
        {collapsed ? (
          <nav className="space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.id}
                to={item.path}
                className={`
                  group relative flex items-center justify-center w-full h-14 rounded-xl transition-all duration-300
                  ${isActive(item.path)
                    ? 'bg-gradient-primary text-white shadow-button'
                    : 'text-neutral-600 hover:bg-neutral-50 hover:text-primary-600'
                  }
                `}
                title={item.title} // แสดง tooltip เมื่อ hover
              >
                {/* Icon */}
                <span className={`
                  material-icons-round text-2xl transition-transform duration-300 group-hover:scale-110
                  ${isActive(item.path) ? 'text-white' : 'text-neutral-400'}
                `}>
                  {item.icon}
                </span>

                {/* Badge (ถ้ามี) */}
                {item.badge && (
                  <span className="absolute top-2 right-2 w-5 h-5 bg-error text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {item.badge}
                  </span>
                )}

                {/* Tooltip */}
                <div className="absolute left-full ml-2 px-3 py-2 bg-neutral-800 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 whitespace-nowrap z-50">
                  {item.title}
                  <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-neutral-800 rotate-45"></div>
                </div>
              </Link>
            ))}
          </nav>
        ) : (
          /* 🔹 โหมดขยาย - แสดงเต็ม */
          <>
            {/* Header */}
            <div className="mb-6">
              <h2 className="text-sm font-semibold text-neutral-400 uppercase tracking-wide mb-2">
                เมนูหลัก
              </h2>
              <div className="h-1 w-12 bg-gradient-primary rounded-full"></div>
            </div>

            {/* Menu Items */}
            <nav className="space-y-1">
              {menuItems.map((item) => (
                <Link
                  key={item.id}
                  to={item.path}
                  className={`
                    group flex items-start gap-3 px-4 py-3 rounded-xl transition-all duration-300
                    ${isActive(item.path)
                      ? 'bg-gradient-primary text-white shadow-button'
                      : 'text-neutral-600 hover:bg-neutral-50 hover:text-primary-600'
                    }
                  `}
                >
                  {/* Icon - ✅ แก้ข้อ 9: ไม่มี highlight สีแดง */}
                  <span className={`
                    material-icons-round text-2xl transition-transform duration-300 group-hover:scale-110
                    ${isActive(item.path) ? 'text-white' : 'text-neutral-400'}
                  `}>
                    {item.icon}
                  </span>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`font-medium text-sm ${isActive(item.path) ? 'text-white' : ''}`}>
                        {item.title}
                      </span>
                      
                      {/* Badge */}
                      {item.badge && (
                        <span className={`
                          px-2 py-0.5 text-xs font-bold rounded-full
                          ${isActive(item.path)
                            ? 'bg-white/20 text-white'
                            : 'bg-error text-white'
                          }
                        `}>
                          {item.badge}
                        </span>
                      )}
                    </div>
                    
                    {/* Description */}
                    <p className={`
                      text-xs line-clamp-1
                      ${isActive(item.path) ? 'text-white/80' : 'text-neutral-400'}
                    `}>
                      {item.description}
                    </p>
                  </div>
                </Link>
              ))}
            </nav>

            {/* Help Section */}
            <div className="mt-8 p-4 bg-gradient-secondary rounded-xl text-white">
              <div className="flex items-start gap-3">
                <span className="material-icons-round text-3xl">help_outline</span>
                <div>
                  <h3 className="font-semibold mb-1">ต้องการความช่วยเหลือ?</h3>
                  <p className="text-xs text-white/80 mb-3">
                    ติดต่อศูนย์บริการลูกค้า
                  </p>
                  <a
                    href="tel:1234567890"
                    className="inline-flex items-center gap-2 text-xs font-medium hover:underline"
                  >
                    <span className="material-icons-round text-sm">phone</span>
                    <span>02-123-4567</span>
                  </a>
                </div>
              </div>
            </div>

            {/* TODO: Backend - Quick Stats */}
            {/* GET /api/customer/stats - แสดงสถิติสรุป */}
            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-500">เคลมทั้งหมด</span>
                <span className="font-semibold text-neutral-dark">5</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-500">กำลังดำเนินการ</span>
                <span className="font-semibold text-primary-600">2</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-500">เสร็จสิ้น</span>
                <span className="font-semibold text-success">3</span>
              </div>
            </div>
          </>
        )}
      </div>
    </aside>
  );
};

CustomerSidebar.propTypes = {
  collapsed: PropTypes.bool,
};

export default CustomerSidebar;