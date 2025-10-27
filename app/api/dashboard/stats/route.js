import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import CompanyProfile from '@/lib/models/CompanyProfile';
import Internship from '@/lib/models/Internship';
import Application from '@/lib/models/Application';
import { verifyToken } from '@/lib/utils/auth';

export async function GET(request) {
  try {
    console.log('📊 Dashboard stats API called');
    await connectDB();
    
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      console.log('❌ No token provided');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const decoded = verifyToken(token);
    console.log('🔐 Token decoded:', decoded ? 'valid' : 'invalid');
    
    if (!decoded || decoded.role !== 'company') {
      console.log('❌ Unauthorized - invalid token or not company role');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get company profile
    const companyProfile = await CompanyProfile.findOne({ userId: decoded.userId });
    console.log('🏢 Company profile found:', companyProfile ? 'yes' : 'no');
    
    if (!companyProfile) {
      console.log('❌ Company profile not found for userId:', decoded.userId);
      return NextResponse.json({ error: 'Company profile not found' }, { status: 404 });
    }
    
    // Get all internships for this company
    const allRoles = await Internship.find({ companyId: companyProfile._id });
    console.log('📝 Total roles found:', allRoles.length);
    
    // Count active roles (under_review, active, matched)
    const activeRoles = allRoles.filter(role => 
      ['under_review', 'active', 'matched'].includes(role.status)
    ).length;
    
    // Count draft roles
    const draftRoles = allRoles.filter(role => role.status === 'draft').length;
    
    // Count completed internships
    const completedInternships = allRoles.filter(role => role.status === 'completed').length;
    
    // Get applications for these roles
    const roleIds = allRoles.map(role => role._id);
    const applications = await Application.find({ 
      internshipId: { $in: roleIds } 
    });
    console.log('📬 Total applications found:', applications.length);
    
    // Count matches (accepted applications)
    const matchesFound = applications.filter(app => 
      app.status === 'accepted' || app.status === 'shortlisted'
    ).length;
    
    // Count pending interviews
    const pendingInterviews = applications.filter(app => 
      app.interviewScheduled && app.status === 'interview_scheduled'
    ).length;
    
    // Calculate trends (mock data for now - you can implement actual trend calculation)
    const stats = {
      activeRoles: {
        count: activeRoles,
        trend: 5, // +5% from last month
      },
      matchesFound: {
        count: matchesFound,
        trend: 12, // +12% from last month
      },
      pendingInterviews: {
        count: pendingInterviews,
        trend: -3, // -3% from last month
      },
      completedInternships: {
        count: completedInternships,
        trend: 8, // +8% from last month
      },
      draftRoles: {
        count: draftRoles,
      },
      totalRoles: allRoles.length,
    };
    
    console.log('✅ Stats calculated:', stats);
    return NextResponse.json({ success: true, stats }, { status: 200 });
  } catch (error) {
    console.error('❌ Get dashboard stats error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
