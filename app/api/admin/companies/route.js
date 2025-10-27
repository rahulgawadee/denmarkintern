import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import CompanyProfile from '@/lib/models/CompanyProfile';
import User from '@/lib/models/User';
import { verifyToken } from '@/lib/utils/auth';
import { sendEmail, emailTemplates } from '@/lib/utils/email';

export async function GET(request) {
  try {
    await connectDB();
    
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'pending';
    
    const companies = await CompanyProfile.find({ verificationStatus: status })
      .populate('userId', 'email createdAt')
      .sort({ createdAt: -1 });
    
    return NextResponse.json({ success: true, companies }, { status: 200 });
  } catch (error) {
    console.error('Get companies error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    await connectDB();
    
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }
    
    const { companyId, status, message } = await request.json();
    
    const company = await CompanyProfile.findById(companyId).populate('userId', 'email');
    
    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }
    
    company.verificationStatus = status;
    
    if (status === 'verified') {
      company.verifiedAt = new Date();
      
      // Update user verification
      await User.findByIdAndUpdate(company.userId._id, { isVerified: true });
      
      // Send verification email
      await sendEmail({
        to: company.userId.email,
        subject: '✅ Your company has been verified!',
        html: emailTemplates.companyVerified(company.companyName),
      });
    } else if (status === 'rejected') {
      // Send rejection email
      await sendEmail({
        to: company.userId.email,
        subject: 'Company Verification Status',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Company Verification Status</h2>
            <p>Hi ${company.companyName},</p>
            <p>Unfortunately, we were unable to verify your company profile at this time.</p>
            ${message ? `
              <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p><strong>Reason:</strong></p>
                <p>${message}</p>
              </div>
            ` : ''}
            <p>Please update your information and resubmit for verification.</p>
            <p>Best regards,<br>Denmark Intern Team</p>
          </div>
        `,
      });
    }
    
    await company.save();
    
    return NextResponse.json(
      { success: true, message: 'Company verification status updated', company },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update company verification error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
