import React, { useState, useEffect } from 'react'; // ⭐️ 1. (เพิ่ม) useEffect
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import axios from 'axios'; // ⭐️ 2. (เพิ่ม) axios

/**
 * InsuranceNavbar - Navbar หลักสำหรับหน้าบริษัทประกันภัย
 * ... (Comments เดิม) ...
 */
const InsuranceNavbar = ({ user, onToggleSidebar }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);

  // ⭐️ 3. (เพิ่ม) State สำหรับ Stats
  const [stats, setStats] = useState({
    approvalRequests: 0,
    activeClaimsBadge: 0
  });

  // ⭐️ 4. (เพิ่ม) useEffect สำหรับดึงข้อมูล Stats
  useEffect(() => {
    // (เราใช้ 'user' prop ที่ถูกส่งมาจาก InsuranceLayout.jsx)
    // (user.insuranceID จะถูกดึงมาจาก localStorage ใน Layout)
    if (!user || !user.insuranceID) return;

    const fetchStats = async () => {
      try {
        // (ใช้ API เดียวกับ Sidebar)
        const res = await axios.get('http://localhost:3000/api/claims/stats', {
          params: {
            insuranceId: user.insuranceID // (ใช้ ID จาก prop 'user')
          }
        });
        // (เราสนใจแค่ 2 ค่านี้)
        setStats({
          approvalRequests: res.data.approvalRequests,
          activeClaimsBadge: res.data.activeClaimsBadge
        });
      } catch (err) {
        console.error('Error fetching navbar stats:', err);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 30000); // Refresh ทุก 30 วิ
    return () => clearInterval(interval);
  }, [user]); // (Rerun เมื่อ 'user' prop เปลี่ยน)


  // TODO: Backend - Logout
  const handleLogout = () => {
    localStorage.removeItem('claimmate_user');
    localStorage.removeItem('token'); // ⭐️ (แนะนำ) ลบ token ด้วย
    window.location.href = '/login';
  };

  return (
      <nav className="bg-white shadow-md sticky top-0 z-40 animate-slide-down">
        <div className="container-custom">
          <div className="flex items-center justify-between h-16">

            {/* Left - Logo & Brand with Toggle Button (เหมือนเดิม) */}
            <div className="flex items-center gap-3">
              <button
                  onClick={onToggleSidebar}
                  className="p-2 hover:bg-neutral-100 rounded-lg transition-colors duration-300"
                  title="ย่อ/ขยาย เมนู"
              >
                <span className="material-icons-round text-neutral-600">menu</span>
              </button>

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

              {/* ⭐️ 5. (แก้ไข) Quick Stats */}
              <div className="hidden md:flex items-center gap-4 px-4 py-2 bg-neutral-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="material-icons-round text-warning text-sm">pending</span>
                  <div className="text-left">
                    <p className="text-xs text-neutral-500">รออนุมัติ</p>
                    {/* (เชื่อม) */}
                    <p className="text-sm font-semibold text-neutral-dark">{stats.approvalRequests}</p>
                  </div>
                </div>
                <div className="w-px h-8 bg-neutral-200"></div>
                <div className="flex items-center gap-2">
                  <span className="material-icons-round text-primary-500 text-sm">assignment</span>
                  <div className="text-left">
                    <p className="text-xs text-neutral-500">กำลังดำเนินการ</p>
                    {/* (เชื่อม) */}
                    <p className="text-sm font-semibold text-neutral-dark">{stats.activeClaimsBadge}</p>
                  </div>
                </div>
              </div>

              {/* User Menu (เหมือนเดิม) */}
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

                {/* User Dropdown (เหมือนเดิม) */}
                {showUserMenu && (
                    <>
                      <div
                          className="fixed inset-0 z-30"
                          onClick={() => setShowUserMenu(false)}
                      ></div>
                      <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-card-hover border border-neutral-200 overflow-hidden z-40 animate-scale-in">
                        <div className="p-4 border-b border-neutral-200">
                          <p className="font-semibold text-neutral-dark">{user?.firstName + " " +user?.lastName || 'ผู้ใช้'}</p>
                          <p className="text-sm text-neutral-500 mt-1">{user?.email || 'user@example.com'}</p>
                        </div>
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
    // (แก้ไข) ⭐️ เพิ่ม props ที่เราใช้
    firstName: PropTypes.string,
    lastName: PropTypes.string,
    insuranceID: PropTypes.number,
    // (Props เดิม)
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