// src/server.js
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

// โหลดค่าจากไฟล์ .env
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// Import Routes
const testerRoute = require('./routes/testerRoute');

const carRoute = require('./routes/carRoute');
const claimRoute = require('./routes/claimRoute');
const authRoute = require('./routes/authRoute');
const userRoute = require("./routes/userRoute");


// Middleware
app.use(cors({
    origin: 'http://localhost:3001', // frontend port (React)
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));
app.use(express.json());

// ใช้งาน Route
app.use('/users', testerRoute);

app.use('/api/claims', claimRoute);
app.use('/api/cars', carRoute);
app.use('/api/auth', authRoute);
app.use("/api/users", userRoute);


// เชื่อมต่อ MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('MongoDB connected successfully!'))
    .catch((err) => console.error('MongoDB connection failed:', err));

// Route ทดสอบหลัก
app.get('/', (req, res) => {
    res.send('Server + MongoDB connected successfully 🚀');
});

// เริ่มเซิร์ฟเวอร์
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});