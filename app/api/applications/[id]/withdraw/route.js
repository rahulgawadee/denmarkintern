import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/utils/auth';
import dbConnect from '@/lib/db/mongodb';
import Application from '@/lib/models/Application';
import Internship from '@/lib/models/Internship';
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

    // Find the application
    const application = await Application.findById(id)
      .populate('internshipId', 'title')
      .populate('companyId', 'companyName contactEmail');

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // Verify ownership
    if (application.candidateId.toString() !== decoded.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Check if already withdrawn, rejected, or accepted
    if (['withdrawn', 'rejected', 'accepted'].includes(application.status)) {
      return NextResponse.json(
        { error: `Cannot withdraw application with status: ${application.status}` },
        { status: 400 }
      );
    }

    // Update application status
    application.status = 'withdrawn';
    application.statusHistory.push({
      status: 'withdrawn',
      changedBy: decoded.userId,
      changedAt: new Date(),
      notes: 'Application withdrawn by candidate',
    });
    await application.save();

    // Remove from internship applications array
    await Internship.findByIdAndUpdate(application.internshipId._id, {
      $pull: { applications: application._id },
    });

    // Get candidate info for email
    const candidate = await User.findById(decoded.userId);

    // Send notification email to company
    try {
      await sendEmail({
        to: application.companyId.contactEmail,
        subject: `Application Withdrawn - ${application.internshipId.title}`,
        html: emailTemplates.applicationWithdrawn({
          companyName: application.companyId.companyName,
          candidateName: `${candidate.firstName} ${candidate.lastName}`,
          internshipTitle: application.internshipId.title,
          withdrawnDate: new Date().toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          }),
        }),
      });
      console.log('📧 Withdrawal notification sent to company');
    } catch (emailError) {
      console.error('❌ Failed to send withdrawal notification:', emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      message: 'Application withdrawn successfully',
      application,
    });
  } catch (error) {
    console.error('❌ Error withdrawing application:', error);
    return NextResponse.json(
      { error: 'Failed to withdraw application' },
      { status: 500 }
    );
  }
}
