import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/utils/auth';
import dbConnect from '@/lib/db/mongodb';
import Application from '@/lib/models/Application';
import Interview from '@/lib/models/Interview';
import CandidateProfile from '@/lib/models/CandidateProfile';

// GET - Fetch all applications for logged-in student with interview data
export async function GET(request) {
  try {
    await dbConnect();

    const token = request.headers.get('authorization')?.replace('Bearer ', '') || 
                  request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'candidate') {
      return NextResponse.json({ error: 'Only candidates can view applications' }, { status: 403 });
    }

    console.log('🔍 Fetching applications for candidate:', decoded.userId);

    // Find candidate profile
    const candidateProfile = await CandidateProfile.findOne({ userId: decoded.userId });
    if (!candidateProfile) {
      return NextResponse.json({ error: 'Candidate profile not found' }, { status: 404 });
    }

    console.log('✅ Candidate profile found:', candidateProfile._id);

    // Fetch all applications for this candidate
    const applications = await Application.find({ candidateId: candidateProfile._id })
      .populate({
        path: 'internshipId',
        select: 'title location duration stipend description requirements workMode'
      })
      .populate({
        path: 'companyId',
        select: 'companyName industry contactEmail contactPhone'
      })
      .sort({ createdAt: -1 })
      .lean();

    console.log(`📋 Found ${applications.length} applications`);

    // For each application, find associated interview if exists
    const applicationsWithInterviews = await Promise.all(
      applications.map(async (app) => {
        const interview = await Interview.findOne({ 
          applicationId: app._id 
        })
        .select('status scheduledDate duration mode meetingLink meetingPassword additionalNotes outcome offerLetter joiningDate joiningMessage')
        .lean();

        return {
          ...app,
          interview: interview || null
        };
      })
    );

    console.log('✅ Applications with interview data prepared');

    return NextResponse.json({
      success: true,
      applications: applicationsWithInterviews,
    });
  } catch (error) {
    console.error('❌ Error fetching student applications:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
