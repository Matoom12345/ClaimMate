import React, { useState } from 'react';
import PropTypes from 'prop-types';
import CustomerNavbar from './CustomerNavbar';
import CustomerSidebar from './CustomerSidebar';

/**
 * CustomerLayout - Layout หลักสำหรับหน้าลูกค้า
 * ประกอบด้วย: Navbar (บน) + Sidebar (ซ้าย) + Content (กลาง)
 * 
 * TODO: Backend Integration Points
 * 1. User Authentication - ตรวจสอบ token/session
 *    - GET /api/auth/me - ดึงข้อมูล user ที่ login อยู่
 *    - ถ้าไม่มี token → redirect ไป /login
 * 
 * 2. User Role Check - ตรวจสอบว่าเป็น customer role จริงหรือไม่
 *    - ถ้า role ไม่ใช่ 'customer' → redirect ไปหน้าที่เหมาะสม
 */
const CustomerLayout = ({ children }) => {
  // 🆕 State สำหรับ toggle sidebar
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
  //     // Redirect ไปหน้าที่เหมาะสมตาม role
  //     navigate(`/${user.role}/dashboard`);
  //   }
  // }, [user, loading, navigate]);

  // TODO: Backend - แสดง loading state
  // if (loading) {
  //   return <Loading fullScreen text="กำลังโหลด..." />;
  // }

  // Mock user data (จะถูกแทนที่ด้วยข้อมูลจริงจาก Backend)
  const mockUser = {
    id: '1',
    name: 'สมชาย ใจดี',
    email: 'somchai@example.com',
    role: 'customer',
    avatar: null,
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Navbar - ส่ง function toggle */}
      <CustomerNavbar 
        user={mockUser} 
        onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Container */}
      <div className="flex">
        {/* Sidebar - ส่ง collapsed state */}
        <CustomerSidebar collapsed={sidebarCollapsed} />

        {/* Main Content Area */}
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

CustomerLayout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default CustomerLayout;