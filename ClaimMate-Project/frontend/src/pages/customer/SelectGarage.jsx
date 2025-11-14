import React, { useState, useEffect, useMemo } from 'react';
import { Modal } from '../../components';
import { useParams, useNavigate } from 'react-router-dom'; // ⭐️ (1) เพิ่ม 2 ตัวนี้
import axios from 'axios'; // ⭐️ (2) เพิ่ม axios

/**
 * SelectGarage - หน้าเลือกอู่ซ่อม
 * 
 * Features:
 * 1. แสดงรายการอู่ทั้งหมด
 * 2. Filter ตามพื้นที่/ระยะทาง
 * 3. แสดงรายละเอียดอู่
 * 4. ยืนยันการเลือกอู่
 * 
 * TODO: Backend Integration
 * - GET /api/customer/garages?lat={lat}&lng={lng}&radius={radius} - ดึงรายการอู่
 * - GET /api/customer/garages/{id} - รายละเอียดอู่
 * - POST /api/customer/claims/{claimId}/select-garage - เลือกอู่
 */
const SelectGarage = () => {
  const [loading, setLoading] = useState(true);
  const [garages, setGarages] = useState([]);
  const [selectedGarage, setSelectedGarage] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const { claimId } = useParams();
  const navigate = useNavigate();

  // TODO: Backend - ดึงตำแหน่งปัจจุบันของ user
  // navigator.geolocation.getCurrentPosition()

  const fetchGarages = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('ไม่พบ Token');

      // ⭐️ (5) ยิง API ไปที่ Backend (Port 8000)
      const response = await axios.get(
        'http://localhost:3000/api/customers/garages',
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // ⭐️ (6) แปลงข้อมูล (map) ให้เข้ากับ format ที่ UI คาดหวัง
      const formattedGarages = response.data.map(garage => ({
        id: garage.id,
        name: garage.garageName, // ⭐️ Map 'garageName' to 'name'
        address: garage.address,
        photoUrl: garage.photoURL || `https://ui-avatars.com/api/?name=${garage.garageName}&background=random`, // ⭐️ ใช้รูป default ถ้าไม่มี
        googleMapsUrl: garage.googleMapsUrl || '#',
      }));
      
      setGarages(formattedGarages);

    } catch (err) {
      console.error('Error fetching garages:', err);
      setError(err.response?.data?.message || 'ไม่สามารถดึงข้อมูลอู่ได้');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGarages();
  }, []); // ⭐️ ( Dependency ว่าง หมายถึง "ทำงาน 1 ครั้งตอนโหลด")


  const handleConfirmSelection = async () => {
    if (!selectedGarage) return; // กันเหนียว

    setSubmitting(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('ไม่พบ Token กรุณาล็อกอินใหม่');
      }

      // ⭐️ (6) ยิง API ไปยัง Backend ที่เราสร้างไว้ (P13)
      await axios.post(
        `http://localhost:3000/api/customers/claims/${claimId}/select-garage`,
        { garageId: selectedGarage.id }, // ⭐️ (7) ส่ง ID ของอู่ที่เลือกไปใน body
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      // ⭐️ (8) ถ้าสำเร็จ: ปิด Modal และย้ายกลับไปหน้า Claim Detail
      setSubmitting(false);
      setShowConfirmModal(false);
      navigate(`/customer/claims/${claimId}`); // ⭐️ ย้ายกลับ

    } catch (err) {
      console.error('Error selecting garage:', err);
      // ⭐️ (9) แสดง Error ใน Modal
      setError(err.response?.data?.message || 'เกิดข้อผิดพลาดในการส่งคำขอ');
      setSubmitting(false);
    }
  };

  // Filter garages
