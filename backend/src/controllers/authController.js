const User = require("../models/User");
const { sendTokens, generateAccessToken } = require("../utils/generateTokens");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, email and password",
      });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }
    const allowedRoles = ["buyer", "seller"];
    const userRole = allowedRoles.includes(role) ? role : "buyer";

    const user = await User.create({ name, email, password, role: userRole });

    sendTokens(res, user, 201, "Account created successfully");
  } catch (error) {
    // console.log("Error name:", error.name);
    // console.log("Error message:", error.message);
    // console.log("Error stack:", error.stack);
    res.status(500).json({ success: false, message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }
    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }
    sendTokens(res, user, 200, "Logged in successfully");
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const logout = (req, res) => {
  res.cookie("refreshToken", "", {
    httpOnly: true,
    expires: new Date(0),
  });
  res.json({ success: true, message: "Logged out successfully" });
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { register, login, logout, getMe };
