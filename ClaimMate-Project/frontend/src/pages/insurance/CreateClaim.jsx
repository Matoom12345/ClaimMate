import React, { useState, useEffect } from 'react';

import axios from "axios";
import { useNavigate } from 'react-router-dom';
import { Input, TextArea } from '../../components';

const CreateClaim = () => {
  const navigate = useNavigate();
  const [searchingCustomer, setSearchingCustomer] = useState(false);
  const [customerFound, setCustomerFound] = useState(null);
  const [formData, setFormData] = useState({
    idCard: '',
    incidentDate: '',
    incidentTime: '',
    location: '',
    description: '',
    priority: 'normal',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [newClaimId, setNewClaimId] = useState(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState(null); // 🚗 เก็บ carID ของรถที่เลือก

  const priorityOptions = [
    { value: 'urgent', label: 'ด่วนมาก', icon: 'priority_high' },
    { value: 'high', label: 'ด่วน', icon: 'arrow_upward' },
    { value: 'normal', label: 'ปกติ', icon: 'remove' },
  ];

  useEffect(() => {
    if (customerFound?.vehicles?.length > 0) {
      // หารถที่เป็น primary
      const primaryVehicle = customerFound.vehicles.find(v => v.isPrimary);

      if (primaryVehicle) {
        // ถ้ามีรถหลัก ให้เลือกอัตโนมัติ
        setSelectedVehicleId(primaryVehicle.carID);
      } else {
        // ถ้าไม่มีรถหลัก ให้เลือกรถคันแรก
        setSelectedVehicleId(customerFound.vehicles[0].carID);
      }
    }
  }, [customerFound?.vehicles]);

  // ✅ Search Customer
  const handleSearchCustomer = async () => {
    const cleanIdCard = formData.idCard.replace(/-/g, "");

    if (!cleanIdCard || cleanIdCard.length !== 13) {
      setErrors({ idCard: "กรุณากรอกเลขบัตรประชาชน 13 หลัก" });
      return;
    }

    setSearchingCustomer(true);
    setErrors({});
    setSelectedVehicleId(null); // รีเซ็ตรถที่เลือก

    try {
      const res = await axios.get(
        `http://localhost:3000/api/users/by-idcard/${cleanIdCard}`
      );

      const user = res.data.user;

      // ✅ ใส่ vehicles เป็น array เพื่อกัน undefined
      setCustomerFound({ ...user, vehicles: [] });

      // ✅ ดึงรถของลูกค้า
      const carRes = await axios.get(
        `http://localhost:3000/api/cars/by-customer/${user.customerID}`
      );

      setCustomerFound(prev => ({
        ...prev,
        vehicles: carRes.data.cars || []
      }));

    } catch (err) {
      setCustomerFound(null);
      setErrors({ idCard: "ไม่พบข้อมูลลูกค้า" });
    }

    setSearchingCustomer(false);
  };

  // ✅ Quick Search
  const handleQuickSearch = async (idCard) => {
    setFormData(prev => ({ ...prev, idCard }));
    setErrors({});
    setSearchingCustomer(true);
    setSelectedVehicleId(null); // รีเซ็ตรถที่เลือก

    try {
      const res = await axios.get(
        `http://localhost:3000/api/users/by-idcard/${idCard}`
      );

      const user = res.data.user;
      setCustomerFound({ ...user, vehicles: [] });

      const carRes = await axios.get(
        `http://localhost:3000/api/cars/by-customer/${user.customerID}`
      );

      setCustomerFound(prev => ({
        ...prev,
        vehicles: carRes.data.cars || []
      }));

    } catch {
      setCustomerFound(null);
      setErrors({ idCard: "ไม่พบข้อมูลลูกค้า" });
    }

    setSearchingCustomer(false);
  };

  // 🚗 Handle Select Vehicle
  const handleSelectVehicle = (carID) => {
    setSelectedVehicleId(carID);
    // ลบ error ถ้ามี
    if (errors.vehicle) {
      setErrors(prev => ({ ...prev, vehicle: '' }));
    }
  };

  // ✅ form change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleClearCustomer = () => {
    setCustomerFound(null);
    setFormData(prev => ({ ...prev, idCard: '' }));
    setSelectedVehicleId(null); // รีเซ็ตรถที่เลือก
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !customerFound) {
      e.preventDefault();
      handleSearchCustomer();
    }
  };

  // ✅ Validate form
  const validate = () => {
    const newErrors = {};

    if (!customerFound) {
      newErrors.idCard = 'กรุณาค้นหาข้อมูลลูกค้าก่อน';
    }
    // 🚗 Validate รถที่เลือก
    if (customerFound && !selectedVehicleId) {
      newErrors.vehicle = 'กรุณาเลือกรถยนต์ที่ต้องการเคลม';
    }

    if (!formData.incidentDate) {
      newErrors.incidentDate = 'กรุณาเลือกวันที่เกิดเหตุ';
    }
    if (!formData.location || formData.location.trim().length < 10) {
      newErrors.location = 'กรุณากรอกสถานที่เกิดเหตุ (อย่างน้อย 10 ตัวอักษร)';
    }
    if (!formData.description || formData.description.trim().length < 20) {
      newErrors.description = 'กรุณาอธิบายเหตุการณ์ (อย่างน้อย 20 ตัวอักษร)';
    }

    return newErrors;
  };

  // ✅ Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        customerID: customerFound.customerID,
        insuranceID: customerFound.insuranceID,
        // carID: customerFound?.vehicles?.find(v => v.isPrimary)?.carID || null,
        carID: selectedVehicleId, // ใช้รถที่เลือก
        title: "อุบัติเหตุจากลูกค้า",
        location: formData.location,
        detail: formData.description,
        priorityLevel: formData.priority,
        incidentDate: `${formData.incidentDate} ${formData.incidentTime}`,
        reportedDate: new Date().toISOString().slice(0, 16).replace("T", " ")
      };

      const res = await axios.post("http://localhost:3000/api/claims", payload);

      setNewClaimId(res.data.claim.claimNumber);
      setShowSuccessModal(true);

    } catch (err) {
      console.error("Create claim error:", err);
      alert("เกิดข้อผิดพลาด" + (err.response?.data?.message || err.message));
    }

    setSubmitting(false);
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    navigate('/insurance/claims/active');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-neutral-500 hover:text-primary-500 mb-3"
        >
          <span className="material-icons-round">arrow_back</span>
          <span>กลับ</span>
        </button>
        <h1 className="text-3xl font-bold text-neutral-dark mb-2">
          เปิดเคสเคลมใหม่
        </h1>
        <p className="text-neutral-500">
          ค้นหาลูกค้าจากเลขบัตรประชาชน และกรอกข้อมูลเหตุการณ์
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left side */}
        <div className="lg:col-span-2 space-y-6">

          {/* ✅ Customer Search */}
          <div className="card-static">
            <h2 className="text-xl font-semibold text-neutral-dark mb-4 flex items-center gap-2">
              <span className="material-icons-round text-primary-500">search</span>
              <span>ค้นหาข้อมูลลูกค้า</span>
            </h2>

            {!customerFound ? (
              <>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <Input
                      label="เลขบัตรประชาชน"
                      name="idCard"
                      value={formData.idCard}
                      onChange={handleChange}
                      onKeyPress={handleKeyPress}
                      placeholder="x-xxxx-xxxxx-xx-x"
                      icon="badge"
                      required
                      error={errors.idCard}
                      maxLength="13"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleSearchCustomer}
                    className="btn-primary mt-7 flex items-center gap-2"
                    disabled={searchingCustomer}
                  >
                    {searchingCustomer ? (
                      <>
                        <span className="material-icons-round animate-spin">refresh</span>
                        <span>กำลังค้นหา...</span>
                      </>
                    ) : (
                      <>
                        <span className="material-icons-round">search</span>
                        <span>ค้นหา</span>
                      </>
                    )}
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* ✅ Customer Info */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center">
                      <span className="material-icons-round text-2xl text-success">check_circle</span>
                    </div>
                    <div>
                      <p className="text-sm text-success font-medium">พบข้อมูลลูกค้า</p>
                      <p className="text-xs text-neutral-500">{customerFound.idCard}</p>
                    </div>
                  </div>
                  <button type="button" onClick={handleClearCustomer} className="btn-ghost btn-sm">
                    <span className="material-icons-round text-sm">close</span>
                    <span>ค้นหาใหม่</span>
                  </button>
                </div>

                {/* ✅ Customer Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-neutral-50 rounded-lg mb-4">
                  <div>
                    <p className="text-xs text-neutral-500 mb-1">ชื่อ-นามสกุล</p>
                    <p className="font-semibold">{customerFound.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500 mb-1">เบอร์โทร</p>
                    <p className="font-semibold">{customerFound.phone}</p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500 mb-1">อีเมล</p>
                    <p className="font-semibold">{customerFound.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500 mb-1">เลขกรมธรรม์</p>
                    <p className="font-semibold text-primary-600">{customerFound.policyNumber || "-"}</p>
                  </div>
                </div>

                {/* ✅ Car List */}
                {/* 🚗 Car List - เพิ่มระบบเลือกรถ */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-medium text-neutral-700">
                      รถยนต์ที่ทำประกัน
                    </p>
                    {selectedVehicleId && (
                      <span className="text-xs text-secondary-600 flex items-center gap-1">
                        <span className="material-icons-round text-sm">check_circle</span>
                        เลือกแล้ว
                      </span>
                    )}
                  </div>

                  {/* แสดง Error ถ้ายังไม่เลือกรถ */}
                  {errors.vehicle && (
                    <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-sm text-error animate-slide-down">
                      <span className="material-icons-round text-lg">error</span>
                      <span>{errors.vehicle}</span>
                    </div>
                  )}
                  <div className="space-y-2">
                    {(customerFound?.vehicles || []).length === 0 ? (
                      <div className="p-6 text-center border-2 border-dashed border-neutral-200 rounded-lg">
                        <span className="material-icons-round text-neutral-300 text-4xl mb-2">no_crash</span>
                        <p className="text-neutral-500">ไม่พบรถยนต์ที่ทำประกัน</p>
                      </div>
                    ) : (
                      (customerFound?.vehicles || []).map(vehicle => {
                        const isSelected = selectedVehicleId === vehicle.carID;

                        return (
                          <button
                            type="button"
                            key={vehicle.carID || vehicle._id}
                            onClick={() => handleSelectVehicle(vehicle.carID)}
                            className={`
                                  w-full p-4 border-2 rounded-lg transition-all duration-300 text-left
                                  ${isSelected
                                ? 'border-primary-500 bg-primary-50 shadow-md scale-[1.02]'
                                : 'border-neutral-200 hover:border-primary-300 hover:bg-neutral-50'
                              }
                                `}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3 flex-1">
                                {/* Car Icon */}
                                <div className={`
                                      w-10 h-10 rounded-lg flex items-center justify-center transition-colors
                                      ${isSelected ? 'bg-primary-100' : 'bg-neutral-100'}
                                    `}>
                                  <span className={`material-icons-round ${isSelected ? 'text-primary-600' : 'text-neutral-400'
                                    }`}>
                                    directions_car
                                  </span>
                                </div>

                                {/* Car Details */}
                                <div className="flex-1">
                                  <p className={`font-medium ${isSelected ? 'text-primary-700' : 'text-neutral-dark'
                                    }`}>
                                    {vehicle.brand} {vehicle.model} ({vehicle.year})
                                  </p>
                                  <p className={`text-sm ${isSelected ? 'text-primary-600' : 'text-neutral-500'
                                    }`}>
                                    ทะเบียน: {vehicle.licensePlate} • สี: {vehicle.color}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                {/* Primary Badge */}
                                {vehicle.isPrimary && (
                                  <span className="badge badge-secondary text-xs">หลัก</span>
                                )}

                                {/* Selected Checkmark */}
                                {isSelected && (
                                  <span className="material-icons-round text-primary-500 text-2xl animate-scale-in">
                                    check_circle
                                  </span>
                                )}
                              </div>
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              </>
            )}
          </div>


          {/* ✅ Incident Information */}
          {customerFound && (
            <div className="card-static">
              <h2 className="text-xl font-semibold text-neutral-dark mb-4 flex items-center gap-2">
                <span className="material-icons-round text-primary-500">event_note</span>
                <span>ข้อมูลเหตุการณ์</span>
              </h2>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="วันที่เกิดเหตุ"
                    name="incidentDate"
                    type="date"
                    value={formData.incidentDate}
                    onChange={handleChange}
                    icon="calendar_today"
                    required
                    error={errors.incidentDate}
                  />

                  <Input
                    label="เวลาที่เกิดเหตุ (ประมาณ)"
                    name="incidentTime"
                    type="time"
                    value={formData.incidentTime}
                    onChange={handleChange}
                    icon="schedule"
                  />
                </div>

                <Input
                  label="สถานที่เกิดเหตุ"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="123 ถนนประชาราษฎร์ แขวงห้วยขวาง..."
                  icon="location_on"
                  required
                  error={errors.location}
                />

                <TextArea
                  label="รายละเอียดเหตุการณ์"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="อธิบายเหตุการณ์ เช่น ชนด้านหน้าจากรถที่วิ่งสวนทาง..."
                  rows={6}
                  required
                  error={errors.description}
                />
              </div>
            </div>
          )}
        </div>

        {/* ✅ Right Sidebar */}
        <div className="space-y-6">
          {customerFound && (
            <div className="card-static">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <span className="material-icons-round text-primary-500">flag</span>
                <span>ระดับความเร่งด่วน</span>
              </h3>

              <div className="space-y-2">
                {priorityOptions.map(option => (
                  <label
                    key={option.value}
                    className={`
                      flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all
                      ${formData.priority === option.value
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-neutral-200 hover:border-primary-300'}
                    `}
                  >
                    <input
                      type="radio"
                      name="priority"
                      value={option.value}
                      checked={formData.priority === option.value}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <span className={`material-icons-round ${formData.priority === option.value ? 'text-primary-600' : 'text-neutral-400'
                      }`}>
                      {option.icon}
                    </span>
                    <span className={`flex-1 font-medium text-sm ${formData.priority === option.value ? 'text-primary-700' : 'text-neutral-700'
                      }`}>
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Info box */}
          <div className="card bg-gradient-primary text-white">
            <span className="material-icons-round text-4xl mb-3">info</span>
            <h3 className="font-semibold mb-2">ขั้นตอนการเคลม</h3>
            <ol className="text-sm text-white/80 space-y-2 list-decimal list-inside">
              <li>ค้นหาข้อมูลลูกค้า</li>
              <li>กรอกข้อมูลเหตุการณ์</li>
              <li>เปิดเคส</li>
              <li>พนักงานลงพื้นที่ตรวจสอบ</li>
              <li>อัปโหลดรายงาน</li>
            </ol>
          </div>

          {customerFound && (
            <div className="space-y-3">
              <button
                type="submit"
                className="btn-primary w-full"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <span className="material-icons-round animate-spin mr-2">refresh</span>
                    กำลังสร้างเคส...
                  </>
                ) : (
                  <>
                    <span className="material-icons-round mr-2">check_circle</span>
                    เปิดเคส
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => navigate(-1)}
                className="btn-outline w-full"
                disabled={submitting}
              >
                ยกเลิก
              </button>
            </div>
          )}
        </div>
      </form>

      {/* ✅ Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <div className="text-center">
              <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-icons-round text-5xl text-success">
                  check_circle
                </span>
              </div>

              <h2 className="text-2xl font-bold mb-2">เปิดเคสสำเร็จ!</h2>

              <p className="text-neutral-600 mb-1">เลขที่เคลม</p>
              <p className="text-2xl font-bold text-primary-600 mb-6">
                {newClaimId}
              </p>

              <button onClick={handleCloseSuccessModal} className="btn-primary w-full">
                เข้าใจแล้ว
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateClaim;