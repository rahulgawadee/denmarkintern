import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Internship from '@/lib/models/Internship';
import CompanyProfile from '@/lib/models/CompanyProfile';
import { verifyToken } from '@/lib/utils/auth';

export async function POST(request) {
  try {
    await connectDB();

    // Get token from header
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { error: 'No authorization token provided' },
        { status: 401 }
      );
    }

    // Verify token and get user
    const decoded = verifyToken(token);
    
    if (!decoded || decoded.role !== 'company') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Get company profile
    const companyProfile = await CompanyProfile.findOne({ userId: decoded.userId });
    
    if (!companyProfile) {
      return NextResponse.json(
        { error: 'Company profile not found. Please complete your profile first.' },
        { status: 404 }
      );
    }

    // Get internship data from request
    const data = await request.json();

    // Create internship
    const internship = await Internship.create({
      companyId: companyProfile._id,
      title: data.title,
      department: data.department,
      area: data.area || [],
      description: data.description,
      responsibilities: data.responsibilities || [],
      
      // Work details
      workMode: data.workMode,
      duration: data.duration,
      weeklyHours: data.weeklyHours,
      specificStartDate: data.specificStartDate || data.startDate,
      location: data.location || {},
      
      // Skills
      mustHaveSkills: data.mustHaveSkills || [],
      niceToHaveSkills: data.niceToHaveSkills || [],
      tools: data.tools || [],
      softSkills: data.softSkills || [],
      
      // Requirements
      academicLevel: data.academicLevel || [],
      fieldOfStudy: data.fieldOfStudy || [],
      languageRequirements: data.languageRequirements || [],
      
      // Compensation
      stipend: data.stipend,
      benefits: data.benefits || [],
      
      // Status
      status: data.status || 'draft',
    });

    // TODO: If status is 'under_review', trigger matching algorithm
    if (internship.status === 'under_review') {
      // Matching logic will go here
      // For now, we'll just log it
      console.log('Triggering matching algorithm for internship:', internship._id);
    }

    return NextResponse.json(
      {
        success: true,
        internship,
        message: 'Internship role created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating internship:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create internship' },
      { status: 500 }
    );
  }
}
