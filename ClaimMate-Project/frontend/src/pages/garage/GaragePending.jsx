// นำเข้า components ที่ใช้
import React, { useState, useEffect } from 'react';
import axios from 'axios'; // (มีอยู่แล้ว)
import { Link } from 'react-router-dom'; // (มีอยู่แล้ว)
import { Card, CardHeader, CardTitle, CardBody, Badge, Button, Modal, Loading } from '../../components'; // (เพิ่ม Loading ถ้ามี)
import { format } from 'date-fns'; // (มีอยู่แล้ว)

// (1) ลบ mockData ทั้งหมดทิ้งไป
// const mockData = [ ... ];

const GaragePending = () => {
  // (2) แก้ไข State เริ่มต้น
  const [claims, setClaims] = useState([]); // <-- แก้ไข: เริ่มต้นด้วย Array ว่าง
  const [loading, setLoading] = useState(true); // <-- แก้ไข: เริ่มต้นด้วย true
  const [error, setError] = useState(null); // (มีอยู่แล้ว)
  const [showAcceptModal, setShowAcceptModal] = useState(false); // (มีอยู่แล้ว)
  const [showRejectModal, setShowRejectModal] = useState(false); // (มีอยู่แล้ว)
  const [selectedClaim, setSelectedClaim] = useState(null); // (มีอยู่แล้ว)
  const [submitting, setSubmitting] = useState(false); // <-- (3) เพิ่ม state นี้ ไว้ล็อคปุ่มใน Modal

  // (4) สร้างฟังก์ชันสำหรับดึงข้อมูล (Fetch Data)
  const fetchPendingJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('ไม่พบ Token, กรุณาล็อกอินใหม่');
      }

      // **สำคัญ**: แก้ Port เป็น 3000 (ตามไฟล์ backend/server.js ของคุณ)
      const response = await axios.get(
        'http://localhost:3000/api/garages/pending-requests', // <-- แก้ไข Port
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setClaims(response.data); // <-- API จะคืนค่า Array ของ ChooseGarageRequest
    } catch (err) {
      console.error('เกิดข้อผิดพลาดในการดึงข้อมูล:', err);
      setError(err.response?.data?.message || err.message || 'ไม่สามารถดึงข้อมูลได้');
    } finally {
      setLoading(false);
    }
  };

  // (5) แก้ไข useEffect ให้เรียกฟังก์ชันดึงข้อมูล
  useEffect(() => {
    fetchPendingJobs();
  }, []); // [] ทำงานครั้งเดียว

  // (6) แก้ไขฟังก์ชัน "รับงาน" (handleAcceptClaim)
  const handleAcceptClaim = async () => {
    if (!selectedClaim) return;

    setSubmitting(true); // ล็อคปุ่ม
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('ไม่พบ Token');

      // ยิง API ไปที่ Backend (ที่เราสร้างในส่วนที่ 1)
      // selectedClaim.id คือ ID ของ ChooseGarageRequest
      await axios.post(
        `http://localhost:3000/api/garages/requests/${selectedClaim.id}/accept`,
        {}, // body ว่าง
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // สำเร็จ: เอารายการนี้ออกจาก state (เพื่อให้ UI อัปเดตทันที)
      setClaims((prevJobs) =>
        prevJobs.filter((job) => job.id !== selectedClaim.id)
      );
      setShowAcceptModal(false); // ปิด Modal
      setSelectedClaim(null);

    } catch (err) {
      console.error('Error accepting job:', err);
      setError(err.response?.data?.message || 'เกิดข้อผิดพลาดในการรับงาน');
      // (อาจจะแสดง Error ใน Modal)
    } finally {
      setSubmitting(false); // ปลดล็อคปุ่ม
    }
  };

  // (7) แก้ไขฟังก์ชัน "ปฏิเสธงาน" (handleRejectClaim)
  const handleRejectClaim = async () => {
    if (!selectedClaim) return;

    setSubmitting(true); // ล็อคปุ่ม
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('ไม่พบ Token');

      // ยิง API ไปที่ Backend (ที่เราสร้างในส่วนที่ 1)
      await axios.post(
        `http://localhost:3000/api/garages/requests/${selectedClaim.id}/reject`,
        {}, // body ว่าง
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // สำเร็จ: เอารายการนี้ออกจาก state
      setClaims((prevJobs) =>
        prevJobs.filter((job) => job.id !== selectedClaim.id)
      );
      setShowRejectModal(false); // ปิด Modal
      setSelectedClaim(null);

    } catch (err) {
      console.error('Error rejecting job:', err);
      setError(err.response?.data?.message || 'เกิดข้อผิดพลาดในการปฏิเสธงาน');
    } finally {
      setSubmitting(false); // ปลดล็อคปุ่ม
    }
  };

  // (ส่วน Modal Handlers (handleShow...Modal) ใช้โค้ดเดิมของคุณได้เลย)
  const handleShowAcceptModal = (claim) => {
    setSelectedClaim(claim); // 'claim' ที่ได้จาก .map() คือ 'job'
    setShowAcceptModal(true);
  };

  const handleShowRejectModal = (claim) => {
    setSelectedClaim(claim); // 'claim' ที่ได้จาก .map() คือ 'job'
    setShowRejectModal(true);
  };

  // === (8) แก้ไขส่วน JSX ===

  // ส่วนแสดงผลตอน Loading
  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6 text-insurance-blue">
          รายการงานที่รอดำเนินการ
        </h1>
        {/* ใช้ Component Loading ของคุณ หรือแสดงข้อความ */}
        {/* <Loading /> */}
        <Card className="text-center"><p>กำลังโหลด...</p></Card>
      </div>
    );
  }
  
  // ส่วนแสดงผลตอน Error (ถ้าดึงข้อมูลไม่สำเร็จเลย)
  if (error && claims.length === 0) {
     return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6 text-insurance-blue">
          รายการงานที่รอดำเนินการ
        </h1>
        <Card className="text-center bg-red-50 border-red-200">
          <p className="text-red-600 font-semibold">เกิดข้อผิดพลาด:</p>
          <p className="text-red-500">{error}</p>
          <Button onClick={fetchPendingJobs} className="mt-4">
            ลองใหม่อีกครั้ง
          </Button>
        </Card>
      </div>
     )
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-insurance-blue">
        รายการงานที่รอดำเนินการ
      </h1>

      {/* (แสดง Error ถ้าเกิดตอนกดปุ่ม) */}
      {error && submitting && (
         <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {/* (9) ตรวจสอบ claims.length */}
      {claims.length === 0 ? (
        <Card className="text-center">
          <p className="text-gray-500">ยังไม่มีงานที่รอดำเนินการในขณะนี้</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* (10) แก้ไขตัวแปรใน .map() ให้ตรงกับ API Response */}
          {claims.map((job) => ( // 'job' คือ ChooseGarageRequest
            <Card key={job.id} className="shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
              <CardHeader className="flex justify-between items-center">
                <CardTitle>
                  {/* เราต้องเจาะลึกไปที่ job.Claim.Car */}
                  {job.Claim?.Car?.brand} {job.Claim?.Car?.model}
                </CardTitle>
                <Badge color="yellow">รอดำเนินการ</Badge>
              </CardHeader>
              <CardBody className="flex-grow">
                {/* ใช้ Optional Chaining (?) ป้องกัน error ถ้าข้อมูลไม่มี */}
                <p>
                  <strong>เลขทะเบียน:</strong> {job.Claim?.Car?.licensePlate || 'N/A'}
                </p>
                <p>
                  <strong>ลูกค้า:</strong> {job.Claim?.Customer?.User?.firstName || ''}{' '}
                  {job.Claim?.Customer?.User?.lastName || 'N/A'}
                </p>
                <p>
                  <strong>วันที่แจ้งเรื่อง:</strong>{' '}
                  {job.createdAt
                    ? format(new Date(job.createdAt), 'dd/MM/yyyy HH:mm')
                    : 'N/A'}
                </p>
              </CardBody>
              <div className="p-4 border-t border-neutral-100 flex flex-col sm:flex-row gap-2">
                <Button
                  variant="primary"
                  fullWidth
                  icon="check"
                  onClick={() => handleShowAcceptModal(job)} // <-- ส่ง 'job' ทั้งก้อน
                  className="flex-1"
                >
                  รับงาน
                </Button>
                <Button
                  variant="danger"
                  fullWidth
                  icon="cancel"
                  onClick={() => handleShowRejectModal(job)} // <-- ส่ง 'job' ทั้งก้อน
                  className="flex-1 bg-error"
                >
                  ปฏิเสธ
                </Button>
                <Link
                  to={`/garage/pending/${job.id}`} // <-- (11) ID นี้คือ ChooseGarageRequest ID
                  className="flex-1"
                >
                  <Button variant="outline" fullWidth>
                    ดูรายละเอียด
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* (12) แก้ไข Modal ให้แสดงข้อมูลจาก API และล็อคปุ่ม */}
      {/* Accept Modal */}
      <Modal
        isOpen={showAcceptModal}
        onClose={() => setShowAcceptModal(false)}
        title="ยืนยันการรับงาน"
        size="md"
      >
        {selectedClaim && (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-neutral-700">
                <span className="font-semibold">เคส:</span> {selectedClaim.Claim?.id}
              </p>
              <p className="text-sm text-neutral-700">
                <span className="font-semibold">รถยนต์:</span> {selectedClaim.Claim?.Car?.brand} {selectedClaim.Claim?.Car?.model} ({selectedClaim.Claim?.Car?.plateNumber})
              </p>
              <p className="text-sm text-neutral-700">
                <span className="font-semibold">ลูกค้า:</span> {selectedClaim.Claim?.Customer?.User?.firstName} {selectedClaim.Claim?.Customer?.User?.lastName}
              </p>
            </div>
            
            {/* แสดง Error ถ้าเกิดตอนกดปุ่ม */}
            {error && !submitting && (
              <p className="text-sm text-red-600">{error}</p>
            )}

            <p className="text-neutral-600">
              คุณต้องการยืนยันรับงานซ่อมนี้หรือไม่?
              <br />
              สถานะของลูกค้าจะอัปเดตเป็น "กำลังซ่อม"
            </p>
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                fullWidth
                onClick={() => setShowAcceptModal(false)}
                disabled={submitting} // ล็อคปุ่ม
              >
                ยกเลิก
              </Button>
              <Button
                variant="primary"
                fullWidth
                icon="check"
                onClick={handleAcceptClaim}
                disabled={submitting} // ล็อคปุ่ม
              >
                {submitting ? 'กำลังยืนยัน...' : 'ยืนยันรับงาน'}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Reject Modal */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        title="ปฏิเสธงาน"
        size="md"
      >
        {selectedClaim && (
          <div className="space-y-4">
            <div className="p-4 bg-red-50 rounded-lg">
              <p className="text-sm text-neutral-700">
                 <span className="font-semibold">เคส:</span> {selectedClaim.Claim?.id}
              </p>
               <p className="text-sm text-neutral-700">
                <span className="font-semibold">รถยนต์:</span> {selectedClaim.Claim?.Car?.brand} {selectedClaim.Claim?.Car?.model}
              </p>
            </div>

            {/* แสดง Error ถ้าเกิดตอนกดปุ่ม */}
            {error && !submitting && (
              <p className="text-sm text-red-600">{error}</p>
            )}

            <p className="text-neutral-600">
              คุณต้องการปฏิเสธงานซ่อมนี้ใช่หรือไม่?
              <br />
              ลูกค้าจะได้รับการแจ้งเตือนและสามารถเลือกอู่อื่นได้
            </p>
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                fullWidth
                onClick={() => setShowRejectModal(false)}
                disabled={submitting} // ล็อคปุ่ม
              >
                ยกเลิก
              </Button>
              <Button
                variant="primary"
                fullWidth
                icon="cancel"
                onClick={handleRejectClaim}
                disabled={submitting} // ล็อคปุ่ม
                className="bg-error hover:bg-red-600"
              >
                {submitting ? 'กำลังปฏิเสธ...' : 'ยืนยันปฏิเสธ'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default GaragePending;