import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import { verifyToken } from '@/lib/utils/auth';
import Interview from '@/lib/models/Interview';
import CompanyProfile from '@/lib/models/CompanyProfile';
import CandidateProfile from '@/lib/models/CandidateProfile';
import User from '@/lib/models/User';
import { sendEmail } from '@/lib/utils/email';

export async function GET(request) {
  try {
    await dbConnect();

    const authHeader = request.headers.get('authorization');
    const cookieToken = request.cookies.get('token')?.value;
    
    if (!authHeader && !cookieToken) {
      return NextResponse.json({ error: 'No authorization' }, { status: 401 });
    }

    const token = authHeader ? authHeader.replace('Bearer ', '') : cookieToken;
    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // Filter by status: pending, scheduled, completed

    // Handle based on role
    if (decoded.role === 'company') {
      // Find company profile
      const companyProfile = await CompanyProfile.findOne({ userId: decoded.userId });

      if (!companyProfile) {
        console.error(`❌ Company profile not found for userId: ${decoded.userId}`);
        return NextResponse.json({ error: 'Company profile not found' }, { status: 404 });
      }

      console.log(`🔍 Company Profile found:
        - Profile ID: ${companyProfile._id}
        - User ID: ${decoded.userId}
        - Company Name: ${companyProfile.companyName || 'N/A'}`);

      // Build query
      const query = { companyId: companyProfile._id };
      if (status) {
        query.status = status;
      }

      console.log(`🔍 Fetching interviews for company with query:`, JSON.stringify(query));

      // Get interviews for this company
      const interviews = await Interview.find(query)
        .populate('internshipId', 'title location workMode duration employmentType stipend')
        .populate('candidateId', 'firstName lastName email phone university fieldOfStudy skills languages cv portfolio city country userId')
        .populate({
          path: 'candidateId',
          populate: { path: 'userId', select: 'email firstName lastName' }
        })
        .sort({ createdAt: -1 });

      console.log(`📋 Found ${interviews.length} interviews for company (status: ${status || 'all'})`);
      if (interviews.length > 0) {
        console.log(`   Sample interview details:`, interviews.slice(0, 2).map(i => ({
          id: i._id,
          status: i.status,
          companyId: i.companyId,
          candidateName: `${i.candidateId?.firstName || 'N/A'} ${i.candidateId?.lastName || ''}`
        })));
      } else {
        console.log(`   No interviews found. This could mean:
          1. No candidates have accepted invitations yet
          2. CompanyId mismatch in database
          3. Interviews exist but with different companyId`);
        
        // Debug: Check if there are ANY interviews in the database
        const anyInterviews = await Interview.find({}).limit(5);
        console.log(`   Total interviews in DB (sample):`, anyInterviews.map(i => ({
          id: i._id,
          companyId: i.companyId,
          status: i.status
        })));
      }
      return NextResponse.json({ 
        success: true,
        interviews,
        count: interviews.length,
      });
    } else if (decoded.role === 'candidate') {
      // Find candidate profile
      const candidateProfile = await CandidateProfile.findOne({ userId: decoded.userId });
      if (!candidateProfile) {
        return NextResponse.json({ error: 'Candidate profile not found' }, { status: 404 });
      }

      // Build query
      const query = { candidateId: candidateProfile._id };
      if (status) {
        query.status = status;
      }

      // Get interviews for this candidate
      const interviews = await Interview.find(query)
        .populate('internshipId', 'title location duration workMode employmentType stipend')
        .populate('companyId', 'companyName contactEmail logo industry location')
        .populate('applicationId')
        .sort({ scheduledDate: 1 }); // Sort by date, earliest first

      console.log(`📅 Found ${interviews.length} interviews for candidate (status: ${status || 'all'})`);

      return NextResponse.json({
        success: true,
        interviews,
        count: interviews.length,
      });
    } else {
      return NextResponse.json({ error: 'Invalid role' }, { status: 403 });
    }

  } catch (error) {
    console.error('Error fetching interviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch interviews', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
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

    const body = await request.json();
    const { roleId, candidateId, message } = body;

    if (!roleId || !candidateId) {
      return NextResponse.json(
        { error: 'Role ID and Candidate ID are required' },
        { status: 400 }
      );
    }

    // Find company profile
    const companyProfile = await CompanyProfile.findOne({ userId: decoded.userId });

    if (!companyProfile) {
      return NextResponse.json({ error: 'Company profile not found' }, { status: 404 });
    }

    // Find candidate profile
    const candidateProfile = await CandidateProfile.findById(candidateId)
      .populate('userId', 'name email');

    if (!candidateProfile) {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });
    }

    // Check if interview request already exists
    const existingInterview = await Interview.findOne({
      internshipId: roleId,
      candidateId: candidateProfile._id,
      status: { $in: ['pending', 'scheduled'] }
    });

    if (existingInterview) {
      return NextResponse.json(
        { error: 'Interview request already exists for this candidate' },
        { status: 400 }
      );
    }

    // Create interview entry
    const interview = await Interview.create({
      internshipId: roleId,
      companyId: companyProfile._id,
      candidateId: candidateProfile._id,
      status: 'pending',
      candidateResponse: 'pending',
      companyNotes: message || '',
      scheduledDate: null,
      mode: 'video',
      duration: 60
    });

    // Get company user details
    const companyUser = await User.findById(decoded.userId);

    // Send email notification to candidate
    try {
      await sendEmail({
        to: candidateProfile.userId.email,
        subject: 'Interview Request - Denmark Intern',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Interview Request</h2>
            <p>Hello ${candidateProfile.userId.name},</p>
            <p><strong>${companyProfile.companyName}</strong> wants to schedule an interview with you!</p>
            
            ${message ? `
              <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p style="margin: 0;"><strong>Message from the company:</strong></p>
                <p style="margin: 10px 0 0 0;">${message}</p>
              </div>
            ` : ''}
            
            <p>Please log in to your dashboard to respond to this interview request.</p>
            
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/candidate/dashboard" 
               style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0;">
              View Request
            </a>
            
            <p style="color: #666; font-size: 14px;">
              If you have any questions, please contact ${companyUser.email}
            </p>
          </div>
        `
      });
    } catch (emailError) {
      console.error('Error sending email:', emailError);
      // Continue even if email fails
    }

    return NextResponse.json({
      message: 'Interview request sent successfully',
      interview: {
        _id: interview._id,
        status: interview.status,
        createdAt: interview.createdAt
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating interview request:', error);
    return NextResponse.json(
      { error: 'Failed to create interview request', details: error.message },
      { status: 500 }
    );
  }
}
