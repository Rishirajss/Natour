const nodemailer = require('nodemailer');

const sendEmail = async (option) => {
    console.log(option);
  try {
    // 1) Create a transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
      secure: false, // Use true for port 465, false for others
      tls: {
        rejectUnauthorized: false, // Allow self-signed certificates (only for testing)
    },
    });

    // 2) Define the email options
    const mailOptions = {
      from: 'Natorus <admin@gmail.com>',
      to: option.email,
      subject: option.subject,
      text: option.message,
    };

    // 3) Actually send the email
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully!");
  } catch (error) {
    console.error("Error sending email:", error.message);
    throw error; // Rethrow to handle in the caller function
  }
};

module.exports = sendEmail;
