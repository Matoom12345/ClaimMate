const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, text) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL,     // Gmail ของคุณ
            pass: process.env.EMAIL_PASS // App Password
        }
    });

    const mailOptions = {
        from: `"ClaimMate" <${process.env.EMAIL}>`,
        to,
        subject,
        text
    };

    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;