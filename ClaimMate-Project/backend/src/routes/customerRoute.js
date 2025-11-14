const express = require('express');
const router = express.Router();
const { Customer, User, Car, Policy, ChooseGarageRequest, Claim, ClaimStatus, sequelize, Garage } = require('../models');
const authenticate = require('../middlewares/authenticate');


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

/**
 * @route   POST /api/customer/claims/:claimId/select-garage
 * @desc    (P13) ลูกค้ายืนยันการเลือกอู่
 * @access  Private (Customer)
 */
router.post('/claims/:claimId/select-garage', authenticate, async (req, res) => {
  const { claimId } = req.params;
  const { garageId } = req.body; // หน้า SelectGarage ต้องส่ง garageId มาใน body

  try {
    // 1. ค้นหา Customer ID จาก User ที่ล็อกอิน
    const customer = await Customer.findOne({ where: { userId: req.user.id } });
    if (!customer) {
      return res.status(403).json({ message: 'ไม่พบข้อมูลลูกค้า' });
    }

    const t = await sequelize.transaction();

    try {
      // 2. ตรวจสอบว่า Claim นี้เป็นของ Customer คนนี้จริง
      const claim = await Claim.findOne({ 
        where: { id: claimId, customerId: customer.id },
        transaction: t 
      });

      if (!claim) {
        await t.rollback();
        return res.status(404).json({ message: 'ไม่พบเคสเคลมนี้ หรือคุณไม่มีสิทธิ์' });
      }

      // 3. ตรวจสอบว่ามีคำขอที่ค้าง (pending) อยู่กับอู่อื่นหรือไม่
      const existingRequest = await ChooseGarageRequest.findOne({
        where: { claimId: claimId, garageStatus: 'pending' },
        transaction: t
      });

      if (existingRequest) {
        await t.rollback();
        return res.status(400).json({ message: 'คุณได้ส่งคำขอเลือกอู่ไปแล้ว กำลังรออู่ยืนยัน' });
      }

      // 4. สร้างคำขอใหม่ (ChooseGarageRequest) เพื่อส่งให้ Garage
      await ChooseGarageRequest.create({
        claimId: claimId,
        garageId: garageId,
        garageStatus: 'pending', // สถานะนี้ที่หน้า GaragePending จะเห็น
        requestDate: new Date(),
      }, { transaction: t });

      // (เราจะไม่เปลี่ยนสถานะ ClaimStatus ตอนนี้
      //  เราจะรอให้ Garage กด "รับงาน" ก่อน สถานะถึงจะเปลี่ยนเป็น 'repair')

      await t.commit();
      res.status(201).json({ success: true, message: 'ส่งคำขอไปยังอู่เรียบร้อย' });

    } catch (err) {
      await t.rollback();
      throw err;
    }

  } catch (error) {
    console.error('Error selecting garage:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   GET /api/customer/garages
 * @desc    (P13) ดึงรายชื่ออู่ซ่อมทั้งหมด
 * @access  Private (Customer)
 */
router.get('/garages', authenticate, async (req, res) => {
  try {
    // ⭐️ (2) ดึงข้อมูลอู่ทั้งหมดจาก Model 'Garage'
    const garages = await Garage.findAll({
      attributes: [
        'id', 
        'garageName', 
        'address', 
        'googleMapsUrl', 
        'photoURL',
      ]
    });

    res.status(200).json(garages); // ⭐️ (3) ส่งข้อมูล (Array) กลับไป

  } catch (error) {
    console.error('Error fetching garages:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;