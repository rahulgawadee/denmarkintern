import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import { verifyToken } from '@/lib/utils/auth';
import CompanyProfile from '@/lib/models/CompanyProfile';
import Internship from '@/lib/models/Internship';
import Application from '@/lib/models/Application';
import CandidateProfile from '@/lib/models/CandidateProfile';
import { sendEmail } from '@/lib/utils/email';

export async function PATCH(request, { params }) {
  try {
    await dbConnect();

    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'No authorization header' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { id } = await params;

    // Find company profile
    const companyProfile = await CompanyProfile.findOne({ userId: decoded.userId });

    if (!companyProfile) {
      return NextResponse.json({ error: 'Company profile not found' }, { status: 404 });
    }

    // Parse the match ID (format: roleId_candidateId)
    const [roleId, candidateId] = id.split('_');

    if (!roleId || !candidateId) {
      return NextResponse.json({ error: 'Invalid match ID' }, { status: 400 });
    }

    // Find or create application for this match
    let application = await Application.findOne({
      internshipId: roleId,
      candidateId: candidateId
    });

    if (!application) {
      // Create new application with approved status
      application = await Application.create({
        internshipId: roleId,
        candidateId: candidateId,
        status: 'matched',
        appliedAt: new Date(),
        companyResponse: {
          status: 'approved',
          respondedAt: new Date()
        }
      });
    } else {
      // Update existing application
      application.status = 'matched';
      application.companyResponse = {
        status: 'approved',
        respondedAt: new Date()
      };
      await application.save();
    }

    // Get candidate details for email
    const candidateProfile = await CandidateProfile.findById(candidateId)
      .populate('userId', 'name email');
    
    const internship = await Internship.findById(roleId);

    // Send email notification to candidate
    if (candidateProfile && internship) {
      try {
        await sendEmail({
          to: candidateProfile.userId.email,
          subject: 'Congratulations! You\'ve been matched - Denmark Intern',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #10b981;">Congratulations!</h2>
              <p>Hello ${candidateProfile.userId.name},</p>
              <p>Great news! <strong>${companyProfile.companyName}</strong> has approved your profile for the following position:</p>
              
              <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <h3 style="margin: 0 0 10px 0;">${internship.title}</h3>
                <p style="margin: 5px 0;"><strong>Department:</strong> ${internship.department}</p>
                <p style="margin: 5px 0;"><strong>Duration:</strong> ${internship.duration?.value} ${internship.duration?.unit}</p>
                <p style="margin: 5px 0;"><strong>Work Mode:</strong> ${internship.workMode}</p>
              </div>
              
              <p>You can expect to hear from them soon regarding next steps.</p>
              
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/candidate/dashboard" 
                 style="display: inline-block; background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0;">
                View in Dashboard
              </a>
              
              <p style="color: #666; font-size: 14px;">
                Best of luck with your internship!
              </p>
            </div>
          `
        });
      } catch (emailError) {
        console.error('Error sending email:', emailError);
      }
    }

    return NextResponse.json({
      message: 'Candidate approved successfully',
      application: {
        _id: application._id,
        status: application.status
      }
    });

  } catch (error) {
    console.error('Error approving candidate:', error);
    return NextResponse.json(
      { error: 'Failed to approve candidate', details: error.message },
      { status: 500 }
    );
  }
}
