import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Application from '@/lib/models/Application';
import CandidateProfile from '@/lib/models/CandidateProfile';
import CompanyProfile from '@/lib/models/CompanyProfile';
import User from '@/lib/models/User';
import { verifyToken } from '@/lib/utils/auth';
import { sendEmail, emailTemplates } from '@/lib/utils/email';

export async function PUT(request, { params }) {
  try {
    await connectDB();
    
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'company') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { id } = await params;
    const { status, message, attachments } = await request.json();
    
    const application = await Application.findById(id)
      .populate('candidateId')
      .populate('companyId');
    
    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }
    
    // Update application status
    application.status = status;
    application.companyMessage = message;
    
    // Add to status history
    application.statusHistory.push({
      status,
      changedBy: decoded.userId,
      notes: message,
    });
    
    // If status is 'offered', save offer details
    if (status === 'offered') {
      application.offerDetails = {
        message,
        attachments: attachments || [],
        sentAt: new Date(),
      };
      
      // Send email to candidate
      const candidateUser = await User.findById(application.candidateId.userId);
      const candidateName = `${application.candidateId.firstName} ${application.candidateId.lastName}`;
      
      await sendEmail({
        to: candidateUser.email,
        subject: '🎉 You have received an internship offer!',
        html: emailTemplates.offerSent(
          candidateName,
          application.companyId.companyName,
          message,
          attachments || []
        ),
        attachments: attachments?.map(att => ({
          filename: att.filename,
          path: att.url,
        })) || [],
      });
    } else {
      // Send status update email
      const candidateUser = await User.findById(application.candidateId.userId);
      const candidateName = `${application.candidateId.firstName} ${application.candidateId.lastName}`;
      
      await sendEmail({
        to: candidateUser.email,
        subject: 'Application Status Update',
        html: emailTemplates.applicationStatusUpdate(
          candidateName,
          application.companyId.companyName,
          status,
          message
        ),
      });
    }
    
    await application.save();
    
    return NextResponse.json(
      { success: true, message: 'Application status updated successfully', application },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update application error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
