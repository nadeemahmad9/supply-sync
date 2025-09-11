const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const dotenv = require("dotenv")
const session = require("express-session")
const passport = require("passport")

// Load environment variables
dotenv.config()

// Import routes
const authRoutes = require("./routes/auth")
const productRoutes = require("./routes/products")
const orderRoutes = require("./routes/orders")
const userRoutes = require("./routes/users")
const adminRoutes = require("./routes/admin")

// Import passport config
require("./config/passport")

const app = express()

// Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// CORS configuration
app.use(
  cors({
    origin: ['https://supplysyncapp.netlify.app', 'http://localhost:5174'],
     methods: "GET,POST,PUT,DELETE",
    credentials: true,
  }),
)

// Session configuration
app.use(
  session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }, // Set to true in production with HTTPS
  }),
)

// Passport middleware
app.use(passport.initialize())
app.use(passport.session())

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err))

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/products", productRoutes)
app.use("/api/orders", orderRoutes)
app.use("/api/users", userRoutes)
app.use("/api/admin", adminRoutes)

// Health check route
app.get("/api/health", (req, res) => {
  res.json({ message: "Server is running successfully!" })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ message: "Something went wrong!" })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
