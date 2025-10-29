import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import CustomerNavbar from './CustomerNavbar';
import CustomerSidebar from './CustomerSidebar';

/**
 * CustomerLayout - Layout หลักสำหรับหน้าลูกค้า
 * ประกอบด้วย: Navbar (บน) + Sidebar (ซ้าย) + Content (กลาง)
 * 
 * ⚠️ IMPORTANT: ใช้ <Outlet /> สำหรับ React Router v6 nested routes
 * 
 * TODO: Backend Integration Points
 * 1. User Authentication - ตรวจสอบ token/session
 *    - GET /api/auth/me - ดึงข้อมูล user ที่ login อยู่
 *    - ถ้าไม่มี token → redirect ไป /login
 * 
 * 2. User Role Check - ตรวจสอบว่าเป็น customer role จริงหรือไม่
 *    - ถ้า role ไม่ใช่ 'customer' → redirect ไปหน้าที่เหมาะสม
 */
const CustomerLayout = () => {
  // State สำหรับ toggle sidebar
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // TODO: Backend - ดึงข้อมูล user จาก context/redux หรือ API
  // const { user, loading } = useAuth();
  // const navigate = useNavigate();

  // TODO: Backend - ตรวจสอบ authentication
  // useEffect(() => {
  //   if (!loading && !user) {
  //     navigate('/login');
  //   }
  //   if (user && user.role !== 'customer') {
  //     navigate(`/${user.role}/dashboard`);
  //   }
  // }, [user, loading, navigate]);

  // Mock user data (จะถูกแทนที่ด้วยข้อมูลจริงจาก Backend)
  const mockUser = {
    id: '1',
    name: 'สมชาย ใจดี',
    email: 'customer@example.com',
    role: 'customer',
    avatar: null,
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Navbar */}
      <CustomerNavbar 
        user={mockUser} 
        onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Container */}
      <div className="flex">
        {/* Sidebar */}
        <CustomerSidebar collapsed={sidebarCollapsed} />

        {/* Main Content Area */}
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto animate-fade-in">
            {/* ⚠️ CRITICAL: ใช้ <Outlet /> สำหรับ nested routes */}
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default CustomerLayout;