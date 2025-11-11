import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import Button from '../components/Button';
import Input from '../components/Input';
import OTPInput from '../components/OTPInput';
import Card from '../components/Card';

const Login = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1 = Email, 2 = OTP
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);

  // ✅ ส่ง OTP ไป backend
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.includes('@')) {
      setError('กรุณากรอกอีเมลให้ถูกต้อง');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post('http://localhost:3000/api/auth/send-otp', { email });

      if (res.data.success) {
        setStep(2);
        setCountdown(60);

        // countdown timer
        const timer = setInterval(() => {
          setCountdown(prev => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        setError(res.data.message);
      }

    } catch (err) {
      setError('เกิดข้อผิดพลาดจากเซิร์ฟเวอร์');
    } finally {
      setLoading(false);
    }
  };

  // ✅ verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');

    if (otp.length !== 6) {
      setError('กรุณากรอกรหัส OTP 6 หลัก');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post('http://localhost:3000/api/auth/verify-otp', {
        email,
        otp,
      });

      if (res.data.success) {
        const user = res.data.user;

        // ✅ เก็บ user ลง localStorage
        localStorage.setItem('claimmate_user', JSON.stringify(user));

        // ✅ Redirect ตาม role
        const roleRoutes = {
          customer: '/customer/dashboard',
          insurance: '/insurance/claims/active',
          garage: '/garage',
        };

        navigate(roleRoutes[user.role] || "/");
      } else {
        setError(res.data.message);
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาดขณะยืนยัน OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = () => {
    if (countdown > 0) return;
    handleSendOTP({ preventDefault: () => {} });
  };

  return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Background Decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-200/20 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary-200/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Navbar */}
      <nav className="relative z-[100] bg-white/80 backdrop-blur-md border-b border-neutral-200 sticky top-0 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center shadow-lg">
                <span className="material-icons-round text-white text-2xl">shield</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gradient-primary">ClaimMate</h1>
                <p className="text-xs text-neutral-500">แจ้งไว เคลมง่าย อุ่นใจทุกการชน</p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-neutral-600 hover:text-primary-600 font-medium transition-colors">คุณสมบัติ</a>
              <a href="#how-it-works" className="text-neutral-600 hover:text-primary-600 font-medium transition-colors">วิธีใช้งาน</a>
              <a href="#login" className="btn-primary">เข้าสู่ระบบ</a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 container mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Content */}
          <div className="space-y-6 animate-fade-in">
            <div className="inline-block px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold">
              🚗 ระบบจัดการเคลมประกันออนไลน์
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold text-neutral-900 leading-tight">
              แจ้งเคลม<br/>
              <span className="text-gradient-primary">ง่ายกว่าที่เคย</span>
            </h1>
            <p className="text-xl text-neutral-600 leading-relaxed">
              ระบบจัดการเคลมประกันรถยนต์ที่ทันสมัย เชื่อมโยงลูกค้า บริษัทประกัน และอู่ซ่อม ให้การเคลมเป็นเรื่องง่าย รวดเร็ว และโปร่งใส
            </p>
            
            {/* Features List */}
            <div className="grid grid-cols-2 gap-4 pt-4">
              {[
                { icon: 'speed', text: 'ประมวลผลรวดเร็ว' },
                { icon: 'verified_user', text: 'ปลอดภัย เชื่อถือได้' },
                { icon: 'visibility', text: 'ติดตามสถานะแบบเรียลไทม์' },
                { icon: 'groups', text: 'เชื่อมต่อทุกฝ่าย' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="material-icons-round text-primary-600">{item.icon}</span>
                  </div>
                  <span className="text-neutral-700 font-medium">{item.text}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-4 pt-4">
              <Button variant="primary" size="lg" icon="arrow_forward" iconPosition="right" onClick={() => document.getElementById('login').scrollIntoView({ behavior: 'smooth' })}>
                เริ่มต้นใช้งาน
              </Button>
              <Button variant="outline" size="lg" icon="play_circle" onClick={() => document.getElementById('how-it-works').scrollIntoView({ behavior: 'smooth' })}>
                ดูวิธีใช้งาน
              </Button>
            </div>
          </div>

          {/* Right: Image/Illustration */}
          <div className="relative animate-float">
            <div className="relative z-10 bg-white rounded-3xl shadow-2xl p-8">
              <img 
                src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&auto=format&fit=crop" 
                alt="Car Insurance"
                className="w-full rounded-2xl"
              />
              {/* Floating Stats */}
              <div className="absolute -top-4 -left-4 bg-white rounded-xl shadow-lg p-4 animate-bounce" style={{ animationDuration: '3s' }}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="material-icons-round text-green-600">check_circle</span>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-neutral-900">98%</p>
                    <p className="text-xs text-neutral-500">ความพึงพอใจ</p>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 bg-white rounded-xl shadow-lg p-4 animate-bounce" style={{ animationDuration: '3s', animationDelay: '0.5s' }}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="material-icons-round text-blue-600">schedule</span>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-neutral-900">24 ชม.</p>
                    <p className="text-xs text-neutral-500">เฉลี่ยการอนุมัติ</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 bg-white py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-neutral-900 mb-4">คุณสมบัติเด่น</h2>
            <p className="text-xl text-neutral-600">ทุกสิ่งที่คุณต้องการสำหรับการเคลมที่สมบูรณ์แบบ</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: 'person',
                color: 'blue',
                title: 'สำหรับลูกค้า',
                desc: 'ติดตามสถานะเคลม เลือกอู่ซ่อม และดาวน์โหลดเอกสารได้ง่ายๆ',
                features: ['ติดตามสถานะแบบเรียลไทม์', 'เลือกอู่ซ่อมที่ใกล้ที่สุด', 'ดาวน์โหลดเอกสาร PDF']
              },
              {
                icon: 'business',
                color: 'indigo',
                title: 'สำหรับบริษัทประกัน',
                desc: 'จัดการเคส อนุมัติรายการ และวิเคราะห์ข้อมูลได้อย่างมีประสิทธิภาพ',
                features: ['จัดการเคสอย่างเป็นระบบ', 'อนุมัติรายการรวดเร็ว', 'วิเคราะห์ต้นทุนเคลม']
              },
              {
                icon: 'build',
                color: 'teal',
                title: 'สำหรับอู่ซ่อม',
                desc: 'รับงานซ่อม อัพเดทสถานะ และขออนุมัติรายการเพิ่มเติมได้สะดวก',
                features: ['รับงานซ่อมออนไลน์', 'อัพเดทสถานะการซ่อม', 'ขออนุมัติรายการเพิ่ม']
              },
            ].map((feature, idx) => (
              <Card key={idx} hoverable className="!p-8 group">
                <div className={`w-16 h-16 bg-${feature.color}-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <span className={`material-icons-round text-${feature.color}-600 text-3xl`}>{feature.icon}</span>
                </div>
                <h3 className="text-2xl font-bold text-neutral-900 mb-3">{feature.title}</h3>
                <p className="text-neutral-600 mb-6">{feature.desc}</p>
                <ul className="space-y-2">
                  {feature.features.map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-neutral-700">
                      <span className="material-icons-round text-success text-sm">check_circle</span>
                      <span className="text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="relative z-10 py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-neutral-900 mb-4">วิธีใช้งาน</h2>
            <p className="text-xl text-neutral-600">เพียง 4 ขั้นตอนง่ายๆ</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '1', icon: 'phone_in_talk', title: 'แจ้งเคลม', desc: 'โทรแจ้งเคลมกับบริษัทประกันภัย' },
              { step: '2', icon: 'fact_check', title: 'ตรวจสอบ', desc: 'เจ้าหน้าที่ตรวจสอบความเสียหายและสร้างเอกสาร' },
              { step: '3', icon: 'build_circle', title: 'ซ่อม', desc: 'เลือกอู่และนำรถเข้าซ่อม' },
              { step: '4', icon: 'celebration', title: 'เสร็จสิ้น', desc: 'รับรถคืนพร้อมประเมินความพึงพอใจ' },
            ].map((item, idx) => (
              <div key={idx} className="relative text-center group">
                {idx < 3 && (
                  <div className="hidden md:block absolute top-12 left-1/2 w-full h-0.5 bg-gradient-to-r from-primary-500 to-primary-300"></div>
                )}
                <div className="relative">
                  <div className="w-24 h-24 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-glow-primary group-hover:scale-110 transition-transform duration-300">
                    <span className="material-icons-round text-white text-4xl">{item.icon}</span>
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-primary-500">
                    <span className="text-primary-600 font-bold">{item.step}</span>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-neutral-900 mb-2">{item.title}</h3>
                <p className="text-neutral-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

        {/* Login Section */}
        <section id="login" className="relative z-20 py-20 bg-gradient-to-br from-primary-50 to-secondary-50">
          <div className="container mx-auto px-6">
            <div className="max-w-md mx-auto">
              <Card className="!p-8 backdrop-blur-sm bg-white/90">

                {step === 1 ? (
                    // ✅ STEP 1: EMAIL
                    <form onSubmit={handleSendOTP} className="space-y-6">
                      <div className="text-center">
                        <h2 className="text-3xl font-bold text-neutral-dark mb-2">เข้าสู่ระบบ</h2>
                        <p className="text-neutral-500">กรอกอีเมลเพื่อรับรหัส OTP</p>
                      </div>

                      <Input
                          type="email"
                          label="อีเมล"
                          placeholder="your@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value.trim())}
                          error={error}
                          icon="email"
                          required
                      />

                      <Button
                          type="submit"
                          variant="primary"
                          fullWidth
                          loading={loading}
                          icon="arrow_forward"
                          iconPosition="right"
                      >
                        ส่งรหัส OTP
                      </Button>
                    </form>
                ) : (
                    // ✅ STEP 2: OTP
                    <form onSubmit={handleVerifyOTP} className="space-y-6">

                      <div className="text-center">
                        <h2 className="text-2xl font-bold">กรอกรหัส OTP</h2>
                        <p className="text-neutral-500">รหัสถูกส่งไปยัง</p>
                        <p className="text-primary-600 font-semibold text-lg">{email}</p>
                      </div>

                      <OTPInput
                          value={otp}
                          onChange={setOtp}
                          error={error}
                          disabled={loading}
                      />

                      <Button
                          type="submit"
                          variant="primary"
                          fullWidth
                          loading={loading}
                          icon="check_circle"
                      >
                        ยืนยัน OTP
                      </Button>

                      <div className="text-center">
                        {countdown > 0 ? (
                            <p className="text-neutral-500 text-sm">
                              ส่งรหัสอีกครั้งใน {countdown} วินาที
                            </p>
                        ) : (
                            <button type="button" onClick={handleResendOTP} className="text-primary-600 text-sm">
                              ส่งรหัสอีกครั้ง
                            </button>
                        )}
                      </div>

                      <button
                          type="button"
                          onClick={() => { setStep(1); setOtp(''); setError(''); }}
                          className="text-neutral-500 text-sm hover:text-neutral-700 w-full flex items-center justify-center"
                      >
                        เปลี่ยนอีเมล
                      </button>
                    </form>
                )}

              </Card>
            </div>
          </div>
        </section>
      </div>
  );
};

export default Login;