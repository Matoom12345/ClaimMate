const express = require('express');
const router = express.Router();
const Garage = require('../models/Garage');

// GET: ดึงอู่ทั้งหมด
router.get('/', async (req, res) => {
    try {
        const garages = await Garage.find();
        res.json(garages);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST: เพิ่มอู่ใหม่
router.post('/', async (req, res) => {
    try {
        const { userID, firstName, lastName, email, phone, garageName, location, phoneNumber } = req.body;

        const newGarage = new Garage({
            userID,
            firstName,
            lastName,
            email,
            phone,
            garageName,
            location,
            phoneNumber
        });

        await newGarage.save();
        res.status(201).json(newGarage);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// GET: ดึงอู่ตาม ID
router.get('/:id', async (req, res) => {
    try {
        const garage = await Garage.findById(req.params.id);
        if (!garage) return res.status(404).json({ message: 'Garage not found' });
        res.json(garage);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT: แก้ไขข้อมูลอู่
router.put('/:id', async (req, res) => {
    try {
        const updatedGarage = await Garage.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedGarage);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// DELETE: ลบอู่
router.delete('/:id', async (req, res) => {
    try {
        await Garage.findByIdAndDelete(req.params.id);
        res.json({ message: 'Garage deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;