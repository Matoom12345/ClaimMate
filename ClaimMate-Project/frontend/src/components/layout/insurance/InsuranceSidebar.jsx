import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import axios from "axios";
// ⭐️ (ลบ) ไม่ต้องใช้ Cookies
// import Cookies from 'js-cookie';

/**
 * InsuranceSidebar - Sidebar สำหรับบริษัทประกันภัย
 * ... (Comments เดิม) ...
 */
const InsuranceSidebar = ({ collapsed = false }) => {
    const location = useLocation();

    // ⭐️ 1. (เพิ่ม) State สำหรับเก็บ User ที่ login (เหมือน CreateClaim/Approvals)
    const [currentUser, setCurrentUser] = useState(null);

    // ⭐️ 2. (แก้ไข) เพิ่ม State ใหม่ๆ ให้ครบ
    const [stats, setStats] = useState({
        totalClaims: 0,
        allPendingClaims: 0, // ⬅️ (เปลี่ยนชื่อ) สำหรับ Quick Stats
        completedClaims: 0,
        activeClaimsBadge: 0, // ⬅️ (เพิ่ม) สำหรับ Badge 1
        approvalRequests: 0   // ⬅️ (เพิ่ม) สำหรับ Badge 2
    });

    // ⭐️ 3. (เพิ่ม) useEffect นี้ เพื่อดึงข้อมูล User จาก localStorage
    useEffect(() => {
        const stored = localStorage.getItem("claimmate_user");
        if (stored) {
            const userData = JSON.parse(stored);
            if (userData && userData.insuranceID) {
                setCurrentUser(userData);
            } else {
                console.error("Sidebar: User data in localStorage is missing insuranceID");
            }
        }
    }, []);

    // ⭐️ 4. (แก้ไข) useEffect นี้ ให้ดึงข้อมูลโดยใช้ currentUser
    useEffect(() => {
        // (รอจนกว่า currentUser จะพร้อม)
        if (!currentUser) return;

        const fetchStats = async () => {
            try {
                // (ลบ Token)
                // ⭐️ (แก้ไข) เปลี่ยน URL และเพิ่ม params
                // (หมายเหตุ: ถ้าคุณตั้ง proxy ใน package.json แล้ว ให้ลบ "http://localhost:3000" ออก)
                const res = await axios.get('http://localhost:3000/api/claims/stats', {
                    params: {
                        insuranceId: currentUser.insuranceID // ⬅️ (ส่ง ID ไปใน query)
                    }
                });
                setStats(res.data); // (API จะส่ง state ทั้งหมดกลับมา)
            } catch (err) {
                console.error('Error fetching stats:', err);
            }
        };

        fetchStats();
        const interval = setInterval(fetchStats, 30000);
        return () => clearInterval(interval);

    }, [currentUser]); // ⬅️ (ให้ re-run เมื่อ currentUser พร้อม)

    // ⭐️ 5. (แก้ไข) menuItems
    const menuItems = [
        {
            id: 'claims-active',
            title: 'เคสที่กำลังดำเนินการ',
            icon: 'assignment',
            path: '/insurance/claims/active',
            badge: stats.activeClaimsBadge, // ⬅️ (เชื่อม Badge 1 - Logic ใหม่)
        },
        {
            id: 'claims-history',
            title: 'ประวัติการเคลม',
            icon: 'history',
            path: '/insurance/claims/history',
        },
        {
            id: 'approvals',
            title: 'คำขออนุมัติ',
            icon: 'approval',
            path: '/insurance/approvals',
            description: 'อนุมัติจากลูกค้าและอู่',
            badge: stats.approvalRequests, // ⬅️ (เชื่อม Badge 2)
            highlight: stats.approvalRequests > 0, // ⬅️ (ให้กระพริบถ้ามี)
        },
    ];

    // (โค้ดส่วนที่เหลือเหมือนเดิมเป๊ะ)

    const isActive = (path) => location.pathname.startsWith(path);

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
                                title={item.title}
                            >
                                {/* Icon */}
                                <span className={`
                  material-icons-round text-2xl transition-transform duration-300 group-hover:scale-110
                  ${isActive(item.path) ? 'text-white' : 'text-neutral-400'}
                `}>
                                    {item.icon}
                                </span>

                                {/* Badge */}
                                {item.badge && item.badge > 0 && (
                                    <span className={`
                    absolute top-2 right-2 w-5 h-5 text-xs font-bold rounded-full flex items-center justify-center
                    ${item.highlight
                                        ? 'bg-error text-white animate-bounce'
                                        : 'bg-primary-500 text-white'
                                    }
                  `}>
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
                                    {/* Icon */}
                                    <span className={`
                    material-icons-round text-2xl transition-transform duration-300 group-hover:scale-110
                    ${isActive(item.path) ? 'text-white' : 'text-neutral-400'}
                    ${item.highlight && !isActive(item.path) ? 'text-error' : ''}
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
                                            {item.badge && item.badge > 0 && (
                                                <span className={`
                          px-2 py-0.5 text-xs font-bold rounded-full
                          ${isActive(item.path)
                                                    ? 'bg-white/20 text-white'
                                                    : item.highlight
                                                        ? 'bg-error text-white animate-bounce'
                                                        : 'bg-primary-500 text-white'
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

                        {/* Quick Actions */}
                        <div className="mt-8">
                            <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-wide mb-3">
                                การดำเนินการด่วน
                            </h3>
                            <div className="space-y-2">
                                <Link
                                    to="/insurance/claims/create"
                                    className="flex items-center gap-3 p-3 bg-primary-50 text-primary-700 hover:bg-primary-100 rounded-lg transition-colors duration-200"
                                >
                                    <span className="material-icons-round">add_circle</span>
                                    <span className="text-sm font-medium">เปิดเคสใหม่</span>
                                </Link>
                            </div>
                        </div>

                        {/* Help Section */}
                        <div className="mt-8 p-4 bg-gradient-secondary rounded-xl text-white">
                            <div className="flex items-start gap-3">
                                <span className="material-icons-round text-3xl">help_outline</span>
                                <div>
                                    <h3 className="font-semibold mb-1">ต้องการความช่วยเหลือ?</h3>
                                    <p className="text-xs text-white/80 mb-3">
                                        ติดต่อฝ่าย IT Support
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

                        {/* ⭐️ 6. (แก้ไข) Quick Stats */}
                        <div className="mt-6 space-y-3">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-neutral-500">เคลมทั้งหมด</span>
                                <span className="font-semibold text-neutral-dark">{stats.totalClaims}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-neutral-500">รอดำเนินการ</span>
                                {/* ⬅️ (ใช้ allPendingClaims ที่มี Logic 'isClosed: false') */}
                                <span className="font-semibold text-warning">{stats.allPendingClaims}</span>

                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-neutral-500">เสร็จสิ้น</span>
                                <span className="font-semibold text-success">{stats.completedClaims}</span>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </aside>
    );
};

InsuranceSidebar.propTypes = {
    collapsed: PropTypes.bool,
};

export default InsuranceSidebar;