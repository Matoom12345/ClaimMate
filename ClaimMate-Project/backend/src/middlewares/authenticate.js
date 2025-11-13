// matoom12345/claimmate/ClaimMate-develop/ClaimMate-Project/backend/src/middlewares/authenticate.js

const jwt = require('jsonwebtoken');
const { User } = require('../models'); // เราจะใช้ User model เพื่อค้นหาเจ้าของ token

/**
 * นี่คือ Middleware หรือ "ยาม" ของเรา
 * - ตรวจสอบว่ามี Token ส่งมาใน Header (Authorization) หรือไม่
 * - ตรวจสอบว่า Token นั้นถูกต้อง (verify) หรือไม่
 * - ถ้าถูกต้อง, ค้นหา user จากใน database
 * - ถ้าเจอ, แนบข้อมูล user (req.user) ไปกับ request เพื่อให้ Route ใช้งานต่อได้
 * - ถ้าไม่ถูกต้อง หรือไม่เจอ, ส่ง Error 401 (Unauthorized) กลับไป
 */
module.exports = async (req, res, next) => {
  try {
    // 1. ดึง Token จาก Header
    const authorization = req.headers.authorization;

    // 2. ตรวจสอบว่า Token ถูกส่งมาในรูปแบบ "Bearer <token>" หรือไม่
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'คุณยังไม่ได้เข้าสู่ระบบ (no token provided)' });
    }

    const token = authorization.split(' ')[1]; // แยกเอาเฉพาะส่วน token

    // 3. ตรวจสอบความถูกต้องของ Token
    //    เราต้องการตัวแปร JWT_SECRET จากไฟล์ .env
    //    (ซึ่งไฟล์ authRoute.js ของคุณก็ใช้อยู่)
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // 4. ค้นหาผู้ใช้งาน (User) จาก ID ที่อยู่ใน payload ของ token
    //    (ใน authRoute.js, คุณใช้ { id: user.id, role: user.role } ในการสร้าง token)
    const user = await User.findByPk(payload.id);

    if (!user) {
      return res.status(404).json({ message: 'ไม่พบผู้ใช้งานนี้ในระบบ' });
    }

    // 5. ถ้าทุกอย่างถูกต้อง, แนบข้อมูล user ไปกับ request แล้วปล่อยให้ทำงานต่อ (next())
    req.user = user;
    next();

  } catch (error) {
    // 6. ดักจับ Error หาก Token ไม่ถูกต้อง หรือหมดอายุ
    console.error('Authentication Error:', error.name, error.message);
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token ไม่ถูกต้องหรือหมดอายุ (invalid/expired token)' });
    }
    // Error อื่นๆ
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการยืนยันตัวตน', error: error.message });
  }
};