const sendEmail = require("../services/mailServices");
require("dotenv").config();
exports.contact = async (req, res) => {
  const { message, email, firstName, lastName } = req.body;
  try {
    await sendEmail(
      process.env.EMAIL_USER,
      "You have a new feedback",
      `By:${firstName} ${lastName}
       email:${email}
       ${message}`,
    );
    res.status(200).json({ msg: "Message sent successfuly!" });
  } catch (error) {
    res.status(500).json({ msg: "Internal Server Error!" });
  }
};
