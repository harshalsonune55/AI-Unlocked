import express from "express";
import bcrypt from "bcryptjs";
import passport from "passport";
import User from "../models/User.js";

const router = express.Router();

/*
SIGNUP
*/
router.post("/signup", async (req, res) => {
  try {

    const { email, password } = req.body;

    const existing = await User.findOne({ email });

    if (existing)
      return res.status(400).json({ error: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      password: hashedPassword
    });

    res.json({
      message: "Signup successful",
      user: {
        id: user._id,
        email: user.email
      }
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/*
LOGIN
*/
router.post("/login",
  passport.authenticate("local", { session: false }),
  (req, res) => {

    res.json({
      message: "Login successful",
      user: {
        id: req.user._id,
        email: req.user.email
      }
    });

  }
);

export default router;