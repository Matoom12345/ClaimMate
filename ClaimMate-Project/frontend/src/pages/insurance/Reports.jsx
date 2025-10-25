import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

/**
 * Reports - หน้าจัดทำใบอนุมัติซ่อม&จ่าย
 * 
 * Features:
 * 1. จัดทำใบอนุมัติซ่อม (Repair Authorization)
 * 2. จัดทำใบอนุมัติจ่าย (Payment Authorization)
 * 3. ส่งเอกสารให้ลูกค้า/อู่
 * 4. Export PDF
 * 
 * TODO: Backend Integration
 * - GET /api/insurance/reports - ดึงรายการเอกสาร
 * - POST /api/insurance/reports/create - สร้างเอกสาร
 * - GET /api/insurance/reports/{id}/pdf - Export PDF
 */
const Reports = () => {
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' or 'completed'
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState({ pending: [], completed: [] });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // TODO: Backend - ดึงรายการเอกสาร
    // fetchReports();
    
    // Mock data
    setTimeout(() => {
      setReports({
        pending: [
          {
            id: '1',
            claimNumber: 'CLM-2024-001',
            claimId: '1',
            type: 'repair', // 'repair' or 'payment'
            
            customerName: 'นายสมชาย ใจดี',
            carModel: 'Honda City 2020',
            licensePlate: 'กข 1234 กรุงเทพ',
            
            garageName: 'อู่สมชาย ห้วยขวาง',
            
            estimatedCost: 25000,
            approvedAmount: 25000,
            
            status: 'draft', // 'draft' or 'pending_send'
            createdDate: '2024-10-26 10:00',
          },
          {
            id: '2',
            claimNumber: 'CLM-2024-002',
            claimId: '2',
            type: 'payment',
            
            customerName: 'นางสุดา รักษ์ดี',
            carModel: 'Toyota Yaris 2021',
            licensePlate: 'คง 5678 กรุงเทพ',
            
            garageName: 'อู่ประเสริฐ จตุจักร',
            
            estimatedCost: 33000,
            approvedAmount: 33000,
            
            status: 'pending_send',
            createdDate: '2024-10-26 11:30',
          },
        ],
        completed: [
          {
            id: '3',
            claimNumber: 'CLM-2024-010',
            claimId: '10',
            type: 'repair',
            
            customerName: 'นายประเสริฐ มั่นคง',
            carModel: 'Mazda CX-5 2022',
            licensePlate: 'งง 9999 กรุงเทพ',
            
            garageName: 'อู่วิภา ห้วยขวาง',
            
            estimatedCost: 25000,
            approvedAmount: 25000,
            
            status: 'sent',
            createdDate: '2024-10-20 09:00',
            sentDate: '2024-10-20 14:00',
          },
          {
            id: '4',
            claimNumber: 'CLM-2024-009',
            claimId: '9',
            type: 'payment',
            
            customerName: 'นางวิมล สุขสันต์',
            carModel: 'Honda CR-V 2020',
            licensePlate: 'ฮฮ 7777 กรุงเทพ',
            
            garageName: 'อู่สมชาย ห้วยขวาง',
            
            estimatedCost: 15000,
            approvedAmount: 15000,
            
            status: 'sent',
            createdDate: '2024-10-18 10:00',
            sentDate: '2024-10-18 16:00',
          },
        ],
      });
      setLoading(false);
    }, 500);
  }, []);

  // TODO: Backend - สร้างเอกสาร
  const handleCreateReport = (claimId, type) => {
    console.log('Create report:', { claimId, type });
    // Navigate to create form
  };

  // TODO: Backend - ส่งเอกสาร
  const handleSendReport = (reportId) => {
    if (!window.confirm('ยืนยันการส่งเอกสารนี้?')) return;
    
    console.log('Send report:', reportId);
    
    // Move to completed
    const report = reports.pending.find(r => r.id === reportId);
    if (report) {
      setReports(prev => ({
        pending: prev.pending.filter(r => r.id !== reportId),
        completed: [{ ...report, status: 'sent', sentDate: new Date().toISOString() }, ...prev.completed],
      }));
    }
    
    alert('ส่งเอกสารสำเร็จ');
  };

  // TODO: Backend - Export PDF
  const handleExportPDF = (reportId) => {
    console.log('Export PDF:', reportId);
  };

  // Filter reports
  const filteredReports = reports[activeTab].filter(report => {
    if (!searchTerm) return true;
    
    const term = searchTerm.toLowerCase();
    return (
      report.claimNumber.toLowerCase().includes(term) ||
      report.customerName.toLowerCase().includes(term) ||
      report.licensePlate.toLowerCase().includes(term) ||
      report.garageName.toLowerCase().includes(term)
    );
  });

  const getTypeBadge = (type) => {
    const config = {
      repair: { label: 'ใบอนุมัติซ่อม', color: 'primary', icon: 'build' },
      payment: { label: 'ใบอนุมัติจ่าย', color: 'secondary', icon: 'payments' },
    };
    const { label, color, icon } = config[type] || config.repair;
    
    return (
      <span className={`badge badge-${color} flex items-center gap-1`}>
        <span className="material-icons-round text-xs">{icon}</span>
        {label}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    const config = {
      draft: { label: 'ร่าง', color: 'neutral', icon: 'draft' },
      pending_send: { label: 'รอส่ง', color: 'warning', icon: 'schedule' },
      sent: { label: 'ส่งแล้ว', color: 'success', icon: 'check_circle' },
    };
    const { label, color, icon } = config[status] || config.draft;
    
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
          <span className="material-icons-round animate-spin text-6xl text-primary-500 mb-4">refresh</span>
          <p className="text-neutral-500">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-dark mb-2">
            ใบอนุมัติซ่อม & จ่าย
          </h1>
          <p className="text-neutral-500">
            จัดทำและส่งเอกสารให้ลูกค้าและอู่ซ่อม
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card hover:shadow-card-hover transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-500 text-sm mb-1">รอดำเนินการ</p>
              <h3 className="text-3xl font-bold text-warning">{reports.pending.length}</h3>
              <p className="text-xs text-neutral-400 mt-1">ร่าง + รอส่ง</p>
            </div>
            <div className="w-16 h-16 rounded-xl bg-warning/10 text-warning flex items-center justify-center">
              <span className="material-icons-round text-3xl">schedule</span>
            </div>
          </div>
        </div>

        <div className="card hover:shadow-card-hover transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-500 text-sm mb-1">ส่งแล้ว</p>
              <h3 className="text-3xl font-bold text-success">{reports.completed.length}</h3>
              <p className="text-xs text-neutral-400 mt-1">ส่งเรียบร้อยแล้ว</p>
            </div>
            <div className="w-16 h-16 rounded-xl bg-success/10 text-success flex items-center justify-center">
              <span className="material-icons-round text-3xl">check_circle</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Tabs */}
      <div className="card-static">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <span className="material-icons-round absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400">
                search
              </span>
              <input
                type="text"
                placeholder="ค้นหาด้วยเลขเคลม, ชื่อลูกค้า, ทะเบียนรถ, อู่..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-12"
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('pending')}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all duration-300
                ${activeTab === 'pending'
                  ? 'bg-primary-500 text-white shadow-button'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }
              `}
            >
              <span className="material-icons-round text-sm">schedule</span>
              <span>รอดำเนินการ</span>
              {reports.pending.length > 0 && (
                <span className="badge badge-error badge-sm">{reports.pending.length}</span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all duration-300
                ${activeTab === 'completed'
                  ? 'bg-primary-500 text-white shadow-button'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }
              `}
            >
              <span className="material-icons-round text-sm">check_circle</span>
              <span>ส่งแล้ว</span>
            </button>
          </div>
        </div>
      </div>

      {/* Reports List */}
      {filteredReports.length === 0 ? (
        <div className="card-static text-center py-16">
          <span className="material-icons-round text-6xl text-neutral-300 mb-4">
            {activeTab === 'pending' ? 'schedule' : 'check_circle'}
          </span>
          <p className="text-neutral-500 text-lg mb-2">
            {activeTab === 'pending' ? 'ไม่มีเอกสารที่รอดำเนินการ' : 'ไม่มีเอกสารที่ส่งแล้ว'}
          </p>
          <p className="text-neutral-400 text-sm">
            {searchTerm ? 'ลองเปลี่ยนคำค้นหา' : 'เมื่อมีเอกสารจะแสดงที่นี่'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredReports.map(report => (
            <div key={report.id} className="card hover:shadow-card-hover transition-all duration-300">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Link
                      to={`/insurance/claims/${report.claimId}`}
                      className="text-lg font-semibold text-primary-600 hover:text-primary-700"
                    >
                      {report.claimNumber}
                    </Link>
                  </div>
                  <div className="flex items-center gap-2">
                    {getTypeBadge(report.type)}
                    {getStatusBadge(report.status)}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-3">
                  <span className="material-icons-round text-neutral-400">person</span>
                  <div className="flex-1">
                    <p className="font-medium text-neutral-dark">{report.customerName}</p>
                    <p className="text-sm text-neutral-500">{report.carModel} • {report.licensePlate}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="material-icons-round text-neutral-400">build</span>
                  <div className="flex-1">
                    <p className="font-medium text-neutral-dark">{report.garageName}</p>
                  </div>
                </div>

                <div className="p-3 bg-primary-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-neutral-600">จำนวนเงินอนุมัติ</span>
                    <span className="text-xl font-bold text-primary-600">
                      ฿{report.approvedAmount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Metadata */}
              <div className="pt-3 border-t border-neutral-200 mb-4">
                <div className="flex items-center gap-4 text-xs text-neutral-500">
                  <span className="flex items-center gap-1">
                    <span className="material-icons-round text-xs">schedule</span>
                    สร้าง: {report.createdDate}
                  </span>
                  {report.sentDate && (
                    <span className="flex items-center gap-1">
                      <span className="material-icons-round text-xs">send</span>
                      ส่ง: {report.sentDate}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleExportPDF(report.id)}
                  className="btn-ghost flex-1 flex items-center justify-center gap-2"
                >
                  <span className="material-icons-round text-sm">download</span>
                  <span>ดาวน์โหลด PDF</span>
                </button>
                
                {activeTab === 'pending' && report.status === 'pending_send' && (
                  <button
                    onClick={() => handleSendReport(report.id)}
                    className="btn-primary flex-1 flex items-center justify-center gap-2"
                  >
                    <span className="material-icons-round text-sm">send</span>
                    <span>ส่งเอกสาร</span>
                  </button>
                )}
                
                {activeTab === 'pending' && report.status === 'draft' && (
                  <button
                    className="btn-outline flex-1 flex items-center justify-center gap-2"
                  >
                    <span className="material-icons-round text-sm">edit</span>
                    <span>แก้ไข</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Reports;