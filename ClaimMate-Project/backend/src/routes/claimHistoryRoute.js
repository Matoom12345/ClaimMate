const express = require('express');
const router = express.Router();
const ClaimHistory = require('../models/ClaimHistory');

// สร้างประวัติ 1 รายการ
router.post('/create', async (req, res) => {
    try {
        // body ต้องมี: { claimNumber, state, reportedDate }
        const hist = await ClaimHistory.create(req.body);
        res.status(201).json(hist);
    } catch (err) {
        console.error('Create claim history error:', err);
        res.status(400).json({ message: err.message });
    }
});

// ดูประวัติทั้งหมดของเคลมหนึ่ง ๆ (timeline)
router.get('/by-claim/:claimNumber', async (req, res) => {
    try {
        const { claimNumber } = req.params;
        const items = await ClaimHistory
            .find({ claimNumber })
            .sort({ reportedDate: 1 }); // เก่า → ใหม่
        res.json(items);
    } catch (err) {
        console.error('Fetch history error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// เอาเฉพาะ entry ล่าสุดของเคลม
router.get('/latest', async (req, res) => {
    try {
        const { claimNumber } = req.query;
        if (!claimNumber) return res.status(400).json({ message: 'claimNumber is required' });

        const latest = await ClaimHistory
            .findOne({ claimNumber })
            .sort({ reportedDate: -1 }); // ใหม่สุด
        res.json(latest || null);
    } catch (err) {
        console.error('Fetch latest history error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;