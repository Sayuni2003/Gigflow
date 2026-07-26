import dotenv from "dotenv";
import mongoose from "mongoose";
import User, { USER_ROLES } from "../models/User.js";

dotenv.config();

const ADMIN = {
  fullName: "Admin gigFlow",
  email: "admin@gmail.com",
  password: "Admin@123",
  dateOfBirth: new Date("1990-01-01"),
  role: USER_ROLES.ADMIN,
};

async function seedAdmin() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI is not set in .env");
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log("MongoDB connected");

  const existing = await User.findOne({ email: ADMIN.email });
  if (existing) {
    console.log(`Admin already exists: ${ADMIN.email}`);
    await mongoose.disconnect();
    return;
  }

  await User.create(ADMIN);
  console.log(`Admin seeded successfully: ${ADMIN.email}`);
  console.log(`Password: ${ADMIN.password}`);
  console.log("Change the password after first login.");

  await mongoose.disconnect();
}

seedAdmin().catch((err) => {
  console.error("Seed failed:", err.message);
  process.exit(1);
});
