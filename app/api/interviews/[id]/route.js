import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import Interview from '@/lib/models/Interview';
import Application from '@/lib/models/Application';
import CompanyProfile from '@/lib/models/CompanyProfile';
import { verifyToken } from '@/lib/utils/auth';
import { sendEmail } from '@/lib/utils/email';

// PATCH /api/interviews/[id] - Update interview (schedule, reschedule, complete)
export async function PATCH(request, { params }) {
  try {
  const { id } = await params;
    const token = request.headers.get('authorization')?.split(' ')[1];
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authorization required' },
        { status: 401 }
      );
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    await dbConnect();

  const body = await request.json();
  const { scheduledDate, scheduledAt, duration, mode, location, meetingLink, meetingPassword, companyNotes, status } = body;

    // Find the interview
    const interview = await Interview.findById(id)
      .populate({
        path: 'candidateId',
        select: 'userId firstName lastName email phone university fieldOfStudy',
        populate: {
          path: 'userId',
          select: 'email firstName lastName',
        },
      })
      .populate('internshipId', 'title companyId companyName')
      .populate('companyId', 'companyName userId');

    if (!interview) {
      return NextResponse.json(
        { error: 'Interview not found' },
        { status: 404 }
      );
    }

    // Verify the company owns this interview
    const companyProfile = await CompanyProfile.findOne({ userId: decoded.userId });
    if (!companyProfile) {
      return NextResponse.json({ error: 'Company profile not found' }, { status: 404 });
    }

    const interviewCompanyId = interview.companyId?._id ? interview.companyId._id : interview.companyId;
    if (!interviewCompanyId || interviewCompanyId.toString() !== companyProfile._id.toString()) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Update fields
    const updateData = {};
    
    if (scheduledDate !== undefined) updateData.scheduledDate = scheduledDate;
    if (scheduledAt !== undefined) updateData.scheduledDate = scheduledAt; // Support both field names
    if (duration !== undefined) updateData.duration = duration;
    if (mode !== undefined) updateData.mode = mode;
    if (location !== undefined) updateData.location = location;
    if (meetingLink !== undefined) updateData.meetingLink = meetingLink;
  if (meetingPassword !== undefined) updateData.meetingPassword = meetingPassword;
    if (companyNotes !== undefined) updateData.companyNotes = companyNotes;
    if (status !== undefined) updateData.status = status;

    // Handle status-specific logic
    if (status === 'scheduled' && (scheduledDate || scheduledAt)) {
      // Send notification to candidate about scheduled interview
  const candidateEmail = interview.candidateId?.userId?.email || interview.candidateId?.email;
  const candidateName = `${interview.candidateId?.firstName || ''} ${interview.candidateId?.lastName || ''}`.trim() || 'Candidate';
      const roleTitle = interview.internshipId.title;
      const dateTime = new Date(scheduledDate || scheduledAt).toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

      if (interview.applicationId) {
        await Application.findByIdAndUpdate(interview.applicationId, {
          status: 'interview_scheduled',
        });
      }

      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #6366f1;">Interview Scheduled</h2>
          <p>Hi ${candidateName},</p>
          <p>Your interview for the <strong>${roleTitle}</strong> position has been scheduled.</p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Date & Time:</strong> ${dateTime}</p>
            <p style="margin: 5px 0;"><strong>Duration:</strong> ${duration || 60} minutes</p>
            <p style="margin: 5px 0;"><strong>Mode:</strong> ${mode === 'video' ? 'Video Call' : mode === 'onsite' ? 'On-site' : 'Phone'}</p>
            ${meetingLink ? `<p style="margin: 5px 0;"><strong>Meeting Link:</strong> <a href="${meetingLink}">${meetingLink}</a></p>` : ''}
            ${location?.address ? `<p style="margin: 5px 0;"><strong>Location:</strong> ${location.address}</p>` : ''}
          </div>

          ${companyNotes ? `<p><strong>Additional Notes:</strong><br/>${companyNotes}</p>` : ''}

          <p>Good luck with your interview!</p>
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            Best regards,<br/>
            Denmark Intern Team
          </p>
        </div>
      `;

      await sendEmail({
        to: candidateEmail,
        subject: `Interview Scheduled - ${roleTitle}`,
        html: emailHtml,
      });
    }

    if (status === 'completed') {
      updateData.outcome = {
        ...interview.outcome,
        decision: 'pending',
        feedback: companyNotes || '',
        decidedAt: new Date(),
      };

      if (interview.applicationId) {
        await Application.findByIdAndUpdate(interview.applicationId, {
          status: 'interviewed',
        });
      }
    }

    if (status === 'rejected' || status === 'cancelled') {
      // Notify candidate
  const candidateEmail = interview.candidateId?.userId?.email || interview.candidateId?.email;
  const candidateName = `${interview.candidateId?.firstName || ''} ${interview.candidateId?.lastName || ''}`.trim() || 'Candidate';
      const roleTitle = interview.internshipId.title;

      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #ef4444;">Interview Update</h2>
          <p>Hi ${candidateName},</p>
          <p>We regret to inform you that the interview for the <strong>${roleTitle}</strong> position has been ${status === 'rejected' ? 'cancelled' : 'cancelled'}.</p>
          <p>Thank you for your interest. We encourage you to explore other opportunities on our platform.</p>
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            Best regards,<br/>
            Denmark Intern Team
          </p>
        </div>
      `;

      await sendEmail({
        to: candidateEmail,
        subject: `Interview Update - ${roleTitle}`,
        html: emailHtml,
      });

      // Update application status
      if (interview.applicationId) {
        await Application.findByIdAndUpdate(interview.applicationId, {
          status: 'rejected',
        });
      }
    }

    // Update the interview
    const updatedInterview = await Interview.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate({
        path: 'candidateId',
        select: 'userId firstName lastName email phone university fieldOfStudy',
        populate: { path: 'userId', select: 'email firstName lastName' },
      })
      .populate('internshipId', 'title companyId companyName')
      .populate('companyId', 'companyName');

    return NextResponse.json({
      success: true,
      message: 'Interview updated successfully',
      interview: updatedInterview,
    });

  } catch (error) {
    console.error('Error updating interview:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update interview' },
      { status: 500 }
    );
  }
}

