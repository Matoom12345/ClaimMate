const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');

// ดึงลูกค้าทั้งหมด
router.get('/', async (req, res) => {
    try {
        const customers = await Customer.find();
        res.json(customers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// เพิ่มลูกค้าใหม่
router.post('/', async (req, res) => {
    try {
        const { userID, firstName, lastName, email, phone, citizenID, phoneNumber } = req.body;

        const newCustomer = new Customer({
            userID,
            firstName,
            lastName,
            email,
            phone,
            citizenID,
            phoneNumber
        });

        await newCustomer.save();
        res.status(201).json(newCustomer);

    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// ดึงลูกค้ารายเดียว
router.get('/:id', async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.id);
        if (!customer) return res.status(404).json({ message: 'Customer not found' });
        res.json(customer);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// แก้ไขข้อมูลลูกค้า
router.put('/:id', async (req, res) => {
    try {
        const updatedCustomer = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedCustomer);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// ลบลูกค้า
router.delete('/:id', async (req, res) => {
    try {
        await Customer.findByIdAndDelete(req.params.id);
        res.json({ message: 'Customer deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;