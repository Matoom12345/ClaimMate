import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';

/**
 * GarageSidebar - Sidebar สำหรับอู่ซ่อม
 */
const GarageSidebar = ({ collapsed = false }) => {
  const location = useLocation();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    // (4) สร้างฟังก์ชันสำหรับดึงข้อมูล (คล้ายกับใน GaragePending)
    const fetchPendingCount = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          // ถ้าไม่มี token ก็ไม่ต้องทำอะไร (badge จะเป็น 0)
          console.warn('Sidebar: No token found, cannot fetch pending count.');
          return;
        }

        // ยิง API เดิม
        const response = await axios.get(
          'http://localhost:8000/api/garage/pending-requests',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // อัปเดต state ด้วย "จำนวน" (length) ของ array ที่ได้มา
        setPendingCount(response.data.length);

      } catch (err) {
        // ถ้า error ก็แค่ log ไว้ ไม่ต้องแสดง error บน UI
        console.error('Sidebar: Error fetching pending count:', err);
      }
    };

    fetchPendingCount(); // สั่งให้ฟังก์ชันทำงาน
  }, []); // [] ทำงานแค่ 1 ครั้งตอนโหลด

  const menuItems = [
    {
      id: 'dashboard',
      title: 'ภาพรวม',
      icon: 'dashboard',
      path: '/garage',
      description: 'สถิติและภาพรวมอู่',
      exactMatch: true,
    },
{
      id: 'pending',
      title: 'รอยืนยัน',
      icon: 'pending_actions',
      path: '/garage/pending',
      description: 'คำขอซ่อมที่รอยืนยัน',
      // นี่คือจุดที่แก้:
      // ถ้า pendingCount มากกว่า 0 ให้แสดงตัวเลข, ถ้าไม่ (เป็น 0) ให้เป็น undefined (Badge จะไม่แสดง)
      badge: pendingCount > 0 ? pendingCount : undefined,
    },
    {
      id: 'repairs',
      title: 'รายการซ่อม',
      icon: 'build_circle',
      path: '/garage/repairs',
      description: 'งานซ่อมที่กำลังดำเนินการ',
      badge: 5,
    },
    {
      id: 'approvals',
      title: 'คำขออนุมัติ',
      icon: 'request_quote',
      path: '/garage/approvals',
      description: 'รายการเพิ่มเติมรออนุมัติ',
      badge: 2,
    },
    {
      id: 'history',
      title: 'ประวัติการซ่อม',
      icon: 'history',
      path: '/garage/history',
      description: 'รายการที่เสร็จสิ้นแล้ว',
    },
  ];

  const isActive = (path, exactMatch = false) => {
    if (exactMatch) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path) && path !== '/garage';
  };

  return (
    <aside className={`
      bg-white border-r border-neutral-200 h-screen sticky top-16 overflow-y-auto custom-scrollbar animate-slide-in-left transition-all duration-300
      ${collapsed ? 'w-20' : 'w-64'}
    `}>
      <div className={`${collapsed ? 'p-3' : 'p-6'}`}>

        {collapsed ? (
          <nav className="space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.id}
                to={item.path}
                className={`
                  group relative flex items-center justify-center w-full h-14 rounded-xl transition-all duration-300
                  ${isActive(item.path, item.exactMatch)
                    ? 'bg-primary-500 text-white shadow-button'
                    : 'text-neutral-600 hover:bg-neutral-50 hover:text-primary-600'
                  }
                `}
                title={item.title}
              >
                <span className={`
                  material-icons-round text-2xl transition-transform duration-300 group-hover:scale-110
                  ${isActive(item.path, item.exactMatch) ? 'text-white' : 'text-neutral-400'}
                `}>
                  {item.icon}
                </span>

                {item.badge && (
                  <span className="absolute top-2 right-2 w-5 h-5 text-xs font-bold rounded-full flex items-center justify-center bg-error text-white">
                    {item.badge}
                  </span>
                )}

                <div className="absolute left-full ml-2 px-3 py-2 bg-neutral-800 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 whitespace-nowrap z-50">
                  {item.title}
                  <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-neutral-800 rotate-45"></div>
                </div>
              </Link>
            ))}
          </nav>
        ) : (
          <>
            <div className="mb-6">
              <h2 className="text-sm font-semibold text-neutral-400 uppercase tracking-wide mb-2">
                เมนูหลัก
              </h2>
              <div className="h-1 w-12 bg-primary-500 rounded-full"></div>
            </div>

            <nav className="space-y-1">
              {menuItems.map((item) => (
                <Link
                  key={item.id}
                  to={item.path}
                  className={`
                    group flex items-start gap-3 px-4 py-3 rounded-xl transition-all duration-300
                    ${isActive(item.path, item.exactMatch)
                      ? 'bg-primary-500 text-white shadow-button'
                      : 'text-neutral-600 hover:bg-neutral-50 hover:text-primary-600'
                    }
                  `}
                >
                  <span className={`
                    material-icons-round text-2xl transition-transform duration-300 group-hover:scale-110
                    ${isActive(item.path, item.exactMatch) ? 'text-white' : 'text-neutral-400'}
                  `}>
                    {item.icon}
                  </span>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`font-medium text-sm ${isActive(item.path, item.exactMatch) ? 'text-white' : ''}`}>
                        {item.title}
                      </span>

                      {item.badge && (
                        <span className={`
                          px-2 py-0.5 text-xs font-bold rounded-full
                          ${isActive(item.path, item.exactMatch)
                            ? 'bg-white/20 text-white'
                            : 'bg-error text-white'
                          }
                        `}>
                          {item.badge}
                        </span>
                      )}
                    </div>

                    <p className={`
                      text-xs line-clamp-1
                      ${isActive(item.path, item.exactMatch) ? 'text-white/80' : 'text-neutral-400'}
                    `}>
                      {item.description}
                    </p>
                  </div>
                </Link>
              ))}
            </nav>

            {/* Help Section */}
            <div className="mt-8 p-4 bg-gradient-primary rounded-xl text-white">
              <div className="flex items-start gap-3">
                <span className="material-icons-round text-3xl">help_outline</span>
                <div>
                  <h3 className="font-semibold mb-1">ต้องการความช่วยเหลือ?</h3>
                  <p className="text-xs text-white/80 mb-3">
                    ติดต่อบริษัทประกันภัย
                  </p>
                  <a
                    href="tel:02-999-8888"
                    className="inline-flex items-center gap-2 text-xs font-medium hover:underline"
                  >
                    <span className="material-icons-round text-sm">phone</span>
                    <span>02-999-8888</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="mt-6 p-4 bg-neutral-50 rounded-xl space-y-3">
              <h3 className="text-sm font-semibold text-neutral-700 mb-3">สถิติด่วน</h3>
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-500">กำลังซ่อม</span>
                <span className="font-semibold text-warning">5</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-500">เสร็จวันนี้</span>
                <span className="font-semibold text-success">3</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-500">ทั้งหมดเดือนนี้</span>
                <span className="font-semibold text-neutral-dark">28</span>
              </div>
            </div>
          </>
        )}
      </div>
    </aside>
  );
};

GarageSidebar.propTypes = {
  collapsed: PropTypes.bool,
};

export default GarageSidebar;