// DELETE /api/interviews/[id] - Delete interview (reject candidate)
export async function DELETE(request, { params }) {
  try {
  const { id } = await params;
    const token = request.headers.get('authorization')?.split(' ')[1];
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authorization required' },
        { status: 401 }
      );
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    await dbConnect();

    // Find the interview
    const interview = await Interview.findById(id)
      .populate('candidateId', 'userId')
      .populate('internshipId', 'title');

    if (!interview) {
      return NextResponse.json(
        { error: 'Interview not found' },
        { status: 404 }
      );
    }

    // Verify the company owns this interview
    if (interview.companyId.toString() !== decoded.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Send rejection email to candidate
    const candidateEmail = interview.candidateId.userId.email;
    const candidateName = interview.candidateId.userId.name;
    const roleTitle = interview.internshipId.title;

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #ef4444;">Application Update</h2>
        <p>Hi ${candidateName},</p>
        <p>Thank you for your interest in the <strong>${roleTitle}</strong> position.</p>
        <p>After careful consideration, we have decided to move forward with other candidates at this time.</p>
        <p>We appreciate the time you invested in the application process and encourage you to explore other opportunities on our platform.</p>
        <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
          Best regards,<br/>
          Denmark Intern Team
        </p>
      </div>
    `;

    await sendEmail({
      to: candidateEmail,
      subject: `Application Update - ${roleTitle}`,
      html: emailHtml,
    });

    // Update application status if exists
    if (interview.applicationId) {
      await Application.findByIdAndUpdate(interview.applicationId, {
        status: 'rejected',
        rejectedAt: new Date(),
      });
    }

    // Delete the interview
    await Interview.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'Interview deleted and candidate notified',
    });

  } catch (error) {
    console.error('Error deleting interview:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete interview' },
      { status: 500 }
    );
  }
}
