import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import UserProfile from './pages/UserProfile';

// Pages
import Login from './pages/Login';

// Layouts
import { CustomerLayout } from './components/layout/customer';
import { InsuranceLayout } from './components/layout/insurance';
import { GarageLayout } from './components/layout/garage';

// Customer Pages
import Dashboard from './pages/customer/Dashboard';
import ClaimList from './pages/customer/ClaimList';
import ClaimDetail from './pages/customer/ClaimDetail';
import SelectGarage from './pages/customer/SelectGarage';
import UrgentRequest from './pages/customer/UrgentRequest';
import Complaint from './pages/customer/Complaint';

// Insurance Pages
import ActiveClaims from './pages/insurance/ActiveClaims';
import ClaimHistory from './pages/insurance/ClaimHistory';
import Approvals from './pages/insurance/Approvals';
import Analytics from './pages/insurance/Analytics';
import CreateClaim from './pages/insurance/CreateClaim';
import InsuranceClaimDetail from './pages/insurance/ClaimDetail';

// Garage Pages
import GarageDashboard from './pages/garage/GarageDashboard';
import GaragePending from './pages/garage/GaragePending';
import GarageRepairs from './pages/garage/GarageRepairs';
import GarageApprovals from './pages/garage/GarageApprovals';
import GarageHistory from './pages/garage/GarageHistory';
import GarageRepairDetail from './pages/garage/GarageRepairDetail';

/**
 * App Component - Main Router
 * 
 * Routes Structure:
 * ✅ / → Redirect to Login
 * ✅ /login → Login Page
 * ✅ /customer/* → Customer Portal (Protected)
 * ✅ /insurance/* → Insurance Portal (Protected)
 * ✅ /garage/* → Garage Portal (Protected)
 * 
 * 🔒 All routes except /login are protected by ProtectedRoute
 * 
 * TODO: Backend Integration
 * - Replace localStorage authentication with JWT tokens
 * - Add token refresh logic
 * - Add role-based permission checks
 */
function App() {
  return (
    <Router>
      <Routes>
        {/* ==================== PUBLIC ROUTES ==================== */}
        
        {/* Root - Redirect to Log in */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Login Page */}
        <Route path="/login" element={<Login />} />

        {/* ==================== CUSTOMER PORTAL ==================== */}
        <Route
          path="/customer"
          element={
            <ProtectedRoute requiredRole="customer">
              <CustomerLayout />
            </ProtectedRoute>
          }
        >
          {/* Dashboard - หน้าหลัก */}
          <Route path="dashboard" element={<Dashboard />} />
          
          {/* Claims - การเคลมทั้งหมด */}
          <Route path="claims" element={<ClaimList />} />
          <Route path="claims/:id" element={<ClaimDetail />} />
          
          {/* Select Garage - เลือกอู่ซ่อม */}
          <Route path="select-garage/:claimId" element={<SelectGarage />} />
          
          {/* Urgent Request - ขออนุมัติซ่อมด่วน */}
          <Route path="urgent-request" element={<UrgentRequest />} />
          
          {/* Complaint - แจ้งร้องเรียน */}
          <Route path="complaint" element={<Complaint />} />
          
          {/* User Profile - ข้อมูลผู้ใช้ */}
          <Route path="profile" element={<UserProfile />} />
          
          {/* Default redirect */}
          <Route index element={<Navigate to="/customer/dashboard" replace />} />
        </Route>

        {/* ==================== INSURANCE PORTAL ==================== */}
        <Route
          path="/insurance"
          element={
            <ProtectedRoute requiredRole="insurance">
              <InsuranceLayout />
            </ProtectedRoute>
          }
        >
          {/* Active Claims - เคสที่กำลังดำเนินการ */}
          <Route path="claims/active" element={<ActiveClaims />} />
          
          {/* Claim History - ประวัติการเคลม */}
          <Route path="claims/history" element={<ClaimHistory />} />
          
          {/* Create Claim - เปิดเคสใหม่ */}
          <Route path="claims/create" element={<CreateClaim />} />
          
          {/* Claim Detail - รายละเอียดเคส */}
          <Route path="claims/:id" element={<InsuranceClaimDetail />} />
          
          {/* Approvals - คำขออนุมัติ */}
          <Route path="approvals" element={<Approvals />} />
          
          {/* Analytics - วิเคราะห์และรายงาน */}
          <Route path="analytics" element={<Analytics />} />
          
          {/* User Profile - ข้อมูลผู้ใช้ */}
          <Route path="profile" element={<UserProfile />} />
          
          {/* Default redirect */}
          <Route index element={<Navigate to="/insurance/claims/active" replace />} />
        </Route>

        {/* ==================== GARAGE PORTAL ==================== */}
        <Route
          path="/garage"
          element={
            <ProtectedRoute requiredRole="garage">
              <GarageLayout />
            </ProtectedRoute>
          }
        >
          {/* Dashboard - ภาพรวม */}
          <Route index element={<GarageDashboard />} />
          
          {/* Pending - รอยืนยัน */}
          <Route path="pending" element={<GaragePending />} />
          
          {/* Repairs - รายการซ่อม */}
          <Route path="repairs" element={<GarageRepairs />} />
          <Route path="repairs/:id" element={<GarageRepairDetail />} />
          
          {/* Approvals - คำขออนุมัติ */}
          <Route path="approvals" element={<GarageApprovals />} />
          
          {/* History - ประวัติการซ่อม */}
          <Route path="history" element={<GarageHistory />} />
          
          {/* User Profile - ข้อมูลผู้ใช้ */}
          <Route path="profile" element={<UserProfile />} />
        </Route>

        {/* ==================== 404 NOT FOUND ==================== */}
        <Route path="*" element={
          <div className="flex items-center justify-center min-h-screen bg-neutral-50">
            <div className="text-center animate-fade-in">
              <div className="inline-flex items-center justify-center w-32 h-32 bg-neutral-100 rounded-full mb-6">
                <span className="material-icons-round text-neutral-300 text-7xl">search_off</span>
              </div>
              <h1 className="text-6xl font-bold text-neutral-300 mb-4">404</h1>
              <p className="text-xl text-neutral-500 mb-6">ไม่พบหน้าที่คุณต้องการ</p>
              <a href="/login" className="btn-primary inline-flex items-center gap-2">
                <span className="material-icons-round">home</span>
                <span>กลับหน้าหลัก</span>
              </a>
            </div>
          </div>
        } />
      </Routes>
    </Router>
  );
}

export default App;