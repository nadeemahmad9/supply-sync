const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");
const dotenv = require("dotenv");

dotenv.config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.NODE_ENV === "production"
  ? "https://supply-sync.onrender.com/api/auth/google/callback"
  : "http://localhost:5000/api/auth/google/callback",


    scope: ["profile", "email"],


    },
    
    async (accessToken, refreshToken, profile, done) => {
      try {

                console.log("Google Profile:", profile); // ✅ Debug

        const email = profile.emails?.[0]?.value;
        if (!email) {
          return done(new Error("No email found in Google profile"), null);
        }

        // Find existing user
        let user = await User.findOne({ email });

        if (!user) {
          // Create new user
          user = await User.create({
            name: profile.displayName,
            email: email,
            password: "google-oauth", // placeholder since Google handles auth
            Avatar: profile.photos?.[0]?.value || "",
          });
        } else {
          // Update profile picture if different or missing
          if (profile.photos?.[0]?.value && user.avatar !== profile.photos[0].value) {
            user.avatar = profile.photos[0].value;
            await user.save();
          }
        }

        done(null, user);
      } catch (err) {
                console.error("Google Auth Error:", err); // ✅ See error in logs

        done(err, null);
      }
    }
  )
);

// Serialize user into session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;
