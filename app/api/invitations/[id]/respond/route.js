import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/utils/auth';
import dbConnect from '@/lib/db/mongodb';
import Invitation from '@/lib/models/Invitation';
import CandidateProfile from '@/lib/models/CandidateProfile';
import Interview from '@/lib/models/Interview';

// PATCH - Respond to invitation (accept/reject)
export async function PATCH(request, { params }) {
  try {
    await dbConnect();

    const authHeader = request.headers.get('authorization');
    const cookieToken = request.cookies.get('token')?.value;
    const token = authHeader?.replace('Bearer ', '') || cookieToken;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'candidate') {
      return NextResponse.json({ error: 'Only candidates can respond to invitations' }, { status: 403 });
    }

    // Await params in Next.js 15+
    const { id } = await params;
    const { status, response } = await request.json();

    if (!['accepted', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status. Must be "accepted" or "rejected"' }, { status: 400 });
    }

    console.log(`📬 PATCH /api/invitations/${id}/respond - Status: ${status}`);

    // Get candidate profile
    const candidateProfile = await CandidateProfile.findOne({ userId: decoded.userId });
    if (!candidateProfile) {
      return NextResponse.json({ error: 'Candidate profile not found' }, { status: 404 });
    }

    // Find invitation
    const invitation = await Invitation.findById(id);
    if (!invitation) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
    }

    // Verify invitation belongs to this candidate
    if (invitation.candidateId.toString() !== candidateProfile._id.toString()) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Check if already responded
    if (invitation.status !== 'pending') {
      return NextResponse.json({ error: `Invitation already ${invitation.status}` }, { status: 400 });
    }

    // Update invitation
    invitation.status = status;
    invitation.candidateResponse = response || '';
    invitation.respondedAt = new Date();
    await invitation.save();

    console.log(`✅ Invitation ${status}`);

    // If accepted, create Interview record for scheduling
    if (status === 'accepted') {
      try {
        console.log(`🔍 Checking for existing interview with invitationId: ${invitation._id}`);
        
        // Check if interview already exists
        const existingInterview = await Interview.findOne({
          invitationId: invitation._id,
        });

        if (!existingInterview) {
          console.log(`📝 Creating new interview record...`);
          console.log(`   - invitationId: ${invitation._id}`);
          console.log(`   - internshipId: ${invitation.internshipId}`);
          console.log(`   - candidateId: ${invitation.candidateId}`);
          console.log(`   - companyId: ${invitation.companyId}`);
          
          const interview = await Interview.create({
            invitationId: invitation._id,
            internshipId: invitation.internshipId,
            candidateId: invitation.candidateId,
            companyId: invitation.companyId,
            status: 'pending', // Pending scheduling by company
            candidateResponse: 'accepted',
            mode: 'video',
            duration: 60,
            candidateNotes: response || '',
          });

          console.log(`✅ Interview record created successfully!`);
          console.log(`   - Interview ID: ${interview._id}`);
          console.log(`   - Status: ${interview.status}`);
        } else {
          console.log(`ℹ️ Interview already exists with ID: ${existingInterview._id}`);
        }
      } catch (interviewError) {
        console.error('❌ Error creating interview record:', interviewError);
        console.error('   Error details:', interviewError.message);
        console.error('   Error stack:', interviewError.stack);
        // Don't fail the whole request if interview creation fails
      }
    }

    return NextResponse.json({
      success: true,
      message: `Invitation ${status} successfully`,
      invitation,
    }, { status: 200 });
  } catch (error) {
    console.error('❌ Error responding to invitation:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
