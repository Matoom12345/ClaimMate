import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

/**
 * GarageNavbar - Navbar สำหรับอู่ซ่อม
 */
const GarageNavbar = ({ garage, onToggleSidebar }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showGarageMenu, setShowGarageMenu] = useState(false);

  const handleLogout = () => {
    console.log("Logout");
  };

  // Mock notifications
  const notifications = [
    { id: 1, type: 'new', message: 'คำขอซ่อมใหม่จากลูกค้า - CLM-2024-009', time: '5 นาทีที่แล้ว', read: false },
    { id: 2, type: 'approved', message: 'บริษัทอนุมัติรายการเพิ่มเติม - R-2024-002', time: '1 ชั่วโมงที่แล้ว', read: false },
    { id: 3, type: 'info', message: 'ลูกค้าแก้ไขข้อมูลการติดต่อ - R-2024-001', time: '3 ชั่วโมงที่แล้ว', read: true },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <nav className="bg-white shadow-md sticky top-0 z-40 animate-slide-down">
      <div className="container-custom">
        <div className="flex items-center justify-between h-16">
          
          {/* Left */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleSidebar}
              className="p-2 hover:bg-neutral-100 rounded-lg transition-colors duration-300"
            >
              <span className="material-icons-round text-neutral-600">menu</span>
            </button>

            <Link to="/garage" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center shadow-button group-hover:shadow-glow-primary transition-all duration-300 group-hover:scale-110">
                <span className="material-icons-round text-white text-2xl">build</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-primary-600">ClaimMate</h1>
                <p className="text-xs text-neutral-500">อู่ซ่อม</p>
              </div>
            </Link>
          </div>

          {/* Right */}
          <div className="flex items-center gap-4">
            {/* Quick Stats */}
            <div className="hidden md:flex items-center gap-4 px-4 py-2 bg-neutral-50 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="material-icons-round text-warning text-sm">build</span>
                <div className="text-left">
                  <p className="text-xs text-neutral-500">กำลังซ่อม</p>
                  <p className="text-sm font-semibold text-neutral-dark">5</p>
                </div>
              </div>
              <div className="w-px h-8 bg-neutral-200"></div>
              <div className="flex items-center gap-2">
                <span className="material-icons-round text-success text-sm">check_circle</span>
                <div className="text-left">
                  <p className="text-xs text-neutral-500">เสร็จแล้ว</p>
                  <p className="text-sm font-semibold text-neutral-dark">28</p>
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors duration-300"
              >
                <span className="material-icons-round">notifications</span>
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-5 h-5 bg-error text-white text-xs font-bold rounded-full flex items-center justify-center animate-bounce">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <>
                  <div 
                    className="fixed inset-0 z-30" 
                    onClick={() => setShowNotifications(false)}
                  ></div>
                  <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-card-hover border border-neutral-200 overflow-hidden z-40 animate-scale-in">
                    <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
                      <h3 className="font-semibold text-neutral-dark">การแจ้งเตือน</h3>
                      {unreadCount > 0 && (
                        <span className="text-xs text-primary-600 font-medium">
                          {unreadCount} ใหม่
                        </span>
                      )}
                    </div>
                    <div className="max-h-96 overflow-y-auto custom-scrollbar">
                      {notifications.map(notif => (
                        <div
                          key={notif.id}
                          className={`
                            p-4 border-b border-neutral-100 hover:bg-neutral-50 cursor-pointer transition-colors duration-200
                            ${!notif.read ? 'bg-blue-50/50' : ''}
                          `}
                        >
                          <div className="flex items-start gap-3">
                            <span className={`
                              material-icons-round text-xl
                              ${notif.type === 'new' ? 'text-primary-600' : 
                                notif.type === 'approved' ? 'text-green-600' : 'text-neutral-400'}
                            `}>
                              {notif.type === 'new' ? 'assignment' : 
                               notif.type === 'approved' ? 'check_circle' : 'info'}
                            </span>
                            <div className="flex-1">
                              <p className="text-sm text-neutral-dark">{notif.message}</p>
                              <p className="text-xs text-neutral-400 mt-1">{notif.time}</p>
                            </div>
                            {!notif.read && (
                              <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="p-3 border-t border-neutral-200 text-center">
                      <Link
                        to="/garage/notifications"
                        className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                        onClick={() => setShowNotifications(false)}
                      >
                        ดูทั้งหมด
                      </Link>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Garage Menu */}
            <div className="relative">
              <button
                onClick={() => setShowGarageMenu(!showGarageMenu)}
                className="flex items-center gap-3 p-2 hover:bg-neutral-50 rounded-lg transition-colors duration-300"
              >
                <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white font-semibold">
                  <span className="material-icons-round">build</span>
                </div>
                <div className="text-left hidden md:block">
                  <p className="text-sm font-medium text-neutral-dark">{garage?.name || 'อู่ซ่อม'}</p>
                  <p className="text-xs text-neutral-500">อู่ซ่อม</p>
                </div>
                <span className="material-icons-round text-neutral-400">expand_more</span>
              </button>

              {showGarageMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-30" 
                    onClick={() => setShowGarageMenu(false)}
                  ></div>
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-card-hover border border-neutral-200 overflow-hidden z-40 animate-scale-in">
                    <div className="p-4 border-b border-neutral-200">
                      <p className="font-semibold text-neutral-dark">{garage?.name}</p>
                      <p className="text-sm text-neutral-500 mt-1">{garage?.phone}</p>
                      <p className="text-xs text-neutral-400 mt-1">{garage?.license}</p>
                    </div>
                    <div className="py-2">
                      <Link
                        to="/garage/profile"
                        className="flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 transition-colors duration-200"
                        onClick={() => setShowGarageMenu(false)}
                      >
                        <span className="material-icons-round text-neutral-400">account_circle</span>
                        <span className="text-sm text-neutral-dark">ข้อมูลอู่</span>
                      </Link>
                    </div>
                    <div className="border-t border-neutral-200 py-2">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors duration-200 w-full text-left"
                      >
                        <span className="material-icons-round text-error">logout</span>
                        <span className="text-sm text-error">ออกจากระบบ</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

GarageNavbar.propTypes = {
  garage: PropTypes.object,
  onToggleSidebar: PropTypes.func,
};

GarageNavbar.defaultProps = {
  onToggleSidebar: () => {},
};

export default GarageNavbar;