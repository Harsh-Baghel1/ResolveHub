const nodemailer = require("nodemailer");

const transporter =
  nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

const sendMail = async (
  to,
  subject,
  text
) => {
  try {
    await transporter.sendMail({
      from: `"ResolveHub" <${process.env.MAIL_USER}>`,
      to,
      subject,
      text,
    });

    console.log(
      `Mail sent to ${to}`
    );

  } catch (error) {
    console.error(
      "Mail Error:",
      error.message
    );
  }
};

module.exports = {
  sendMail,
};