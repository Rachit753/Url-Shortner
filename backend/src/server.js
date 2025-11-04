const express = require("express");
//const mongoose = require("mongoose");
const dotenv = require("dotenv");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");
const mongoSanitize = require("express-mongo-sanitize");
const connectDB = require("./config/db"); //new

dotenv.config();

const app = express();

// ------------------- Middlewares -------------------
app.use(express.json());
app.use(helmet());
app.use(cors());
app.use(morgan("dev"));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: "Too many requests, please try again later.",
});
app.use(limiter);

// Mongo Sanitize
app.use(mongoSanitize());

// ------------------- Routes -------------------
const urlRoutes = require("./routes/UrlRoutes");
app.use("/api/url", urlRoutes);

app.get("/", (req, res) => {
  res.send("🚀 URL Shortener API Running...");
});

// ------------------- Database -------------------

connectDB();
// mongoose
//   .connect(process.env.MONGO_URI, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   })
//   .then(() => console.log("✅ MongoDB Connected"))
//   .catch((err) => console.error("❌ DB Connection Error:", err));

// ------------------- Server -------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
