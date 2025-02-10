import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { sendMail } from "../utils/sendVerificationEmail.js";
import { sendLoginEmail } from "../utils/sendLoginEmail.js";

dotenv.config();

// Create A new User
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

//Verify A new User with 5 degit code
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

// Resend verification token/Code in email address
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

// Login new or Existing User with (email & password)
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "All file Are Required ( email, password)" });
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

    // Create token
    const token = jwt.sign(
      { _id: user._id, email: user.email },
      process.env.SECRET_KEY,
      { expiresIn: "1h" }
    );

    // Set token in cookies
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });

    await sendLoginEmail(user.email, user.name);
    return res.status(200).json(user);
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Error occured during signup, please try again later" });
  }
};

//password reset request send with email
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
    const resetToken = Math.floor(10000 + Math.random() * 90000).toString();
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

    await user.save();
    await sendMail(user.email, resetToken, user.name, "password-reset");
    // await sendMail(user.email, resetToken, user.name, 'password-reset'); // Modify your sendMail function to handle different types of emails
    return res.status(200).json({ message: "Password reset token sent" });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message:
        "Error occurred while requesting password reset, please try again later",
    });
  }
};
//verify 5 degit password reset Code
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
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

    user.resetPasswordToken = undefined; // Clear the reset token and its expiration
    user.resetPasswordExpiresAt = undefined;
    await user.save();
    return res.status(200).json({ message: "Token reset successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message:
        "Error occurred while resetting password, please try again later",
    });
  }
};
//after reset newpassword
export const resetNewPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword) {
      return res.status(400).json({ message: "new password are required" });
    }
    const user = await User.findOne();

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    return res.status(200).json({ message: "newPassword reset successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message:
        "Error occurred while resetting password, please try again later",
    });
  }
};

// check authentick & isverified:true user Profile data
export const checkAuth = async (req, res) => {
  try {
    if (req.user) {
      const user = await User.findById(req.user._id);
      if (user && user.isverified === true) {
        return res.status(200).json(user);
      } else {
        return res.status(403).json({ message: "User not verified" });
      }
    }
    res.sendStatus(401);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
};

//check authentick & isverified&isadmin::true user Profile data & isadmin true
export const adminAuth = async (req, res) => {
  try {
    if (req.user) {
      const user = await User.findById(req.user._id);
      if (user && user.isverified === true && user.isadmin === true) {
        return res.status(200).json(user);
      } else {
        return res.status(403).json({ message: "User not verified admin " });
      }
    }
    res.sendStatus(401);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
};
//Logout and crear cookie
export const logout = async (_, res) => {
  try {
    res.cookie("token", {
      maxAge: 0,
      sameSite: process.env.PRODUCTION === "true" ? "None" : "Lax",
      httpOnly: true,
      secure: process.env.PRODUCTION === "true" ? true : false,
    });
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.log(error);
  }
};

// Show All User (verified or not verified)
export const alluser = async (req, res) => {
  try {
    const user = await User.find();
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Show User by _id (verified or not verified)
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

// Update User by _id (verified or not verified)
export const updateUserByID = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};

// Delete User by _id (verified or not verified)
export const deleteUserByID = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};
