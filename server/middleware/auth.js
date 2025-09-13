const jwt = require("jsonwebtoken")
const User = require("../models/User")
const  asyncHandler = require("express-async-handler");


// Protect routes - verify JWT token
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");

      next();
    } catch (error) {
      res.status(401);
      throw new Error("Not authorized, token failed");
    }
  }

  if (!token) {
    res.status(401);
    throw new Error("Not authorized, no token");
  }
});

// Admin only access
const adminOnly = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(401);
    throw new Error("Not authorized as admin");
  }
};

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
