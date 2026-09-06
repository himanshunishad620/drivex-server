const Redis = require("redis");
require("dotenv").config();
const client = new Redis.createClient({
  username: "default",
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  },
});

client.connect();

client.on("ready", () => console.log("✅ Connected to Redis"));
client.on("error", (err) => console.error("❌ Redis Error:", err));

module.exports = client;
