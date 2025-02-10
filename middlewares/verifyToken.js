import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

export const verifyToken = async (req, res, next) => {
  try {
    // Extract the token from request cookies
    const { token } = req.cookies;

    // If the token is missing, return a 401 response
    if (!token) {
      return res
        .status(401)
        .json({ message: "Token missing, please login again" });
    }

    // Verify the token
    const decodedInfo = jwt.verify(token, process.env.SECRET_KEY);

    // Check if the decoded information contains valid details and isVerified is true
    if (decodedInfo && decodedInfo._id && decodedInfo.email) {
      req.user = decodedInfo;
      next();
    } else {
      // If the token is invalid or isVerified is not true, send a response accordingly
      return res.status(401).json({
        message: "Invalid Token or User not verified, please login again",
      });
    }
  } catch (error) {
    console.log(error);

    // Handle specific JWT errors
    if (error instanceof jwt.TokenExpiredError) {
      return res
        .status(401)
        .json({ message: "Token expired, please login again" });
    } else if (error instanceof jwt.JsonWebTokenError) {
      return res
        .status(401)
        .json({ message: "Invalid Token, please login again" });
    } else {
      // Handle other unexpected errors
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
};
