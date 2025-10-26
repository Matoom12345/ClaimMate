// src/server.js
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

// โหลดค่าจากไฟล์ .env
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Import Routes
const userRoute = require('./routes/userRoute');

// ใช้งาน Route
app.use('/api/users', userRoute);

// เชื่อมต่อ MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('MongoDB connected successfully!'))
    .catch((err) => console.error('MongoDB connection failed:', err));

// Import routes
const testerRoute = require('./routes/testerRoute');

// ใช้งาน route
app.use('/users', testerRoute);

// Route ทดสอบหลัก
app.get('/', (req, res) => {
    res.send('Server + MongoDB connected successfully 🚀');
});

// เริ่มเซิร์ฟเวอร์
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});