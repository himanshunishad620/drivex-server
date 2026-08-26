const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async (to, subject, text) => {
  try {
    await transporter.sendMail({
      to,
      subject,
      text,
    });
  } catch (error) {
    console.log(error);
  }
};

module.exports = sendEmail;

// const sgMail = require("@sendgrid/mail");
// require("dotenv").config();
// // const API_KEY =
// //   ;
// sgMail.setApiKey(process.env.API_KEY);
// const sendEmail = async (to, subject, text) => {
//   const message = {
//     to,
//     from: process.env.EMAIL_USER,
//     subject,
//     text,
//   };
//   sgMail
//     .send(message)
//     .then((res) => console.log("Email Sent"))
//     .catch((err) => console.log(err));
// };

// module.exports = sendEmail;
