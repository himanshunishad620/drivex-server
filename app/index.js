// const serverless = require("serverless-http");
// const app = require("../app");
// const connectDB = require("../config/db");

// let isConnected = false;

// // Ensure DB connects only once
// const connect = async () => {
//   if (!isConnected) {
//     await connectDB();
//     isConnected = true;
//     console.log("DB connected");
//   }
// };

// module.exports.handler = async (req, res) => {
//   await connect();
//   return serverless(app)(req, res);
// };

const app = require("./app");
require("dotenv").config();
const connectDB = require("./config/db");

connectDB();

module.exports = app;
