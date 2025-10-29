import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import InsuranceNavbar from './InsuranceNavbar';
import InsuranceSidebar from './InsuranceSidebar';

const InsuranceLayout = () => {
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

    //ถ้า role ไม่ใช่ insurance → redirect ไปหน้าที่ถูกต้อง
    if (parsed.role !== "insurance") {
      navigate(`/${parsed.role}/dashboard`);
    }
  }, [navigate]);

  // ยังโหลด user ไม่เสร็จ
  if (!user) return <div className="p-6">กำลังโหลด...</div>;

  return (
      <div className="min-h-screen bg-neutral-50">

        {/* Navbar */}
        <InsuranceNavbar
            user={user}
            onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        <div className="flex">

          {/* Sidebar */}
          <InsuranceSidebar collapsed={sidebarCollapsed} />

          {/* Content */}
          <main className="flex-1 p-6 overflow-y-auto">
            <div className="max-w-7xl mx-auto animate-fade-in">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
  );
};

export default InsuranceLayout;