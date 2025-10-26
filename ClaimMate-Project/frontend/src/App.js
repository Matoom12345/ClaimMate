import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Layout
import { CustomerLayout } from './components/layout/customer';

// Pages
import {
  Dashboard,
  ClaimList,
  ClaimDetail,
  SelectGarage,
  UrgentRequest,
  Complaint,
} from './pages/customer';

/**
 * App Component - Main application router
 * 
 * TODO: Backend Integration
 * 1. Auth Context - สำหรับจัดการ authentication
 *    - Login/Logout
 *    - ตรวจสอบ token
 *    - ตรวจสอบ role
 * 
 * 2. Protected Routes - ป้องกันการเข้าถึงหน้าโดยไม่มี auth
 * 
 * 3. Role-based Routing - แยก route ตาม role
 *    - /customer/* - สำหรับลูกค้า
 *    - /insurance/* - สำหรับบริษัทประกัน
 *    - /garage/* - สำหรับอู่ซ่อม
 */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Root - Redirect to customer dashboard */}
        <Route path="/" element={<Navigate to="/customer/dashboard" replace />} />

        {/* Customer Routes */}
        <Route path="/customer/*" element={
          // TODO: Backend - เพิ่ม <ProtectedRoute role="customer">
          <CustomerLayout>
            <Routes>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="claims" element={<ClaimList />} />
              <Route path="claims/:id" element={<ClaimDetail />} />
              <Route path="select-garage" element={<SelectGarage />} />
              <Route path="urgent-request" element={<UrgentRequest />} />
              <Route path="complaint" element={<Complaint />} />
              
              {/* TODO: เพิ่มหน้าอื่นๆ */}
              {/* <Route path="profile" element={<Profile />} /> */}
              {/* <Route path="settings" element={<Settings />} /> */}
              {/* <Route path="satisfaction" element={<Satisfaction />} /> */}
              
              {/* 404 - Not Found */}
              <Route path="*" element={
                <div className="card text-center py-16">
                  <span className="material-icons-round text-6xl text-neutral-300 mb-4">
                    error_outline
                  </span>
                  <h2 className="text-2xl font-bold text-neutral-dark mb-2">
                    ไม่พบหน้าที่ค้นหา
                  </h2>
                  <p className="text-neutral-500">
                    หน้าที่คุณกำลังมองหาไม่มีอยู่ในระบบ
                  </p>
                </div>
              } />
            </Routes>
          </CustomerLayout>
        } />

        {/* TODO: Insurance Routes */}
        {/* <Route path="/insurance/*" element={<InsuranceRoutes />} /> */}

        {/* TODO: Garage Routes */}
        {/* <Route path="/garage/*" element={<GarageRoutes />} /> */}

        {/* TODO: Auth Routes */}
        {/* <Route path="/login" element={<Login />} /> */}
        {/* <Route path="/register" element={<Register />} /> */}
        {/* <Route path="/forgot-password" element={<ForgotPassword />} /> */}

        {/* Catch all - Redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
