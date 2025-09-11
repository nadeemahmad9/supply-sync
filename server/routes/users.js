const express = require("express")
const User = require("../models/User")
const { protect, adminOnly } = require("../middleware/auth")

const router = express.Router()

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
router.get("/", [protect, adminOnly], async (req, res) => {
  try {
    const { page = 1, limit = 10, search, role } = req.query

    // Build query
    const query = {}

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { department: { $regex: search, $options: "i" } },
      ]
    }

    if (role && role !== "all") {
      query.role = role
    }

    const users = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await User.countDocuments(query)

    res.json({
      success: true,
      data: users,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        limit,
      },
    })
  } catch (error) {
    console.error("Get users error:", error)
    res.status(500).json({
      success: false,
      message: "Error fetching users",
    })
  }
})

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private/Admin
router.get("/:id", [protect, adminOnly], async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password")

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    res.json({
      success: true,
      data: user,
    })
  } catch (error) {
    console.error("Get user error:", error)
    res.status(500).json({
      success: false,
      message: "Error fetching user",
    })
  }
})

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
router.put("/:id", [protect, adminOnly], async (req, res) => {
  try {
    const { name, email, role, department, phone, isActive } = req.body

    const user = await User.findById(req.params.id)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    // Check if email is being changed and if it already exists
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email })
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "User with this email already exists",
        })
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        name,
        email,
        role,
        department,
        phone,
        isActive,
      },
      { new: true, runValidators: true },
    ).select("-password")

    res.json({
      success: true,
      message: "User updated successfully",
      data: updatedUser,
    })
  } catch (error) {
    console.error("Update user error:", error)
    res.status(500).json({
      success: false,
      message: "Error updating user",
    })
  }
})

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
router.delete("/:id", [protect, adminOnly], async (req, res) => {
  try {
    const user = await User.findById(req.params.id)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own account",
      })
    }

    // Soft delete - set isActive to false
    await User.findByIdAndUpdate(req.params.id, { isActive: false })

    res.json({
      success: true,
      message: "User deleted successfully",
    })
  } catch (error) {
    console.error("Delete user error:", error)
    res.status(500).json({
      success: false,
      message: "Error deleting user",
    })
  }
})

module.exports = router
