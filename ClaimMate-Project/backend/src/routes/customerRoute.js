const express = require('express');
const router = express.Router();
const { Customer, User, Car, Policy } = require('../models');

/**
 * @route   GET /api/customers/search/by-idcard/:citizenId
 * @desc    ค้นหาข้อมูลลูกค้า (แก้ Name + ส่ง Balance)
 * @access  Private (Insurance)
 */
router.get('/search/by-idcard/:citizenId', async (req, res) => {
    const { citizenId } = req.params;

    if (!citizenId || citizenId.length !== 13) {
        return res.status(400).json({ message: 'กรุณากรอกเลขบัตรประชาชน 13 หลัก' });
    }

    try {
        const customer = await Customer.findOne({ where: { citizenId: citizenId } });
        if (!customer) {
            return res.status(404).json({ message: 'ไม่พบข้อมูลลูกค้า' });
        }

        const user = await User.findOne({ where: { id: customer.userId } });
        if (!user) {
            return res.status(404).json({ message: 'ไม่พบข้อมูลผู้ใช้งาน (User) ที่เชื่อมโยง' });
        }

        const cars = await Car.findAll({
            where: { customerId: customer.id },
            include: [
                {
                    model: Policy,
                    // ✅ [แก้ไข 1] เพิ่ม 'balance' เข้าไปใน attributes ที่ดึงมา
                    attributes: ['policyNumber', 'level', 'startDate', 'endDate', 'remainingBalance'],
                }
            ]
        });

        const userData = user.toJSON();

        const responseData = {
            ...customer.toJSON(),

            // ✅ [แก้ไข 2] รวมชื่อ (firstName + lastName) เป็น 'name'
            name: `${userData.firstName} ${userData.lastName}`,
            phone: userData.phone,
            email: userData.email,

            citizenID: customer.citizenId, // For PolicyReviewStep
            customerID: customer.id,       // For CreateClaim
            idCard: customer.citizenId,    // For CreateClaim

            vehicles: cars.map(car => {
                const policy = car.Policy ? car.Policy.toJSON() : {};

                return {
                    ...car.toJSON(),
                    carID: car.id,

                    policyNumber: policy.policyNumber || '-',
                    insuranceClass: policy.level || '3',
                    insuranceCreateAt: policy.startDate || '-',
                    insuranceExpireAt: policy.endDate || '-',

                    // ✅ [แก้ไข 3] ส่ง 'balance' จาก Policy ออกไป
                    balance: policy.remainingBalance || 0,

                    isPrimary: false,
                }
            })
        };

        res.status(200).json({ user: responseData });

    } catch (error) {
        console.error('Error searching customer:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;