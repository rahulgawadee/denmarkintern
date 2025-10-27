import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import { verifyToken } from '@/lib/utils/auth';
import Notification from '@/lib/models/Notification';
import Invitation from '@/lib/models/Invitation';
import Interview from '@/lib/models/Interview';
import Application from '@/lib/models/Application';
import CandidateProfile from '@/lib/models/CandidateProfile';
import CompanyProfile from '@/lib/models/CompanyProfile';

export async function GET(request) {
  try {
    await dbConnect();

    const token = request.headers.get('authorization')?.replace('Bearer ', '') ||
      request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = decoded.userId;
    const role = decoded.role;

    const baseCounts = await Notification.countDocuments({ userId, read: false });

    if (role === 'candidate') {
      const candidateProfile = await CandidateProfile.findOne({ userId }, '_id');
      if (!candidateProfile) {
        return NextResponse.json({ error: 'Candidate profile not found' }, { status: 404 });
      }

      const [pendingInvitations, activeApplications, activeInterviews] = await Promise.all([
        Invitation.countDocuments({ candidateId: candidateProfile._id, status: 'pending' }),
        Application.countDocuments({
          candidateId: candidateProfile._id,
          status: { $in: ['pending', 'reviewed', 'shortlisted', 'interview_scheduled', 'interviewed', 'offered'] },
        }),
        Interview.countDocuments({
          candidateId: candidateProfile._id,
          status: { $in: ['pending', 'scheduled', 'rescheduled'] },
        }),
      ]);

      return NextResponse.json({
        success: true,
        counts: {
          notificationCount: baseCounts,
          invitationCount: pendingInvitations,
          applicationCount: activeApplications,
          interviewCount: activeInterviews,
        },
      });
    }

    if (role === 'company') {
      const companyProfile = await CompanyProfile.findOne({ userId }, '_id');
      if (!companyProfile) {
        return NextResponse.json({ error: 'Company profile not found' }, { status: 404 });
      }

      const [pendingInvitations, pendingInterviews] = await Promise.all([
        Invitation.countDocuments({ companyId: companyProfile._id, status: 'pending' }),
        Interview.countDocuments({ companyId: companyProfile._id, status: { $in: ['pending', 'scheduled', 'rescheduled'] } }),
      ]);

      return NextResponse.json({
        success: true,
        counts: {
          notificationCount: baseCounts,
          matchCount: pendingInvitations,
          interviewCount: pendingInterviews,
        },
      });
    }

    // default for other roles
    return NextResponse.json({
      success: true,
      counts: {
        notificationCount: baseCounts,
      },
    });
  } catch (error) {
    console.error('❌ Error fetching notification summary:', error);
    return NextResponse.json({ error: 'Failed to fetch summary' }, { status: 500 });
  }
}
