const express = require('express');
const router = express.Router();
/**
 * @type {import('mongoose').Model}
 */
const User = require('../models/User');
const nodemailer = require('nodemailer');

// ✅ Mail Transport
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,      // Gmail
        pass: process.env.EMAIL_PASS, // App Password
    },
});

/* -------------------------------------------
   ✅   ส่ง OTP
-------------------------------------------- */
router.post('/send-otp', async (req, res) => {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
        return res.json({ success: false, message: 'ไม่พบอีเมลนี้ในระบบ' });
    }

    // ✅ Generate OTP (6 หลัก)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // ✅ Save OTP + Expire
    user.otp = otp;
    user.otpExpires = Date.now() + 1000 * 60 * 5;
    await user.save();

    // ✅ ส่งอีเมลจริง
    await transporter.sendMail({
        from: process.env.EMAIL,
        to: email,
        subject: "รหัส OTP สำหรับเข้าสู่ระบบ ClaimMate",
        html: `
            <h2>รหัส OTP ของคุณ</h2>
            <div style="font-size: 32px; font-weight: bold;">${otp}</div>
            <p>รหัสจะหมดอายุใน 5 นาที</p>
        `,
    });

    return res.json({ success: true, message: 'ส่ง OTP ไปยังอีเมลแล้ว' });
});


/* -------------------------------------------
   ✅   ตรวจสอบ OTP (Login)
-------------------------------------------- */
router.post('/verify-otp', async (req, res) => {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    console.log("USER KEYS ===> ", Object.keys(user._doc));
    console.log("🟡 VERIFY USER FROM DB ===>", user);

    if (!user || user.otp !== otp || user.otpExpires < new Date()) {
        return res.status(400).json({ success: false, message: 'รหัส OTP ไม่ถูกต้อง' });
    }

    // ✅ เคลียร์ OTP
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    // ✅ แปลง document -> plain object (สำคัญมาก)
    const data = user.toObject();
    console.log("✅ REAL DATA ===>", data);

    // ✅ ส่งข้อมูลกลับ (อ่านจาก data แทน user)
    let output = {
        role: data.role.toLowerCase(),
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: data.phoneNumber,
    };

    if (output.role === 'customer') {
        output.customerID = data.customerID;
    }
    else if (output.role === 'insurance') {
        output.insuranceID = data.insuranceID; // ✅ ตอนนี้มีชัวร์
        output.position = data.position;
    }
    else if (output.role === 'garage') {
        output.garageID = data.garageID;
        output.garageName = data.garageName;
    }

    console.log("✅ OUTPUT SENT:", output);
    return res.json({ success: true, user: output });
});

module.exports = router;