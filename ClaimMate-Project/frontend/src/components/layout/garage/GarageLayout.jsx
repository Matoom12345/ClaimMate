import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import GarageNavbar from './GarageNavbar';
import GarageSidebar from './GarageSidebar';

/**
 * GarageLayout - Layout หลักสำหรับหน้าอู่ซ่อม
 * ประกอบด้วย: Navbar (บน) + Sidebar (ซ้าย) + Content (กลาง)
 */
const GarageLayout = () => {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [user, setUser] = useState(null);

  // ดึง user จาก localStorage หลัง login
  useEffect(() => {
    const stored = localStorage.getItem("claimmate_user");
    if (!stored) {
      navigate("/login");
      return;
    }

    const parsed = JSON.parse(stored);
    setUser(parsed);

    //ถ้า role ไม่ใช่ garage → redirect ไปหน้าที่ถูกต้อง
    if (parsed.role !== "garage") {
      navigate(`/${parsed.role}/GarageDashboard`);
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Navbar */}
      <GarageNavbar
        garage={user}
        onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Container */}
      <div className="flex">
        {/* Sidebar */}
        <GarageSidebar collapsed={sidebarCollapsed} />

        {/* Main Content Area */}
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default GarageLayout;