import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ClaimTimeline } from "../../components";
import axios from "axios";

const CustomerDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ total: 0, active: 0, completed: 0 });
    const [activeClaims, setActiveClaims] = useState([]);

    useEffect(() => {
        (async () => {
            await loadDashboardData();
        })();
    }, []);
    const loadDashboardData = async () => {
        try {
            const user = JSON.parse(localStorage.getItem("claimmate_user"));
            if (!user) return;

            // ✅ แก้ไขการดึง ID: ให้ลองดึงจาก customerID (ที่ backend แยกมาให้) ก่อน
            const customerID = user.customerID || user.Customer?.id;

            if (!customerID) {
                console.error("Customer ID not found in user object:", user);
                return;
            }
            // ✅ 1) ดึงสถิติ (total, ongoing, completed)
            const statRes = await axios.get(
                `http://localhost:3000/api/claims/customer/${customerID}/stats`
            );

            // ✅ 2) ดึงรายการเคลมทั้งหมดของลูกค้า
            const claimsRes = await axios.get(
                `http://localhost:3000/api/claims/customer/${customerID}`
            );

            const claims = claimsRes.data.claims || [];

            // ✅ แก้ไข Filter ให้ตรงกับ ENUM ใน ClaimStatus.js
            const activeStates = ['open_case', 'survey', 'approved', 'choose_garage', 'repair'];

            const activeList = claims.filter((claim) => {
                // เช็คว่า backend ส่งมาเป็น object ชื่อ ClaimStatus หรือ array
                // ถ้า backend include มาแบบ hasOne จะได้ claim.ClaimStatus
                const s = claim.ClaimStatus;

                if (!s) return false;

                // เช็คว่า state ปัจจุบัน อยู่ใน list ของงานที่ยังไม่จบหรือไม่
                return activeStates.includes(s.state);
            });

            // ✅ Mapping สำหรับ UI
            const mappedActive = activeList.map((claim) => {
                const latest = claim.ClaimStatus || {};

                return {
                    id: claim.id,
                    claimNumber: `ประกันชั้น ${claim.Car?.Policy?.level || 'N/A'}`,
                    title: `CLM-${claim.id}`, // อาจจะเปลี่ยนเป็น claim.Car?.brand + ' ' + claim.Car?.model ก็ได้เพื่อให้สื่อความหมาย
                    date: claim.incidentDate,
                    currentStep: latest.currentStep || 1,
                    status: latest.state || "open_case", // ใช้ state แทน
                    estimatedCost: claim.estimateCost || 0,
                    garage: claim.garageId || null, // ต้องระวัง ถ้าไม่ได้ join Garage มา ค่านี้จะเป็นแค่ ID หรือ null
                    carBrand: claim.Car?.brand || "",
                    carModel: claim.Car?.model || "",
                    carYear: claim.Car?.year || "",
                    licensePlate: claim.Car?.licensePlate || "",
                };
            });


            setStats({
                total: statRes.data.stats.total,
                active: statRes.data.stats.ongoing,
                completed: statRes.data.stats.completed,
            });

            setActiveClaims(mappedActive);
            setLoading(false);
        } catch (err) {
            console.error("Dashboard load error:", err);
            setLoading(false);
        }
    };

    const getPriorityBadge = (priority) => {
        const config = {
            urgent: { label: 'ด่วนมาก', color: 'error', icon: 'priority_high' },
            high: { label: 'ด่วน', color: 'warning', icon: 'arrow_upward' },
            normal: { label: 'ปกติ', color: 'neutral', icon: 'remove' },
        };
        const { label, color, icon } = config[priority] || config.normal;

        return (
            <span className={`badge badge-${color} badge-sm flex items-center gap-1`}>
        <span className="material-icons-round text-xs">{icon}</span>
                {label}
      </span>
        );
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

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-neutral-dark mb-2">
                        ภาพรวมการเคลม
                    </h1>
                    <p className="text-neutral-500">
                        ยินดีต้อนรับ! ติดตามสถานะการเคลมของคุณได้ที่นี่
                    </p>
                </div>
            </div>

            {/* ✅ Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card hover:shadow-card-hover transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                        <div className="icon-container bg-primary-100 text-primary-600">
                            <span className="material-icons-round">description</span>
                        </div>
                    </div>
                    <p className="text-neutral-500 text-sm mb-1">เคลมทั้งหมด</p>
                    <h3 className="text-3xl font-bold text-neutral-dark">{stats.total}</h3>
                </div>

                <div className="card hover:shadow-card-hover transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                        <div className="icon-container bg-warning/20 text-warning">
                            <span className="material-icons-round">autorenew</span>
                        </div>
                    </div>
                    <p className="text-neutral-500 text-sm mb-1">กำลังดำเนินการ</p>
                    <h3 className="text-3xl font-bold text-warning">{stats.active}</h3>
                </div>

                <div className="card hover:shadow-card-hover transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                        <div className="icon-container bg-success/20 text-success">
                            <span className="material-icons-round">check_circle</span>
                        </div>
                    </div>
                    <p className="text-neutral-500 text-sm mb-1">เสร็จสิ้น</p>
                    <h3 className="text-3xl font-bold text-success">{stats.completed}</h3>
                </div>
            </div>

            {/* ✅ Active Claims Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-neutral-dark">
                            การเคลมที่กำลังดำเนินการ
                        </h2>
                        <span className="text-sm text-neutral-500">
              {activeClaims.length} รายการ
            </span>
                    </div>

                    {activeClaims.length === 0 ? (
                        <div className="card text-center py-12">
              <span className="material-icons-round text-6xl text-neutral-300 mb-4">
                inbox
              </span>
                            <p className="text-neutral-500 mb-4">
                                คุณไม่มีการเคลมที่กำลังดำเนินการ
                            </p>
                            <Link
                                to="/customer/claims"
                                className="btn-primary inline-flex items-center gap-2"
                            >
                                <span>ดูประวัติการเคลม</span>
                            </Link>
                        </div>
                    ) : (
                        activeClaims.map((claim) => (
                            <div key={claim.id} className="card">
                                {/* Claim Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-semibold text-neutral-dark">
                                                {claim.title}
                                            </h3>
                                            <span className="badge badge-primary">
                        {claim.claimNumber}
                      </span>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-neutral-500">
                      <span className="flex items-center gap-1">
                        <span className="material-icons-round text-sm">
                          calendar_today
                        </span>
                          {claim.date}
                      </span>

                                            <span className="flex items-center gap-1">
                        <span className="material-icons-round text-sm">
                          directions_car
                        </span>
                                                {claim.carBrand + " " + claim.carModel + " (" + claim.carYear + ")"}
                      </span>

                                            <span className="flex items-center gap-1">
                        <span className="material-icons-round text-sm">pin</span>
                                                {claim.licensePlate}
                      </span>
                                        </div>
                                    </div>
                                    <Link
                                        to={`/customer/claims/${claim.id}`}
                                        className="btn-ghost flex items-center gap-1"
                                    >
                                        <span>ดูรายละเอียด</span>
                                        <span className="material-icons-round text-sm">
                      arrow_forward
                    </span>
                                    </Link>
                                </div>

                                {/* Claim Info */}
                                <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-neutral-50 rounded-lg">
                                    <div>
                                        <p className="text-xs text-neutral-500 mb-1">ค่าซ่อมประเมิน</p>
                                        <p className="text-lg font-semibold text-primary-600">
                                            ฿{claim.estimatedCost.toLocaleString() || (
                                            <span className="text-warning">รอการประเมิน</span>
                                        )}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs text-neutral-500 mb-1">อู่ซ่อม</p>
                                        <p className="font-medium text-neutral-dark">
                                            {(() => {
                                                // ถ้ายังไม่ถึงขั้น "เลือกอู่ซ่อม" แสดง "-"
                                                const stepsBeforeGarageSelection = ['reported', 'inspected', 'approved'];
                                                if (stepsBeforeGarageSelection.includes(claim.currentStep)) {
                                                    return <span className="text-neutral-400">-</span>;
                                                }

                                                // ถ้าถึงขั้น "เลือกอู่ซ่อม" แต่ยังไม่เลือก
                                                if (claim.currentStep === 3 && !claim.garage) {
                                                    return <span className="text-warning">กรุณาเลือกอู่ซ่อม</span>;
                                                }

                                                // ถ้ามีอู่แล้ว (เลือกและยืนยันแล้ว)
                                                if (claim.garage) {
                                                    return claim.garage.name || claim.garage;
                                                }

                                                // default
                                                return <span className="text-neutral-400">-</span>;
                                            })()}
                                        </p>
                                    </div>
                                </div>

                                {/* ✅ Timeline */}
                                <ClaimTimeline
                                    currentStep={claim.currentStep}
                                    claimData={{
                                        reportedDate: claim.date,
                                        inspectionDate: claim.currentStep >= 1 ? "" : "",
                                        approvalDate: claim.currentStep >= 2 ? "" : "",
                                        garageSelectedDate: claim.currentStep >= 3 ? "" : "",
                                        repairStartDate: claim.currentStep >= 4 ? "" : "",
                                        completedDate: claim.currentStep >= 5 ? "" : "",
                                    }}
                                />
                            </div>
                        ))
                    )}
                </div>

                {/* ✅ Quick Actions */}
                <div className="space-y-6">
                    <div className="card">
                        <h3 className="font-semibold text-neutral-dark mb-4">
                            การดำเนินการด่วน
                        </h3>
                        <div className="space-y-3">
                            <Link
                                to="/customer/urgent-request"
                                className="flex items-center gap-3 p-3 hover:bg-red-50 rounded-lg transition-colors"
                            >
                                <div className="w-12 h-12 rounded-xl bg-red-100 text-error flex items-center justify-center">
                                    <span className="material-icons-round">priority_high</span>
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-neutral-dark">
                                        ขออนุมัติซ่อมด่วน
                                    </p>
                                    <p className="text-xs text-neutral-500">
                                        สำหรับกรณีฉุกเฉิน
                                    </p>
                                </div>
                                <span className="material-icons-round text-neutral-400">
                  chevron_right
                </span>
                            </Link>
                        </div>
                    </div>

                    <div className="card bg-gradient-secondary text-white">
            <span className="material-icons-round text-4xl mb-3">
              support_agent
            </span>
                        <h3 className="font-semibold mb-2">ต้องการความช่วยเหลือ?</h3>
                        <p className="text-sm text-white/80 mb-4">
                            ติดต่อศูนย์บริการลูกค้าของเรา
                        </p>
                        <a
                            href="tel:02-123-4567"
                            className="btn-outline !border-white !text-white hover:!bg-white hover:!text-secondary-600"
                        >
                            <span className="material-icons-round mr-2">phone</span>
                            โทร 02-123-4567
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerDashboard;