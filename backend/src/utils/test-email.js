const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env
dotenv.config({ path: path.join(__dirname, '../../.env') });

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT, 10) || 465,
  secure: (process.env.SMTP_PORT || '465') === '465',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const mailOptions = {
  from: process.env.SMTP_FROM,
  to: process.env.SMTP_USER, // Send to your own email address to verify
  subject: '⚡ ReserveX - Real Email Delivery Test',
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1a1a2e; color: #eee; padding: 30px; border-radius: 12px;">
      <h1 style="color: #8b5cf6; text-align: center;">⚡ ReserveX</h1>
      <div style="background: #16213e; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
        <h3>🎉 Real Email Delivery Works!</h3>
        <p>This email was successfully sent using <strong>Nodemailer</strong> and <strong>Gmail SMTP</strong>.</p>
        <p>Your configuration is correct and ready for evaluation!</p>
      </div>
    </div>
  `,
};

console.log('📨 Sending test email...');
transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    console.error('\n❌ Email sending failed:', error.message);
    console.log('\n💡 Please check that:');
    console.log('1. You saved your .env file.');
    console.log('2. Your SMTP_USER is correct.');
    console.log('3. Your SMTP_PASS is the 16-character Google App Password (not your regular Gmail password).');
  } else {
    console.log('\n✅ Email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log(`Check the inbox of ${process.env.SMTP_USER} now!`);
  }
});
