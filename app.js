const express = require("express");
const cors = require("cors");
require("dotenv").config();
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/authRoutes");
const fileRoutes = require("./routes/fileRoutes");
const otherRoutes = require("./routes/otherRoutes");
const app = express();

app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:5173", process.env.FRONTEND_URL],
    credentials: true,
  }),
);
app.use(cookieParser());
app.use("/api", authRoutes);
app.use("/api", fileRoutes);
app.use("/api", otherRoutes);

module.exports = app;
