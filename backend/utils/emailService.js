const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async (to, subject, html) => {
  try {
    const mailOptions = {
      from: `"Village Service Platform" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Email sending failed:', error.message);
    // Don't throw - email failure shouldn't break the app
    return null;
  }
};

const getStatusChangeEmail = (userName, requestTitle, oldStatus, newStatus, resolutionNote) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #4361ee; color: #fff; padding: 20px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="margin: 0; font-size: 22px;">🏘️ Village Service Platform</h1>
      </div>
      <div style="background: #fff; padding: 24px; border: 1px solid #e8e8e8; border-radius: 0 0 12px 12px;">
        <h2 style="color: #1a1a2e; font-size: 18px;">Request Status Updated</h2>
        <p style="color: #555; font-size: 14px;">Hi ${userName},</p>
        <p style="color: #555; font-size: 14px;">Your service request <strong>"${requestTitle}"</strong> has been updated.</p>
        <div style="background: #f8f9fa; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p style="margin: 4px 0; font-size: 14px; color: #666;">
            <strong>Previous Status:</strong> <span style="text-transform: capitalize;">${oldStatus}</span>
          </p>
          <p style="margin: 4px 0; font-size: 14px; color: #666;">
            <strong>New Status:</strong> <span style="text-transform: capitalize; color: #4361ee; font-weight: 600;">${newStatus}</span>
          </p>
          ${resolutionNote ? `<p style="margin: 8px 0 4px; font-size: 14px; color: #666;"><strong>Note:</strong> ${resolutionNote}</p>` : ''}
        </div>
        <p style="color: #555; font-size: 14px;">Login to your dashboard to view full details and communicate with the assigned official.</p>
        <p style="color: #999; font-size: 12px; margin-top: 24px;">This is an automated notification from Village Service Platform.</p>
      </div>
    </div>
  `;
};

const getNewRequestEmail = (officialName, requestTitle, citizenName, category, urgency) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #4361ee; color: #fff; padding: 20px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="margin: 0; font-size: 22px;">🏘️ Village Service Platform</h1>
      </div>
      <div style="background: #fff; padding: 24px; border: 1px solid #e8e8e8; border-radius: 0 0 12px 12px;">
        <h2 style="color: #1a1a2e; font-size: 18px;">New Service Request</h2>
        <p style="color: #555; font-size: 14px;">Hi ${officialName},</p>
        <p style="color: #555; font-size: 14px;">A new service request has been submitted.</p>
        <div style="background: #f8f9fa; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p style="margin: 4px 0; font-size: 14px; color: #666;"><strong>Title:</strong> ${requestTitle}</p>
          <p style="margin: 4px 0; font-size: 14px; color: #666;"><strong>By:</strong> ${citizenName}</p>
          <p style="margin: 4px 0; font-size: 14px; color: #666;"><strong>Category:</strong> <span style="text-transform: capitalize;">${category}</span></p>
          <p style="margin: 4px 0; font-size: 14px; color: #666;"><strong>Urgency:</strong> <span style="text-transform: capitalize;">${urgency}</span></p>
        </div>
        <p style="color: #555; font-size: 14px;">Login to your dashboard to review and take action.</p>
        <p style="color: #999; font-size: 12px; margin-top: 24px;">This is an automated notification from Village Service Platform.</p>
      </div>
    </div>
  `;
};

module.exports = { sendEmail, getStatusChangeEmail, getNewRequestEmail };