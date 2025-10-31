import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { ClaimTimeline, StatusBadge, Modal } from "../../components";

const ClaimDetail = () => {
  const { id } = useParams(); // ✅ id = claimNumber
  const [loading, setLoading] = useState(true);
  const [claim, setClaim] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);

  useEffect(() => {
    loadClaimData();
  }, [id]);

  const loadClaimData = async () => {
    try {
      const res = await axios.get(
          `http://localhost:3000/api/claims/detail/${id}`
      );

      if (!res.data.claim) {
        setClaim(null);
        setLoading(false);
        return;
      }

      const c = res.data.claim;

      // ✅ สร้าง vehicle object ให้ UI ใช้เหมือน mock
      const vehicle = {
        brand: c.carBrand || "",
        model: c.carModel || "",
        color: c.carColor || "",
        year: c.carYear,
        licensePlate: c.licensePlate || "",
        chassisNumber: c.engineID || "",
      };

      // ✅ garage object (ถ้ามี)
      const garage = c.garageName
          ? {
            name: c.garageName,
            phone: c.garagePhone,
            email: c.garageEmail,
            address: "-", // ยังไม่มีใน claimRoute
            distance: "-", // เว้นไว้ก่อน
          }
          : null;

        // ✅ assigned officer จาก backend
      const assignedOfficer = {
        name: c.insuranceFirstName + " " + c.insuranceLastName || "",
        phone: c.insurancePhone || "",
        email: c.insuranceEmail || ""
      };

      // ✅ timeline mapping
      const timeline = {
        reportedDate: c.reportedDate || "",
        inspectionDate: c.inspectionDate || "",
        approvalDate: c.approvalDate || "",
        garageSelectedDate: c.garageSelectedDate || "",
        repairStartDate: c.repairStartDate || "",
        completedDate: c.completedDate || "",
      };

      setClaim({
        id: c.id,
        claimNumber: c.claimNumber,
        title: c.title,
        detail: c.detail,
        location: c.location,
        status: c.state,
        currentStep: c.currentStep,

        incidentDate: c.incidentDate,
        estimatedCost: c.estimatedCost || 0,
        approvedAmount: c.approvedCost || 0,
        deductible: c.additionalCost || 0,

        vehicle,
        garage,
        timeline,
        assignedOfficer,
        images: [], // ✅ backend ยังไม่มีระบบรูป
      });

      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleImageClick = (image) => {
    setSelectedImage(image);
    setShowImageModal(true);
  };

  const handleDownloadPDF = () => {
    console.log("Generate PDF Later", id);
  };

  if (loading) {
    return (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
          <span className="material-icons-round animate-spin text-6xl text-primary-500 mb-4">
            refresh
          </span>
            <p className="text-neutral-500">กำลังโหลดข้อมูล...</p>
          </div>
        </div>
    );
  }

  if (!claim) {
    return (
        <div className="card-static text-center py-16">
        <span className="material-icons-round text-6xl text-neutral-300 mb-4">
          error_outline
        </span>
          <p className="text-neutral-500 text-lg mb-4">ไม่พบข้อมูลเคลม</p>
          <Link to="/customer/claims" className="btn-primary">
            กลับไปหน้ารายการเคลม
          </Link>
        </div>
    );
  }

  return (
      <div className="space-y-6">
        {/* ✅ Header */}
        <div className="flex items-start justify-between">
          <div>
            <Link
                to="/customer/claims"
                className="inline-flex items-center gap-2 text-neutral-500 hover:text-primary-500 mb-3 transition-colors duration-300"
            >
              <span className="material-icons-round">arrow_back</span>
              <span>กลับ</span>
            </Link>

            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-neutral-dark">
                {claim.title}
              </h1>
              <StatusBadge status={claim.status} />
            </div>

            <p className="text-neutral-500">
              เลขที่เคลม:{" "}
              <span className="font-medium text-neutral-dark">
              {claim.claimNumber}
            </span>
            </p>
          </div>

          <button
              onClick={handleDownloadPDF}
              className="btn-primary flex items-center gap-2"
          >
            <span className="material-icons-round">download</span>
            <span>ดาวน์โหลด PDF</span>
          </button>
        </div>

        {/* ✅ Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* ✅ Claim Info */}
            <div className="card-static">
              <h2 className="text-xl font-semibold text-neutral-dark mb-4 flex items-center gap-2">
              <span className="material-icons-round text-primary-500 leading-none">
                info
              </span>
                ข้อมูลการเคลม
              </h2>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-neutral-500 mb-1">วันเกิดเหตุ</p>
                  <p className="font-medium text-neutral-dark">
                    {claim.incidentDate}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-neutral-500 mb-1">สถานที่เกิดเหตุ</p>
                  <p className="font-medium text-neutral-dark">
                    {claim.location}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-neutral-500 mb-1">
                    รายละเอียดเหตุการณ์
                  </p>
                  <p className="font-medium text-neutral-dark">
                    {claim.detail || claim.description}
                  </p>
                </div>
              </div>
            </div>

            {/* ✅ Vehicle */}
            <div className="card-static">
              <h2 className="text-xl font-semibold text-neutral-dark mb-4 flex items-center gap-2">
              <span className="material-icons-round text-primary-500 leading-none">
                directions_car
              </span>
                ข้อมูลรถยนต์
              </h2>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-neutral-500 mb-1">ยี่ห้อ/รุ่น</p>
                  <p className="font-medium text-neutral-dark">
                    {claim.vehicle.brand} {claim.vehicle.model} ({claim.vehicle.year})
                  </p>
                </div>

                <div>
                  <p className="text-sm text-neutral-500 mb-1">ทะเบียนรถ</p>
                  <p className="font-medium text-neutral-dark">
                    {claim.vehicle.licensePlate}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-neutral-500 mb-1">สี</p>
                  <p className="font-medium text-neutral-dark">
                    {claim.vehicle.color}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-neutral-500 mb-1">เลขตัวถัง</p>
                  <p className="font-medium text-neutral-dark">
                    {claim.vehicle.chassisNumber}
                  </p>
                </div>
              </div>
            </div>

            {/* ✅ Timeline */}
            <div className="card-static">
              <h2 className="text-xl font-semibold text-neutral-dark mb-6 flex items-center gap-2">
              <span className="material-icons-round text-primary-500 leading-none">
                timeline
              </span>
                สถานะการดำเนินการ
              </h2>

              <ClaimTimeline
                  currentStep={claim.currentStep}
                  claimData={claim.timeline}
              />
            </div>
          </div>

          {/* ✅ Sidebar */}
          <div className="space-y-6">
            {/* ✅ Cost Summary */}
            <div className="card-static">
              <h3 className="font-semibold text-neutral-dark mb-4 flex items-center gap-2">
              <span className="material-icons-round text-primary-500 leading-none">
                payments
              </span>
                สรุปค่าใช้จ่าย
              </h3>

              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-neutral-50 rounded-lg">
                  <span className="text-neutral-600">ค่าซ่อมประเมิน</span>
                  <span className="font-semibold text-neutral-dark">
                  ฿{claim.estimatedCost.toLocaleString()}
                </span>
                </div>

                <div className="flex justify-between items-center p-3 bg-primary-50 rounded-lg">
                  <span className="text-primary-700">จำนวนเงินที่อนุมัติ</span>
                  <span className="font-bold text-primary-700 text-lg">
                  ฿{claim.approvedAmount.toLocaleString()}
                </span>
                </div>

                <div className="flex justify-between items-center p-3 bg-neutral-50 rounded-lg">
                  <span className="text-neutral-600">ต้องจ่ายเพิ่ม</span>
                  <span className="font-semibold text-neutral-dark">
                  ฿{claim.deductible.toLocaleString()}
                </span>
                </div>
              </div>
            </div>

            {/* ✅ Garage Info */}
            {claim.garage && (
                <div className="card-static">
                  <h3 className="font-semibold text-neutral-dark mb-4 flex items-center gap-2">
                <span className="material-icons-round text-primary-500 leading-none">
                  build_circle
                </span>
                    อู่ซ่อม
                  </h3>

                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-neutral-500 mb-1">ชื่ออู่</p>
                      <p className="font-medium text-neutral-dark">
                        {claim.garage.name}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-neutral-500 mb-1">เบอร์โทร</p>
                      <a
                          href={`tel:${claim.garage.phone}`}
                          className="text-primary-600 hover:text-primary-700 font-medium"
                      >
                        {claim.garage.phone}
                      </a>
                    </div>
                  </div>

                  <button className="btn-outline w-full mt-4">
                    <span className="material-icons-round mr-2">map</span>
                    ดูแผนที่
                  </button>
                </div>
            )}

            {/* ✅ Assigned Officer */}
            <div className="card bg-gradient-secondary text-white">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
              <span className="material-icons-round leading-none">
                support_agent
              </span>
                เจ้าหน้าที่ผู้ดูแล
              </h3>

              <div className="space-y-2 text-sm mb-4">
                <p>
                  <span className="opacity-80">ชื่อ:</span>{" "}
                  <span className="font-medium">{claim.assignedOfficer.name}</span>
                </p>

                <p>
                  <span className="opacity-80">โทร:</span>{" "}
                  <a
                      href={`tel:${claim.assignedOfficer.phone}`}
                      className="font-medium hover:underline"
                  >
                    {claim.assignedOfficer.phone}
                  </a>
                </p>

                <p>
                  <span className="opacity-80">อีเมล:</span>{" "}
                  <a
                      href={`mailto:${claim.assignedOfficer.email}`}
                      className="font-medium hover:underline"
                  >
                    {claim.assignedOfficer.email}
                  </a>
                </p>
              </div>

              <button className="btn-outline !border-white !text-white hover:!bg-white hover:!text-secondary-600 w-full">
                <span className="material-icons-round mr-2">phone</span>
                ติดต่อเจ้าหน้าที่
              </button>
            </div>

            {/* ✅ Quick Actions */}
            <div className="card">
              <h3 className="font-semibold text-neutral-dark mb-4">
                การดำเนินการด่วน
              </h3>

              <div className="space-y-2">
                {claim.status === "approved" && !claim.garage && (
                    <Link
                        to={`/customer/claims/${claim.id}/select-garage`}
                        className="btn-primary w-full flex items-center justify-center gap-2"
                    >
                      <span className="material-icons-round">build_circle</span>
                      เลือกอู่ซ่อม
                    </Link>
                )}

                <Link
                    to="/customer/urgent-request"
                    className="btn-outline w-full flex items-center justify-center gap-2"
                >
                  <span className="material-icons-round">priority_high</span>
                  ขออนุมัติซ่อมด่วน
                </Link>

                <Link
                    to="/customer/complaint"
                    className="btn-ghost w-full flex items-center justify-center gap-2"
                >
                  <span className="material-icons-round">report_problem</span>
                  แจ้งร้องเรียน
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ✅ Image Modal */}
        {showImageModal && selectedImage && (
            <Modal
                isOpen={showImageModal}
                onClose={() => setShowImageModal(false)}
                title={selectedImage.caption}
                size="lg"
            >
              <img
                  src={selectedImage.url}
                  alt={selectedImage.caption}
                  className="w-full rounded-lg"
              />
            </Modal>
        )}
      </div>
  );
};

export default ClaimDetail;