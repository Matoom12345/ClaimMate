import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import GarageNavbar from './GarageNavbar';
import GarageSidebar from './GarageSidebar';

/**
 * GarageLayout - Layout หลักสำหรับหน้าอู่ซ่อม
 * ประกอบด้วย: Navbar (บน) + Sidebar (ซ้าย) + Content (กลาง)
 */
const GarageLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Mock garage data
  const mockGarage = {
    id: '1',
    name: 'อู่สมชาย ห้วยขวาง',
    phone: '02-123-4567',
    email: 'somchai.garage@example.com',
    address: '123 ถนนประชาราษฎร์ แขวงห้วยขวาง เขตห้วยขวาง กรุงเทพมหานคร',
    license: 'GAR-2024-001',
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Navbar */}
      <GarageNavbar 
        garage={mockGarage} 
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