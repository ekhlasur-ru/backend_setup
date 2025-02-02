import dotenv from "dotenv";
import connectDB from "./database/db.js";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import noticeRoute from "./controllers/Notice.js";

// Load environment variables from .env file
dotenv.config({
  path: "./.env",
});

// server init as app
const app = express();

//database Connection
connectDB();

// Serve static files from the public directory
app.use(express.static("public"));
// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieParser());
app.use(morgan("dev"));
app.use(
  cors({
    origin: "http://localhost:5008",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
    optionsSuccessStatus: 204,
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Content-Type", "Authorization"],
  })
);

//routes declaration For REST API
app.use("/notice", noticeRoute);

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
