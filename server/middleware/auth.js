const jwt = require("jsonwebtoken")
const User = require("../models/User")

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
  let token

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      // Get token from header
      token = req.headers.authorization.split(" ")[1]

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET)

      // Get user from token
      req.user = await User.findById(decoded.id).select("-password")

      if (!req.user || !req.user.isActive) {
        return res.status(401).json({
          success: false,
          message: "User not found or inactive",
        })
      }

      next()
    } catch (error) {
      console.error("Token verification error:", error)
      return res.status(401).json({
        success: false,
        message: "Not authorized, token failed",
      })
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized, no token",
    })
  }
}

// Admin only access
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next()
  } else {
    res.status(403).json({
      success: false,
      message: "Access denied. Admin privileges required.",
    })
  }
}

// Employee or Admin access
const employeeOrAdmin = (req, res, next) => {
  if (req.user && (req.user.role === "employee" || req.user.role === "admin")) {
    next()
  } else {
    res.status(403).json({
      success: false,
      message: "Access denied. Employee or Admin privileges required.",
    })
  }
}

module.exports = {
  protect,
  adminOnly,
  employeeOrAdmin,
}
