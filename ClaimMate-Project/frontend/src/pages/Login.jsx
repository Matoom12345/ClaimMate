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
                          onChange={(e) => setEmail(e.target.value)}
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