const express = require("express")
const User = require("../models/User")
const Product = require("../models/Product")
const Order = require("../models/Order")
const { protect, adminOnly } = require("../middleware/auth")

const router = express.Router()

router.get("/me", protect, adminOnly, async (req, res) => {
    try {
        const user = req.user;
        res.json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
                department: user.department,
                phone: user.phone,
                address: user.address,
            },
        });
    } catch (error) {
        console.error("Get user error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
});
// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
router.get("/stats", [protect, adminOnly], async (req, res) => {
  try {
    // Get current date and calculate date ranges
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

    // Total counts
    const totalUsers = await User.countDocuments({ isActive: true })
    const totalProducts = await Product.countDocuments({ isActive: true })
    const totalOrders = await Order.countDocuments()

    // Monthly stats
    const monthlyOrders = await Order.countDocuments({
      createdAt: { $gte: startOfMonth },
    })

    const lastMonthOrders = await Order.countDocuments({
      createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
    })

    // Revenue calculations
    const monthlyRevenue = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfMonth },
          status: { $in: ["confirmed", "processing", "shipped", "delivered"] },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$total" },
        },
      },
    ])

    const lastMonthRevenue = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
          status: { $in: ["confirmed", "processing", "shipped", "delivered"] },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$total" },
        },
      },
    ])

    // Low stock products
    const lowStockProducts = await Product.find({
      isActive: true,
      $expr: { $lte: ["$stock", "$minStock"] },
    }).select("name stock minStock")

    // Recent orders
    const recentOrders = await Order.find()
      .populate("user", "name email")
      .populate("items.product", "name")
      .sort({ createdAt: -1 })
      .limit(5)

    // Order status distribution
    const orderStatusStats = await Order.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ])

    // Top selling products
    const topProducts = await Order.aggregate([
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product",
          totalSold: { $sum: "$items.quantity" },
          revenue: { $sum: "$items.total" },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
    ])

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalProducts,
          totalOrders,
          monthlyOrders,
          monthlyRevenue: monthlyRevenue[0]?.total || 0,
          orderGrowth: lastMonthOrders > 0 ? ((monthlyOrders - lastMonthOrders) / lastMonthOrders) * 100 : 0,
          revenueGrowth:
            lastMonthRevenue[0]?.total > 0
              ? (((monthlyRevenue[0]?.total || 0) - lastMonthRevenue[0].total) / lastMonthRevenue[0].total) * 100
              : 0,
        },
        lowStockProducts,
        recentOrders,
        orderStatusStats,
        topProducts,
      },
    })
  } catch (error) {
    console.error("Get admin stats error:", error)
    res.status(500).json({
      success: false,
      message: "Error fetching admin statistics",
    })
  }
})

// @desc    Get sales analytics
// @route   GET /api/admin/analytics
// @access  Private/Admin
// router.get("/analytics", [protect, adminOnly], async (req, res) => {
//   try {
//     const { period = "month" } = req.query

//     let dateRange
//     const now = new Date()

//     switch (period) {
//       case "week":
//         dateRange = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
//         break
//       case "month":
//         dateRange = new Date(now.getFullYear(), now.getMonth(), 1)
//         break
//       case "year":
//         dateRange = new Date(now.getFullYear(), 0, 1)
//         break
//       default:
//         dateRange = new Date(now.getFullYear(), now.getMonth(), 1)
//     }

//     // Sales over time
//     const salesData = await Order.aggregate([
//       {
//         $match: {
//           createdAt: { $gte: dateRange },
//           status: { $in: ["confirmed", "processing", "shipped", "delivered"] },
//         },
//       },
//       {
//         $group: {
//           _id: {
//             $dateToString: {
//               format: period === "year" ? "%Y-%m" : "%Y-%m-%d",
//               date: "$createdAt",
//             },
//           },
//           revenue: { $sum: "$total" },
//           orders: { $sum: 1 },
//         },
//       },
//       { $sort: { _id: 1 } },
//     ])

//     // Category performance
//     const categoryData = await Order.aggregate([
//       { $match: { createdAt: { $gte: dateRange } } },
//       { $unwind: "$items" },
//       {
//         $lookup: {
//           from: "products",
//           localField: "items.product",
//           foreignField: "_id",
//           as: "product",
//         },
//       },
//       { $unwind: "$product" },
//       {
//         $group: {
//           _id: "$product.category",
//           revenue: { $sum: "$items.total" },
//           quantity: { $sum: "$items.quantity" },
//         },
//       },
//       { $sort: { revenue: -1 } },
//     ])

//     res.json({
//       success: true,
//       data: {
//         salesData,
//         categoryData,
//       },
//     })
//   } catch (error) {
//     console.error("Get analytics error:", error)
//     res.status(500).json({
//       success: false,
//       message: "Error fetching analytics",
//     })
//   }
// })


