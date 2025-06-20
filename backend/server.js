require('dotenv').config();
const path = require('path'); 
const express = require('express');
const cors    = require('cors');
const connectDB = require('./src/config/db');
const authRoutes = require('./src/routes/auth');
const statsRoutes  = require("./src/routes/stats");
const permRoutes   = require("./src/routes/permissions");
const userRoutes = require("./src/routes/users");
const docRoutes  = require('./src/routes/driverDocs');
const vehicleRoutes = require('./src/routes/vehicles');
const adminRoutes   = require("./src/routes/admin");


const app = express();
connectDB();

app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/permissions", permRoutes);
app.use("/api/users", userRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/driver-docs', docRoutes);
app.use('/api/vehicles',     vehicleRoutes); 
app.use("/api/admin",     adminRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server listening on ${PORT}`));
