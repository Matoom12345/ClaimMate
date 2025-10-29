// src/routes/carRoutes.js
const express = require('express');
const router = express.Router();
const CarRoute = require('../models/Car');

// เพิ่มรถใหม่
router.post('/create', async (req, res) => {
    try {
        const newCar = new CarRoute(req.body);
        await newCar.save();
        res.status(201).json(newCar);
    } catch (err) {
        console.error('Error creating car:', err);
        res.status(400).json({ message: err.message });
    }
});

// ดูรถทั้งหมด
router.get('/all', async (req, res) => {
    try {
        const cars = await CarRoute.find().populate('customerID', 'firstName lastName email');
        res.json(cars);
    } catch (err) {
        console.error('Error fetching cars:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// ดูรถเฉพาะของลูกค้าคนหนึ่ง
router.get('/customer/:customerID', async (req, res) => {
    try {
        const cars = await CarRoute.find({ customerID: req.params.customerID });
        res.json(cars);
    } catch (err) {
        console.error('Error fetching customer cars:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;