router.get("/analytics", [protect, adminOnly], async (req, res) => {
  try {
    const { period = "month" } = req.query;
    const now = new Date();
    let dateRange;

    switch (period) {
      case "7": // last 7 days
        dateRange = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "30":
        dateRange = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "90":
        dateRange = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case "365":
        dateRange = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        dateRange = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    // Overview
    const totalOrders = await Order.countDocuments();
    const totalRevenueAgg = await Order.aggregate([
      { $match: { status: { $in: ["confirmed","processing","shipped","delivered"] } } },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]);
    const totalRevenue = totalRevenueAgg[0]?.total || 0;
    const totalCustomers = await User.countDocuments({ isActive: true });
    const avgOrderValue = totalOrders ? totalRevenue / totalOrders : 0;

    // Sales data
    const salesAgg = await Order.aggregate([
      { $match: { createdAt: { $gte: dateRange }, status: { $in: ["confirmed","processing","shipped","delivered"] } } },
      { $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          sales: { $sum: "$total" },
        }
      },
      { $sort: { _id: 1 } },
    ]);
    const salesData = salesAgg.map(s => ({ date: s._id, sales: s.sales }));

    // Category data
    const categoryData  = await Order.aggregate([
      { $match: { createdAt: { $gte: dateRange } } },
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      {
        $group: {
          _id: "$product.category",
          value: { $sum: "$items.total" },
        },
      },
      { $sort: { value: -1 } },
    ]);

    // Recent orders
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("user", "name")
      .lean();
    
    const recentOrdersFormatted = recentOrders.map(o => ({
      _id: o._id,
      customerName: o.user?.name || "Unknown",
      totalAmount: o.total,
      createdAt: o.createdAt,
    }));

    res.json({
      success: true,
      data: {
        overview: { totalRevenue, totalOrders, totalCustomers, avgOrderValue },
        salesData,
        categoryData,
        recentOrders: recentOrdersFormatted,
      },
    });
  } catch (error) {
    console.error("Analytics fetch error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


// @desc    Get all users (admin)
// @route   GET /api/admin/users
// @access  Private/Admin
router.get("/users", protect, adminOnly, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const role = req.query.role || "";

    let query = {};

    if (search) {
      query["$or"] = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    if (role) query.role = role;

    const totalUsers = await User.countDocuments(query);
    const totalPages = Math.ceil(totalUsers / limit);

    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({ users, totalPages });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Server error fetching users" });
  }
});

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
router.put("/users/:id/role", protect, adminOnly, async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.role = role;
    await user.save();

    res.json({ success: true, message: "User role updated" });
  } catch (error) {
    console.error("Error updating user role:", error);
    res.status(500).json({ message: "Server error updating user role" });
  }
});

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
router.delete("/users/:id", protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

await User.deleteOne({ _id: req.params.id });
    res.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Server error deleting user" });
  }
});

// @desc    Get all orders (for admin dashboard)
// @route   GET /api/admin/orders
// @access  Private/Admin
router.get("/orders", protect, adminOnly, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const status = req.query.status || "";

    let query = {};

    // Search by order ID or user email or name
    if (search) {
      query["$or"] = [
        { _id: { $regex: search, $options: "i" } },
        { "shippingAddress.firstName": { $regex: search, $options: "i" } },
        { "shippingAddress.lastName": { $regex: search, $options: "i" } },
        { "user.email": { $regex: search, $options: "i" } },
      ];
    }

    // Filter by status
    if (status) query.status = status;

    const totalOrders = await Order.countDocuments(query);
    const totalPages = Math.ceil(totalOrders / limit);

    const orders = await Order.find(query)
      .populate("user", "name email")
      .populate("items.product", "name price")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({ orders, totalPages });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Server error fetching orders" });
  }
});


// @desc    Get single order by ID
// @route   GET /api/admin/orders/:id
// @access  Private/Admin
router.get("/orders/:id", protect, adminOnly, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email")
      .populate("items.product", "name price category");

    if (!order) return res.status(404).json({ message: "Order not found" });

    res.json(order);
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ message: "Server error fetching order" });
  }
});


// @desc    Update order status
// @route   PUT /api/admin/orders/:id/status
// @access  Private/Admin
router.put("/orders/:id/status", protect, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status = status;
    await order.save();

    res.json({ success: true, message: "Order status updated", order });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ message: "Server error updating order status" });
  }
});

// Create new product
router.post("/products", protect, adminOnly, async (req, res) => {
  try {
    const productData = req.body;
    const product = await Product.create(productData);
    res.status(201).json({ success: true, data: product });
  } catch (err) {
    console.error("Error creating product:", err);
    res.status(500).json({ success: false, message: "Failed to create product" });
  }
});

// Update existing product
router.put("/products/:id", protect, adminOnly, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    res.json({ success: true, data: product });
  } catch (err) {
    console.error("Error updating product:", err);
    res.status(500).json({ success: false, message: "Failed to update product" });
  }
});

// Get all products (optional for admin dashboard)
router.get("/products", protect, adminOnly, async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json({ success: true, data: products });
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ success: false, message: "Failed to fetch products" });
  }
});


module.exports = router
