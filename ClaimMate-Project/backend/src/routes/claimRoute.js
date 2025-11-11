const express = require('express');
const router = express.Router();
const { Claim, ClaimStatus } = require('../models'); // นำเข้า Model ที่เกี่ยวข้อง

/**
 * @route   POST /api/claims
 * @desc    สร้างเคสเคลมใหม่
 * @access  Private (Insurance)
 */
router.post('/', async (req, res) => {
    const {
        customerID,
        insuranceID,
        carID,
        location,
        detail,
        priorityLevel, // สังเกตว่า frontend ส่ง priorityLevel แต่ model ไม่มี
        incidentDate,
    } = req.body;

    // TODO: ควรมีการตรวจสอบ validation ของข้อมูลที่รับมา

    try {
        // 1. สร้าง Claim หลัก
        const newClaim = await Claim.create({
            customerId: customerID,
            insuranceId: insuranceID,
            carId: carID,
            location: location,
            detail: detail,
            incidentDate: incidentDate,
            // estimateCost, additionalCost, approvedCost มีค่า default 0
        });

        // 2. สร้างสถานะเริ่มต้น (เช่น 'รอดำเนินการ')
        // (เราต้องใช้ Model 'ClaimStatus' ที่เชื่อมกัน)
        await ClaimStatus.create({
            claimId: newClaim.id,
            status: 'pending', // หรือ 'reported'
            notes: 'เคสถูกสร้างผ่านระบบโดยเจ้าหน้าที่ประกัน',
            // priorityLevel: priorityLevel, // (ถ้า ClaimStatus model มี field นี้)
        });

        // TODO: Frontend คาดหวัง claimNumber แต่ Claim model ไม่มี field นี้
        // เราจะส่ง id กลับไปแทน
        res.status(201).json({
            message: 'Claim created successfully',
            claim: { ...newClaim.toJSON(), claimNumber: `CLM-${newClaim.id}` } // สร้าง claimNumber จำลอง
        });

    } catch (error) {
        console.error('Error creating claim:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;