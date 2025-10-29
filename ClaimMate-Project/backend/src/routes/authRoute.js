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

    if (!user || user.otp !== otp || user.otpExpires < new Date()) {
        return res.status(400).json({ success: false, message: 'รหัส OTP ไม่ถูกต้อง' });
    }

    // ✅ เคลียร์ OTP
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    // ✅ ส่งข้อมูลกลับ
    let output = {
        role: user.role.toLowerCase(),        // ✅ แปลง role เป็น lowercase
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
    };

    if (output.role === 'customer') {
        output.id = user.customerID;
    }
    else if (output.role === 'insurance') {
        output.id = user.insuranceID;
        output.position = user.position;
    }
    else if (output.role === 'garage') {
        output.id = user.garageID;
        output.garageName = user.garageName;
    }

    return res.json({ success: true, user: output });
});

module.exports = router;