import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';

import CustomerNavbar from './CustomerNavbar';
import CustomerSidebar from './CustomerSidebar';

const CustomerLayout = () => {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("claimmate_user");

    if (!stored) {
      navigate("/login");
      return;
    }

    const parsed = JSON.parse(stored);

    // ✅ ถ้า role ไม่ตรง customer → redirect ไปหน้า role นั้น
    if (parsed.role !== "customer") {
      navigate(`/${parsed.role}/dashboard`);
      return;
    }

    setUser(parsed); // ✅ set user ให้ Navbar + Sidebar

  }, [navigate]);

  if (!user) return null; // ป้องกัน render ก่อนตรวจ role

  return (
      <div className="min-h-screen bg-neutral-50">

        {/* ✅ Navbar */}
        <CustomerNavbar
            user={user}
            onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        {/* ✅ Layout */}
        <div className="flex">

          <CustomerSidebar collapsed={sidebarCollapsed} />

          <main className="flex-1 p-6 overflow-y-auto">
            <div className="max-w-7xl mx-auto animate-fade-in">
              <Outlet />
            </div>
          </main>

        </div>
      </div>
  );
};

export default CustomerLayout;