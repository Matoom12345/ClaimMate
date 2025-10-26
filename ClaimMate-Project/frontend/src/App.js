import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import { InsuranceLayout } from './components/layout/insurance';

// Insurance Pages
import {
  ActiveClaims,
  CreateClaim,
  ClaimDetail,
  ClaimHistory,
  Approvals,
  Analytics
} from './pages/insurance';

/**
 * App Component - Main Router
 *
 * Routes:
 * - /insurance/* - Insurance Company Portal
 * - /customer/* - Customer Portal (TODO)
 * - /garage/* - Garage Portal (TODO)
 */
function App() {
  return (
      <Router>
        <Routes>
          {/* Root - Redirect to Insurance */}
          <Route path="/" element={<Navigate to="/insurance" replace />} />

          {/* Insurance Company Portal */}
          <Route path="/insurance" element={<InsuranceLayout />}>
            <Route index element={<ActiveClaims />} />

            {/* Claims Management */}
            <Route path="claims">
              <Route path="active" element={<ActiveClaims />} />
              <Route path="create" element={<CreateClaim />} />
              <Route path=":id" element={<ClaimDetail />} />
              <Route path="history" element={<ClaimHistory />} />
            </Route>

            {/* Approvals */}
            <Route path="approvals" element={<Approvals />} />

            {/* Reports & Analytics */}
            <Route path="analytics" element={<Analytics />} />
          </Route>

          {/* Customer Portal - TODO */}
          {/* <Route path="/customer" element={<CustomerLayout />}>
          <Route index element={<CustomerDashboard />} />
          <Route path="claims/:id" element={<CustomerClaimDetail />} />
          <Route path="garages" element={<GarageSelection />} />
        </Route> */}

          {/* Garage Portal - TODO */}
          {/* <Route path="/garage" element={<GarageLayout />}>
          <Route index element={<GarageDashboard />} />
          <Route path="claims/:id" element={<GarageClaimDetail />} />
        </Route> */}

          {/* 404 Not Found */}
          <Route path="*" element={
            <div className="flex items-center justify-center min-h-screen bg-neutral-50">
              <div className="text-center">
                <h1 className="text-6xl font-bold text-neutral-300 mb-4">404</h1>
                <p className="text-xl text-neutral-500 mb-6">ไม่พบหน้าที่คุณต้องการ</p>
                <a href="/" className="btn-primary">
                  กลับหน้าหลัก
                </a>
              </div>
            </div>
          } />
        </Routes>
      </Router>
  );
}

export default App;