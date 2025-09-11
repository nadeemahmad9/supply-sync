// const express = require("express")
// const Order = require("../models/Order")
// const Product = require("../models/Product")
// const { protect, adminOnly, employeeOrAdmin } = require("../middleware/auth")

// const router = express.Router()

// // @desc    Create new order
// // @route   POST /api/orders
// // @access  Private
// router.post("/", [protect], async (req, res) => {
//   try {
//     const { items, shippingAddress, notes } = req.body

//     if (!items || items.length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: "Order must contain at least one item",
//       })
//     }

//     // Validate and calculate order totals
//     let subtotal = 0
//     const orderItems = []

//     for (const item of items) {
//       const product = await Product.findById(item.product)

//       if (!product || !product.isActive) {
//         return res.status(400).json({
//           success: false,
//           message: `Product ${item.product} not found or inactive`,
//         })
//       }

//       if (product.stock < item.quantity) {
//         return res.status(400).json({
//           success: false,
//           message: `Insufficient stock for ${product.name}. Available: ${product.stock}`,
//         })
//       }

//       const itemTotal = product.price * item.quantity
//       subtotal += itemTotal

//       orderItems.push({
//         product: product._id,
//         quantity: item.quantity,
//         price: product.price,
//         total: itemTotal,
//       })

//       // Update product stock
//       product.stock -= item.quantity
//       await product.save()
//     }

//     // Calculate totals
//     const tax = subtotal * 0.1 // 10% tax
//     const shipping = subtotal > 100 ? 0 : 10 // Free shipping over $100
//     const total = subtotal + tax + shipping

//     // Create order
//     const order = await Order.create({
//       user: req.user._id,
//       items: orderItems,
//       subtotal,
//       tax,
//       shipping,
//       total,
//       shippingAddress,
//       notes,
//     })

//     await order.populate("items.product", "name images")

//     res.status(201).json({
//       success: true,
//       message: "Order created successfully",
//       data: order,
//     })
//   } catch (error) {
//     console.error("Create order error:", error)
//     res.status(500).json({
//       success: false,
//       message: "Error creating order",
//     })
//   }
// })

// // @desc    Get user orders
// // @route   GET /api/orders
// // @access  Private
// router.get("/", [protect], async (req, res) => {
//   try {
//     const { page = 1, limit = 10, status } = req.query

//     const query = { user: req.user._id }

//     if (status && status !== "all") {
//       query.status = status
//     }

//     const orders = await Order.find(query)
//       .populate("items.product", "name images")
//       .sort({ createdAt: -1 })
//       .limit(limit * 1)
//       .skip((page - 1) * limit)

//     const total = await Order.countDocuments(query)

//     res.json({
//       success: true,
//       data: orders,
//       pagination: {
//         current: page,
//         pages: Math.ceil(total / limit),
//         total,
//         limit,
//       },
//     })
//   } catch (error) {
//     console.error("Get orders error:", error)
//     res.status(500).json({
//       success: false,
//       message: "Error fetching orders",
//     })
//   }
// })

// // @desc    Get single order
// // @route   GET /api/orders/:id
// // @access  Private
// router.get("/:id", [protect], async (req, res) => {
//   try {
//     const query = { _id: req.params.id }

//     // Non-admin users can only see their own orders
//     if (req.user.role !== "admin") {
//       query.user = req.user._id
//     }

//     const order = await Order.findOne(query).populate("items.product", "name images sku").populate("user", "name email")

//     if (!order) {
//       return res.status(404).json({
//         success: false,
//         message: "Order not found",
//       })
//     }

//     res.json({
//       success: true,
//       data: order,
//     })
//   } catch (error) {
//     console.error("Get order error:", error)
//     res.status(500).json({
//       success: false,
//       message: "Error fetching order",
//     })
//   }
// })

// // @desc    Update order status
// // @route   PUT /api/orders/:id/status
// // @access  Private/Admin
// router.put("/:id/status", [protect, adminOnly], async (req, res) => {
//   try {
//     const { status, trackingNumber } = req.body

//     const validStatuses = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"]

//     if (!validStatuses.includes(status)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid order status",
//       })
//     }

//     const updateData = { status }

//     if (trackingNumber) {
//       updateData.trackingNumber = trackingNumber
//     }

//     if (status === "delivered") {
//       updateData.deliveredAt = new Date()
//     }

//     const order = await Order.findByIdAndUpdate(req.params.id, updateData, {
//       new: true,
//     }).populate("items.product", "name images")

//     if (!order) {
//       return res.status(404).json({
//         success: false,
//         message: "Order not found",
//       })
//     }

//     res.json({
//       success: true,
//       message: "Order status updated successfully",
//       data: order,
//     })
//   } catch (error) {
//     console.error("Update order status error:", error)
//     res.status(500).json({
//       success: false,
//       message: "Error updating order status",
//     })
//   }
// })

