import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Interview from '@/lib/models/Interview';
import CandidateProfile from '@/lib/models/CandidateProfile';
import { verifyToken } from '@/lib/utils/auth';

// GET /api/interviews/student - Get all interviews for a student
export async function GET(request) {
  try {
    await connectDB();

    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized - No token provided' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid token' },
        { status: 401 }
      );
    }

    // Verify user is a candidate
    if (decoded.role !== 'candidate') {
      return NextResponse.json(
        { error: 'Forbidden - Only candidates can access this endpoint' },
        { status: 403 }
      );
    }

    // Find the candidate profile
    const candidateProfile = await CandidateProfile.findOne({ userId: decoded.userId });
    
    if (!candidateProfile) {
      return NextResponse.json(
        { error: 'Candidate profile not found' },
        { status: 404 }
      );
    }

    console.log('🔍 Fetching interviews for candidate:', candidateProfile._id);

    // Find all interviews for this candidate
    const interviews = await Interview.find({ 
      candidateId: candidateProfile._id 
    })
      .populate({
        path: 'internshipId',
        select: 'position location employmentType duration salary'
      })
      .populate({
        path: 'companyId',
        select: 'companyName companyLogo industry'
      })
      .sort({ scheduledDate: 1 }) // Upcoming interviews first
      .lean();

    console.log('✅ Found interviews:', interviews.length);

    return NextResponse.json({
      success: true,
      interviews: interviews
    });

  } catch (error) {
    console.error('❌ Error fetching student interviews:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
