import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import Onboarding from '@/lib/models/Onboarding';
import Application from '@/lib/models/Application';
import { verifyToken } from '@/lib/utils/auth';
import { sendEmail } from '@/lib/utils/email';

// PATCH /api/onboarding/[id] - Update onboarding
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
    const { startDate, endDate, supervisor, documents, status, workLocation, department, companyNotes } = body;

    // Find the onboarding
    const onboarding = await Onboarding.findById(id)
      .populate({
        path: 'candidateId',
        populate: { path: 'userId', select: 'name email' }
      })
      .populate('internshipId', 'title');

    if (!onboarding) {
      return NextResponse.json(
        { error: 'Onboarding not found' },
        { status: 404 }
      );
    }

    // Verify the company owns this onboarding
    if (onboarding.companyId.toString() !== decoded.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Update fields
    if (startDate !== undefined) onboarding.startDate = startDate;
    if (endDate !== undefined) onboarding.endDate = endDate;
    if (supervisor !== undefined) onboarding.supervisor = supervisor;
    if (workLocation !== undefined) onboarding.workLocation = workLocation;
    if (department !== undefined) onboarding.department = department;
    if (companyNotes !== undefined) onboarding.companyNotes = companyNotes;
    
    // Handle documents array update
    if (documents !== undefined) {
      onboarding.documents = documents;
    }

    // Handle status change to completed
    if (status === 'completed' && onboarding.status !== 'completed') {
      onboarding.status = 'completed';
      onboarding.onboardingCompletedAt = new Date();

      // Update application status to 'active'
      await Application.findByIdAndUpdate(onboarding.applicationId, {
        status: 'active',
      });

      // Send completion emails
      const candidateEmail = onboarding.candidateId.userId.email;
      const candidateName = onboarding.candidateId.userId.name;
      const roleTitle = onboarding.internshipId.title;

      const candidateEmailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #10b981;">Onboarding Completed! 🎉</h2>
          <p>Hi ${candidateName},</p>
          <p>Congratulations! Your onboarding for the <strong>${roleTitle}</strong> position has been completed.</p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Start Date:</strong> ${new Date(onboarding.startDate).toLocaleDateString()}</p>
            ${onboarding.supervisor ? `<p style="margin: 5px 0;"><strong>Supervisor:</strong> ${onboarding.supervisor.name}</p>` : ''}
            ${onboarding.workLocation ? `<p style="margin: 5px 0;"><strong>Location:</strong> ${onboarding.workLocation}</p>` : ''}
          </div>

          <p>Welcome aboard! We're excited to have you join us.</p>
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            Best regards,<br/>
            Denmark Intern Team
          </p>
        </div>
      `;

      await sendEmail({
        to: candidateEmail,
        subject: `Onboarding Completed - ${roleTitle}`,
        html: candidateEmailHtml,
      });
    }

    if (status === 'in_progress' && !onboarding.onboardingStartedAt) {
      onboarding.status = 'in_progress';
      onboarding.onboardingStartedAt = new Date();
    }

    await onboarding.save();

    return NextResponse.json({
      success: true,
      message: 'Onboarding updated successfully',
      onboarding,
    });

  } catch (error) {
    console.error('Error updating onboarding:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update onboarding' },
      { status: 500 }
    );
  }
}

// DELETE /api/onboarding/[id] - Delete onboarding (cancel)
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

    const onboarding = await Onboarding.findById(id);

    if (!onboarding) {
      return NextResponse.json(
        { error: 'Onboarding not found' },
        { status: 404 }
      );
    }

    if (onboarding.companyId.toString() !== decoded.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    await Onboarding.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'Onboarding cancelled successfully',
    });

  } catch (error) {
    console.error('Error deleting onboarding:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete onboarding' },
      { status: 500 }
    );
  }
}
