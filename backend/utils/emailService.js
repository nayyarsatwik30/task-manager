const nodemailer = require('nodemailer');

// Create reusable email transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    // Additional secure configuration
    tls: {
      rejectUnauthorized: false
    }
  });
};

// Send email utility function
const sendEmail = async ({ to, subject, text, html }) => {
  try {
    console.log('🔧 EMAIL DEBUG - Creating transporter...');
    const transporter = createTransporter();

    console.log('🔧 EMAIL DEBUG - Verifying transporter...');
    await transporter.verify();
    console.log('✅ EMAIL DEBUG - Transporter verified successfully');

    const mailOptions = {
      from: `"Task Manager" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html: html || text
    };

    console.log('🔧 EMAIL DEBUG - Sending email to:', to);
    const result = await transporter.sendMail(mailOptions);
    console.log('✅ EMAIL DEBUG - Email sent successfully:', result.messageId);

    return {
      success: true,
      messageId: result.messageId,
      response: result.response
    };
  } catch (error) {
    console.error('❌ EMAIL ERROR - Failed to send email:', error);

    // Handle common Gmail errors
    if (error.code === 'EAUTH') {
      return {
        success: false,
        error: 'Authentication failed. Check EMAIL_USER and EMAIL_PASS in .env',
        details: 'Ensure you are using a Google App Password, not your regular password'
      };
    }

    return {
      success: false,
      error: error.message,
      code: error.code
    };
  }
};

module.exports = { sendEmail, createTransporter };
