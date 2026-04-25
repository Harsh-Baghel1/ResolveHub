const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const {
  generateAccessToken,
  generateRefreshToken,
} = require("../utils/generateToken");

// ======================================
// REGISTER
// ======================================
exports.register = async (
  req,
  res,
  next
) => {
  try {
    const {
      name,
      email,
      password,
    } = req.body;

    const userExists =
      await User.findOne({
        email,
      });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message:
          "User already exists",
      });
    }

    const hashedPassword =
      await bcrypt.hash(
        password,
        10
      );

    await User.create({
      name,
      email,
      password:
        hashedPassword,
    });

    res.status(201).json({
      success: true,
      message:
        "User registered successfully",
    });
  } catch (error) {
    next(error);
  }
};

// ======================================
// LOGIN
// ======================================
exports.login = async (
  req,
  res,
  next
) => {
  try {
    const {
      email,
      password,
    } = req.body;

    const user =
      await User.findOne({
        email,
      });

    if (!user) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid credentials",
      });
    }

    const isMatch =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid credentials",
      });
    }

    const accessToken =
      generateAccessToken(
        user
      );

    const refreshToken =
      generateRefreshToken(
        user
      );

    user.refreshToken =
      refreshToken;

    await user.save();

    res.json({
      success: true,
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email:
          user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ======================================
// REFRESH TOKEN
// ======================================
exports.refreshToken = async (req,res,next) => {
    try {
      const { refreshToken: token } = req.body;ody;

      if (!refreshToken) {
        return res.status(401).json({
          success: false,
          message:
            "No refresh token",
        });
      }

      const decoded =
        jwt.verify(
          refreshToken,
          process.env
            .JWT_REFRESH_SECRET
        );

      const user =
        await User.findById(
          decoded.id
        );

      if (
        !user ||
        user.refreshToken !==
          refreshToken
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Invalid refresh token",
        });
      }

      const newAccessToken =
        generateAccessToken(
          user
        );

      res.json({
        success: true,
        accessToken:
          newAccessToken,
      });
    } catch (error) {
      next(error);
    }
  };

// ======================================
// GET CURRENT USER
// ======================================
exports.getMe = async (
  req,
  res,
  next
) => {
  try {
    const user =
      await User.findById(
        req.user.id
      ).select(
        "-password -refreshToken"
      );

    if (!user) {
      return res.status(404).json({
        success: false,
        message:
          "User not found",
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};