import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input, TextArea } from '../../components';

/**
 * CreateClaim - หน้าเปิดเคสเคลมใหม่
 * 
 * Features:
 * 1. ค้นหาลูกค้าจากเลขบัตรประชาชน (Mock Database)
 * 2. กรอกข้อมูลเหตุการณ์
 * 3. เปิดเคสใหม่
 */
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

  const priorityOptions = [
    { value: 'urgent', label: 'ด่วนมาก', icon: 'priority_high' },
    { value: 'high', label: 'ด่วน', icon: 'arrow_upward' },
    { value: 'normal', label: 'ปกติ', icon: 'remove' },
  ];

  // MOCK DATABASE
  const mockCustomerDatabase = {
    '1234567890123': {
      idCard: '1-2345-67890-12-3',
      name: 'นายสมชาย ใจดี',
      phone: '081-234-5678',
      email: 'somchai@example.com',
      policyNumber: 'POL-2024-001234',
      vehicles: [
        {
          id: '1',
          brand: 'Honda',
          model: 'City',
          year: 2020,
          licensePlate: 'กข 1234 กรุงเทพ',
          chassisNumber: 'JHMC12345678',
          color: 'ขาว',
          isPrimary: true,
        },
        {
          id: '2',
          brand: 'Toyota',
          model: 'Yaris',
          year: 2019,
          licensePlate: 'คง 5678 กรุงเทพ',
          chassisNumber: 'TYMC98765432',
          color: 'เทา',
          isPrimary: false,
        }
      ]
    },
    '9876543210987': {
      idCard: '9-8765-43210-98-7',
      name: 'นางสุดา รักษ์ดี',
      phone: '082-345-6789',
      email: 'suda@example.com',
      policyNumber: 'POL-2024-005678',
      vehicles: [
        {
          id: '1',
          brand: 'Toyota',
          model: 'Yaris',
          year: 2021,
          licensePlate: 'งง 5678 กรุงเทพ',
          chassisNumber: 'TYMC55555555',
          color: 'แดง',
          isPrimary: true,
        }
      ]
    },
    '5555555555555': {
      idCard: '5-5555-55555-55-5',
      name: 'นายประเสริฐ มั่นคง',
      phone: '083-456-7890',
      email: 'prasert@example.com',
      policyNumber: 'POL-2024-009999',
      vehicles: [
        {
          id: '1',
          brand: 'Mazda',
          model: 'CX-5',
          year: 2022,
          licensePlate: 'ฮฮ 9999 กรุงเทพ',
          chassisNumber: 'MZDA99999999',
          color: 'น้ำเงิน',
          isPrimary: true,
        },
        {
          id: '2',
          brand: 'Honda',
          model: 'CR-V',
          year: 2020,
          licensePlate: 'จจ 1111 กรุงเทพ',
          chassisNumber: 'JHMC11111111',
          color: 'ดำ',
          isPrimary: false,
        }
      ]
    }
  };

  const handleSearchCustomer = async () => {
    const cleanIdCard = formData.idCard.replace(/-/g, '');
    
    if (!cleanIdCard || cleanIdCard.length !== 13) {
      setErrors({ idCard: 'กรุณากรอกเลขบัตรประชาชน 13 หลัก' });
      return;
    }
    
    setSearchingCustomer(true);
    setErrors({});
    
    setTimeout(() => {
      const customer = mockCustomerDatabase[cleanIdCard];
      
      if (customer) {
        setCustomerFound(customer);
      } else {
        setErrors({ idCard: 'ไม่พบข้อมูลลูกค้า กรุณาตรวจสอบเลขบัตรประชาชนอีกครั้ง' });
        setCustomerFound(null);
      }
      
      setSearchingCustomer(false);
    }, 800);
  };

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
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !customerFound) {
      e.preventDefault();
      handleSearchCustomer();
    }
  };

  const handleQuickSearch = (idCard) => {
    setFormData(prev => ({ ...prev, idCard }));
    setErrors({});
    
    setTimeout(() => {
      const cleanIdCard = idCard.replace(/-/g, '');
      setSearchingCustomer(true);
      
      setTimeout(() => {
        const customer = mockCustomerDatabase[cleanIdCard];
        
        if (customer) {
          setCustomerFound(customer);
        } else {
          setErrors({ idCard: 'ไม่พบข้อมูลลูกค้า' });
          setCustomerFound(null);
        }
        
        setSearchingCustomer(false);
      }, 800);
    }, 100);
  };

  const validate = () => {
    const newErrors = {};
    
    if (!customerFound) {
      newErrors.idCard = 'กรุณาค้นหาข้อมูลลูกค้าก่อน';
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setSubmitting(true);
    
    setTimeout(() => {
      const claimId = 'CLM-2024-' + Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      setNewClaimId(claimId);
      setSubmitting(false);
      setShowSuccessModal(true);
    }, 1500);
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    navigate('/insurance');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-neutral-500 hover:text-primary-500 mb-3 transition-colors duration-300"
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
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* ค้นหาลูกค้า */}
          <div className="card-static">
            <h2 className="text-xl font-semibold text-neutral-dark mb-4 flex items-center gap-2">
              <span className="material-icons-round text-primary-500">search</span>
              <span>ค้นหาข้อมูลลูกค้า</span>
            </h2>
            
            {!customerFound ? (
              <div>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <Input
                      label="เลขบัตรประชาชน"
                      name="idCard"
                      value={formData.idCard}
                      onChange={handleChange}
                      onKeyPress={handleKeyPress}
                      placeholder="1234567890123"
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
                
                <div className="mt-4 space-y-3">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-neutral-700">
                      <span className="material-icons-round text-sm mr-1 align-middle text-info">info</span>
                      กรอกเลขบัตรประชาชน 13 หลัก หรือคลิกปุ่มด้านล่างเพื่อทดสอบ
                    </p>
                  </div>
                  
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-sm font-semibold text-amber-800 mb-3">
                      💡 ทดสอบด้วยเลขบัตรเหล่านี้ (คลิกเพื่อค้นหา):
                    </p>
                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={() => handleQuickSearch('1234567890123')}
                        className="w-full flex items-center justify-between p-3 bg-white hover:bg-amber-100 rounded-lg transition-colors duration-200 text-left"
                        disabled={searchingCustomer}
                      >
                        <div>
                          <code className="text-sm font-semibold text-amber-900">1234567890123</code>
                          <p className="text-xs text-amber-700 mt-1">นายสมชาย ใจดี • Honda City, Toyota Yaris</p>
                        </div>
                        <span className="material-icons-round text-amber-600">arrow_forward</span>
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => handleQuickSearch('9876543210987')}
                        className="w-full flex items-center justify-between p-3 bg-white hover:bg-amber-100 rounded-lg transition-colors duration-200 text-left"
                        disabled={searchingCustomer}
                      >
                        <div>
                          <code className="text-sm font-semibold text-amber-900">9876543210987</code>
                          <p className="text-xs text-amber-700 mt-1">นางสุดา รักษ์ดี • Toyota Yaris</p>
                        </div>
                        <span className="material-icons-round text-amber-600">arrow_forward</span>
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => handleQuickSearch('5555555555555')}
                        className="w-full flex items-center justify-between p-3 bg-white hover:bg-amber-100 rounded-lg transition-colors duration-200 text-left"
                        disabled={searchingCustomer}
                      >
                        <div>
                          <code className="text-sm font-semibold text-amber-900">5555555555555</code>
                          <p className="text-xs text-amber-700 mt-1">นายประเสริฐ มั่นคง • Mazda CX-5, Honda CR-V</p>
                        </div>
                        <span className="material-icons-round text-amber-600">arrow_forward</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center">
                      <span className="material-icons-round text-2xl text-success">check_circle</span>
                    </div>
                    <div>
                      <p className="text-sm text-success font-medium">พบข้อมูลลูกค้า</p>
                      <p className="text-xs text-neutral-500">เลขบัตรประชาชน: {customerFound.idCard}</p>
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-neutral-50 rounded-lg mb-4">
                  <div>
                    <p className="text-xs text-neutral-500 mb-1">ชื่อ-นามสกุล</p>
                    <p className="font-semibold text-neutral-dark">{customerFound.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500 mb-1">เบอร์โทรศัพท์</p>
                    <p className="font-semibold text-neutral-dark">{customerFound.phone}</p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500 mb-1">อีเมล</p>
                    <p className="font-semibold text-neutral-dark">{customerFound.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500 mb-1">เลขกรมธรรม์</p>
                    <p className="font-semibold text-primary-600">{customerFound.policyNumber}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-neutral-700 mb-3">รถยนต์ที่ทำประกัน</p>
                  <div className="space-y-2">
                    {customerFound.vehicles.map(vehicle => (
                      <div key={vehicle.id} className="p-3 border-2 border-neutral-200 rounded-lg hover:border-primary-300 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="material-icons-round text-neutral-400">directions_car</span>
                            <div>
                              <p className="font-medium text-neutral-dark">
                                {vehicle.brand} {vehicle.model} ({vehicle.year})
                              </p>
                              <p className="text-sm text-neutral-500">
                                ทะเบียน: {vehicle.licensePlate} • สี: {vehicle.color}
                              </p>
                            </div>
                          </div>
                          {vehicle.isPrimary && (
                            <span className="badge badge-primary badge-sm">หลัก</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ข้อมูลเหตุการณ์ */}
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
                  placeholder="123 ถนนประชาราษฎร์ แขวงห้วยขวาง เขตห้วยขวาง กรุงเทพมหานคร"
                  icon="location_on"
                  required
                  error={errors.location}
                />
                
                <TextArea
                  label="รายละเอียดเหตุการณ์"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="อธิบายเหตุการณ์ที่เกิดขึ้น เช่น ชนด้านหน้าจากรถที่วิ่งสวนทาง..."
                  rows={6}
                  required
                  error={errors.description}
                />
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {customerFound && (
            <div className="card-static">
              <h3 className="font-semibold text-neutral-dark mb-4 flex items-center gap-2">
                <span className="material-icons-round text-primary-500">flag</span>
                <span>ระดับความเร่งด่วน</span>
              </h3>
              
              <div className="space-y-2">
                {priorityOptions.map(option => (
                  <label
                    key={option.value}
                    className={`
                      flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all duration-300
                      ${formData.priority === option.value
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-neutral-200 hover:border-primary-300'
                      }
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
                    <span className={`
                      material-icons-round
                      ${formData.priority === option.value
                        ? 'text-primary-600'
                        : 'text-neutral-400'
                      }
                    `}>
                      {option.icon}
                    </span>
                    <span className={`
                      flex-1 font-medium text-sm
                      ${formData.priority === option.value
                        ? 'text-primary-700'
                        : 'text-neutral-700'
                      }
                    `}>
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

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

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 animate-scale-in">
            <div className="text-center">
              <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-icons-round text-5xl text-success">
                  check_circle
                </span>
              </div>
              <h2 className="text-2xl font-bold text-neutral-dark mb-2">
                เปิดเคสสำเร็จ!
              </h2>
              <p className="text-neutral-600 mb-1">
                เลขที่เคลม
              </p>
              <p className="text-2xl font-bold text-primary-600 mb-6">
                {newClaimId}
              </p>
              <div className="p-4 bg-blue-50 rounded-lg text-left mb-6">
                <p className="text-sm text-neutral-700">
                  <span className="material-icons-round text-sm mr-1 align-middle text-info">info</span>
                  พนักงานสามารถลงพื้นที่ตรวจสอบและอัปโหลดรายงานได้ทันที
                </p>
              </div>
              <button
                onClick={handleCloseSuccessModal}
                className="btn-primary w-full"
              >
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