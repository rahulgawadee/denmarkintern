import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import Interview from '@/lib/models/Interview';
import CompanyProfile from '@/lib/models/CompanyProfile';
import { verifyToken } from '@/lib/utils/auth';

export async function GET(request) {
  try {
    await dbConnect();

    const token = request.headers.get('authorization')?.replace('Bearer ', '') || request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);

    // Get ALL interviews
    const allInterviews = await Interview.find({}).lean();
    
    // Get company profile
    let companyProfile = null;
    if (decoded.role === 'company') {
      companyProfile = await CompanyProfile.findOne({ userId: decoded.userId }).lean();
    }

    console.log('='.repeat(80));
    console.log('🔍 DEBUG - ALL INTERVIEWS IN DATABASE');
    console.log('='.repeat(80));
    console.log(`Total interviews found: ${allInterviews.length}`);
    
    if (companyProfile) {
      console.log(`\n📋 Company Profile:
        - Profile ID: ${companyProfile._id}
        - User ID: ${decoded.userId}
        - Company Name: ${companyProfile.companyName || 'N/A'}`);
    }

    console.log('\n📝 All Interviews:');
    allInterviews.forEach((interview, index) => {
      console.log(`\n  Interview ${index + 1}:
        - Interview ID: ${interview._id}
        - Company ID: ${interview.companyId}
        - Candidate ID: ${interview.candidateId}
        - Internship ID: ${interview.internshipId}
        - Status: ${interview.status}
        - Created: ${interview.createdAt}
        ${companyProfile ? `- MATCHES Company Profile: ${interview.companyId.toString() === companyProfile._id.toString() ? '✅ YES' : '❌ NO'}` : ''}`);
    });
    console.log('='.repeat(80));

    return NextResponse.json({
      success: true,
      totalInterviews: allInterviews.length,
      companyProfileId: companyProfile?._id || null,
      interviews: allInterviews.map(i => ({
        id: i._id,
        companyId: i.companyId,
        candidateId: i.candidateId,
        internshipId: i.internshipId,
        status: i.status,
        matchesProfile: companyProfile ? i.companyId.toString() === companyProfile._id.toString() : null,
        createdAt: i.createdAt,
      })),
    });
  } catch (error) {
    console.error('❌ Debug interviews error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
