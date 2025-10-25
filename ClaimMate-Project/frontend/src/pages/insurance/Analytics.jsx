import React, { useState, useEffect } from 'react';

/**
 * Analytics - หน้าวิเคราะห์และรายงาน
 * 
 * Features:
 * 1. วิเคราะห์ต้นทุนเฉลี่ยในการเคลม
 * 2. สร้างรายงานประจำปี & เดือน
 * 3. แสดงสถิติและกราฟ
 * 
 * TODO: Backend Integration
 * - GET /api/insurance/analytics/summary - ดึงข้อมูลสรุป
 * - GET /api/insurance/analytics/monthly - ดึงข้อมูลรายเดือน
 * - GET /api/insurance/analytics/yearly - ดึงข้อมูลรายปี
 * - POST /api/insurance/analytics/export - Export รายงาน
 */
const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('month'); // 'month' or 'year'
  const [selectedMonth, setSelectedMonth] = useState('2024-10');
  const [selectedYear, setSelectedYear] = useState('2024');
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    // TODO: Backend - ดึงข้อมูลวิเคราะห์
    // fetchAnalytics();
    
    // Mock data
    setTimeout(() => {
      setAnalytics({
        summary: {
          totalClaims: 45,
          completedClaims: 28,
          totalCost: 1250000,
          averageCost: 27778,
          approvalRate: 93,
        },
        monthly: {
          claims: [
            { month: 'ม.ค.', count: 12, cost: 320000 },
            { month: 'ก.พ.', count: 15, cost: 380000 },
            { month: 'มี.ค.', count: 18, cost: 450000 },
            { month: 'เม.ย.', count: 10, cost: 250000 },
            { month: 'พ.ค.', count: 14, cost: 350000 },
            { month: 'มิ.ย.', count: 16, cost: 400000 },
            { month: 'ก.ค.', count: 20, cost: 520000 },
            { month: 'ส.ค.', count: 22, cost: 580000 },
            { month: 'ก.ย.', count: 19, cost: 480000 },
            { month: 'ต.ค.', count: 17, cost: 440000 },
          ],
        },
        topGarages: [
          { name: 'อู่สมชาย ห้วยขวาง', claims: 12, totalCost: 320000 },
          { name: 'อู่ประเสริฐ จตุจักร', claims: 10, totalCost: 280000 },
          { name: 'อู่วิภา ห้วยขวาง', claims: 8, totalCost: 210000 },
          { name: 'อู่สุดา บางกะปิ', claims: 7, totalCost: 195000 },
          { name: 'อู่มั่นคง ลาดพร้าว', claims: 6, totalCost: 168000 },
        ],
        damageTypes: [
          { type: 'ชนด้านหน้า', count: 15, percentage: 33 },
          { type: 'ชนด้านหลัง', count: 10, percentage: 22 },
          { type: 'ชนด้านข้าง', count: 12, percentage: 27 },
          { type: 'รอยขีดข่วน', count: 5, percentage: 11 },
          { type: 'อื่นๆ', count: 3, percentage: 7 },
        ],
      });
      setLoading(false);
    }, 500);
  }, [selectedPeriod, selectedMonth, selectedYear]);

  // TODO: Backend - Export รายงาน
  const handleExportReport = () => {
    console.log('Export report:', { period: selectedPeriod, month: selectedMonth, year: selectedYear });
    alert('กำลังดาวน์โหลดรายงาน...');
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

  const maxMonthlyCost = Math.max(...analytics.monthly.claims.map(c => c.cost));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-dark mb-2">
            Analytics & Reports
          </h1>
          <p className="text-neutral-500">
            วิเคราะห์และรายงานข้อมูลการเคลม
          </p>
        </div>
        <button
          onClick={handleExportReport}
          className="btn-primary flex items-center gap-2"
        >
          <span className="material-icons-round">file_download</span>
          <span>Export รายงาน</span>
        </button>
      </div>

      {/* Period Filter */}
      <div className="card-static">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedPeriod('month')}
              className={`
                px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300
                ${selectedPeriod === 'month'
                  ? 'bg-primary-500 text-white shadow-button'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }
              `}
            >
              รายเดือน
            </button>
            <button
              onClick={() => setSelectedPeriod('year')}
              className={`
                px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300
                ${selectedPeriod === 'year'
                  ? 'bg-primary-500 text-white shadow-button'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }
              `}
            >
              รายปี
            </button>
          </div>

          <div className="flex gap-4 flex-1">
            {selectedPeriod === 'month' && (
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="input-field flex-1"
              >
                <option value="2024-10">ตุลาคม 2024</option>
                <option value="2024-09">กันยายน 2024</option>
                <option value="2024-08">สิงหาคม 2024</option>
              </select>
            )}
            
            {selectedPeriod === 'year' && (
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="input-field flex-1"
              >
                <option value="2024">2024</option>
                <option value="2023">2023</option>
                <option value="2022">2022</option>
              </select>
            )}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="card hover:shadow-card-hover transition-all duration-300">
          <p className="text-neutral-500 text-sm mb-1">เคลมทั้งหมด</p>
          <h3 className="text-3xl font-bold text-primary-600">{analytics.summary.totalClaims}</h3>
          <p className="text-xs text-neutral-400 mt-1">รายการ</p>
        </div>

        <div className="card hover:shadow-card-hover transition-all duration-300">
          <p className="text-neutral-500 text-sm mb-1">เสร็จสิ้น</p>
          <h3 className="text-3xl font-bold text-success">{analytics.summary.completedClaims}</h3>
          <p className="text-xs text-neutral-400 mt-1">รายการ</p>
        </div>

        <div className="card hover:shadow-card-hover transition-all duration-300">
          <p className="text-neutral-500 text-sm mb-1">ต้นทุนรวม</p>
          <h3 className="text-2xl font-bold text-secondary-600">
            ฿{(analytics.summary.totalCost / 1000000).toFixed(2)}M
          </h3>
          <p className="text-xs text-neutral-400 mt-1">บาท</p>
        </div>

        <div className="card hover:shadow-card-hover transition-all duration-300">
          <p className="text-neutral-500 text-sm mb-1">ค่าเฉลี่ย/เคส</p>
          <h3 className="text-2xl font-bold text-warning">
            ฿{(analytics.summary.averageCost / 1000).toFixed(1)}K
          </h3>
          <p className="text-xs text-neutral-400 mt-1">บาท</p>
        </div>

        <div className="card hover:shadow-card-hover transition-all duration-300">
          <p className="text-neutral-500 text-sm mb-1">อัตราอนุมัติ</p>
          <h3 className="text-3xl font-bold text-info">{analytics.summary.approvalRate}%</h3>
          <p className="text-xs text-neutral-400 mt-1">ของทั้งหมด</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Claims Chart */}
        <div className="lg:col-span-2 card-static">
          <h2 className="text-xl font-semibold text-neutral-dark mb-6">
            จำนวนเคลมและค่าใช้จ่ายรายเดือน
          </h2>
          
          <div className="space-y-3">
            {analytics.monthly.claims.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-neutral-700">{item.month}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-neutral-600">{item.count} เคส</span>
                    <span className="font-semibold text-primary-600">
                      ฿{(item.cost / 1000).toFixed(0)}K
                    </span>
                  </div>
                </div>
                <div className="relative h-8 bg-neutral-100 rounded-full overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 bg-gradient-primary rounded-full transition-all duration-500"
                    style={{ width: `${(item.cost / maxMonthlyCost) * 100}%` }}
                  />
                  <div className="absolute inset-0 flex items-center justify-between px-4 text-xs font-medium">
                    <span className="text-white mix-blend-difference">{item.count} เคส</span>
                    <span className="text-white mix-blend-difference">
                      ฿{item.cost.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Damage Types */}
        <div className="card-static">
          <h2 className="text-xl font-semibold text-neutral-dark mb-6">
            ประเภทความเสียหาย
          </h2>
          
          <div className="space-y-4">
            {analytics.damageTypes.map((item, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-neutral-700">{item.type}</span>
                  <span className="text-sm font-semibold text-primary-600">{item.percentage}%</span>
                </div>
                <div className="relative h-2 bg-neutral-100 rounded-full overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 bg-primary-500 rounded-full transition-all duration-500"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
                <p className="text-xs text-neutral-500 mt-1">{item.count} รายการ</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Garages */}
      <div className="card-static">
        <h2 className="text-xl font-semibold text-neutral-dark mb-6">
          Top 5 อู่ซ่อมที่ใช้บริการมากที่สุด
        </h2>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-200">
                <th className="text-left py-3 px-4 font-semibold text-neutral-700">อันดับ</th>
                <th className="text-left py-3 px-4 font-semibold text-neutral-700">ชื่ออู่</th>
                <th className="text-center py-3 px-4 font-semibold text-neutral-700">จำนวนเคส</th>
                <th className="text-right py-3 px-4 font-semibold text-neutral-700">ค่าใช้จ่ายรวม</th>
              </tr>
            </thead>
            <tbody>
              {analytics.topGarages.map((garage, index) => (
                <tr key={index} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors duration-200">
                  <td className="py-4 px-4">
                    <div className={`
                      w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg
                      ${index === 0 ? 'bg-yellow-100 text-yellow-600' :
                        index === 1 ? 'bg-gray-100 text-gray-600' :
                        index === 2 ? 'bg-orange-100 text-orange-600' :
                        'bg-neutral-100 text-neutral-600'}
                    `}>
                      {index + 1}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <p className="font-medium text-neutral-dark">{garage.name}</p>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="badge badge-primary">{garage.claims} เคส</span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <p className="font-semibold text-lg text-primary-600">
                      ฿{garage.totalCost.toLocaleString()}
                    </p>
                    <p className="text-xs text-neutral-500">
                      เฉลี่ย ฿{Math.round(garage.totalCost / garage.claims).toLocaleString()}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Card */}
      <div className="card bg-gradient-secondary text-white">
        <div className="flex items-center gap-4">
          <span className="material-icons-round text-5xl">analytics</span>
          <div className="flex-1">
            <h3 className="text-xl font-semibold mb-2">ข้อมูลเชิงลึกเพิ่มเติม</h3>
            <p className="text-white/80 text-sm mb-4">
              ระบบกำลังวิเคราะห์ข้อมูลเพื่อให้คำแนะนำในการปรับปรุงประสิทธิภาพ
            </p>
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="material-icons-round text-sm">trending_up</span>
                <span>เคลมเพิ่มขึ้น 12% จากเดือนที่แล้ว</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-icons-round text-sm">schedule</span>
                <span>เวลาดำเนินการเฉลี่ย 3.5 วัน</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;