const filteredGarages = useMemo(() => {
    if (!searchTerm) {
      return garages; // ถ้าไม่ค้นหา ก็แสดงทั้งหมด
    }
    return garages.filter(garage => 
      garage.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      garage.address.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [garages, searchTerm]);

  const handleSelectGarage = (garage) => {
    setSelectedGarage(garage);
    setShowConfirmModal(true);
  };

  const handleShowConfirmModal = (garage) => {
    setSelectedGarage(garage);
    setShowConfirmModal(true);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <span className="material-icons-round animate-spin text-6xl text-primary-500 mb-4">refresh</span>
          <p className="text-neutral-500">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  if (error && garages.length === 0) {
    return <div className="p-6 text-center text-error">เกิดข้อผิดพลาด: {error}</div>;
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-neutral-dark mb-2">
          เลือกอู่ซ่อม
        </h1>
        <p className="text-neutral-500">
          เลือกอู่ที่คุณต้องการนำรถไปซ่อม ({filteredGarages.length} อู่)
        </p>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <span className="material-icons-round absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400">
                search
              </span>
              <input
                type="text"
                placeholder="ค้นหาชื่ออู่, พื้นที่, บริการ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-12"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Garage List */}
      {filteredGarages.length === 0 ? (
        <div className="card text-center py-16">
          <span className="material-icons-round text-6xl text-neutral-300 mb-4">
            search_off
          </span>
          <p className="text-neutral-500 text-lg mb-2">
            ไม่พบอู่ที่ตรงกับเงื่อนไข
          </p>
          <p className="text-neutral-400 text-sm">
            ลองเปลี่ยนคำค้นหาหรือขยายระยะทาง
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredGarages.map(garage => (
            <div key={garage.id} className="card hover:shadow-card-hover transition-all duration-300">
              {/* Image */}
              <div className="relative h-48 -m-6 mb-4 rounded-t-card overflow-hidden">
                <img
                  src={garage.photoUrl}
                  alt={garage.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Content */}
              <div className="space-y-4">
                {/* Header */}
                <div>
                  <h3 className="text-lg font-semibold text-neutral-dark mb-2">
                    {garage.name}
                  </h3>
                </div>

                {/* Info */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2 text-neutral-600">
                    <span className="material-icons-round text-sm mt-0.5">location_on</span>
                    <span className="line-clamp-2">{garage.address}</span>
                  </div>
                </div>

                {/* ✅ Actions - แก้ไขตามข้อ 7C */}
                <div className="flex gap-2 pt-4 border-t border-neutral-200">
                  {/* ✅ ปุ่มดูแผนที่ - เปิด Google Maps */}
                  <a
                    href={garage.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-outline flex-1 flex items-center justify-center gap-2"
                  >
                    <span className="material-icons-round text-sm">map</span>
                    <span>ดูแผนที่</span>
                  </a>

                  {/* ✅ ปุ่มเลือกอู่ */}
                  <button
                    onClick={() => handleSelectGarage(garage)}
                    className="btn-primary flex-1 flex items-center justify-center gap-2"
                  >
                    <span className="material-icons-round text-sm">check_circle</span>
                    <span>เลือกอู่นี้</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirm Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="ยืนยันการเลือกอู่"
        size="md"
        footer={
          <>
            <button
              onClick={() => setShowConfirmModal(false)}
              className="btn-outline"
              disabled={submitting}
            >
              ยกเลิก
            </button>
            <button
              onClick={handleConfirmSelection}
              disabled={submitting}
              className="btn-primary"
            >
              {submitting ? 'กำลังส่งคำขอ...' : 'ยืนยัน'}
            </button>
          </>
        }
      >
        {selectedGarage && (
          <div className="space-y-4">
            <p className="text-neutral-700">
              คุณต้องการเลือกอู่นี้สำหรับการซ่อมรถของคุณใช่หรือไม่?
            </p>

            <div className="p-4 bg-neutral-50 rounded-lg space-y-3">
              <div>
                <p className="text-sm text-neutral-500">ชื่ออู่</p>
                <p className="font-semibold text-neutral-dark">{selectedGarage.name}</p>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm text-center">
                {error}
              </div>
            )}

            <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-info">
              <p className="text-sm text-neutral-700">
                <span className="material-icons-round text-sm mr-1 align-middle">info</span>
                หลังจากยืนยัน กรุณานำรถไปยังอู่ภายใน 3 วัน
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SelectGarage;