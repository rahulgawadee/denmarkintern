import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/utils/auth';
import dbConnect from '@/lib/db/mongodb';
import Interview from '@/lib/models/Interview';
import CandidateProfile from '@/lib/models/CandidateProfile';
import CompanyProfile from '@/lib/models/CompanyProfile';
import Internship from '@/lib/models/Internship';
import { sendEmail, emailTemplates } from '@/lib/utils/email';

// POST - Schedule interview (company only)
export async function POST(request, { params }) {
  try {
    await dbConnect();

  const { id } = await params;
    const token = request.headers.get('authorization')?.replace('Bearer ', '') || request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'company') {
      return NextResponse.json({ error: 'Only companies can schedule interviews' }, { status: 403 });
    }

    const { scheduledDate, scheduledTime, meetingLink, meetingPassword, mode, duration, additionalNotes } = await request.json();

    if (!scheduledDate || !scheduledTime) {
      return NextResponse.json({ error: 'Date and time are required' }, { status: 400 });
    }

    console.log(`📅 POST /api/interviews/${id}/schedule - Scheduling interview`);

    // Find interview
    const interview = await Interview.findById(id)
      .populate('candidateId', 'firstName lastName userId')
      .populate('internshipId', 'title')
      .populate('companyId', 'companyName');

    if (!interview) {
      return NextResponse.json({ error: 'Interview not found' }, { status: 404 });
    }

    // Verify company owns this interview
    const companyProfile = await CompanyProfile.findOne({ userId: decoded.userId });
    if (!companyProfile || interview.companyId._id.toString() !== companyProfile._id.toString()) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Check if already scheduled
    if (interview.status !== 'pending') {
      return NextResponse.json({ error: 'Interview already scheduled' }, { status: 400 });
    }

    // Combine date and time into a single Date object
    const dateTimeString = `${scheduledDate}T${scheduledTime}`;
    const scheduledDateTime = new Date(dateTimeString);

    // Update interview
    interview.scheduledDate = scheduledDateTime;
    interview.meetingLink = meetingLink || '';
    interview.meetingPassword = meetingPassword || '';
    interview.mode = mode || 'video';
    interview.duration = duration || 60;
    interview.additionalNotes = additionalNotes || '';
    interview.status = 'scheduled';
    await interview.save();

    console.log('✅ Interview scheduled');

    // Get candidate email
    const candidateUser = await CandidateProfile.findById(interview.candidateId._id).populate('userId', 'email');

    // Send email to candidate
    try {
      await sendEmail({
        to: candidateUser.userId.email,
        subject: `Interview Scheduled - ${interview.internshipId.title}`,
        html: emailTemplates.interviewScheduled({
          candidateName: `${interview.candidateId.firstName} ${interview.candidateId.lastName}`,
          companyName: interview.companyId.companyName,
          internshipTitle: interview.internshipId.title,
          date: scheduledDateTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
          time: scheduledDateTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          meetingLink: meetingLink || '',
          meetingPassword: meetingPassword || '',
          additionalNotes: additionalNotes || '',
        }),
      });
      console.log('📧 Scheduling email sent to candidate');
    } catch (emailError) {
      console.error('⚠️ Failed to send scheduling email:', emailError);
    }

    return NextResponse.json({
      success: true,
      message: 'Interview scheduled successfully',
      interview,
    });
  } catch (error) {
    console.error('❌ Error scheduling interview:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
