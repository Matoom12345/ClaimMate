import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

/**
 * InsuranceNavbar - Navbar หลักสำหรับหน้าบริษัทประกันภัย
 * แสดง: โลโก้ + การแจ้งเตือน + ข้อมูลผู้ใช้
 * 
 * Props:
 * - user: object - ข้อมูลผู้ใช้
 * - onToggleSidebar: function - ฟังก์ชันสำหรับย่อ/ขยาย sidebar
 */
const InsuranceNavbar = ({ user, onToggleSidebar }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);

  // TODO: Backend - Logout
  const handleLogout = () => {
    localStorage.removeItem('claimmate_user');  // ✅ ลบข้อมูล user
    window.location.href = '/login';            // ✅ Redirect ไปหน้า login
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-40 animate-slide-down">
      <div className="container-custom">
        <div className="flex items-center justify-between h-16">
          
          {/* Left - Logo & Brand with Toggle Button */}
          <div className="flex items-center gap-3">
            {/* Toggle Sidebar Button */}
            <button
              onClick={onToggleSidebar}
              className="p-2 hover:bg-neutral-100 rounded-lg transition-colors duration-300"
              title="ย่อ/ขยาย เมนู"
            >
              <span className="material-icons-round text-neutral-600">menu</span>
            </button>

            {/* Logo */}
            <Link to="/insurance/claims" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-button group-hover:shadow-glow-primary transition-all duration-300 group-hover:scale-110">
                <span className="material-icons-round text-white text-2xl">shield</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gradient-primary">ClaimMate</h1>
                <p className="text-xs text-neutral-500">บริษัทประกันภัย</p>
              </div>
            </Link>
          </div>

          {/* Right Menu */}
          <div className="flex items-center gap-4">
            {/* Quick Stats */}
            <div className="hidden md:flex items-center gap-4 px-4 py-2 bg-neutral-50 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="material-icons-round text-warning text-sm">pending</span>
                <div className="text-left">
                  <p className="text-xs text-neutral-500">รออนุมัติ</p>
                  <p className="text-sm font-semibold text-neutral-dark">12</p>
                </div>
              </div>
              <div className="w-px h-8 bg-neutral-200"></div>
              <div className="flex items-center gap-2">
                <span className="material-icons-round text-primary-500 text-sm">assignment</span>
                <div className="text-left">
                  <p className="text-xs text-neutral-500">กำลังดำเนินการ</p>
                  <p className="text-sm font-semibold text-neutral-dark">8</p>
                </div>
              </div>
            </div>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-3 p-2 hover:bg-neutral-50 rounded-lg transition-colors duration-300"
              >
                <div className="w-10 h-10 bg-gradient-secondary rounded-full flex items-center justify-center text-white font-semibold">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user?.firstName + " " +user?.lastName} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span>{user?.firstName?.charAt(0) || 'U'}</span>
                  )}
                </div>
                <div className="text-left hidden md:block">
                  <p className="text-sm font-medium text-neutral-dark">{user?.firstName + " " +user?.lastName || 'ผู้ใช้'}</p>
                  <p className="text-xs text-neutral-500">{user?.position || 'เจ้าหน้าที่'}</p>
                </div>
                <span className="material-icons-round text-neutral-400">expand_more</span>
              </button>

              {/* User Dropdown */}
              {showUserMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-30" 
                    onClick={() => setShowUserMenu(false)}
                  ></div>
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-card-hover border border-neutral-200 overflow-hidden z-40 animate-scale-in">
                    {/* User Info */}
                    <div className="p-4 border-b border-neutral-200">
                      <p className="font-semibold text-neutral-dark">{user?.firstName + " " +user?.lastName || 'ผู้ใช้'}</p>
                      <p className="text-sm text-neutral-500 mt-1">{user?.email || 'user@example.com'}</p>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <Link
                        to="/insurance/profile"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 transition-colors duration-200"
                      >
                        <span className="material-icons-round text-neutral-400">person</span>
                        <span className="text-sm text-neutral-dark">ข้อมูลผู้ใช้</span>
                      </Link>
                    </div>

                    {/* Logout */}
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

InsuranceNavbar.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    email: PropTypes.string,
    position: PropTypes.string,
    avatar: PropTypes.string,
  }),
  onToggleSidebar: PropTypes.func,
};

InsuranceNavbar.defaultProps = {
  onToggleSidebar: () => {},
};

export default InsuranceNavbar;