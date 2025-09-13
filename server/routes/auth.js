const express = require("express")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const passport = require("passport")
const User = require("../models/User")
const { protect } = require("../middleware/auth");

const { body, validationResult } = require("express-validator")

const router = express.Router()

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  })
}



// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
router.post(
  "/register",
  [
    body("name").trim().isLength({ min: 2 }).withMessage("Name must be at least 2 characters"),
    body("email").isEmail().withMessage("Please enter a valid email"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
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

      const { name, email, password, role = "employee" } = req.body

      // Check if user exists
      const existingUser = await User.findOne({ email })
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "User already exists with this email",
        })
      }

      // Create user
      const user = await User.create({
        name,
        email,
        password,
        role,
      })

      // Generate token
      const token = generateToken(user._id)

      res.status(201).json({
        success: true,
        message: "User registered successfully",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
        },
      })
    } catch (error) {
      console.error("Registration error:", error)
      res.status(500).json({
        success: false,
        message: "Server error during registration",
      })
    }
  },
)

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Please enter a valid email"),
    body("password").exists().withMessage("Password is required"),
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

      const { email, password } = req.body

      // Check if user exists
      const user = await User.findOne({ email }).select("+password")
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Invalid credentials",
        })
      }

      
      // Check if user is active
      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: "Account is deactivated. Please contact administrator.",
        })
      }

      // Check password
      const isPasswordValid = await user.comparePassword(password)
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: "Invalid credentials",
        })
      }

      // Update last login
      user.lastLogin = new Date()
      await user.save()

      // Generate token
      const token = generateToken(user._id)

      res.json({
        success: true,
        message: "Login successful",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
        },
      })
    } catch (error) {
      console.error("Login error:", error)
      res.status(500).json({
        success: false,
        message: "Server error during login",
      })
    }
  },
)

// @desc    Google OAuth
// @route   GET /api/auth/google
// @access  Public
// router.get(
//   "/google",
//   passport.authenticate("google", {
//     scope: ["profile", "email"],
//   }),
// )

// // @desc    Google OAuth callback
// // @route   GET /api/auth/google/callback
// // @access  Public
// // router.get("/google/callback", passport.authenticate("google", { failureRedirect: "/login" }), async (req, res) => {
// //   try {
// //     // Generate token for the authenticated user
// //     const token = generateToken(req.user._id)

// //     // Update last login
// //     req.user.lastLogin = new Date()
// //     await req.user.save()

// //     // Redirect to appropriate frontend based on user role
// //     const redirectUrl =
// //       req.user.role === "admin"
// //         ? `${process.env.ADMIN_URL}/dashboard?token=${token}`
// //         : `${process.env.CLIENT_URL}/dashboard?token=${token}`

// //     res.redirect(redirectUrl)
// //   } catch (error) {
// //     console.error("Google OAuth callback error:", error)
// //     res.redirect(`${process.env.CLIENT_URL}/login?error=oauth_failed`)
// //   }
// // })

// router.get(
//   "/google/callback",
//   passport.authenticate("google", { failureRedirect: "/login" }),
//   async (req, res) => {
//     try {
//       // Generate JWT token for the user
//       const token = jwt.sign(
//         { id: req.user._id },
//         process.env.JWT_SECRET,
//         { expiresIn: "30d" }
//       );

//       // Redirect to frontend with token
//       const redirectUrl =
//         req.user.role === "admin"
//           ? `${process.env.ADMIN_URL}/dashboard?token=${token}`
//           : `${process.env.CLIENT_URL}/dashboard?token=${token}`;

//       res.redirect(redirectUrl);
//     } catch (error) {
//       console.error("Google OAuth callback error:", error);
//       res.redirect(`${process.env.CLIENT_URL}/login?error=oauth_failed`);
//     }
//   }
// );



// router.get(
//   "/google",
//   passport.authenticate("google", { scope: ["profile", "email"] })
// );

// // @desc   Google callback
// router.get(
//   "/google/callback",
//   passport.authenticate("google", { session: false }),
//   async (req, res) => {
//     try {
//       // Find existing user by email
//       let user = await User.findOne({ email: req.user.email });

//       if (!user) {
//         // Create a new user if not found
//         user = await User.create({
//           name: req.user.name,
//           email: req.user.email,
//           password: "google-oauth", // placeholder password
//           avatar: req.user.avatar || null,
//         });
//       } else {
//         // Update profile picture if changed or missing
//         if (req.user.avatar && user.avatar !== req.user.avatar) {
//           user.avatar = req.user.avatar;
//           await user.save();
//         }
//       }

//       // Generate JWT
//       const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
//         expiresIn: "20d",
//       });

//       // Redirect to frontend with token
// res.redirect(`${process.env.CLIENT_URL}/login?token=${token}`);

