import User from "../models/User.js";
import bcrypt from "bcrypt";
import crypto from "crypto"; // We'll use this to generate a random token
// import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { sendMail } from "../utils/sendVerificationEmail.js";

dotenv.config();
// Create User
export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "All file Are Required (name, email, password)" });
    }
    const UserExist = await User.findOne({ email });
    if (UserExist) {
      return res.status(400).json({ message: "User(email) already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = Math.floor(
      10000 + Math.random() * 90000
    ).toString();
    const user = User({
      name,
      email,
      password: hashedPassword,
      verificationToken,
      // verificationTokenExpiresAt: Date.now() + 20 * 60 * 60 * 1000, //24hours
      verificationTokenExpiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
    });
    await user.save();
    await sendMail(user.email, verificationToken, user.name);
    return res.status(201).json(user);
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Error occured during signup, please try again later" });
  }
};

//Verify User with code
export const verifyEmail = async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ message: "code is required" });
    }
    const user = await User.findOne({
      verificationToken: code,
      verificationTokenExpiresAt: { $gt: Date.now() },
    });
    if (!user) {
      return res.status(400).json({ message: "Invalid Code" });
    }
    user.isverified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiresAt = undefined;

    await user.save();
    return res.status(201).json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error occured during verify Token Code, please try again later",
    });
  }
};

// Resend verification token function
export const resendVerificationToken = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const verificationToken = Math.floor(
      10000 + Math.random() * 90000
    ).toString();
    user.verificationToken = verificationToken;
    user.verificationTokenExpiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

    await user.save();
    await sendMail(user.email, verificationToken, user.name);

    return res.status(200).json({ message: "Verification token resent" });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message:
        "Error occurred while resending the verification token, please try again later",
    });
  }
};

// Login User
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "All file Are Required (name, email, password)" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid Creadentials" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid Creadentials" });
    }
    user.lostlogin = Date.now();
    await user.save();
    // await sendMail(user.email, verificationToken, user.name);
    return res.status(200).json(user);
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Error occured during signup, please try again later" });
  }
};

//password reset request
export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const resetToken = crypto.randomBytes(20).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiresAt = Date.now() + 3600000; // 1 hour

    await user.save();
    await sendMail(user.email, resetToken, user.name, "password-reset");

    // await sendMail(user.email, resetToken, user.name, 'password-reset'); // Modify your sendMail function to handle different types of emails

    return res.status(200).json({ message: "Password reset token sent" });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({
        message:
          "Error occurred while requesting password reset, please try again later",
      });
  }
};
//reset password
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res
        .status(400)
        .json({ message: "Token and new password are required" });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiresAt: { $gt: Date.now() }, // Check if the token has expired
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = undefined; // Clear the reset token and its expiration
    user.resetPasswordExpiresAt = undefined;

    await user.save();

    return res
      .status(200)
      .json({ message: "Password has been reset successfully" });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({
        message:
          "Error occurred while resetting password, please try again later",
      });
  }
};

// Show All User
export const alluser = async (req, res) => {
  try {
    const user = await User.find();
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Show User by _id
export const alluserID = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    await user.save();
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};
