import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Internship from '@/lib/models/Internship';
import CompanyProfile from '@/lib/models/CompanyProfile';
import { verifyToken } from '@/lib/utils/auth';

export async function GET(request) {
  try {
    console.log('📋 Company internships API called');
    await connectDB();

    // Get token from header
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      console.log('❌ No token provided');
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      );
    }

    // Verify token and get user
    const decoded = verifyToken(token);
    console.log('🔐 Token decoded:', decoded ? `userId: ${decoded.userId}` : 'invalid');
    
    if (!decoded || decoded.role !== 'company') {
      console.log('❌ Unauthorized - invalid token or not company role');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Get company profile
    const companyProfile = await CompanyProfile.findOne({ userId: decoded.userId });
    console.log('🏢 Company profile:', companyProfile ? `found (ID: ${companyProfile._id})` : 'not found');
    
    if (!companyProfile) {
      console.log('⚠️ No company profile - returning empty internships');
      return NextResponse.json(
        { success: true, internships: [] },
        { status: 200 }
      );
    }

    // Fetch internships for this company
    const internships = await Internship.find({ companyId: companyProfile._id })
      .populate('applications')
      .sort({ createdAt: -1 });

    console.log(`✅ Found ${internships.length} internships for company ${companyProfile._id}`);
    return NextResponse.json(
      {
        success: true,
        internships,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Error fetching company internships:', error);
    return NextResponse.json(
      { error: error.message || 'Server error occurred' },
      { status: 500 }
    );
  }
}
