import nodemailer from 'nodemailer';

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

// Send Email
export const sendEmail = async ({ to, subject, html, attachments = [] }) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"Denmark Intern" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
      attachments,
    };
    
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false, error: error.message };
  }
};

// Email Templates
export const emailTemplates = {
  welcome: (name, verificationLink) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Welcome to Denmark Intern!</h2>
      <p>Hi ${name},</p>
      <p>Thank you for signing up. Please verify your email address by clicking the button below:</p>
      <a href="${verificationLink}" style="display: inline-block; padding: 12px 24px; background-color: #0070f3; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">Verify Email</a>
      <p>If you didn't create this account, please ignore this email.</p>
      <p>Best regards,<br>Denmark Intern Team</p>
    </div>
  `,
  
  offerSent: (candidateName, companyName, message, attachments) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>🎉 You have received an internship offer!</h2>
      <p>Hi ${candidateName},</p>
      <p><strong>${companyName}</strong> has sent you an offer for an internship position.</p>
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Message from ${companyName}:</strong></p>
        <p>${message}</p>
      </div>
      ${attachments.length > 0 ? `
        <p><strong>Attached documents:</strong></p>
        <ul>
          ${attachments.map(att => `<li>${att.filename}</li>`).join('')}
        </ul>
      ` : ''}
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/offers" style="display: inline-block; padding: 12px 24px; background-color: #0070f3; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">View Offer</a>
      <p>Best regards,<br>Denmark Intern Team</p>
    </div>
  `,
  
  applicationStatusUpdate: (candidateName, companyName, status, message) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Application Status Update</h2>
      <p>Hi ${candidateName},</p>
      <p>Your application status with <strong>${companyName}</strong> has been updated to: <strong>${status}</strong></p>
      ${message ? `
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p>${message}</p>
        </div>
      ` : ''}
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/applications" style="display: inline-block; padding: 12px 24px; background-color: #0070f3; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">View Details</a>
      <p>Best regards,<br>Denmark Intern Team</p>
    </div>
  `,
  
  companyVerified: (companyName) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>✅ Your company has been verified!</h2>
      <p>Hi ${companyName},</p>
      <p>Congratulations! Your company profile has been verified by our team.</p>
      <p>You can now post internships and receive candidate matches.</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="display: inline-block; padding: 12px 24px; background-color: #0070f3; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">Go to Dashboard</a>
      <p>Best regards,<br>Denmark Intern Team</p>
    </div>
  `,
  
  applicationConfirmation: ({ candidateName, internshipTitle, companyName }) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>✅ Application Submitted Successfully!</h2>
      <p>Hi ${candidateName},</p>
      <p>Your application for <strong>${internshipTitle}</strong> at <strong>${companyName}</strong> has been successfully submitted.</p>
      <div style="background-color: #f0f9ff; padding: 15px; border-left: 4px solid #0070f3; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #0070f3;">Next Steps:</h3>
        <ul style="margin-bottom: 0;">
          <li>The company will review your application</li>
          <li>You'll be notified of any status changes</li>
          <li>Track your application in your dashboard</li>
        </ul>
      </div>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/candidate/applications" style="display: inline-block; padding: 12px 24px; background-color: #0070f3; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">View My Applications</a>
      <p>Good luck with your application!</p>
      <p>Best regards,<br>Denmark Intern Team</p>
    </div>
  `,
  
  newApplicationNotification: ({ companyName, candidateName, internshipTitle, applicationDate }) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>🎯 New Application Received!</h2>
      <p>Hi ${companyName},</p>
      <p>You have received a new application for your internship position.</p>
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Position:</strong> ${internshipTitle}</p>
        <p><strong>Candidate:</strong> ${candidateName}</p>
        <p><strong>Applied on:</strong> ${applicationDate}</p>
      </div>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/company/applications" style="display: inline-block; padding: 12px 24px; background-color: #0070f3; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">Review Application</a>
      <p>Best regards,<br>Denmark Intern Team</p>
    </div>
  `,
  
  applicationWithdrawn: ({ companyName, candidateName, internshipTitle, withdrawnDate }) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Application Withdrawn</h2>
      <p>Hi ${companyName},</p>
      <p><strong>${candidateName}</strong> has withdrawn their application for <strong>${internshipTitle}</strong>.</p>
      <div style="background-color: #fef3c7; padding: 15px; border-left: 4px solid #f59e0b; margin: 20px 0;">
        <p><strong>Withdrawn on:</strong> ${withdrawnDate}</p>
      </div>
      <p>This application has been removed from your active applications list.</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/company/applications" style="display: inline-block; padding: 12px 24px; background-color: #0070f3; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">View Applications</a>
      <p>Best regards,<br>Denmark Intern Team</p>
    </div>
  `,
  
  interviewAccepted: ({ companyName, candidateName, internshipTitle, interviewDate, interviewTime }) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>✅ Interview Accepted!</h2>
      <p>Hi ${companyName},</p>
      <p><strong>${candidateName}</strong> has accepted the interview invitation for <strong>${internshipTitle}</strong>.</p>
      <div style="background-color: #d1fae5; padding: 15px; border-left: 4px solid #10b981; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #047857;">Interview Confirmed</h3>
        <p><strong>Date:</strong> ${interviewDate}</p>
        <p><strong>Time:</strong> ${interviewTime}</p>
        <p><strong>Candidate:</strong> ${candidateName}</p>
      </div>
      <p>The interview is now confirmed. Please ensure all necessary preparations are made.</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/company/interviews" style="display: inline-block; padding: 12px 24px; background-color: #0070f3; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">View Interview Details</a>
      <p>Best regards,<br>Denmark Intern Team</p>
    </div>
  `,
  
  interviewDeclined: ({ companyName, candidateName, internshipTitle }) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Interview Declined</h2>
      <p>Hi ${companyName},</p>
      <p><strong>${candidateName}</strong> has declined the interview invitation for <strong>${internshipTitle}</strong>.</p>
      <div style="background-color: #fee2e2; padding: 15px; border-left: 4px solid #ef4444; margin: 20px 0;">
        <p>The candidate is not available for this interview.</p>
      </div>
      <p>You may want to consider other candidates for this position.</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/company/applications" style="display: inline-block; padding: 12px 24px; background-color: #0070f3; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">View Other Candidates</a>
      <p>Best regards,<br>Denmark Intern Team</p>
    </div>
  `,
  
  interviewRescheduleRequest: ({ companyName, candidateName, internshipTitle, reason, currentDate, currentTime }) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>🔄 Reschedule Request</h2>
      <p>Hi ${companyName},</p>
      <p><strong>${candidateName}</strong> has requested to reschedule the interview for <strong>${internshipTitle}</strong>.</p>
      <div style="background-color: #fef3c7; padding: 15px; border-left: 4px solid #f59e0b; margin: 20px 0;">
        <p><strong>Current Schedule:</strong></p>
        <p>Date: ${currentDate}</p>
        <p>Time: ${currentTime}</p>
        <p style="margin-top: 10px;"><strong>Reason:</strong></p>
        <p>${reason}</p>
      </div>
      <p>Please log in to your dashboard to propose a new interview time.</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/company/interviews" style="display: inline-block; padding: 12px 24px; background-color: #0070f3; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">Reschedule Interview</a>
      <p>Best regards,<br>Denmark Intern Team</p>
    </div>
  `,
  
  invitationReceived: ({ candidateName, companyName, internshipTitle, message, expiresAt }) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>🎉 You've Been Invited for an Interview!</h2>
      <p>Hi ${candidateName},</p>
      <p><strong>${companyName}</strong> is interested in you for the <strong>${internshipTitle}</strong> position and would like to invite you for an interview.</p>
      ${message ? `
        <div style="background-color: #f0f9ff; padding: 15px; border-left: 4px solid #0070f3; margin: 20px 0;">
          <p><strong>Message from ${companyName}:</strong></p>
          <p>${message}</p>
        </div>
      ` : ''}
      <div style="background-color: #fef3c7; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>⏰ This invitation expires on:</strong> ${new Date(expiresAt).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>
      <p>Please respond to this invitation as soon as possible.</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/candidate/internships" style="display: inline-block; padding: 12px 24px; background-color: #10b981; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">View Invitation</a>
      <p>Best regards,<br>Denmark Intern Team</p>
    </div>
  `,
  
  invitationAccepted: ({ companyName, candidateName, internshipTitle }) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>✅ Invitation Accepted!</h2>
      <p>Hi ${companyName},</p>
      <p>Great news! <strong>${candidateName}</strong> has accepted your interview invitation for <strong>${internshipTitle}</strong>.</p>
      <div style="background-color: #d1fae5; padding: 15px; border-left: 4px solid #10b981; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #047857;">Next Steps:</h3>
        <ul style="margin-bottom: 0;">
          <li>Schedule the interview with ${candidateName}</li>
          <li>Add meeting link and password</li>
          <li>Set date, time, and any additional notes</li>
        </ul>
      </div>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/company/interviews" style="display: inline-block; padding: 12px 24px; background-color: #0070f3; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">Schedule Interview</a>
      <p>Best regards,<br>Denmark Intern Team</p>
    </div>
  `,
  
  invitationRejected: ({ companyName, candidateName, internshipTitle }) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Invitation Declined</h2>
      <p>Hi ${companyName},</p>
      <p><strong>${candidateName}</strong> has declined your interview invitation for <strong>${internshipTitle}</strong>.</p>
      <div style="background-color: #fee2e2; padding: 15px; border-left: 4px solid #ef4444; margin: 20px 0;">
        <p>The candidate is not interested in proceeding with this opportunity at this time.</p>
      </div>
      <p>You can continue reviewing other matched candidates for this position.</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/company/matches" style="display: inline-block; padding: 12px 24px; background-color: #0070f3; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">View Matched Candidates</a>
      <p>Best regards,<br>Denmark Intern Team</p>
    </div>
  `,
  
  interviewScheduled: ({ candidateName, companyName, internshipTitle, date, time, meetingLink, meetingPassword, additionalNotes }) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>📅 Interview Scheduled!</h2>
      <p>Hi ${candidateName},</p>
      <p><strong>${companyName}</strong> has scheduled your interview for <strong>${internshipTitle}</strong>.</p>
      <div style="background-color: #f0f9ff; padding: 20px; border-left: 4px solid #0070f3; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #0070f3;">Interview Details</h3>
        <p><strong>📅 Date:</strong> ${date}</p>
        <p><strong>🕒 Time:</strong> ${time}</p>
        ${meetingLink ? `<p><strong>🔗 Meeting Link:</strong> <a href="${meetingLink}" style="color: #0070f3;">${meetingLink}</a></p>` : ''}
        ${meetingPassword ? `<p><strong>🔐 Password:</strong> ${meetingPassword}</p>` : ''}
        ${additionalNotes ? `
          <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e5e7eb;">
            <p><strong>📝 Additional Notes:</strong></p>
            <p>${additionalNotes}</p>
          </div>
        ` : ''}
      </div>
      <div style="background-color: #fef3c7; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>💡 Tips for your interview:</strong></p>
        <ul style="margin-bottom: 0;">
          <li>Test your internet connection and equipment beforehand</li>
          <li>Join the meeting 5 minutes early</li>
          <li>Have your resume and portfolio ready</li>
          <li>Prepare questions about the role and company</li>
        </ul>
      </div>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/candidate/interviews" style="display: inline-block; padding: 12px 24px; background-color: #0070f3; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">View Interview Details</a>
      <p>Good luck with your interview!</p>
      <p>Best regards,<br>Denmark Intern Team</p>
    </div>
  `,
  
  offerLetterSent: ({ candidateName, companyName, internshipTitle, joiningDate, joiningMessage }) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>🎉 Congratulations! You've Received an Offer!</h2>
      <p>Hi ${candidateName},</p>
      <p>Fantastic news! <strong>${companyName}</strong> is pleased to offer you the <strong>${internshipTitle}</strong> position.</p>
      <div style="background-color: #d1fae5; padding: 20px; border-left: 4px solid #10b981; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #047857;">📋 Offer Details</h3>
        <p><strong>Company:</strong> ${companyName}</p>
        <p><strong>Position:</strong> ${internshipTitle}</p>
        ${joiningDate ? `<p><strong>📅 Joining Date:</strong> ${new Date(joiningDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>` : ''}
        ${joiningMessage ? `
          <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #a7f3d0;">
            <p><strong>Message from ${companyName}:</strong></p>
            <p>${joiningMessage}</p>
          </div>
        ` : ''}
      </div>
      <div style="background-color: #f0f9ff; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>📎 Your offer letter is attached.</strong></p>
        <p>Please review the offer letter carefully and log in to your dashboard to download it.</p>
      </div>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/candidate/applications" style="display: inline-block; padding: 12px 24px; background-color: #10b981; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">View Offer Letter</a>
      <p>Congratulations once again! We're excited to see you begin this journey.</p>
      <p>Best regards,<br>Denmark Intern Team</p>
    </div>
  `,
};
