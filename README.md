# 🚕 Vendor Cab & Driver Onboarding & Vendor Hierarchy Management

A full-stack fleet management platform enabling multi‑level vendor hierarchies, role‑based access, driver & vehicle onboarding, document compliance, and real‑time dashboards. Built with React, Node.js, Express, Tailwind CSS and MongoDB.

---

## 📖 Table of Contents

1. [Overview](#overview)  
2. [Features](#features)  
3. [Architecture & Diagrams](#architecture--diagrams)  
4. [Tech Stack](#tech-stack)  
5. [Project Structure](#project-structure)  
6. [Setup & Run](#setup--run)  
7. [Usage & Demonstration](#usage--demonstration)  


---

## 🌟 Overview

**Vendor Cab & Driver Onboarding System** supports:

- **Multi‑Level Vendor Hierarchies** (Super → Regional → City → Local)  
- **Role‑Based Access Control** for super‑vendors, regional‑vendors, drivers, etc.  
- **Vehicle Onboarding & Assignment** (registration, seating, fuel type)  
- **Driver Onboarding & License Upload**  
- **Document Compliance** (RC, Permit, Pollution certificates)  
- **Real‑Time Dashboards** for super‑vendors & regional‑vendors  

---

## ✅ Features

### 1. Multi‑Level Vendor Hierarchy
- N‑level parent‑child structure (e.g. Super → Regional → City → Local)  
- Scoped views: each vendor only sees their region’s data  

### 2. Role‑Based Access Control (RBAC)
- **Roles**: `super_vendor`, `regional_vendor`, `city_vendor`, `local_vendor`, `driver`  
- Super‑vendors define sub‑vendor permissions & delegation  

### 3. Vehicle Management
- **Add vehicles**: reg. number, model, seating capacity, fuel type, region  
- **Upload docs**: RC, Permit, Pollution certificates  
- **Status badges**: Active / Unassigned  
- **Delete** only if unassigned  

### 4. Driver Management
- **Add drivers** with personal details & region  
- **License upload**: view, replace; old files auto‑cleanup  
- **Driver dashboard**: view & update profile, region & license  

### 5. Super‑Vendor Dashboard
- Central overview: total users, roles, permissions  
- View all sub‑vendors, fleets, driver assignments & compliance  

### 6. Regional‑Vendor Dashboard
- Manage vehicles & drivers in own region  
- Assign/unassign driver ↔ vehicle (region‑matched)  

### 7. Document Management
- **DriverDocument**: one license per driver  
- **Vehicle docs**: RC, permit, pollution  
- Serve via `/uploads/*`  

---


## 🛠️ Tech Stack

- **Frontend**: React.js, React Router, Tailwind CSS, Axios, Lucide React  
- **Backend**: Node.js, Express.js, JWT Authentication, Multer file uploads  
- **Database**: MongoDB (Mongoose)  
- **Hosting**: (Optional) Heroku, Vercel, MongoDB Atlas  

---

## 📂 Project Structure

- **backend/**
  - **src/**
    - **config/** – Database & multer setup
    - **middleware/** – Authentication middleware (e.g., auth.js)
    - **models/** – Mongoose models (User, Vehicle, DriverDocument, Permission, etc.)
    - **routes/** – API routes (auth.js, users.js, vehicles.js, driverDocs.js, admin.js, etc.)
    - **server.js** – Main server entry point

- **frontend/**
  - **src/**
    - **api/** – Axios client setup (axiosClient.js)
    - **components/** – Reusable UI components (Sidebar.jsx, Modal.jsx, PrivateRoute.jsx)
    - **context/** – React context providers (AuthContext.jsx)
    - **pages/** – Page components (SuperVendorDashBoard.jsx, Users.jsx, Roles.jsx, Permissions.jsx, Profile.jsx, RegionalVendorVehicles.jsx, DriverDashboard.jsx, AdminOverview.jsx, etc.)
    - **App.jsx** – Main App component
    - **index.jsx** – Entry point for React

- **uploads/** – Static file storage for uploaded documents




## 📂 Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env:
# MONGODB_URI=your_mongo_uri
# JWT_SECRET=your_jwt_secret
npm run dev
```
## 📂 Frontend

```bash
cd frontend
npm install
npm start
```
## 🏛️ Demo Video and ScreenShots

- **Demo Video**  
  [Watch Demo Video](https://drive.google.com/file/d/1N7Wn0Y7latzaUOSt14zwoaQYpo_jKfxh/view?usp=drive_link)
- **Demo ScreenShots**  
  [Demo Screenshots](https://drive.google.com/drive/folders/1w2LPryJp4y8DQVNSORKNFe0iKxbYk3YU?usp=drive_link)




---




