import React, { useState } from 'react';

/**
 * PolicyReviewStep - หน้าแสดงรายละเอียดกรมธรรม์ก่อนเปิดเคส
 * เพื่อให้พนักงานตรวจสอบว่าลูกค้ามีความคุ้มครองตามที่แจ้งหรือไม่
 */
const PolicyReviewStep = ({ customer, onContinue, onCancel }) => {
  // ✅ State สำหรับเปิด/ปิด dropdown ของแต่ละคัน
  const [expandedVehicle, setExpandedVehicle] = useState(null);

  const toggleVehicle = (carID) => {
    setExpandedVehicle(expandedVehicle === carID ? null : carID);
  };

  // ข้อมูลความคุ้มครองแต่ละชั้น
  const coverageDetails = {
    '1': {
      name: 'ชั้น 1',
      subtitle: 'คุ้มครองครบถ้วนที่สุด',
      color: 'primary',
      icon: 'verified',
      coverageAmount: 500000, // ✅ เพิ่มวงเงินตามชั้น
      coverages: [
        { icon: 'check_circle', text: 'รถยนต์ตนเอง (ชน, กระแทก, คว่ำ, ตก)', included: true },
        { icon: 'check_circle', text: 'รถยนต์คู่กรณี (บุคคลภายนอก)', included: true },
        { icon: 'check_circle', text: 'ภัยธรรมชาติ (น้ำท่วม, พายุ, ลูกเห็บ)', included: true },
        { icon: 'check_circle', text: 'ไฟไหม้, ระเบิด, ฟ้าผ่า', included: true },
        { icon: 'check_circle', text: 'โจรกรรม (รถหาย)', included: true },
        { icon: 'check_circle', text: 'อุบัติเหตุส่วนบุคคล (คนขับ/ผู้โดยสาร)', included: true },
      ],
      notes: [
        'คุ้มครองทุกกรณีอุบัติเหตุ',
        'เหมาะสำหรับรถใหม่และรถราคาสูง',
      ],
    },
    '2+': {
      name: 'ชั้น 2+',
      subtitle: 'คุ้มครองบางส่วน (ไฟไหม้ + รถคู่กรณี)',
      color: 'warning',
      icon: 'local_fire_department',
      coverageAmount: 300000, // ✅ เพิ่มวงเงินตามชั้น
      coverages: [
        { icon: 'cancel', text: 'รถยนต์ตนเอง (ชน, กระแทก)', included: false },
        { icon: 'check_circle', text: 'รถยนต์คู่กรณี (บุคคลภายนอก)', included: true },
        { icon: 'cancel', text: 'ภัยธรรมชาติ (น้ำท่วม, พายุ)', included: false },
        { icon: 'check_circle', text: 'ไฟไหม้, ระเบิด, ฟ้าผ่า', included: true },
        { icon: 'check_circle', text: 'โจรกรรม (รถหายทั้งคัน)', included: true },
        { icon: 'cancel', text: 'อุบัติเหตุส่วนบุคคล', included: false },
      ],
      notes: [
        'ไม่คุ้มครองความเสียหายรถตนเองจากการชน',
        'คุ้มครองเฉพาะไฟไหม้และโจรกรรม',
      ],
    },
    '2': {
      name: 'ชั้น 2',
      subtitle: 'คุ้มครองเฉพาะไฟไหม้ + รถคู่กรณี',
      color: 'warning',
      icon: 'local_fire_department',
      coverageAmount: 250000, // ✅ เพิ่มวงเงินตามชั้น
      coverages: [
        { icon: 'cancel', text: 'รถยนต์ตนเอง (ชน, กระแทก)', included: false },
        { icon: 'check_circle', text: 'รถยนต์คู่กรณี (บุคคลภายนอก)', included: true },
        { icon: 'cancel', text: 'ภัยธรรมชาติ (น้ำท่วม, พายุ)', included: false },
        { icon: 'check_circle', text: 'ไฟไหม้, ระเบิด, ฟ้าผ่า', included: true },
        { icon: 'cancel', text: 'โจรกรรม', included: false },
        { icon: 'cancel', text: 'อุบัติเหตุส่วนบุคคล', included: false },
      ],
      notes: [
        'ไม่คุ้มครองความเสียหายรถตนเองจากการชน',
        'ไม่คุ้มครองโจรกรรม',
      ],
    },
    '3+': {
      name: 'ชั้น 3+',
      subtitle: 'คุ้มครองเฉพาะรถคู่กรณี + ไฟไหม้บางส่วน',
      color: 'info',
      icon: 'directions_car',
      coverageAmount: 150000, // ✅ เพิ่มวงเงินตามชั้น
      coverages: [
        { icon: 'cancel', text: 'รถยนต์ตนเอง (ชน, กระแทก)', included: false },
        { icon: 'check_circle', text: 'รถยนต์คู่กรณี (บุคคลภายนอก)', included: true },
        { icon: 'cancel', text: 'ภัยธรรมชาติ', included: false },
        { icon: 'check_circle', text: 'ไฟไหม้รถตนเอง (เฉพาะบางกรณี)', included: true },
        { icon: 'cancel', text: 'โจรกรรม', included: false },
        { icon: 'cancel', text: 'อุบัติเหตุส่วนบุคคล', included: false },
      ],
      notes: [
        'คุ้มครองหลักคือความเสียหายต่อบุคคลภายนอก',
        'ไม่คุ้มครองรถตนเองจากการชน',
      ],
    },
    '3': {
      name: 'ชั้น 3 (พ.ร.บ.)',
      subtitle: 'คุ้มครองเฉพาะรถคู่กรณี (บังคับตามกฎหมาย)',
      color: 'neutral',
      icon: 'shield',
      coverageAmount: 100000, // ✅ เพิ่มวงเงินตามชั้น
      coverages: [
        { icon: 'cancel', text: 'รถยนต์ตนเอง (ชน, กระแทก)', included: false },
        { icon: 'check_circle', text: 'รถยนต์คู่กรณี (บุคคลภายนอก) - จำกัดวงเงิน', included: true },
        { icon: 'cancel', text: 'ภัยธรรมชาติ', included: false },
        { icon: 'cancel', text: 'ไฟไหม้', included: false },
        { icon: 'cancel', text: 'โจรกรรม', included: false },
        { icon: 'cancel', text: 'อุบัติเหตุส่วนบุคคล', included: false },
      ],
      notes: [
        'คุ้มครองแค่ความเสียหายต่อบุคคลภายนอกเท่านั้น',
        'ไม่คุ้มครองรถตนเองเลย',
      ],
    },
  };

  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="material-icons-round text-2xl text-primary-600">
                verified_user
              </span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-neutral-dark">
                ตรวจสอบกรมธรรม์ประกันภัย
              </h1>
              <p className="text-neutral-500">
                กรุณาตรวจสอบความคุ้มครองก่อนเปิดเคส
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left - Policy Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* ✅ Customer Info Card - เหลือแค่ชื่อและบัตร */}
            <div className="card-static">
              <h2 className="text-xl font-semibold text-neutral-dark mb-4 flex items-center gap-2">
                <span className="material-icons-round text-primary-500">person</span>
                ข้อมูลลูกค้า
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-neutral-500 mb-1">ชื่อ-นามสกุล</p>
                  <p className="font-semibold text-neutral-dark">{customer?.name}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500 mb-1">เลขบัตรประชาชน</p>
                  <p className="font-semibold text-neutral-dark">{customer?.citizenID}</p>
                </div>
              </div>
            </div>

            {/* ✅ TODO: Vehicle Cards จะเพิ่มในขั้นตอนต่อไป */}

            {/* ✅ Vehicle Cards - แสดงรถแต่ละคัน */}
            <div className="space-y-4">
              {(customer?.vehicles || []).map((vehicle) => {
                // ดึงข้อมูลความคุ้มครองตามชั้นของรถ
                const vehicleClass = vehicle.insuranceClass || '1';
                const coverage = coverageDetails[vehicleClass] || coverageDetails['1'];
                const isExpanded = expandedVehicle === vehicle.carID;

                return (
                  <div key={vehicle.carID} className="card-static">
                    {/* Header - คลิกเพื่อเปิด/ปิด dropdown */}
                    <button
                      onClick={() => toggleVehicle(vehicle.carID)}
                      className="w-full flex items-center justify-between p-4 hover:bg-neutral-50 rounded-lg transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 bg-${coverage.color}-100 rounded-lg flex items-center justify-center`}>
                          <span className={`material-icons-round text-2xl text-${coverage.color}-600`}>
                            directions_car
                          </span>
                        </div>

                        <div className="text-left">
                          <p className="font-semibold text-neutral-dark">
                            {vehicle.brand} {vehicle.model} ({vehicle.year})
                          </p>
                          <p className="text-sm text-neutral-500">
                            ทะเบียน: {vehicle.licensePlate} • สี: {vehicle.color}
                          </p>
                        </div>
                      </div>

                      <span className={`material-icons-round text-neutral-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                        expand_more
                      </span>
                    </button>

                    {/* Dropdown Content */}
                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-neutral-200 space-y-6">
                        {/* รายละเอียดกรมธรรม์ */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-neutral-500 mb-1">เลขกรมธรรม์</p>
                            <p className="font-semibold text-primary-600">{vehicle.policyNumber || '-'}</p>
                          </div>

                          <div>
                            <p className="text-xs text-neutral-500 mb-1">ประเภทประกัน</p>
                            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-${coverage.color}-100`}>
                              <span className={`material-icons-round text-sm text-${coverage.color}-700`}>
                                {coverage.icon}
                              </span>
                              <span className={`font-semibold text-${coverage.color}-700`}>
                                {coverage.name}
                              </span>
                            </div>
                          </div>

                          <div>
                            <p className="text-xs text-neutral-500 mb-1">วันเริ่มต้น</p>
                            <p className="font-semibold text-neutral-dark">{vehicle.insuranceCreateAt || '-'}</p>
                          </div>

                          <div>
                            <p className="text-xs text-neutral-500 mb-1">วันหมดอายุ</p>
                            <p className="font-semibold text-neutral-dark">{vehicle.insuranceExpireAt || '-'}</p>
                          </div>

                          <div className="col-span-2">
                            <p className="text-xs text-neutral-500 mb-1">วงเงินคุ้มครอง</p>
                            <p className="font-bold text-lg text-primary-600">
                              ฿{coverage.coverageAmount.toLocaleString()}
                            </p>
                          </div>
                        </div>

                        {/* ✅ TODO: ความคุ้มครอง + ข้อควรระวัง จะเพิ่มในขั้นตอนต่อไป */}

                        {/* ✅ ความคุ้มครอง */}
                        <div>
                          <h3 className="font-semibold text-neutral-dark mb-3 flex items-center gap-2">
                            <span className="material-icons-round text-primary-500">description</span>
                            ความคุ้มครอง - {coverage.name}
                          </h3>

                          <div className="space-y-2">
                            {coverage.coverages.map((item, index) => (
                              <div
                                key={index}
                                className={`flex items-start gap-3 p-3 rounded-lg ${
                                  item.included
                                    ? 'bg-success/10 border border-success/20'
                                    : 'bg-neutral-100 border border-neutral-200'
                                }`}
                              >
                                <span
                                  className={`material-icons-round text-lg ${
                                    item.included ? 'text-success' : 'text-neutral-400'
                                  }`}
                                >
                                  {item.icon}
                                </span>
                                <p
                                  className={`flex-1 text-sm ${
                                    item.included ? 'text-neutral-dark font-medium' : 'text-neutral-500'
                                  }`}
                                >
                                  {item.text}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* ✅ ข้อควรระวัง */}
                        <div className="p-4 bg-gradient-to-br from-warning/10 to-warning/5 border border-warning/20 rounded-lg">
                          <div className="flex items-start gap-3">
                            <span className="material-icons-round text-2xl text-warning">warning</span>
                            <div>
                              <h3 className="font-semibold text-neutral-dark mb-2">
                                ข้อควรระวัง
                              </h3>
                              <ul className="space-y-1 text-sm text-neutral-600">
                                {coverage.notes.map((note, index) => (
                                  <li key={index} className="flex items-start gap-2">
                                    <span className="material-icons-round text-xs text-warning mt-0.5">
                                      arrow_right
                                    </span>
                                    <span>{note}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right - Action Sidebar */}
          <div className="space-y-6">
            {/* Decision Card */}
            <div className="card-static sticky top-6">
              <h3 className="font-semibold text-neutral-dark mb-4 flex items-center gap-2">
                <span className="material-icons-round text-primary-500">checklist</span>
                ตรวจสอบความคุ้มครอง
              </h3>

              <div className="bg-neutral-50 p-4 rounded-lg mb-6">
                <p className="text-sm text-neutral-600 mb-3">
                  กรุณาตรวจสอบว่าเหตุการณ์ที่ลูกค้าแจ้งมา<br />
                  <span className="font-semibold text-neutral-dark">อยู่ในความคุ้มครองหรือไม่</span>
                </p>
                <ul className="text-xs text-neutral-500 space-y-1 list-disc list-inside">
                  <li>ถ้าอยู่ในความคุ้มครอง → ดำเนินการต่อ</li>
                  <li>ถ้าไม่อยู่ในความคุ้มครอง → ยกเลิก</li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={onContinue}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  <span className="material-icons-round">check_circle</span>
                  <span>ดำเนินการต่อ</span>
                </button>

                <button
                  onClick={onCancel}
                  className="btn-outline w-full flex items-center justify-center gap-2"
                >
                  <span className="material-icons-round">cancel</span>
                  <span>ยกเลิกการเปิดเคส</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PolicyReviewStep;