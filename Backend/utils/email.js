const nodemailer = require('nodemailer');

/**
 * Sends an email using nodemailer.
 * @param {Object} options - Email options.
 * @param {string} options.to - The recipient's email address.
 * @param {string} options.subject - The subject of the email.
 * @param {string} options.message - The plain text message of the email.
 */
const sendEmail = async (options) => {
  // 1. Create a transporter using SMTP. For development, you can use a
  // service like Mailtrap.io. For production, use a transactional email
  // service like SendGrid, Mailgun, or AWS SES.
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // 2. Define the email options. Nodemailer expects the body in a 'text' or 'html' property.
  // We will map our 'message' property to 'text'.
  const mailOptions = {
    from: options.from,
    to: options.to,
    subject: options.subject,
    text: options.message,
  };

  // 2. Send the email with the defined options.
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;