import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/utils/auth';
import dbConnect from '@/lib/db/mongodb';
import Invitation from '@/lib/models/Invitation';
import Interview from '@/lib/models/Interview';
import Application from '@/lib/models/Application';
import CandidateProfile from '@/lib/models/CandidateProfile';
import Internship from '@/lib/models/Internship';
import { sendEmail, emailTemplates } from '@/lib/utils/email';

// PATCH - Respond to invitation (candidate only: accept/reject)
export async function PATCH(request, { params }) {
  try {
    await dbConnect();

    const { id } = await params;
    const token = request.headers.get('authorization')?.replace('Bearer ', '') || request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'candidate') {
      return NextResponse.json({ error: 'Only candidates can respond to invitations' }, { status: 403 });
    }

    const { response, candidateResponse } = await request.json(); // response: 'accepted' or 'rejected'

    if (!['accepted', 'rejected'].includes(response)) {
      return NextResponse.json({ error: 'Invalid response. Must be accepted or rejected' }, { status: 400 });
    }

    console.log(`📝 PATCH /api/invitations/${id} - Candidate responding: ${response}`);

    // Find invitation with all required references
    const invitation = await Invitation.findById(id)
      .populate('internshipId', 'title companyId')
      .populate('companyId', 'companyName contactEmail userId');

    if (!invitation) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
    }

    // Verify candidate owns this invitation
    const candidateProfile = await CandidateProfile.findOne({ userId: decoded.userId });
    if (!candidateProfile || invitation.candidateId.toString() !== candidateProfile._id.toString()) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Check if already responded
    if (invitation.status !== 'pending') {
      return NextResponse.json({ error: 'Invitation already responded to' }, { status: 400 });
    }

    // Update invitation
    invitation.status = response;
    invitation.candidateResponse = candidateResponse || '';
    invitation.respondedAt = new Date();
    await invitation.save();

    console.log(`✅ Invitation ${response}`);

    // If accepted, create both Application and Interview records
    if (response === 'accepted') {
      console.log('📝 Creating Application and Interview records...');

      const companyProfileId = invitation.companyId?._id || invitation.companyId;
      const internshipId = invitation.internshipId?._id || invitation.internshipId;

      if (!companyProfileId) {
        console.error('❌ Missing company profile ID on invitation');
        return NextResponse.json({ error: 'Company information missing on invitation' }, { status: 500 });
      }

      // Ensure we have the latest internship data (to validate ownership)
      const internship = await Internship.findById(internshipId).lean();
      if (!internship) {
        console.error(`❌ Internship ${internshipId} not found when accepting invitation`);
        return NextResponse.json({ error: 'Internship not found' }, { status: 404 });
      }

      if (internship.companyId.toString() !== companyProfileId.toString()) {
        console.warn('⚠️ Internship company mismatch. Using invitation company ID');
      }

      // 1. Ensure application exists or create
      let application = await Application.findOne({
        internshipId: internshipId,
        candidateId: candidateProfile._id,
      });

      if (!application) {
        application = await Application.create({
          internshipId: internshipId,
          candidateId: candidateProfile._id,
          companyId: companyProfileId,
          status: 'pending',
          coverLetter: candidateResponse || 'Applied via invitation',
          statusHistory: [
            {
              status: 'pending',
              changedAt: new Date(),
              notes: 'Created from accepted invitation',
            },
          ],
        });
        console.log(`✅ Application created with ID: ${application._id}`);
      } else {
        console.log(`ℹ️ Application already existed (${application._id}) - updating status to pending`);
        application.status = 'pending';
        application.statusHistory = application.statusHistory || [];
        application.statusHistory.push({
          status: 'pending',
          changedAt: new Date(),
          notes: 'Re-confirmed via invitation acceptance',
        });
        await application.save();
      }

      // 2. Ensure interview exists or create (pending status)
      let interview = await Interview.findOne({ invitationId: invitation._id });

      if (!interview) {
        interview = await Interview.create({
          applicationId: application._id,
          invitationId: invitation._id,
          internshipId: internshipId,
          candidateId: candidateProfile._id,
          companyId: companyProfileId,
          status: 'pending',
          candidateResponse: 'accepted',
          mode: 'video', // default until scheduled
          duration: 60,
          candidateNotes: candidateResponse || '',
        });
        console.log(`✅ Interview created with ID: ${interview._id}`);
      } else {
        console.log(`ℹ️ Interview already existed (${interview._id}) - resetting to pending`);
        interview.status = 'pending';
        interview.candidateResponse = 'accepted';
        interview.candidateNotes = candidateResponse || '';
        interview.applicationId = application._id;
        interview.companyId = companyProfileId;
        interview.candidateId = candidateProfile._id;
        interview.internshipId = internshipId;
        await interview.save();
      }

      console.log(`🎯 Interview ready for scheduling (companyId: ${interview.companyId}, status: ${interview.status})`);
      console.log(`🎯 Student will see Application in 'My Applications → Pending' tab`);
      console.log(`🎯 Company will see Interview in 'Interviews → Yet to Be Scheduled' tab`);

      // Send email to company
      try {
        await sendEmail({
          to: invitation.companyId.contactEmail,
          subject: `Invitation Accepted - ${invitation.internshipId.title}`,
          html: emailTemplates.invitationAccepted({
            companyName: invitation.companyId.companyName,
            candidateName: `${candidateProfile.firstName} ${candidateProfile.lastName}`,
            internshipTitle: invitation.internshipId.title,
          }),
        });
        console.log('📧 Acceptance email sent to company');
      } catch (emailError) {
        console.error('⚠️ Failed to send acceptance email:', emailError);
      }
    } else {
      // Send rejection email to company
      try {
        await sendEmail({
          to: invitation.companyId.contactEmail,
          subject: `Invitation Declined - ${invitation.internshipId.title}`,
          html: emailTemplates.invitationRejected({
            companyName: invitation.companyId.companyName,
            candidateName: `${candidateProfile.firstName} ${candidateProfile.lastName}`,
            internshipTitle: invitation.internshipId.title,
          }),
        });
        console.log('📧 Rejection email sent to company');
      } catch (emailError) {
        console.error('⚠️ Failed to send rejection email:', emailError);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Invitation ${response}`,
      invitation,
    });
  } catch (error) {
    console.error('❌ Error responding to invitation:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Withdraw/ignore invitation (candidate only)
export async function DELETE(request, { params }) {
  try {
    await dbConnect();

    const { id } = await params;
    const token = request.headers.get('authorization')?.replace('Bearer ', '') || request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'candidate') {
      return NextResponse.json({ error: 'Only candidates can delete invitations' }, { status: 403 });
    }

    const invitation = await Invitation.findById(id);
    if (!invitation) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
    }

    // Verify ownership
    const candidateProfile = await CandidateProfile.findOne({ userId: decoded.userId });
    if (!candidateProfile || invitation.candidateId.toString() !== candidateProfile._id.toString()) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await Invitation.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: 'Invitation ignored' });
  } catch (error) {
    console.error('❌ Error deleting invitation:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
