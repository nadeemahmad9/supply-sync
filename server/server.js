// const express = require("express")
// const mongoose = require("mongoose")
// const cors = require("cors")
// const dotenv = require("dotenv")
// const session = require("express-session")
// const passport = require("passport")

// // Load environment variables
// dotenv.config()

// // Import routes
// const authRoutes = require("./routes/auth")
// const productRoutes = require("./routes/products")
// const orderRoutes = require("./routes/orders")
// const userRoutes = require("./routes/users")
// const adminRoutes = require("./routes/admin")

// // Import passport config
// require("./config/passport")

// const app = express()

// // Middleware
// app.use(express.json())
// app.use(express.urlencoded({ extended: true }))

// // CORS configuration
// app.use(
//   cors({
//     origin: ['https://supplysyncapp.netlify.app', 'https://supplysyncadmin.netlify.app'],
//       methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//     credentials: true,
//   }),
// )

// // Session configuration
// app.use(
//   session({
//     secret: process.env.JWT_SECRET,
//     resave: false,
//     saveUninitialized: false,
//     cookie: { secure: false }, // Set to true in production with HTTPS
//   }),
// )

// // Passport middleware
// app.use(passport.initialize())
// app.use(passport.session())

// // Connect to MongoDB
// mongoose
//   .connect(process.env.MONGO_URI)
//   .then(() => console.log("MongoDB connected successfully"))
//   .catch((err) => console.error("MongoDB connection error:", err))

// // Routes
// app.use("/api/auth", authRoutes)
// app.use("/api/products", productRoutes)
// app.use("/api/orders", orderRoutes)
// app.use("/api/users", userRoutes)
// app.use("/api/admin", adminRoutes)

// // Health check route
// app.get("/api/health", (req, res) => {
//   res.json({ message: "Server is running successfully!" })
// })

// // Error handling middleware
// app.use((err, req, res, next) => {
//   console.error(err.stack)
//   res.status(500).json({ message: "Something went wrong!" })
// })

// const PORT = process.env.PORT || 5000
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`)
// })



// const express = require("express")
// const mongoose = require("mongoose")
// const cors = require("cors")
// const dotenv = require("dotenv")
// const session = require("express-session")
// const passport = require("passport")
// const http = require("http")               // ✅ Needed for socket.io
// const { Server } = require("socket.io")    // ✅ Import socket.io

// // Load environment variables
// dotenv.config()

// // Import routes
// const authRoutes = require("./routes/auth")
// const productRoutes = require("./routes/products")
// const orderRoutes = require("./routes/orders")
// const userRoutes = require("./routes/users")
// const adminRoutes = require("./routes/admin")

// // Import passport config
// require("./config/passport")

// const app = express()
// const server = http.createServer(app) // ✅ Create server for express + socket.io

// // Setup Socket.IO
// const io = new Server(server, {
//   cors: {
//     origin: [
//       "https://supplysyncapp.netlify.app",
//       "https://supplysyncadmin.netlify.app"
//     ],
//     methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//     credentials: true,
//   },
// })

// // ✅ Socket.IO listeners
// io.on("connection", (socket) => {
//   console.log("⚡ New client connected:", socket.id)

//   // Send welcome message
//   socket.emit("notification", { message: "🔔 Connected to real-time updates!" })

//   // Example: Listen for custom notifications from frontend
//   socket.on("sendNotification", (data) => {
//     console.log("📢 Notification received:", data)
//     io.emit("notification", data) // Broadcast to all connected clients
//   })

//   socket.on("disconnect", () => {
//     console.log("❌ Client disconnected:", socket.id)
//   })
// })

// // Middleware
// app.use(express.json())
// app.use(express.urlencoded({ extended: true }))

// // CORS configuration
// app.use(
//   cors({
//     origin: ["https://supplysyncapp.netlify.app", "https://supplysyncadmin.netlify.app"],
//     methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//     credentials: true,
//   }),
// )

// // Session configuration
// app.use(
//   session({
//     secret: process.env.JWT_SECRET,
//     resave: false,
//     saveUninitialized: false,
//     cookie: { secure: false }, // ⚠️ set true in production with HTTPS
//   }),
// )

// // Passport middleware
// app.use(passport.initialize())
// app.use(passport.session())

// // Connect to MongoDB
// mongoose
//   .connect(process.env.MONGO_URI)
//   .then(() => console.log("✅ MongoDB connected successfully"))
//   .catch((err) => console.error("❌ MongoDB connection error:", err))

// // Routes
// app.use("/api/auth", authRoutes)
// app.use("/api/products", productRoutes)
// app.use("/api/orders", orderRoutes)
// app.use("/api/users", userRoutes)
// app.use("/api/admin", adminRoutes)

// // Health check route
// app.get("/api/health", (req, res) => {
//   res.json({ message: "Server is running successfully!" })
// })

// // Error handling middleware
// app.use((err, req, res, next) => {
//   console.error(err.stack)
//   res.status(500).json({ message: "Something went wrong!" })
// })

// const PORT = process.env.PORT || 5000
// server.listen(PORT, () => {   // ✅ Listen with http server, not app
//   console.log(`🚀 Server running on port ${PORT}`)
// })



const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const session = require("express-session");
const passport = require("passport");
const http = require("http");
const { Server } = require("socket.io");

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/products");
const orderRoutes = require("./routes/orders");
const userRoutes = require("./routes/users");
const adminRoutes = require("./routes/admin");

// Import passport config
require("./config/passport");

// Import Order model (for emitting notifications on new orders)
const Order = require("./models/Order");

const app = express();
const server = http.createServer(app);

// Setup Socket.IO
const io = new Server(server, {
  cors: {
    origin: [
      "https://supplysyncapp.netlify.app",
      "https://supplysyncadmin.netlify.app"
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  },
});

// Socket.IO connection
io.on("connection", (socket) => {
  console.log("⚡ New client connected:", socket.id);

  // Send welcome message
// Example: whenever a new order is placed
socket.on("newOrder", (order) => {
  io.emit("notification", { message: `🛒 New order placed by ${order.user}` });
});

// Example: admin adds product
socket.on("newProduct", (product) => {
  io.emit("notification", { message: `📦 New product added: ${product.name}` });
});

  // Listen for custom notifications (optional)
  socket.on("sendNotification", (data) => {
    console.log("📢 Notification received:", data);
    io.emit("notification", data); // broadcast to all clients
  });

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
  });
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration
app.use(
  cors({
    origin: ["https://supplysyncapp.netlify.app", "https://supplysyncadmin.netlify.app"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

// Session configuration
app.use(
  session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }, // ⚠️ set true in production with HTTPS
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);

// Example: Emit real-time notification when new order is created
// This requires you to modify your order creation route like below:
// Inside routes/orders.js after saving the order:
app.post("/api/orders", async (req, res, next) => {
  try {
    const newOrder = await Order.create(req.body);

    // Emit notification to all connected clients (or specific room)
    io.emit("notification", {
      type: "order",
      message: `📦 New order placed by ${newOrder.user.name}`,
      orderId: newOrder._id
    });

    res.status(201).json({ data: newOrder });
  } catch (err) {
    next(err);
  }
});

// Health check route
app.get("/api/health", (req, res) => {
  res.json({ message: "Server is running successfully!" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

// Start server with Socket.IO
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