//     } catch (err) {
//       console.error("Google callback error:", err);
//       res.redirect(`${process.env.CLIENT_URL}/login?error=google_auth_failed}`);
//     }
//   }
// );


// @desc    Start Google OAuth
// @route   GET /api/auth/google
// router.get(
//   "/google",
//   passport.authenticate("google", { scope: ["profile", "email"] })
// );

// // @desc    Google OAuth callback
// // @route   GET /api/auth/google/callback
// router.get(
//   "/google/callback",
//   passport.authenticate("google", { failureRedirect: `${process.env.CLIENT_URL}/login` }),
//   async (req, res) => {
//     try {
//       // Find or create user
//       let user = await User.findOne({ email: req.user.email });

//       if (!user) {
//         user = await User.create({
//           name: req.user.name,
//           email: req.user.email,
//           password: "google-oauth",
//           avatar: req.user.avatar || null,
//         });
//       } else {
//         if (req.user.avatar && user.avatar !== req.user.avatar) {
//           user.avatar = req.user.avatar;
//           await user.save();
//         }
//       }

//       // Generate JWT token
//       const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
//         expiresIn: "20d",
//       });

//       // Redirect to frontend with token
//       const redirectUrl =
//         user.role === "admin"
//           ? `${process.env.ADMIN_URL}/dashboard?token=${token}`
//           : `${process.env.CLIENT_URL}/dashboard?token=${token}`;

//       res.redirect(redirectUrl);
//     } catch (err) {
//       console.error("Google callback error:", err);
//       res.redirect(`${process.env.CLIENT_URL}/login?error=google_auth_failed`);
//     }
//   }
// );


// // @desc   Get logged-in Google user
// router.get("/google/user", protect, async (req, res) => {
//   try {
//     if (!req.user) {
//       return res.status(404).json({ message: "User not found" });
//     }
//     res.json(req.user); // full user object without password
//   } catch (err) {
//     console.error("Error fetching Google user:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// });




// @desc   Start Google login
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// @desc   Google callback
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  async (req, res) => {
    try {
      // Find existing user by email
      let user = await User.findOne({ email: req.user.email });

      if (!user) {
        // Create a new user if not found
        user = await User.create({
          name: req.user.name,
          email: req.user.email,
          password: "google-oauth", // placeholder password
          avatar: req.user.avatar || null,
        });
      } else {
        // Update profile picture if changed or missing
        if (req.user.avatar && user.avatar !== req.user.avatar) {
          user.avatar = req.user.avatar;
          await user.save();
        }
      }

      // Generate JWT
      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
        expiresIn: "30d",
      });

      // Redirect to frontend with token
res.redirect(`${process.env.CLIENT_URL}/login?token=${token}`);

    } catch (err) {
      console.error("Google callback error:", err);
      res.redirect(`${process.env.CLIENT_URL}/login?error=google_auth_failed}`);
    }
  }
);

// @desc   Get logged-in Google user
router.get("/google/user", protect, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(req.user); // full user object without password
  } catch (err) {
    console.error("Error fetching Google user:", err);
    res.status(500).json({ message: "Server error" });
  }
});




// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
router.get("/me", async (req, res) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "")

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.id)

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: "User not found or inactive",
      })
    }

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
    })
  } catch (error) {
    console.error("Get user error:", error)
    res.status(401).json({
      success: false,
      message: "Invalid token",
    })
  }
})

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
router.post("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Error during logout",
      })
    }
    res.json({
      success: true,
      message: "Logged out successfully",
    })
  })
})

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
// router.put("/profile", async (req, res) => {
//   try {
//     const token = req.header("Authorization")?.replace("Bearer ", "")
//     const decoded = jwt.verify(token, process.env.JWT_SECRET)

//     const { name, phone, department, address } = req.body

//     const user = await User.findByIdAndUpdate(
//       decoded.id,
//       {
//         name,
//         phone,
//         department,
//         address,
//       },
//       { new: true, runValidators: true },
//     )

//     res.json({
//       success: true,
//       message: "Profile updated successfully",
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//         avatar: user.avatar,
//         department: user.department,
//         phone: user.phone,
//         address: user.address,
//       },
//     })
//   } catch (error) {
//     console.error("Profile update error:", error)
//     res.status(500).json({
//       success: false,
//       message: "Error updating profile",
//     })
//   }
// })


router.put("/profile", async (req, res) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token, authorization denied",
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(403).json({
        success: false,
        message: "Token is invalid or expired",
      });
    }

    const { name, phone, department, address } = req.body;

    const user = await User.findByIdAndUpdate(
      decoded.id,
      { name, phone, department, address },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      message: "Profile updated successfully",
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
    console.error("Profile update error:", error);
    res.status(500).json({
      success: false,
      message: "Server error updating profile",
    });
  }
});

module.exports = router
