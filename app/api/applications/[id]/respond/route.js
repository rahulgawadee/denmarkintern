import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Application from '@/lib/models/Application';
import CompanyProfile from '@/lib/models/CompanyProfile';
import User from '@/lib/models/User';
import { verifyToken } from '@/lib/utils/auth';

export async function PUT(request, { params }) {
  try {
    await connectDB();
    
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'candidate') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { id } = await params;
    const { accepted, response } = await request.json();
    
    const application = await Application.findById(id)
      .populate('candidateId')
      .populate('companyId');
    
    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }
    
    if (application.status !== 'offered') {
      return NextResponse.json(
        { error: 'No offer to respond to' },
        { status: 400 }
      );
    }
    
    // Update application
    application.status = accepted ? 'accepted' : 'rejected';
    application.candidateResponse = response;
    application.offerDetails.respondedAt = new Date();
    
    // Add to status history
    application.statusHistory.push({
      status: accepted ? 'accepted' : 'rejected',
      changedBy: decoded.userId,
      notes: response,
    });
    
    await application.save();
    
    // Notify company via email
    const companyUser = await User.findById(application.companyId.userId);
    
    await sendEmail({
      to: companyUser.email,
      subject: accepted
        ? '✅ Offer Accepted!'
        : 'Offer Response',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>${accepted ? '✅ Great news!' : 'Offer Response'}</h2>
          <p>${application.candidateId.firstName} ${application.candidateId.lastName} has ${accepted ? 'accepted' : 'declined'} your internship offer.</p>
          ${response ? `
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p><strong>Candidate's response:</strong></p>
              <p>${response}</p>
            </div>
          ` : ''}
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/applications" style="display: inline-block; padding: 12px 24px; background-color: #0070f3; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">View Details</a>
          <p>Best regards,<br>Denmark Intern Team</p>
        </div>
      `,
    });
    
    return NextResponse.json(
      {
        success: true,
        message: accepted ? 'Offer accepted successfully!' : 'Response sent successfully',
        application,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Respond to offer error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
