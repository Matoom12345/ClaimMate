const express = require('express');
const router = express.Router();
const Claim = require('../models/Claim');

router.get('/', async (req, res) => {
    try {
        // 1️⃣ ดึงเคลมทั้งหมดจาก MongoDB
        const claims = await Claim.find().sort({ date: -1 });

        // 2️⃣ สรุปจำนวนตามสถานะ
        const total = claims.length;
        const active = claims.filter(c => c.status === 'repairing' || c.status === 'approved').length;
        const completed = claims.filter(c => c.status === 'completed').length;
        const pending = claims.filter(c => c.status === 'pending').length;

        // 3️⃣ เคลมที่ยัง active
        const activeClaims = claims
            .filter(c => c.status !== 'completed')
            .slice(0, 3); // เอาแค่ 3 รายการล่าสุด

        // 4️⃣ สร้างรายการการแจ้งเตือนจำลอง (หรือจะดึงจาก collection notifications ก็ได้)
        const recentNotifications = claims
            .slice(0, 3)
            .map((c, i) => ({
                id: i + 1,
                type: c.status === 'completed' ? 'success' : 'info',
                message:
                    c.status === 'completed'
                        ? `การเคลม ${c.claimNumber} เสร็จสิ้นแล้ว`
                        : `การเคลม ${c.claimNumber} อยู่ระหว่างดำเนินการ`,
                time: 'ไม่กี่นาทีที่แล้ว',
            }));

        // 5️⃣ ส่งข้อมูลทั้งหมดกลับไป frontend
        res.json({
            stats: { total, active, completed, pending },
            activeClaims,
            recentNotifications
        });
    } catch (err) {
        console.error('❌ Dashboard fetch failed:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;