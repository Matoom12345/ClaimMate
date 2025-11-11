import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';

const CustomerSidebar = ({ collapsed = false }) => {
  const location = useLocation();

  const [stats, setStats] = useState({
    total: 0,
    ongoing: 0,
    completed: 0,
  });

  // ✅ โหลดข้อมูลจาก backend
  useEffect(() => {
    const fetchStats = async () => {
      const user = JSON.parse(localStorage.getItem("claimmate_user"));
      if (!user?.customerID) return;

      try {
        const res = await axios.get(
            `http://localhost:3000/api/claims/customer/${user.customerID}/stats`
        );
        if (res.data.success) {
          setStats(res.data.stats);
        }
      } catch (err) {
        console.error("Failed to load stats", err);
      }
    };

    fetchStats();
  }, []);

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

      // ✅ กำลังดำเนินการจริง ๆ
      badge: stats.ongoing,
    },
    {
      id: 'urgent',
      title: 'ขออนุมัติซ่อมด่วน',
      icon: 'priority_high',
      path: '/customer/urgent-request',
      description: 'ขออนุมัติซ่อมด่วนฉุกเฉิน',
    },
  ];

  const isActive = (path) => location.pathname === path;

  return (
      <aside className={`
      bg-white border-r border-neutral-200 h-screen sticky top-16 overflow-y-auto custom-scrollbar
      transition-all duration-300 animate-slide-in-left
      ${collapsed ? 'w-20' : 'w-64'}
    `}>
        <div className={`${collapsed ? 'p-3' : 'p-6'}`}>
          {!collapsed && (
              <>
                {/* Header */}
                <div className="mb-6">
                  <h2 className="text-sm font-semibold text-neutral-400 uppercase tracking-wide mb-2">
                    เมนูหลัก
                  </h2>
                  <div className="h-1 w-12 bg-gradient-primary rounded-full"></div>
                </div>
              </>
          )}

          {/* Menu Items */}
          <nav className="space-y-1">
            {menuItems.map((item) => (
                <Link
                    key={item.id}
                    to={item.path}
                    className={`
                group flex ${collapsed ? 'justify-center' : 'items-start gap-3'} 
                px-4 py-3 rounded-xl transition-all duration-300
                ${isActive(item.path)
                        ? 'bg-gradient-primary text-white shadow-button'
                        : 'text-neutral-600 hover:bg-neutral-50 hover:text-primary-600'
                    }
              `}
                >
              <span className={`
                material-icons-round text-2xl
                ${isActive(item.path) ? 'text-white' : 'text-neutral-400'}
              `}>
                {item.icon}
              </span>

                  {!collapsed && (
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                    <span className={`font-medium text-sm ${isActive(item.path) ? 'text-white' : ''}`}>
                      {item.title}
                    </span>

                          {item.badge > 0 && (
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

                        <p className={`text-xs line-clamp-1 ${isActive(item.path) ? 'text-white/80' : 'text-neutral-400'}`}>
                          {item.description}
                        </p>
                      </div>
                  )}
                </Link>
            ))}
          </nav>

          {/* ✅ Stats จาก Backend */}
          {!collapsed && (
              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-500">เคลมทั้งหมด</span>
                  <span className="font-semibold text-neutral-dark">{stats.total}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-500">กำลังดำเนินการ</span>
                  <span className="font-semibold text-primary-600">{stats.ongoing}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-500">เสร็จสิ้น</span>
                  <span className="font-semibold text-success">{stats.completed}</span>
                </div>
              </div>
          )}
        </div>
      </aside>
  );
};

CustomerSidebar.propTypes = {
  collapsed: PropTypes.bool,
};

export default CustomerSidebar;