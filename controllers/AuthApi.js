import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { sendMail } from "../utils/AuthEmail.js";

dotenv.config();
const secretKey = process.env.SECRET_KEY;

//register
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res
        .status(400)
        .json({ status: false, message: "All files are require" });

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res
        .status(400)
        .json({ status: false, message: "Email Already registered" });

    const hashPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ name, email, password: hashPassword });
    await newUser.save();
    await sendMail(
      newUser.email,
      "Welcome to MERN-AUTH-REDUX-TOOLKIT",
      `<p>Dear ${newUser.name} </p>,

      Thank you for registering for a ${newUser.email} MERN-AUTH-REDUX-TOOLKIT account. We are excited to have you on board.</p>
      
      <p>If you have any questions or need assistance, please feel free to reach out to our support team.</p>
      
      <p>Thank you,
      The MERN-AUTH-REDUX-TOOLKIT Team</p>`
    );
    return res
      .status(201)
      .json({ status: true, message: "Register successful" });
  } catch (error) {
    return res.status(400).json({
      status: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

//Login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res
        .status(400)
        .json({ status: false, message: "All fields are required" });

    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res
        .status(400)
        .json({ status: false, message: "Invalid Credentials" });
    }

    const token = jwt.sign({ id: user._id, email: user.email }, secretKey, {
      expiresIn: "1h",
    });

    res.cookie("token", token, {
      httpOnly: true, //cross-site scripting (XSS) attacks.
      secure: true, //the cookie is only sent over HTTPS
      sameSite: "strict", //protect against cross-site request forgery (CSRF) attacks
      maxAge: 3600000, //cookie will expire after 1 hour.
    });

    return res
      .status(201)
      .json({ status: true, message: "Login successful", token: token });
  } catch (error) {
    return res.status(400).json({
      status: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

// Logout
export const logout = async (req, res) => {
  try {
    res.clearCookie("token");
    // Invalidate the token by simply returning a success message
    return res.status(200).json({ status: true, message: "Logout successful" });
  } catch (error) {
    return res.status(400).json({
      status: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

//Profile
export const profile = async (req, res) => {
  try {
    const token = req.headers?.authorization?.split(" ")[1];
    if (!token)
      return res.status(400).json({ status: false, message: "Access Denied" });

    jwt.verify(token, secretKey, async (err, decode) => {
      const user = await User.findById(decode?.id);
      if (!user)
        return res
          .status(400)
          .json({ status: false, message: "Invalid Token" });
      const userData = {
        id: user?.id,
        name: user?.name,
        email: user?.email,
      };
      return res
        .status(201)
        .json({ status: true, message: "Profile Data", data: userData });
    });
  } catch (error) {
    return res.status(400).json({
      status: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

// Update Profile Picture
export const updateProfilePicture = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ status: false, message: "Access Denied" });
    }

    jwt.verify(token, secretKey, async (err, decoded) => {
      if (err) {
        return res.status(401).json({
          status: false,
          message:
            err.name === "TokenExpiredError"
              ? "Token Expired. Please login again."
              : "Invalid Token",
        });
      }

      const user = await User.findById(decoded.id);
      if (!user) {
        return res
          .status(404)
          .json({ status: false, message: "User not found" });
      }

      user.profilePicture = req.file.path;
      await user.save();

      res.status(200).json({
        status: true,
        message: "Profile picture updated successfully",
        profilePicture: user.profilePicture,
      });
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};
