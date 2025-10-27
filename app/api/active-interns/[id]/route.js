import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import Onboarding from '@/lib/models/Onboarding';
import { verifyToken } from '@/lib/utils/auth';
import { sendEmail } from '@/lib/utils/email';

// PATCH /api/active-interns/[id] - Mark internship as completed
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
    const { status } = body;

    const onboarding = await Onboarding.findById(id)
      .populate({
        path: 'candidateId',
        populate: { path: 'userId', select: 'name email' }
      })
      .populate('internshipId', 'title');

    if (!onboarding) {
      return NextResponse.json(
        { error: 'Internship not found' },
        { status: 404 }
      );
    }

    if (onboarding.companyId.toString() !== decoded.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Mark as completed
    if (status === 'completed') {
      onboarding.status = 'completed';
      
      // Send completion email to candidate
      const candidateEmail = onboarding.candidateId.userId.email;
      const candidateName = onboarding.candidateId.userId.name;
      const roleTitle = onboarding.internshipId.title;

      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #10b981;">Internship Completed! 🎉</h2>
          <p>Hi ${candidateName},</p>
          <p>Congratulations on successfully completing your internship for the <strong>${roleTitle}</strong> position!</p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Start Date:</strong> ${new Date(onboarding.startDate).toLocaleDateString()}</p>
            <p style="margin: 5px 0;"><strong>End Date:</strong> ${new Date(onboarding.endDate || Date.now()).toLocaleDateString()}</p>
          </div>

          <p>We hope this experience has been valuable for your career development.</p>
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            Best regards,<br/>
            Denmark Intern Team
          </p>
        </div>
      `;

      await sendEmail({
        to: candidateEmail,
        subject: `Internship Completed - ${roleTitle}`,
        html: emailHtml,
      });
    }

    await onboarding.save();

    return NextResponse.json({
      success: true,
      message: 'Internship updated successfully',
      onboarding,
    });

  } catch (error) {
    console.error('Error updating internship:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update internship' },
      { status: 500 }
    );
  }
}
