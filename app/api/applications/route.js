import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Application from '@/lib/models/Application';
import Internship from '@/lib/models/Internship';
import CandidateProfile from '@/lib/models/CandidateProfile';
import CompanyProfile from '@/lib/models/CompanyProfile';
import User from '@/lib/models/User';
import { verifyToken } from '@/lib/utils/auth';
import { sendEmail, emailTemplates } from '@/lib/utils/email';

export async function GET(request) {
  try {
    await connectDB();
    
    // Try to get token from header or cookie
    const authHeader = request.headers.get('authorization');
    const cookieToken = request.cookies.get('token')?.value;
    const token = authHeader?.replace('Bearer ', '') || cookieToken;
    
    if (!token) {
      console.log('❌ No token provided in GET /api/applications');
      return NextResponse.json({ error: 'Unauthorized - No token provided' }, { status: 401 });
    }
    
    const decoded = verifyToken(token);
    if (!decoded) {
      console.log('❌ Invalid token in GET /api/applications');
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    console.log(`✅ GET /api/applications - User: ${decoded.userId}, Role: ${decoded.role}`);
    
    let applications;
    
    if (decoded.role === 'candidate') {
      const candidateProfile = await CandidateProfile.findOne({ userId: decoded.userId });
      
      if (!candidateProfile) {
        console.log('⚠️  Candidate profile not found, returning empty array');
        // Return empty array if profile doesn't exist yet
        return NextResponse.json({ success: true, applications: [] }, { status: 200 });
      }
      
      console.log(`📋 Fetching applications for candidate: ${candidateProfile._id}`);
      
      applications = await Application.find({ candidateId: candidateProfile._id })
        .populate('internshipId')
        .populate('companyId', 'companyName logo')
        .sort({ createdAt: -1 });
        
      console.log(`✅ Found ${applications.length} applications`);
    } else if (decoded.role === 'company') {
      const companyProfile = await CompanyProfile.findOne({ userId: decoded.userId });
      
      if (!companyProfile) {
        console.log('⚠️  Company profile not found, returning empty array');
        // Return empty array if profile doesn't exist yet
        return NextResponse.json({ success: true, applications: [] }, { status: 200 });
      }
      
      console.log(`📋 Fetching applications for company: ${companyProfile._id}`);
      
      applications = await Application.find({ companyId: companyProfile._id })
        .populate('internshipId')
        .populate('candidateId')
        .sort({ createdAt: -1 });
        
      console.log(`✅ Found ${applications.length} applications`);
    }
    
    return NextResponse.json({ success: true, applications }, { status: 200 });
  } catch (error) {
    console.error('❌ Get applications error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    console.log('📨 POST /api/applications - Creating new application');
    await connectDB();
    
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'candidate') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { internshipId, companyId, coverLetter } = await request.json();
    
    console.log(`👤 Candidate ID: ${decoded.userId}`);
    console.log(`💼 Internship ID: ${internshipId}`);
    
    // Get candidate profile
    const candidateProfile = await CandidateProfile.findOne({ userId: decoded.userId });
    const candidateUser = await User.findById(decoded.userId);
    
    if (!candidateProfile) {
      console.log('❌ Candidate profile not found');
      return NextResponse.json(
        { error: 'Please complete your profile first' },
        { status: 400 }
      );
    }
    
    // Check profile completion (must be at least 80%)
    if (candidateProfile.profileCompletion < 80) {
      console.log(`❌ Profile completion too low: ${candidateProfile.profileCompletion}%`);
      return NextResponse.json(
        { error: `Profile must be at least 80% complete to apply. Currently: ${candidateProfile.profileCompletion}%` },
        { status: 400 }
      );
    }
    
    console.log(`✅ Profile completion: ${candidateProfile.profileCompletion}%`);
    
    // Get internship details
    const internship = await Internship.findById(internshipId);
    
    if (!internship) {
      console.log('❌ Internship not found');
      return NextResponse.json({ error: 'Internship not found' }, { status: 404 });
    }
    
    // Check if already applied (prevent duplicates)
    const existingApplication = await Application.findOne({
      internshipId,
      candidateId: candidateProfile._id,
    });
    
    if (existingApplication) {
      console.log('❌ Already applied to this internship');
      return NextResponse.json(
        { error: 'You have already applied to this internship' },
        { status: 400 }
      );
    }
    
    // Get company details for notifications
    const companyProfile = await CompanyProfile.findById(internship.companyId);
    const companyUser = await User.findOne({ _id: companyProfile.userId });
    
    console.log('✅ Creating application...');
    
    // Create application
    const application = await Application.create({
      internshipId,
      candidateId: candidateProfile._id,
      companyId: internship.companyId,
      coverLetter,
      status: 'pending',
      appliedAt: new Date(),
      statusHistory: [
        {
          status: 'pending',
          changedBy: decoded.userId,
          notes: 'Application submitted',
        },
      ],
    });
    
    // Add application to internship
    await Internship.findByIdAndUpdate(internshipId, {
      $push: { applications: application._id },
    });
    
    console.log('✅ Application created successfully');
    
    // Send confirmation email to candidate
    try {
      await sendEmail({
        to: candidateUser.email,
        subject: `Application Submitted - ${internship.title}`,
        html: emailTemplates.applicationConfirmation({
          candidateName: `${candidateProfile.firstName} ${candidateProfile.lastName}`,
          internshipTitle: internship.title,
          companyName: companyProfile.companyName,
        }),
      });
      console.log('📧 Confirmation email sent to candidate');
    } catch (emailError) {
      console.error('⚠️  Failed to send candidate email:', emailError.message);
    }
    
    // Send notification to company
    try {
      await sendEmail({
        to: companyUser.email,
        subject: `New Application - ${internship.title}`,
        html: emailTemplates.newApplicationNotification({
          companyName: companyProfile.companyName,
          candidateName: `${candidateProfile.firstName} ${candidateProfile.lastName}`,
          internshipTitle: internship.title,
          applicationDate: new Date().toLocaleDateString(),
        }),
      });
      console.log('📧 Notification email sent to company');
    } catch (emailError) {
      console.error('⚠️  Failed to send company email:', emailError.message);
    }
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'Application submitted successfully', 
        application 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('❌ Create application error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
