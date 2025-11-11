const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const db = require('./models');
// const fileUpload = require('express-fileupload'); // (หากคุณยังต้องการใช้ file upload)

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') }); //

const app = express();

// --- Middlewares ---
// 1. Enable Cross-Origin Resource Sharing (CORS)
app.use(cors());

// 2. Enable JSON body parsing
app.use(express.json());

// 3. (Optional) Enable File Uploads (หากคุณยังต้องการใช้)
// app.use(
//   fileUpload({
//     useTempFiles: true,
//   })
// );

// --- Basic Health Check Route ---
app.get('/', (req, res) => {
    res.status(200).json({ message: 'ClaimMate API is running' });
});

const customerRoute = require('./routes/customerRoute'); // 1. Import customerRoute
const claimRoute = require('./routes/claimRoute');       // 2. Import claimRoute
const authRoute = require('./routes/authRoute');


app.use('/api/auth', authRoute);
app.use('/api/customers', customerRoute); // 1. ใช้งาน customerRoute
app.use('/api/claims', claimRoute);       // 2. ใช้งาน claimRoute

// --- Database Connection ---
// (นี่คือจุดที่คุณจะเพิ่มโค้dเชื่อมต่อ Sequelize/SQLite ในอนาคต)
// const sequelize = require('./config/database');
// const connectDb = async () => { ... };
// connectDb();

// --- [เพิ่มส่วนนี้] เชื่อมต่อและ Sync ฐานข้อมูล Sequelize ---
db.sequelize.authenticate()
  .then(() => {
    console.log('✅ SQLite database connected successfully.');

    // สั่งให้ Sequelize สร้างตารางตาม Models ที่เรานิยามไว้
    // force: true = ลบตารางเก่าทิ้งทั้งหมดแล้วสร้างใหม่ (เหมาะสำหรับ dev ตอนเริ่ม)
    // force: false = ไม่ลบ (ใช้เมื่อข้อมูลเริ่มจริงจัง)
    return db.sequelize.sync({ force: false }); 
  })
  .then(() => {
    console.log('✅ All models were synchronized successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });
// ----------------------------------------------------


// --- Start Server ---
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
});