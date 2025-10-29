import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import Loading from './Loading';

/**
 * ProtectedRoute - Component สำหรับป้องกันหน้าที่ต้อง login
 * 
 * 🟢 Production: แทนที่การเช็ค localStorage ด้วย AuthContext หรือ Redux
 * 
 * @param {node} children - Component ที่ต้องการป้องกัน
 * @param {string} requiredRole - Role ที่ต้องการ (optional)
 */
const ProtectedRoute = ({ children, requiredRole = null }) => {
  // 🔴 MOCK - ตรวจสอบ user จาก localStorage (ในระบบจริงใช้ AuthContext)
  const userString = localStorage.getItem('claimmate_user');
  const user = userString ? JSON.parse(userString) : null;

  // ถ้าไม่มี user → redirect ไป login
  if (!user) {
    console.log('❌ No user found - Redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // ถ้ากำหนด requiredRole และ role ไม่ตรง → redirect ไปหน้าที่เหมาะสม
  if (requiredRole && user.role !== requiredRole) {
    console.log(`❌ Wrong role: ${user.role} (required: ${requiredRole})`);
    const roleRoutes = {
      customer: '/customer/dashboard',
      insurance: '/insurance/claims/active',
      garage: '/garage',
    };
    return <Navigate to={roleRoutes[user.role] || '/login'} replace />;
  }

  // ✅ ผ่านการตรวจสอบ → แสดง component
  return children;
};

export default ProtectedRoute;