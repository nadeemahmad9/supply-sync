const express = require("express")
const Product = require("../models/Product")
const { protect, adminOnly } = require("../middleware/auth")
const { body, validationResult } = require("express-validator")

const router = express.Router()

// @desc    Get all products with filtering, sorting, and pagination
// @route   GET /api/products
// @access  Public
router.get("/", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      search,
      minPrice,
      maxPrice,
      sortBy = "createdAt",
      sortOrder = "desc",
      featured,
      onSale,
    } = req.query

    // Build query object
    const query = { isActive: true }

    // Category filter
    if (category && category !== "all") {
      query.category = category
    }

    // Search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ]
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query.price = {}
      if (minPrice) query.price.$gte = Number.parseFloat(minPrice)
      if (maxPrice) query.price.$lte = Number.parseFloat(maxPrice)
    }

    // Featured filter
    if (featured === "true") {
      query.isFeatured = true
    }

    // On sale filter
    if (onSale === "true") {
      query.onSale = true
    }

    // Sort options
    const sortOptions = {}
    sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1

    // Execute query with pagination
    const products = await Product.find(query)
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select("-reviews")

    // Get total count for pagination
    const total = await Product.countDocuments(query)

    // Get categories for filter options
    const categories = await Product.distinct("category", { isActive: true })

    res.json({
      success: true,
      data: products,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        limit,
      },
      categories,
    })
  } catch (error) {
    console.error("Get products error:", error)
    res.status(500).json({
      success: false,
      message: "Error fetching products",
    })
  }
})

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("reviews.user", "name avatar")

    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      })
    }

    // Get related products (same category, excluding current product)
    const relatedProducts = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
      isActive: true,
    })
      .limit(4)
      .select("-reviews")

    res.json({
      success: true,
      data: product,
      relatedProducts,
    })
  } catch (error) {
    console.error("Get product error:", error)
    res.status(500).json({
      success: false,
      message: "Error fetching product",
    })
  }
})

// @desc    Create new product
// @route   POST /api/products
// @access  Private/Admin
router.post(
  "/",
  [
    protect,
    adminOnly,
    body("name").trim().isLength({ min: 2 }).withMessage("Product name must be at least 2 characters"),
    body("description").trim().isLength({ min: 10 }).withMessage("Description must be at least 10 characters"),
    body("price").isFloat({ min: 0 }).withMessage("Price must be a positive number"),
    body("category").notEmpty().withMessage("Category is required"),
    body("sku").trim().isLength({ min: 3 }).withMessage("SKU must be at least 3 characters"),
    body("stock").isInt({ min: 0 }).withMessage("Stock must be a non-negative integer"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        })
      }

      // Check if SKU already exists
      const existingProduct = await Product.findOne({ sku: req.body.sku })
      if (existingProduct) {
        return res.status(400).json({
          success: false,
          message: "Product with this SKU already exists",
        })
      }

      const product = await Product.create(req.body)

      res.status(201).json({
        success: true,
        message: "Product created successfully",
        data: product,
      })
    } catch (error) {
      console.error("Create product error:", error)
      res.status(500).json({
        success: false,
        message: "Error creating product",
      })
    }
  },
)

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
router.put("/:id", [protect, adminOnly], async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      })
    }

    // Check if SKU is being changed and if it already exists
    if (req.body.sku && req.body.sku !== product.sku) {
      const existingProduct = await Product.findOne({ sku: req.body.sku })
      if (existingProduct) {
        return res.status(400).json({
          success: false,
          message: "Product with this SKU already exists",
        })
      }
    }

    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })

    res.json({
      success: true,
      message: "Product updated successfully",
      data: updatedProduct,
    })
  } catch (error) {
    console.error("Update product error:", error)
    res.status(500).json({
      success: false,
      message: "Error updating product",
    })
  }
})

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
router.delete("/:id", [protect, adminOnly], async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      })
    }

    // Soft delete - set isActive to false
    await Product.findByIdAndUpdate(req.params.id, { isActive: false })

    res.json({
      success: true,
      message: "Product deleted successfully",
    })
  } catch (error) {
    console.error("Delete product error:", error)
    res.status(500).json({
      success: false,
      message: "Error deleting product",
    })
  }
})

// @desc    Add product review
// @route   POST /api/products/:id/reviews
// @access  Private
router.post("/:id/reviews", [protect], async (req, res) => {
  try {
    const { rating, comment } = req.body

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      })
    }

    const product = await Product.findById(req.params.id)

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      })
    }

    // Check if user already reviewed this product
    const existingReview = product.reviews.find((review) => review.user.toString() === req.user._id.toString())

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this product",
      })
    }

    // Add review
    const review = {
      user: req.user._id,
      rating: Number(rating),
      comment,
    }

    product.reviews.push(review)

    // Update product rating
    product.rating.count = product.reviews.length
    product.rating.average = product.reviews.reduce((acc, review) => acc + review.rating, 0) / product.reviews.length

    await product.save()

    res.status(201).json({
      success: true,
      message: "Review added successfully",
    })
  } catch (error) {
    console.error("Add review error:", error)
    res.status(500).json({
      success: false,
      message: "Error adding review",
    })
  }
})

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
router.get("/featured/list", async (req, res) => {
  try {
    const products = await Product.find({
      isFeatured: true,
      isActive: true,
    })
      .limit(8)
      .select("-reviews")
      .sort({ createdAt: -1 })

    res.json({
      success: true,
      data: products,
    })
  } catch (error) {
    console.error("Get featured products error:", error)
    res.status(500).json({
      success: false,
      message: "Error fetching featured products",
    })
  }
})

// @desc    Get products on sale
// @route   GET /api/products/sale
// @access  Public
router.get("/sale/list", async (req, res) => {
  try {
    const products = await Product.find({
      onSale: true,
      isActive: true,
    })
      .limit(8)
      .select("-reviews")
      .sort({ salePercentage: -1 })

    res.json({
      success: true,
      data: products,
    })
  } catch (error) {
    console.error("Get sale products error:", error)
    res.status(500).json({
      success: false,
      message: "Error fetching sale products",
    })
  }
})

// @desc    Search products
// @route   GET /api/products/search/:query
// @access  Public
router.get("/search/:query", async (req, res) => {
  try {
    const { query } = req.params
    const { limit = 10 } = req.query

    const products = await Product.find({
      $and: [
        { isActive: true },
        {
          $or: [
            { name: { $regex: query, $options: "i" } },
            { description: { $regex: query, $options: "i" } },
            { tags: { $in: [new RegExp(query, "i")] } },
            { category: { $regex: query, $options: "i" } },
          ],
        },
      ],
    })
      .limit(Number.parseInt(limit))
      .select("name price images category")

    res.json({
      success: true,
      data: products,
    })
  } catch (error) {
    console.error("Search products error:", error)
    res.status(500).json({
      success: false,
      message: "Error searching products",
    })
  }
})

module.exports = router
