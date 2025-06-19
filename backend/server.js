require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const connectDB = require('./src/config/db');
const authRoutes = require('./src/routes/auth');
const statsRoutes  = require("./src/routes/stats");
const permRoutes   = require("./src/routes/permissions");
const userRoutes = require("./src/routes/users");

const app = express();
connectDB();

app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/permissions", permRoutes);
app.use("/api/users", userRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server listening on ${PORT}`));