// // @desc    Get all orders (Admin)
// // @route   GET /api/orders/admin/all
// // @access  Private/Admin
// router.get("/admin/all", [protect, adminOnly], async (req, res) => {
//   try {
//     const { page = 1, limit = 10, status, search } = req.query

//     const query = {}

//     if (status && status !== "all") {
//       query.status = status
//     }

//     if (search) {
//       query.orderNumber = { $regex: search, $options: "i" }
//     }

//     const orders = await Order.find(query)
//       .populate("user", "name email")
//       .populate("items.product", "name images")
//       .sort({ createdAt: -1 })
//       .limit(limit * 1)
//       .skip((page - 1) * limit)

//     const total = await Order.countDocuments(query)

//     res.json({
//       success: true,
//       data: orders,
//       pagination: {
//         current: page,
//         pages: Math.ceil(total / limit),
//         total,
//         limit,
//       },
//     })
//   } catch (error) {
//     console.error("Get all orders error:", error)
//     res.status(500).json({
//       success: false,
//       message: "Error fetching orders",
//     })
//   }
// })

// module.exports = router



const express = require("express");
const Order = require("../models/Order");
const Product = require("../models/Product");
const { protect, adminOnly } = require("../middleware/auth");

const router = express.Router();

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
router.post("/", protect, async (req, res) => {
  try {
    const { items, shippingAddress, notes, paymentMethod } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Order must contain at least one item",
      });
    }

    // Validate and calculate order totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);

      if (!product || !product.isActive) {
        return res.status(400).json({
          success: false,
          message: `Product ${item.product} not found or inactive`,
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}`,
        });
      }

      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price,
        total: itemTotal,
      });

      // Update stock
      product.stock -= item.quantity;
      await product.save();
    }

    // Totals
    const tax = subtotal * 0.1; // 10% tax
    const shipping = subtotal > 100 ? 0 : 10;
    const total = subtotal + tax + shipping;

    // ✅ Create order using `new Order().save()` so pre("save") runs
    // const order = new Order({
    //   user: req.user._id,
    //   items: orderItems,
    //   subtotal,
    //   tax,
    //   shipping,
    //   total,
    //   shippingAddress,
    //   notes,
    // });
// Pull paymentMethod from request

// ✅ Create order
const order = new Order({
  user: req.user._id,
  items: orderItems,
  subtotal,
  tax,
  shipping,
  total,
  shippingAddress,
  notes,
  paymentMethod, // <-- include it
  paymentStatus: paymentMethod === "cash" ? "pending" : "paid", // auto-set
});



    await order.save();
    await order.populate("items.product", "name images");

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: order,
    });
  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating order",
    });
  }
});

// @desc    Get user orders
// @route   GET /api/orders
// @access  Private
router.get("/", protect, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    const query = { user: req.user._id };
    if (status && status !== "all") query.status = status;

    const orders = await Order.find(query)
      .populate("items.product", "name images")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      data: orders,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        limit,
      },
    });
  } catch (error) {
    console.error("Get orders error:", error);
    res.status(500).json({ success: false, message: "Error fetching orders" });
  }
});

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
router.get("/:id", protect, async (req, res) => {
  try {
    const query = { _id: req.params.id };
    if (req.user.role !== "admin") query.user = req.user._id;

    const order = await Order.findOne(query)
      .populate("items.product", "name images sku")
      .populate("user", "name email");

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    console.error("Get order error:", error);
    res.status(500).json({ success: false, message: "Error fetching order" });
  }
});

// @desc    Update order status (Admin only)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
router.put("/:id/status", protect, adminOnly, async (req, res) => {
  try {
    const { status, trackingNumber } = req.body;
    const validStatuses = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const updateData = { status };
    if (trackingNumber) updateData.trackingNumber = trackingNumber;
    if (status === "delivered") updateData.deliveredAt = new Date();

    const order = await Order.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    }).populate("items.product", "name images");

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    res.json({
      success: true,
      message: "Order status updated",
      data: order,
    });
  } catch (error) {
    console.error("Update order status error:", error);
    res.status(500).json({ success: false, message: "Error updating order" });
  }
});

// @desc    Get all orders (Admin)
// @route   GET /api/orders/admin/all
// @access  Private/Admin
router.get("/admin/all", protect, adminOnly, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;

    const query = {};
    if (status && status !== "all") query.status = status;
    if (search) query.orderNumber = { $regex: search, $options: "i" };

    const orders = await Order.find(query)
      .populate("user", "name email")
      .populate("items.product", "name images")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      data: orders,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        limit,
      },
    });
  } catch (error) {
    console.error("Get all orders error:", error);
    res.status(500).json({ success: false, message: "Error fetching orders" });
  }
});

module.exports = router;
