import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import Onboarding from '@/lib/models/Onboarding';
import { verifyToken } from '@/lib/utils/auth';

// GET /api/active-interns - Get active interns for company
export async function GET(request) {
  try {
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

    // Fetch all completed onboardings (which means they're now active interns)
    const interns = await Onboarding.find({ 
      companyId: decoded.userId,
      status: { $in: ['completed', 'in_progress'] }
    })
      .populate({
        path: 'candidateId',
        populate: { path: 'userId', select: 'name email' }
      })
      .populate('internshipId', 'title startWindow')
      .sort({ onboardingCompletedAt: -1 });

    // Calculate progress for each intern
    const internsWithProgress = interns.map(intern => {
      const progress = calculateProgress(intern.startDate, intern.endDate);
      return {
        ...intern.toObject(),
        progress,
        status: intern.endDate && new Date(intern.endDate) < new Date() ? 'completed' : 
                intern.status === 'completed' ? 'active' : 'active'
      };
    });

    return NextResponse.json({
      success: true,
      interns: internsWithProgress,
    });

  } catch (error) {
    console.error('Error fetching active interns:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch active interns' },
      { status: 500 }
    );
  }
}

function calculateProgress(startDate, endDate) {
  if (!startDate || !endDate) return 0;
  
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  const now = Date.now();
  
  if (now < start) return 0;
  if (now > end) return 100;
  
  const total = end - start;
  const elapsed = now - start;
  
  return Math.round((elapsed / total) * 100);
}
