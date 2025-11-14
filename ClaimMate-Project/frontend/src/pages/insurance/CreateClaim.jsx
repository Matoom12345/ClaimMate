import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Input, TextArea } from "../../components";
import PolicyReviewStep from "./PolicyReviewStep"; // ✅ เพิ่ม


const CreateClaim = () => {
  const navigate = useNavigate();

  // ✅ USER LOGIN
  const [currentUser, setCurrentUser] = useState(null);

  // ✅ CUSTOMER STATE
  const [customerFound, setCustomerFound] = useState(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState(null);

  // ✅ FORM STATE
  const [formData, setFormData] = useState({
    idCard: "",
    incidentDate: "",
    incidentTime: "",
    location: "",
    description: "",
    priority: "normal",
  });

  // ✅ UI STATE
  const [searchingCustomer, setSearchingCustomer] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [newClaimId, setNewClaimId] = useState(null);
  const [currentStep, setCurrentStep] = useState(1); // ✅ 1: search, 2: review, 3: form


  const priorityOptions = [
    { value: "urgent", label: "ด่วนมาก", icon: "priority_high" },
    { value: "high", label: "ด่วน", icon: "arrow_upward" },
    { value: "normal", label: "ปกติ", icon: "remove" },
  ];

  /* ────────────────────────────────────────────────
     ✅ LOAD CURRENT USER
  ─────────────────────────────────────────────────*/
  useEffect(() => {
    const stored = localStorage.getItem("claimmate_user");
    if (stored) {
      setCurrentUser(JSON.parse(stored));
    }
  }, []);

  /* ────────────────────────────────────────────────
     ✅ AUTO-SELECT VEHICLE WHEN CUSTOMER LOADED
  ─────────────────────────────────────────────────*/
  useEffect(() => {
    if (customerFound?.vehicles?.length > 0) {
      const primary = customerFound.vehicles.find((v) => v.isPrimary);
      setSelectedVehicleId(primary ? primary.carID : customerFound.vehicles[0].carID);
    }
  }, [customerFound?.vehicles]);

  /* ────────────────────────────────────────────────
     ✅ SEARCH CUSTOMER BY ID CARD
  ─────────────────────────────────────────────────*/
  const handleSearchCustomer = async () => {
    const cleanIdCard = formData.idCard.replace(/-/g, "");

    if (!cleanIdCard || cleanIdCard.length !== 13) {
      return setErrors({ idCard: "กรุณากรอกเลขบัตรประชาชน 13 หลัก" });
    }

    setSearchingCustomer(true);
    setErrors({});
    setSelectedVehicleId(null);

    try {
      const res = await axios.get(
          `http://localhost:3000/api/customers/search/by-idcard/${cleanIdCard}`
      );
      const customerData = res.data.user;

      setCustomerFound({
        ...customerData,
        vehicles: customerData.vehicles || [],
      });

      setCurrentStep(2);

    } catch (err) {
      setCustomerFound(null);
      setErrors({ idCard: err.response?.data?.message || "ไม่พบข้อมูลลูกค้า" });
    }

    setSearchingCustomer(false);
  };

  /* ────────────────────────────────────────────────
     ✅ HANDLE CHANGE
  ─────────────────────────────────────────────────*/
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSelectVehicle = (carID) => {
    setSelectedVehicleId(carID);
    if (errors.vehicle) {
      setErrors((prev) => ({ ...prev, vehicle: "" }));
    }
  };

  const handleClearCustomer = () => {
    setCustomerFound(null);
    setFormData((prev) => ({ ...prev, idCard: "" }));
    setSelectedVehicleId(null);
  };

  /* ────────────────────────────────────────────────
   ✅ POLICY REVIEW HANDLERS
─────────────────────────────────────────────────*/
  const handleProceedFromReview = () => {
    setCurrentStep(3); // ไปหน้ากรอกข้อมูลเหตุการณ์
  };

  const handleCancelFromReview = () => {
    setCurrentStep(1);
    setCustomerFound(null);
    setSelectedVehicleId(null);
    setFormData({
      idCard: "",
      incidentDate: "",
      incidentTime: "",
      location: "",
      description: "",
      priority: "normal",
    });
  };

  /* ────────────────────────────────────────────────
     ✅ VALIDATION
  ─────────────────────────────────────────────────*/
  const validate = () => {
    const newErrors = {};

    if (!customerFound) newErrors.idCard = "กรุณาค้นหาข้อมูลลูกค้าก่อน";
    if (customerFound && !selectedVehicleId)
      newErrors.vehicle = "กรุณาเลือกรถยนต์ที่ต้องการเคลม";
    if (!formData.incidentDate)
      newErrors.incidentDate = "กรุณาเลือกวันที่เกิดเหตุ";
    if (!formData.location || formData.location.trim().length < 10)
      newErrors.location = "กรุณากรอกสถานที่เกิดเหตุ (อย่างน้อย 10 ตัวอักษร)";
    if (!formData.description || formData.description.trim().length < 20)
      newErrors.description =
          "กรุณาอธิบายเหตุการณ์ (อย่างน้อย 20 ตัวอักษร)";

    return newErrors;
  };

  /* ────────────────────────────────────────────────
     ✅ SUBMIT FORM → API
  ─────────────────────────────────────────────────*/
  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      return setErrors(newErrors);
    }

    if (!currentUser) {
      alert("เกิดข้อผิดพลาด: ไม่มีข้อมูลผู้ใช้งาน (insurance)");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        customerID: customerFound.customerID,
        insuranceID: currentUser.insuranceID,
        carID: selectedVehicleId,
        location: formData.location,
        detail: formData.description,
        priorityLevel: formData.priority,
        incidentDate: `${formData.incidentDate} ${formData.incidentTime || "00:00"}`,
      };

      console.log("✅ PAYLOAD SENT =", payload);

      const res = await axios.post("http://localhost:3000/api/claims", payload);

      setNewClaimId(res.data.claim.claimNumber);
      setShowSuccessModal(true);
    } catch (err) {
      console.error("Create claim error:", err);
      alert("เกิดข้อผิดพลาด: " + (err.response?.data?.message || err.message));
    }

    setSubmitting(false);
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    navigate("/insurance/claims/active");
  };

  /* ────────────────────────────────────────────────
     ✅ RENDER
  ─────────────────────────────────────────────────*/

  // --- [ ✅ 1. เพิ่มโค้ดส่วนนี้: คำนวณขอบเขตวันที่ ] ---
  const getFormattedDate = (date) => {
    // แปลง Date object เป็น YYYY-MM-DD
    return date.toISOString().split('T')[0];
  };

  // วันที่สูงสุด (เลือกอนาคตไม่ได้)
  const today = new Date();
  const maxDate = getFormattedDate(today);

  // วันที่ต่ำสุด (ย้อนหลังได้ 7 วัน)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(today.getDate() - 7); // ลบวันที่ออก 7 วัน
  const minDate = getFormattedDate(sevenDaysAgo);
  // --- [ จบการแก้ไข ] ---


  return (
      <>
        {/* ✅ STEP 2: Policy Review */}
        {currentStep === 2 && (
            <PolicyReviewStep
                customer={customerFound}
                onContinue={handleProceedFromReview}
                onCancel={handleCancelFromReview}
            />
        )}

        {/* ✅ STEP 1 & 3: Search + Form */}
        {currentStep !== 2 && (
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

              {/* FORM */}
              <form
                  onSubmit={handleSubmit}
                  className="grid grid-cols-1 lg:grid-cols-3 gap-6"
              >
                {/* LEFT */}
                <div className="lg:col-span-2 space-y-6">
                  {/* ✅ Customer Search */}
                  <div className="card-static">
                    <h2 className="text-xl font-semibold text-neutral-dark mb-4 flex items-center gap-2">
                      <span className="material-icons-round text-primary-500">search</span>
                      <span>ค้นหาข้อมูลลูกค้า</span>
                    </h2>

                    {/* ✅ BEFORE SEARCH */}
                    {!customerFound ? (
                        <div className="flex gap-3">
                          <Input
                              label="เลขบัตรประชาชน"
                              name="idCard"
                              value={formData.idCard}
                              onChange={handleChange}
                              icon="badge"
                              error={errors.idCard}
                              maxLength="13"
                          />

                          <button
                              type="button"
                              onClick={handleSearchCustomer}
                              className="btn-primary mt-7 flex items-center gap-2"
                              disabled={searchingCustomer}
                          >
                            {searchingCustomer ? (
                                <>
                          <span className="material-icons-round animate-spin">
                            refresh
                          </span>
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
                    ) : (
                        <>
                          {/* ✅ CUSTOMER FOUND */}
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center">
                          <span className="material-icons-round text-2xl text-success">
                            check_circle
                          </span>
                              </div>

                              <div>
                                <p className="text-sm text-success font-medium">
                                  พบข้อมูลลูกค้า
                                </p>
                                <p className="text-xs text-neutral-500">
                                  {customerFound.idCard}
                                </p>
                              </div>
                            </div>

                            <button
                                type="button"
                                onClick={handleClearCustomer}
                                className="btn-ghost btn-sm"
                            >
                              <span className="material-icons-round text-sm">close</span>
                              <span>ค้นหาใหม่</span>
                            </button>
                          </div>

                          {/* ✅ CUSTOMER DETAILS */}
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
                          </div>

                          {/* ✅ VEHICLE LIST */}
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <p className="text-sm font-medium text-neutral-700">
                                รถยนต์ที่ทำประกัน
                              </p>

                              {selectedVehicleId && (
                                  <span className="text-xs text-secondary-600 flex items-center gap-1">
                            <span className="material-icons-round text-sm">
                              check_circle
                            </span>
                            เลือกแล้ว
                          </span>
                              )}
                            </div>

                            {errors.vehicle && (
                                <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-sm text-error">
                                  <span className="material-icons-round text-lg">error</span>
                                  {errors.vehicle}
                                </div>
                            )}

                            <div className="space-y-2">
                              {(customerFound?.vehicles || []).map((vehicle) => {
                                const isSelected = selectedVehicleId === vehicle.carID;

                                return (
                                    <button
                                        type="button"
                                        key={vehicle.carID}
                                        onClick={() => handleSelectVehicle(vehicle.carID)}
                                        className={`
                            w-full p-4 border-2 rounded-lg transition-all
                            ${isSelected
                                            ? "border-primary-500 bg-primary-50 shadow-md"
                                            : "border-neutral-200 hover:border-primary-300"
                                        }
                          `}
                                    >
                                      <div className="flex items-center gap-3">
                                        <div
                                            className={`
                              w-10 h-10 rounded-lg flex items-center justify-center
                              ${isSelected
                                                ? "bg-primary-100 text-primary-600"
                                                : "bg-neutral-100 text-neutral-400"
                                            }
                            `}
                                        >
                                          <span className="material-icons-round">directions_car</span>
                                        </div>

                                        <div className="flex-1 text-left">
                                          <p
                                              className={`font-medium ${isSelected ? "text-primary-700" : "text-neutral-dark"
                                              }`}
                                          >
                                            {vehicle.brand} {vehicle.model} ({vehicle.year})
                                          </p>
                                          <p
                                              className={`text-sm ${isSelected ? "text-primary-600" : "text-neutral-500"
                                              }`}
                                          >
                                            ทะเบียน: {vehicle.licensePlate} • สี:{" "}
                                            {vehicle.color}
                                          </p>
                                        </div>

                                        {vehicle.isPrimary && (
                                            <span className="badge badge-secondary text-xs">
                                    หลัก
                                  </span>
                                        )}

                                        {isSelected && (
                                            <span className="material-icons-round text-primary-500 text-2xl">
                                    check_circle
                                  </span>
                                        )}
                                      </div>
                                    </button>
                                );
                              })}
                            </div>
                          </div>
                        </>
                    )}
                  </div>

                  {/* ✅ INCIDENT INFO */}
                  {customerFound && currentStep === 3 &&(
                      <div className="card-static">
                        <h2 className="text-xl font-semibold text-neutral-dark mb-4 flex items-center gap-2">
                          <span className="material-icons-round text-primary-500">event_note</span>
                          ข้อมูลเหตุการณ์
                        </h2>

                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                            {/* --- [ ✅ 2. เพิ่ม props min และ max ที่นี่ ] --- */}
                            <Input
                                label="วันที่เกิดเหตุ"
                                name="incidentDate"
                                type="date"
                                value={formData.incidentDate}
                                onChange={handleChange}
                                error={errors.incidentDate}
                                icon="calendar_today"
                                max={maxDate}
                                min={minDate}
                            />
                            {/* --- [ จบการแก้ไข ] --- */}

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
                              placeholder="เช่น ถนนรัชดาภิเษก ซอย 7 ..."
                              error={errors.location}
                              icon="location_on"
                          />

                          <TextArea
                              label="รายละเอียดเหตุการณ์"
                              name="description"
                              value={formData.description}
                              onChange={handleChange}
                              placeholder="อธิบายเหตุการณ์อย่างละเอียด..."
                              rows={6}
                              error={errors.description}
                          />
                        </div>
                      </div>
                  )}
                </div>

                {/* RIGHT SIDEBAR */}
                <div className="space-y-6">


                  {/* INFO BOX */}
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

                  {/* ✅ SUBMIT BUTTON */}
                  {customerFound && (
                      <div className="space-y-3">
                        <button type="submit" className="btn-primary w-full" disabled={submitting}>
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

              {/* ✅ SUCCESS MODAL */}
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
                        <p className="text-2xl font-bold text-primary-600 mb-6">{newClaimId}</p>

                        <button onClick={handleCloseSuccessModal} className="btn-primary w-full">
                          เข้าใจแล้ว
                        </button>
                      </div>
                    </div>
                  </div>
              )}
            </div>
        )}
      </>
  );
};

export default CreateClaim;