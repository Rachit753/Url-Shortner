const express = require("express");
const dotenv = require("dotenv");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");
const mongoSanitize = require("express-mongo-sanitize");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");


dotenv.config();

const app = express();

app.use(express.json());
app.use(helmet());
app.use(cors({
  origin: ["http://localhost:3000"],
  credentials: true
}));
app.use(morgan("dev"));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: "Too many requests, please try again later.",
});
app.use(limiter);

app.use(mongoSanitize());

const urlRoutes = require("./routes/urlRoutes");
app.use("/api/url", urlRoutes);
app.use("/", urlRoutes);

app.get("/", (req, res) => {
  res.send("$$ URL Shortener API Running...");
});

app.use(errorHandler);


connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`$ Server running on port ${PORT}`);
});
