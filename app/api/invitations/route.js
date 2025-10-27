import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/utils/auth';
import dbConnect from '@/lib/db/mongodb';
import Invitation from '@/lib/models/Invitation';
import Internship from '@/lib/models/Internship';
import CandidateProfile from '@/lib/models/CandidateProfile';
import CompanyProfile from '@/lib/models/CompanyProfile';
import User from '@/lib/models/User';
import { sendEmail, emailTemplates } from '@/lib/utils/email';

// GET - Fetch invitations (different logic for company vs candidate)
export async function GET(request) {
  try {
    await dbConnect();

    const authHeader = request.headers.get('authorization');
    const cookieToken = request.cookies.get('token')?.value;
    const token = authHeader?.replace('Bearer ', '') || cookieToken;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    console.log(`📬 GET /api/invitations - User: ${decoded.userId}, Role: ${decoded.role}`);

    let invitations;

    if (decoded.role === 'company') {
      const companyProfile = await CompanyProfile.findOne({ userId: decoded.userId });
      if (!companyProfile) {
        return NextResponse.json({ invitations: [] }, { status: 200 });
      }

      // Fetch all invitations sent by this company
      invitations = await Invitation.find({ companyId: companyProfile._id })
        .populate('internshipId', 'title location workMode')
        .populate({
          path: 'candidateId',
          populate: {
            path: 'userId',
            select: 'firstName lastName email',
          },
        })
        .sort({ createdAt: -1 });

      console.log(`✅ Found ${invitations.length} invitations for company`);
    } else if (decoded.role === 'candidate') {
      const candidateProfile = await CandidateProfile.findOne({ userId: decoded.userId });
      if (!candidateProfile) {
        return NextResponse.json({ invitations: [] }, { status: 200 });
      }

      // Fetch all invitations received by this candidate
      invitations = await Invitation.find({ candidateId: candidateProfile._id })
        .populate('internshipId', 'title location workMode stipend duration')
        .populate('companyId', 'companyName logo contactEmail')
        .sort({ createdAt: -1 });

      console.log(`✅ Found ${invitations.length} invitations for candidate`);
    }

    return NextResponse.json({ success: true, invitations }, { status: 200 });
  } catch (error) {
    console.error('❌ Error fetching invitations:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Send invitation (company only)
export async function POST(request) {
  try {
    await dbConnect();

    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'company') {
      return NextResponse.json({ error: 'Only companies can send invitations' }, { status: 403 });
    }

    const { internshipId, candidateId, message } = await request.json();

    console.log(`📤 POST /api/invitations - Company sending invitation`);
    console.log(`   Internship: ${internshipId}, Candidate: ${candidateId}`);

    // Verify company profile
    const companyProfile = await CompanyProfile.findOne({ userId: decoded.userId });
    if (!companyProfile) {
      return NextResponse.json({ error: 'Company profile not found' }, { status: 404 });
    }

    // Verify internship belongs to this company
    const internship = await Internship.findById(internshipId);
    if (!internship) {
      return NextResponse.json({ error: 'Internship not found' }, { status: 404 });
    }
    if (internship.companyId.toString() !== companyProfile._id.toString()) {
      return NextResponse.json({ error: 'Unauthorized - internship not owned by company' }, { status: 403 });
    }

    // Verify candidate exists
    const candidateProfile = await CandidateProfile.findById(candidateId).populate('userId', 'firstName lastName email');
    if (!candidateProfile) {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });
    }

    // Check if invitation already exists
    const existingInvitation = await Invitation.findOne({
      internshipId,
      candidateId,
    });

    if (existingInvitation) {
      return NextResponse.json(
        { error: 'Invitation already sent to this candidate' },
        { status: 400 }
      );
    }

    // Create invitation
    const invitation = await Invitation.create({
      internshipId,
      candidateId,
      companyId: companyProfile._id,
      message: message || '',
    });

    console.log('✅ Invitation created');

    // Send email notification to candidate
    try {
      await sendEmail({
        to: candidateProfile.userId.email,
        subject: `Interview Invitation - ${internship.title}`,
        html: emailTemplates.invitationReceived({
          candidateName: `${candidateProfile.firstName} ${candidateProfile.lastName}`,
          companyName: companyProfile.companyName,
          internshipTitle: internship.title,
          message: message || 'No additional message',
        }),
      });
      console.log('📧 Invitation email sent to candidate');
    } catch (emailError) {
      console.error('⚠️ Failed to send invitation email:', emailError);
    }

    return NextResponse.json({
      success: true,
      message: 'Invitation sent successfully',
      invitation,
    }, { status: 201 });
  } catch (error) {
    console.error('❌ Error sending invitation:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
