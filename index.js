const app = require("./app");
require("dotenv").config();
const connectDB = require("./config/db");

connectDB();

app.listen(5000, () => {
  console.log(`Server running on portd 5000`);
});
