const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const db = require('./models');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();

// --- Middlewares ---
app.use(cors());
app.use(express.json());

// --- Basic Health Check Route ---
app.get('/', (req, res) => {
    res.status(200).json({ message: 'ClaimMate API is running' });
});

// --- Routes ---
const customerRoute = require('./routes/customerRoute'); // 1. Import customerRoute
const claimRoute = require('./routes/claimRoute');       // 2. Import claimRoute
const authRoute = require('./routes/authRoute');


const garageRoute = require('./routes/garageRoute');

app.use('/api/auth', authRoute);
app.use('/api/customers', customerRoute); // 1. ใช้งาน customerRoute
app.use('/api/claims', claimRoute);       // 2. ใช้งาน claimRoute
app.use('/api/garages', garageRoute);

// --- Database Connection ---
db.sequelize.authenticate()
  .then(() => {
    console.log('✅ SQLite database connected successfully.');
    return db.sequelize.sync({ force: false }); 
  })
  .then(() => {
    console.log('✅ All models were synchronized successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

// --- Start Server ---
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
});