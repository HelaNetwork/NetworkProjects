require("dotenv").config();

const express = require("express");
const cors = require("cors");
const multer = require("multer");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const app = express();
const PORT = process.env.PORT || 4000;

// --- Middleware ---
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : ["http://localhost:3000"];

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// --- DB (simple JSON file) ---
const DB_PATH = path.join(__dirname, "data", "papers.json");

// ensure data dir exists
if (!fs.existsSync(path.join(__dirname, "data"))) {
  fs.mkdirSync(path.join(__dirname, "data"), { recursive: true });
}
// ensure uploads dir exists
if (!fs.existsSync(path.join(__dirname, "uploads"))) {
  fs.mkdirSync(path.join(__dirname, "uploads"), { recursive: true });
}
// ensure papers.json exists
if (!fs.existsSync(DB_PATH)) {
  fs.writeFileSync(DB_PATH, "[]");
}

function readDB() {
  try {
    return JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
  } catch {
    return [];
  }
}

function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// --- Multer config ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, "uploads")),
  filename: (req, file, cb) => {
    const unique = `${uuidv4()}-${file.originalname}`;
    cb(null, unique);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      return cb(new Error("Only PDFs allowed"), false);
    }
    cb(null, true);
  },
  limits: { fileSize: 20 * 1024 * 1024 },
});

// --- Routes ---
app.post("/api/papers", upload.single("file"), (req, res) => {
  try {
    const { title } = req.body;
    if (!title || !req.file) {
      return res.status(400).json({ error: "Title and PDF required" });
    }
    const fileBuffer = fs.readFileSync(req.file.path);
    const hash = crypto.createHash("sha256").update(fileBuffer).digest("hex");
    const paper = {
      id: uuidv4(),
      title: title.trim(),
      filename: req.file.filename,
      originalName: req.file.originalname,
      filePath: `/uploads/${req.file.filename}`,
      hash,
      txHash: null,
      walletAddress: null,
      onChain: false,
      uploadedAt: new Date().toISOString(),
    };
    const papers = readDB();
    papers.push(paper);
    writeDB(papers);
    res.status(201).json(paper);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/papers", (req, res) => res.json(readDB()));

app.get("/api/papers/:id", (req, res) => {
  const paper = readDB().find((p) => p.id === req.params.id);
  if (!paper) return res.status(404).json({ error: "Not found" });
  res.json(paper);
});

app.patch("/api/papers/:id", (req, res) => {
  const papers = readDB();
  const idx = papers.findIndex((p) => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Not found" });
  papers[idx] = { ...papers[idx], ...req.body };
  writeDB(papers);
  res.json(papers[idx]);
});

app.delete("/api/papers/:id", (req, res) => {
  const papers = readDB();
  const paper = papers.find((p) => p.id === req.params.id);
  if (!paper) return res.status(404).json({ error: "Not found" });
  const filePath = path.join(__dirname, "uploads", paper.filename);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  writeDB(papers.filter((p) => p.id !== req.params.id));
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`✅ Backend running at http://localhost:${PORT}`);
});