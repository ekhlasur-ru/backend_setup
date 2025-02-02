import express from "express";
// import multer from "multer";
import Notice from "../models/Notice.js";
import upload from "../middlewares/Notice.js";

const router = express.Router();

// // Set up Multer for file uploads
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, "noticePhotos");
//     },
//     filename: (req, file, cb) => {
//         cb(null, Date.now() + "-" + file.originalname);
//     },
// });

// const upload = multer({ storage: storage });

// Create a new notice
router.post("/", upload.single("photo"), async (req, res) => {
  const { title } = req.body;
  const photo = req.file ? req.file.path : "";
  try {
    const newNotice = new Notice({ title, photo });
    await newNotice.save();
    res.status(201).json(newNotice);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Read all notices
router.get("/", async (req, res) => {
  try {
    const notices = await Notice.find();
    res.status(200).json(notices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Read a single notice by ID
router.get("/:id", async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);
    if (!notice) return res.status(404).json({ message: "Notice not found" });
    res.status(200).json(notice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update a notice by ID
router.put("/:id", upload.single("photo"), async (req, res) => {
  const { title } = req.body;
  const photo = req.file ? req.file.path : "";
  try {
    const notice = await Notice.findByIdAndUpdate(
      req.params.id,
      { title, photo },
      { new: true, runValidators: true }
    );
    if (!notice) return res.status(404).json({ message: "Notice not found" });
    res.status(200).json(notice);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a notice by ID
router.delete("/:id", async (req, res) => {
  try {
    const notice = await Notice.findByIdAndDelete(req.params.id);
    if (!notice) return res.status(404).json({ message: "Notice not found" });
    res.status(200).json({ message: "Notice deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
