import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/utils/auth';
import dbConnect from '@/lib/db/mongodb';
import Interview from '@/lib/models/Interview';
import CandidateProfile from '@/lib/models/CandidateProfile';
import CompanyProfile from '@/lib/models/CompanyProfile';
import Application from '@/lib/models/Application';
import { sendEmail, emailTemplates } from '@/lib/utils/email';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

// POST - Complete interview and provide outcome (company only)
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
      return NextResponse.json({ error: 'Only companies can complete interviews' }, { status: 403 });
    }

    console.log(`✅ POST /api/interviews/${id}/complete - Completing interview`);

    // Parse multipart form data
    const formData = await request.formData();
    const decision = formData.get('decision'); // 'accepted' or 'rejected'
    const feedback = formData.get('feedback');
    const joiningDate = formData.get('joiningDate');
    const joiningMessage = formData.get('joiningMessage');
    const offerLetterFile = formData.get('offerLetter'); // File object

    if (!decision || !['accepted', 'rejected'].includes(decision)) {
      return NextResponse.json({ error: 'Valid decision required (accepted/rejected)' }, { status: 400 });
    }

    // Find interview
    const interview = await Interview.findById(id)
      .populate('candidateId', 'firstName lastName userId')
      .populate('internshipId', 'title')
      .populate('companyId', 'companyName contactEmail');

    if (!interview) {
      return NextResponse.json({ error: 'Interview not found' }, { status: 404 });
    }

    // Verify company owns this interview
    const companyProfile = await CompanyProfile.findOne({ userId: decoded.userId });
    if (!companyProfile || interview.companyId._id.toString() !== companyProfile._id.toString()) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Check if interview can be completed
    if (interview.status !== 'scheduled') {
      return NextResponse.json({ error: 'Only scheduled interviews can be completed' }, { status: 400 });
    }

    // Update interview outcome
    interview.outcome = {
      decision,
      feedback: feedback || '',
      decidedAt: new Date(),
    };
    interview.status = 'completed';

    // If accepted, handle offer letter upload
    if (decision === 'accepted') {
      if (!joiningDate) {
        return NextResponse.json({ error: 'Joining date required for accepted candidates' }, { status: 400 });
      }

      interview.joiningDate = new Date(joiningDate);
      interview.joiningMessage = joiningMessage || '';

      // Handle offer letter file upload
      if (offerLetterFile && offerLetterFile.size > 0) {
        const bytes = await offerLetterFile.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Create uploads directory if it doesn't exist
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'offers', companyProfile._id.toString());
        await mkdir(uploadDir, { recursive: true });

        // Generate unique filename
        const timestamp = Date.now();
        const fileExtension = path.extname(offerLetterFile.name);
        const filename = `offer_${interview.candidateId._id}_${timestamp}${fileExtension}`;
        const filepath = path.join(uploadDir, filename);

        // Save file
        await writeFile(filepath, buffer);

        // Store file info in interview
        interview.offerLetter = {
          filename: offerLetterFile.name,
          url: `/uploads/offers/${companyProfile._id}/${filename}`,
          uploadedAt: new Date(),
        };

        console.log('📎 Offer letter uploaded:', filename);
      }
    }

    // Sync application status
    if (interview.applicationId) {
      const applicationUpdate = {
        status: decision === 'accepted' ? 'offered' : 'rejected',
      };

      if (decision === 'accepted') {
        applicationUpdate.offerDetails = {
          message: joiningMessage || '',
          joiningDate: interview.joiningDate,
          joiningMessage: joiningMessage || '',
          attachments: interview.offerLetter?.url
            ? [{ filename: interview.offerLetter.filename, url: interview.offerLetter.url, uploadedAt: interview.offerLetter.uploadedAt }]
            : [],
          sentAt: new Date(),
        };
      }

      await Application.findByIdAndUpdate(interview.applicationId, applicationUpdate, { new: true });
    }

    await interview.save();
    console.log(`✅ Interview completed with decision: ${decision}`);

    // Get candidate email
    const candidateUser = await CandidateProfile.findById(interview.candidateId._id).populate('userId', 'email');

    // Send appropriate email to candidate
    try {
      if (decision === 'accepted') {
        await sendEmail({
          to: candidateUser.userId.email,
          subject: `Congratulations! Offer from ${interview.companyId.companyName}`,
          html: emailTemplates.offerLetterSent({
            candidateName: `${interview.candidateId.firstName} ${interview.candidateId.lastName}`,
            companyName: interview.companyId.companyName,
            internshipTitle: interview.internshipId.title,
            joiningDate: interview.joiningDate,
            joiningMessage: interview.joiningMessage || '',
          }),
        });
        console.log('📧 Offer letter email sent to candidate');
      } else {
        // Send rejection email
        await sendEmail({
          to: candidateUser.userId.email,
          subject: `Interview Update - ${interview.internshipId.title}`,
          html: emailTemplates.applicationStatusUpdate(
            `${interview.candidateId.firstName} ${interview.candidateId.lastName}`,
            interview.companyId.companyName,
            'Rejected',
            feedback || 'Thank you for your time and interest in our company. We wish you the best in your future endeavors.'
          ),
        });
        console.log('📧 Rejection email sent to candidate');
      }
    } catch (emailError) {
      console.error('⚠️ Failed to send outcome email:', emailError);
    }

    return NextResponse.json({
      success: true,
      message: `Interview completed with decision: ${decision}`,
      interview,
    });
  } catch (error) {
    console.error('❌ Error completing interview:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
