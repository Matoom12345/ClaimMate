import React, { useState, useEffect } from 'react';
import { Modal } from '../../components';

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
  const [filterDistance, setFilterDistance] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // TODO: Backend - ดึงตำแหน่งปัจจุบันของ user
  // navigator.geolocation.getCurrentPosition()
  const userLocation = { lat: 13.7563, lng: 100.5018 }; // Mock: Bangkok

  useEffect(() => {
    // TODO: Backend - ดึงรายการอู่
    // fetchGarages(userLocation);
    
    // Mock data
    setTimeout(() => {
      setGarages([
        {
          id: '1',
          name: 'อู่สมชาย ห้วยขวาง',
          address: '456 ถนนรัชดาภิเษก แขวงห้วยขวาง เขตห้วยขวาง กรุงเทพมหานคร 10310',
          phone: '02-123-4567',
          distance: 2.5,
          rating: 4.8,
          reviewCount: 256,
          services: ['ซ่อมตัวถัง', 'ทำสี', 'เปลี่ยนกระจก'],
          workingHours: 'จันทร์-ศุกร์ 8:00-18:00, เสาร์ 8:00-16:00',
          image: 'https://via.placeholder.com/400x300?text=Garage+1',
          certified: true,
          estimatedDays: 3,
          // ✅ เพิ่ม lat, lng สำหรับ Google Maps
          lat: 13.7645,
          lng: 100.5698,
        },
        {
          id: '2',
          name: 'อู่บางกอก สาทร',
          address: '789 ถนนสาทร แขวงยานนาวา เขตสาทร กรุงเทพมหานคร 10120',
          phone: '02-234-5678',
          distance: 5.8,
          rating: 4.6,
          reviewCount: 189,
          services: ['ซ่อมตัวถัง', 'ทำสี', 'ระบบไฟฟ้า'],
          workingHours: 'จันทร์-เสาร์ 8:00-18:00',
          image: 'https://via.placeholder.com/400x300?text=Garage+2',
          certified: true,
          estimatedDays: 4,
          lat: 13.7197,
          lng: 100.5256,
        },
        {
          id: '3',
          name: 'อู่กระจกใส ลาดพร้าว',
          address: '321 ถนนลาดพร้าว แขวงจันทรเกษม เขตจตุจักร กรุงเทพมหานคร 10900',
          phone: '02-345-6789',
          distance: 7.2,
          rating: 4.9,
          reviewCount: 412,
          services: ['เปลี่ยนกระจก', 'ฟิล์มกรองแสง', 'ซ่อมกระจก'],
          workingHours: 'ทุกวัน 8:00-19:00',
          image: 'https://via.placeholder.com/400x300?text=Garage+3',
          certified: true,
          estimatedDays: 1,
          lat: 13.7965,
          lng: 100.6057,
        },
        {
          id: '4',
          name: 'อู่มาสเตอร์ บางนา',
          address: '654 ถนนบางนา แขวงบางนา เขตบางนา กรุงเทพมหานคร 10260',
          phone: '02-456-7890',
          distance: 12.3,
          rating: 4.7,
          reviewCount: 298,
          services: ['ซ่อมตัวถัง', 'ทำสี', 'เปลี่ยนกระจก', 'ระบบไฟฟ้า'],
          workingHours: 'จันทร์-ศุกร์ 8:00-18:00',
          image: 'https://via.placeholder.com/400x300?text=Garage+4',
          certified: false,
          estimatedDays: 5,
          lat: 13.6676,
          lng: 100.6411,
        },
      ]);
      setLoading(false);
    }, 500);
  }, []);

  // Filter garages
  const filteredGarages = garages
    .filter(garage => {
      // Distance filter
      if (filterDistance !== 'all') {
        const maxDistance = parseInt(filterDistance);
        if (garage.distance > maxDistance) return false;
      }
      
      // Search filter
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        return (
          garage.name.toLowerCase().includes(term) ||
          garage.address.toLowerCase().includes(term) ||
          garage.services.some(s => s.toLowerCase().includes(term))
        );
      }
      
      return true;
    })
    .sort((a, b) => a.distance - b.distance);

  // TODO: Backend - เลือกอู่
  const handleSelectGarage = (garage) => {
    setSelectedGarage(garage);
    setShowConfirmModal(true);
  };

  const handleConfirmSelection = () => {
    // TODO: Backend - บันทึกการเลือกอู่
    // POST /api/customer/claims/{claimId}/select-garage
    console.log('Selected garage:', selectedGarage.id);
    setShowConfirmModal(false);
    
    // แสดง success message และ redirect
    // navigate('/customer/claims');
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

          {/* Distance Filter */}
          <select
            value={filterDistance}
            onChange={(e) => setFilterDistance(e.target.value)}
            className="input-field md:w-56"
          >
            <option value="all">ระยะทางทั้งหมด</option>
            <option value="5">ไม่เกิน 5 km</option>
            <option value="10">ไม่เกิน 10 km</option>
            <option value="20">ไม่เกิน 20 km</option>
          </select>
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
                  src={garage.image}
                  alt={garage.name}
                  className="w-full h-full object-cover"
                />
                {garage.certified && (
                  <div className="absolute top-3 right-3 badge badge-success flex items-center gap-1">
                    <span className="material-icons-round text-sm">verified</span>
                    <span>อู่รับรอง</span>
                  </div>
                )}
                <div className="absolute bottom-3 left-3 badge badge-primary">
                  <span className="material-icons-round text-sm mr-1">location_on</span>
                  {garage.distance} km
                </div>
              </div>

              {/* Content */}
              <div className="space-y-4">
                {/* Header */}
                <div>
                  <h3 className="text-lg font-semibold text-neutral-dark mb-2">
                    {garage.name}
                  </h3>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="flex items-center gap-1 text-warning">
                      <span className="material-icons-round text-sm">star</span>
                      <span className="font-semibold">{garage.rating}</span>
                    </div>
                    <span className="text-neutral-400">
                      ({garage.reviewCount} รีวิว)
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2 text-neutral-600">
                    <span className="material-icons-round text-sm mt-0.5">location_on</span>
                    <span className="line-clamp-2">{garage.address}</span>
                  </div>
                  <div className="flex items-center gap-2 text-neutral-600">
                    <span className="material-icons-round text-sm">phone</span>
                    <a href={`tel:${garage.phone}`} className="hover:text-primary-600">
                      {garage.phone}
                    </a>
                  </div>
                  <div className="flex items-center gap-2 text-neutral-600">
                    <span className="material-icons-round text-sm">schedule</span>
                    <span>{garage.workingHours}</span>
                  </div>
                  <div className="flex items-center gap-2 text-neutral-600">
                    <span className="material-icons-round text-sm">timer</span>
                    <span>ประมาณ {garage.estimatedDays} วันทำการ</span>
                  </div>
                </div>

                {/* Services */}
                <div>
                  <p className="text-xs text-neutral-500 mb-2">บริการ</p>
                  <div className="flex flex-wrap gap-2">
                    {garage.services.map((service, idx) => (
                      <span key={idx} className="badge badge-neutral text-xs">
                        {service}
                      </span>
                    ))}
                  </div>
                </div>

                {/* ✅ Actions - แก้ไขตามข้อ 7C */}
                <div className="flex gap-2 pt-4 border-t border-neutral-200">
                  {/* ✅ ปุ่มดูแผนที่ - เปิด Google Maps */}
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${garage.lat},${garage.lng}`}
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
            >
              ยกเลิก
            </button>
            <button
              onClick={handleConfirmSelection}
              className="btn-primary"
            >
              ยืนยัน
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
              <div>
                <p className="text-sm text-neutral-500">ระยะทาง</p>
                <p className="font-medium text-neutral-dark">{selectedGarage.distance} km</p>
              </div>
              <div>
                <p className="text-sm text-neutral-500">ระยะเวลาประมาณ</p>
                <p className="font-medium text-neutral-dark">{selectedGarage.estimatedDays} วันทำการ</p>
              </div>
            </div>

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