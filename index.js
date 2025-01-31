import dotenv from "dotenv";
import connectDB from "./database/db.js";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";

// Load environment variables from .env file
dotenv.config({
  path: "./.env",
});

// server init as app
const app = express();

//database Connection
connectDB();

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieParser());
app.use(morgan("dev"));
app.use(
  cors({
    origin: process.env.ORIGIN || "*", // Allow all origins if CORS_ORIGIN is not set
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
    exposedHeaders: ["X-Total-Count", "Authorization"], // Expose additional headers
    methods: ["GET", "POST", "PATCH", "DELETE", "PUT", "OPTIONS"], // Include more HTTP methods
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
    ],
  })
);

//routes declaration For REST API
// app.use("/users", userRouter);

//express backend route
app.get("/", (req, res) => {
  res.send("<h1>Welcome to Express Backend</h1>");
});

// ejs setup
app.set("view engine", "ejs");

//ejs backend route
app.get("/ejs", (req, res) => {
  res.render("index.ejs");
});

//APP LISTENER
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`\n !!! Express Server Running On PORT: ${PORT}`);
});
