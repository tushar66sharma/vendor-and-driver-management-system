require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const connectDB = require('./src/config/db');
const authRoutes = require('./src/routes/auth');

const app = express();
connectDB();

app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server listening on ${PORT}`));
