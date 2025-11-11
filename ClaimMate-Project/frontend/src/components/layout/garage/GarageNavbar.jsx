import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

/**
 * GarageNavbar - Navbar สำหรับอู่ซ่อม
 */
const GarageNavbar = ({ garage, onToggleSidebar }) => {
  const [showGarageMenu, setShowGarageMenu] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('claimmate_user');  // ✅ ลบข้อมูล user
    window.location.href = '/login';
  };

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