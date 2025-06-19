require("dotenv").config();
const mongoose = require("mongoose");
const Permission = require("../src/models/Permission");

const permissions = [
  { permissionName: "vehicle:read",        description: "View vehicles" },
  { permissionName: "vehicle:manage",      description: "Add, edit or delete vehicles" },
  { permissionName: "driver:view",         description: "View driver profiles" },
  { permissionName: "driver:approve",      description: "Approve or reject driver applications" },
  { permissionName: "fleet:view",          description: "View fleet dashboard and status" },
  { permissionName: "fleet:assign",        description: "Assign drivers to vehicles" },
  { permissionName: "role:assign",         description: "Assign roles to users" },
  { permissionName: "permission:modify",   description: "Add or remove permissions from roles" },
  { permissionName: "user:create",         description: "Create new user accounts" },
  { permissionName: "user:deactivate",     description: "Deactivate user accounts" }
];

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await Permission.deleteMany({}); // remove old entries
  console.log("🔴 Removed existing permissions");

  for (const p of permissions) {
    await Permission.create(p);
    console.log("✅ Inserted:", p.permissionName);
  }

  await mongoose.disconnect();
})();
