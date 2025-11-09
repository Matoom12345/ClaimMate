const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
// const fileUpload = require('express-fileupload'); // (หากคุณยังต้องการใช้ file upload)

// Load environment variables
dotenv.config({ path: '../.env' }); //

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
    res.status(200).json({ message: 'Welcome to the API' });
});

// --- Routes ---
// (ในอนาคต คุณจะ import routes ของคุณมาไว้ที่นี่)
// const authRoute = require('./routes/authRoute');
// const claimRoute = require('./routes/claimRoute');
// app.use('/api/auth', authRoute);
// app.use('/api/claims', claimRoute);


// --- Database Connection ---
// (นี่คือจุดที่คุณจะเพิ่มโค้dเชื่อมต่อ Sequelize/SQLite ในอนาคต)
// const sequelize = require('./config/database');
// const connectDb = async () => { ... };
// connectDb();


// --- Start Server ---
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});