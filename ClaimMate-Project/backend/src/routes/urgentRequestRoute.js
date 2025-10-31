const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload"); // (memoryStorage)
const uploadImage = require("../utils/uploadToCloudinary"); // (util ที่แก้ไขแล้ว)
const UrgentRequest = require("../models/urgentRequest");

/* =====================================================
   ✅ 1) สร้างคำขอซ่อมด่วน (POST)
===================================================== */
// ใช้ upload.single("file") เพราะรับแค่ไฟล์เดียว
router.post("/", upload.single("file"), async (req, res) => {
    try {
        const { claimNumber, type, detail } = req.body;

        // 1. ตรวจสอบข้อมูล Text
        if (!claimNumber || !type || !detail) {
            return res.status(400).json({ success: false, message: "ข้อมูลไม่ครบ (claimNumber, type, detail)" });
        }

        // 2. ตรวจสอบไฟล์
        if (!req.file) {
            return res.status(400).json({ success: false, message: "ไม่พบไฟล์แนบ" });
        }

        // 3. อัปโหลดไป Cloudinary
        const folder = "urgent_requests"; // โฟลเดอร์ตามที่กำหนด
        // ชื่อไฟล์ตามที่กำหนด: urgentRequest-{claimNumber}
        const publicId = `urgentRequest-${claimNumber}`;

        const result = await uploadImage(
            req.file.buffer,
            folder,
            publicId // ส่ง publicId ที่เราสร้าง
        );

        // 4. บันทึกลง DB
        const newRequest = await UrgentRequest.create({
            claimNumber,
            type,
            detail,
            fileURL: result.secure_url // บันทึก URL จาก Cloudinary
        });

        return res.status(201).json({ success: true, data: newRequest });

    } catch (error) {
        console.error("CREATE URGENT REQUEST ERROR:", error);

        // 11000 = duplicate key error (จาก claimNumber ที่เป็น unique)
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "ไม่สามารถส่งคำขอซ้ำสำหรับใบเคลมนี้ได้",
                code: 11000 // ส่ง code นี้ไปให้ Frontend check
            });
        }

        return res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;