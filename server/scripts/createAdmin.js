const mongoose = require("mongoose")
const dotenv = require("dotenv")
const User = require("../models/User")

// Load environment variables
dotenv.config()

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI)
    console.log("MongoDB connected for admin creation...")

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: "admin" })
    if (existingAdmin) {
      console.log("Admin user already exists:", existingAdmin.email)
      process.exit(0)
    }

    // Create admin user
    const adminUser = new User({
  name: "Admin User",
  email: "admin@stationero.com",
  password: "admin123456",
  role: "admin",
  department: "Administration",
  isActive: true,
});

await adminUser.save();


    console.log("Admin user created successfully!")
    console.log("Email:", adminUser.email)
    console.log("Password: admin123456")
    console.log("Please change the password after first login.")

    process.exit(0)
  } catch (error) {
    console.error("Error creating admin user:", error)
    process.exit(1)
  }
}

// Run the admin creation function
createAdmin()
