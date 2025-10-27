import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Internship from '@/lib/models/Internship';
import CompanyProfile from '@/lib/models/CompanyProfile';
import { verifyToken } from '@/lib/utils/auth';

export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const area = searchParams.get('area');
    const workMode = searchParams.get('workMode');
    
    let query = {};
    
    if (status) query.status = status;
    if (area) query.area = area;
    if (workMode) query.workMode = workMode;
    
    const internships = await Internship.find(query)
      .populate('companyId', 'companyName logo city')
      .sort({ createdAt: -1 });
    
    return NextResponse.json({ success: true, internships }, { status: 200 });
  } catch (error) {
    console.error('Get internships error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectDB();
    
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'company') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get company profile
    const companyProfile = await CompanyProfile.findOne({ userId: decoded.userId });
    
    if (!companyProfile) {
      return NextResponse.json(
        { error: 'Please complete your company profile first' },
        { status: 400 }
      );
    }
    
    if (companyProfile.verificationStatus !== 'verified') {
      return NextResponse.json(
        { error: 'Your company must be verified before posting internships' },
        { status: 403 }
      );
    }
    
    const internshipData = await request.json();
    
    const internship = await Internship.create({
      ...internshipData,
      companyId: companyProfile._id,
    });
    
    return NextResponse.json(
      { success: true, message: 'Internship posted successfully', internship },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create internship error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
