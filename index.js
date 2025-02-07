import dotenv from "dotenv";
import connectDB from "./database/db.js";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import morgan from "morgan";
// import compression from "compression";
import noticeRoute from "./controllers/Notice.js";
import auth from "./routes/Auth.js";
import responseTime from "response-time";
// import vhost from "vhost";
import favicon from "serve-favicon";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: "./.env",
}); // Load .env file
const app = express(); // server init as app
connectDB(); //database Connection
app.set("view engine", "ejs"); // ejs setup

app.use(favicon(path.join(__dirname, "public", "favicon.ico")));
app.use(express.static(path.join(__dirname, "public"))); // Serve static files from the public directory

// middlewares
app.use(responseTime());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan("dev")); //show api hit terminal

// app.use(
//   compression({
//     level: 9, //0-9 level
//     threshold: 100 * 1024, //100kb min
//     filter: (req, res) => {
//       if (req.headers["x-no-compression"]) {
//         return false;
//       }
//       return compression.filter(req, res);
//     },
//   })
// );

app.use(
  cors({
    origin: process.env.CORS_ORIGIN.split(",") || [
      "http://localhost:5173",
      "http://localhost:5174",
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"],
    credentials: true,
    optionsSuccessStatus: 204,
  })
);

//routes declaration For REST API
app.use("/notice", noticeRoute);
app.use("/api/auth", auth);

//ejs backend route
app.get("/ejs", (req, res) => {
  res.render("index.ejs");
});

//APP LISTENER
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`\n !!! Express Server Running On PORT: ${PORT}`);
});

//express backend route
app.get("/data", (req, res) => {
  const data = "ekhlasur ".repeat(10);
  res.send(data);
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});
app.get("/json", (req, res) => {
  res.json({ name: "ekhlasur rahman", email: "miekhlas@gmail.com" });
});
app.get("/jsonp", (req, res) => {
  res.jsonp({ name: "ekhlasur rahman", email: "miekhlas@gmail.com" });
});
app.get("/status", (req, res) => {
  res.status(404).send("Not Found");
});
app.get("/sendstatus", (req, res) => {
  res.sendStatus(404);
});
app.get("/end", (req, res) => {
  res.end();
});
app.get("/redirect", (req, res) => {
  res.redirect("/");
});
app.get("/sendfile", (req, res) => {
  res.sendFile("./public/index.html");
});
app.get("/download", (req, res) => {
  res.download("./public/index.html");
});
app.get("/downloadpdf", (req, res) => {
  res.download("./public/index.html", "filensme.pdf");
});
app.get("/type", (req, res) => {
  res.type("application/json");
});
app.get("/slow", (req, res) => {
  setTimeout(() => {
    res.send("This response was delayed by 5 seconds");
  }, 8000);
});
app.get("/sloww", (_, res) => {
  setTimeout(() => {
    res.send("This response was delayed by 3 seconds");
  }, 3000);
});

// const app2 = express();
// app2.get("/", (req, res) => {
//   res.send("Welcome to vhost ");
// });

// app.use(vhost("ekh.example.com", app2));
