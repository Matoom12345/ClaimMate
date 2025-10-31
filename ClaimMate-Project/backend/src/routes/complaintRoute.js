const express = require("express");
const router = express.Router();
const Complaint = require("../models/Complaint");
const upload = require("../middlewares/upload"); // (memoryStorage)
const uploadImage = require("../utils/uploadToCloudinary");

/**
 * ✅ POST /api/complaint/
 * รับเรื่องร้องเรียนใหม่ (พร้อมไฟล์)
 */
router.post("/", upload.single("file"), async (req, res) => {
    try {
        const { claimNumber, type, head, detail } = req.body;

        if (!claimNumber || !type || !head || !detail) {
            return res.status(400).json({ success: false, message: "ข้อมูลไม่ครบถ้วน" });
        }

        if (!req.file) {
            return res.status(400).json({ success: false, message: "กรุณาแนบไฟล์หลักฐาน" });
        }

        // 1. สร้าง Instance (ยังไม่ save) เพื่อให้ pre-validate hook ทำงาน
        const complaint = new Complaint({
            claimNumber,
            type,
            head,
            detail,
            // fileURL: "temp" // ใส่ค่าชั่วคราว (แต่ไม่จำเป็น เพราะเราจะ assign ก่อน save)
        });

        // (ตอนนี้ complaint.complaintID ถูกสร้างแล้วโดย pre-validate)

        // 2. กำหนดชื่อไฟล์บน Cloudinary
        // Format: {complaintID}-{claimNumber}
        const publicId = `${complaint.complaintID}-${complaint.claimNumber}`;
        const folder = "complaint"; // ⭐️ ชื่อ folder ตามที่กำหนด

        // 3. อัปโหลดไฟล์ (Buffer)
        const result = await uploadImage(
            req.file.buffer,
            folder,
            publicId
        );

        // 4. อัปเดต fileURL และบันทึกลง DB
        complaint.fileURL = result.secure_url;
        await complaint.save();

        res.json({ success: true, complaint });

    } catch (error) {
        console.error("CREATE COMPLAINT ERROR:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * ✅ GET /api/complaint/customer/:customerID
 * ดึงประวัติการร้องเรียนของลูกค้า
 */
router.get("/customer/:customerID", async (req, res) => {
    try {
        const { customerID } = req.params;

        // ค้นหา Claim ทั้งหมดของ Customer คนนี้
        const customerClaims = await mongoose.model('Claim').find({ customerID }).select('claimNumber');
        const claimNumbers = customerClaims.map(c => c.claimNumber);

        // ค้นหา Complaint ที่มี claimNumber ตรงกับ list นั้น
        const history = await Complaint.find({
            claimNumber: { $in: claimNumbers }
        }).sort({ createdAt: -1 });

        res.json({ success: true, history });

    } catch (error) {
        console.error("GET COMPLAINT HISTORY ERROR:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
});


module.exports = router;