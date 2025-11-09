import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/utils/auth';
import dbConnect from '@/lib/db/mongodb';
import Interview from '@/lib/models/Interview';
import Application from '@/lib/models/Application';
import CandidateProfile from '@/lib/models/CandidateProfile';
import User from '@/lib/models/User';
import { sendEmail, emailTemplates } from '@/lib/utils/email';

export async function POST(req, { params }) {
  try {
    await dbConnect();

    // Verify token
    const token = req.headers.get('authorization')?.split(' ')[1] || req.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'candidate') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

  const { id } = await params;
    const body = await req.json();
    const { response, reason } = body; // response: 'accepted', 'declined', 'reschedule_requested'

    if (!response || !['accepted', 'declined', 'reschedule_requested'].includes(response)) {
      return NextResponse.json(
        { error: 'Invalid response. Must be: accepted, declined, or reschedule_requested' },
        { status: 400 }
      );
    }

    // Find the interview
    const interview = await Interview.findById(id)
      .populate('internshipId', 'title')
      .populate('companyId', 'companyName contactEmail')
      .populate('applicationId');

    if (!interview) {
      return NextResponse.json({ error: 'Interview not found' }, { status: 404 });
    }

    // Find candidate profile to verify ownership
    const candidateProfile = await CandidateProfile.findOne({ userId: decoded.userId });
    if (!candidateProfile) {
      return NextResponse.json({ error: 'Candidate profile not found' }, { status: 404 });
    }

    // Verify ownership
    if (interview.candidateId.toString() !== candidateProfile._id.toString()) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Update interview response
    interview.candidateResponse = response;
    
    if (response === 'reschedule_requested' && reason) {
      interview.candidateNotes = reason;
      interview.rescheduleHistory.push({
        previousDate: interview.scheduledDate,
        newDate: null,
        reason: reason,
        requestedBy: 'candidate',
        createdAt: new Date(),
      });
    }

    if (response === 'accepted') {
      interview.status = 'scheduled';
      // Update application status if exists
      if (interview.applicationId) {
        await Application.findByIdAndUpdate(interview.applicationId._id, {
          status: 'interview_scheduled',
          $push: {
            statusHistory: {
              status: 'interview_scheduled',
              changedBy: decoded.userId,
              changedAt: new Date(),
              notes: 'Candidate accepted interview invitation',
            },
          },
        });
      }
    } else if (response === 'declined') {
      interview.status = 'cancelled';
      // Update application status if exists
      if (interview.applicationId) {
        await Application.findByIdAndUpdate(interview.applicationId._id, {
          status: 'rejected',
          $push: {
            statusHistory: {
              status: 'rejected',
              changedBy: decoded.userId,
              changedAt: new Date(),
              notes: 'Candidate declined interview invitation',
            },
          },
        });
      }
    }

    await interview.save();

    // Get candidate info for email
    const candidate = await User.findById(decoded.userId);
    const candidateName = `${candidate.firstName} ${candidate.lastName}`;

    // Send notification email to company
    try {
      let emailSubject = '';
      let emailTemplate = '';

      if (response === 'accepted') {
        emailSubject = `Interview Accepted - ${interview.internshipId.title}`;
        emailTemplate = emailTemplates.interviewAccepted({
          companyName: interview.companyId.companyName,
          candidateName: candidateName,
          internshipTitle: interview.internshipId.title,
          interviewDate: new Date(interview.scheduledDate).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          }),
          interviewTime: new Date(interview.scheduledDate).toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
          }),
        });
      } else if (response === 'declined') {
        emailSubject = `Interview Declined - ${interview.internshipId.title}`;
        emailTemplate = emailTemplates.interviewDeclined({
          companyName: interview.companyId.companyName,
          candidateName: candidateName,
          internshipTitle: interview.internshipId.title,
        });
      } else if (response === 'reschedule_requested') {
        emailSubject = `Reschedule Request - ${interview.internshipId.title}`;
        emailTemplate = emailTemplates.interviewRescheduleRequest({
          companyName: interview.companyId.companyName,
          candidateName: candidateName,
          internshipTitle: interview.internshipId.title,
          reason: reason || 'No reason provided',
          currentDate: new Date(interview.scheduledDate).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          }),
          currentTime: new Date(interview.scheduledDate).toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
          }),
        });
      }

      await sendEmail({
        to: interview.companyId.contactEmail,
        subject: emailSubject,
        html: emailTemplate,
      });
      console.log(`📧 Interview response notification sent to company (${response})`);
    } catch (emailError) {
      console.error('❌ Failed to send interview response notification:', emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      message: `Interview ${response === 'accepted' ? 'accepted' : response === 'declined' ? 'declined' : 'reschedule requested'} successfully`,
      interview,
    });
  } catch (error) {
    console.error('❌ Error responding to interview:', error);
    return NextResponse.json(
      { error: 'Failed to respond to interview' },
      { status: 500 }
    );
  }
}
