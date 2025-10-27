import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import Onboarding from '@/lib/models/Onboarding';
import Application from '@/lib/models/Application';
import Internship from '@/lib/models/Internship';
import { verifyToken } from '@/lib/utils/auth';

// GET /api/onboarding - Get onboarding records for company
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

    const onboardings = await Onboarding.find({ companyId: decoded.userId })
      .populate({
        path: 'candidateId',
        populate: { path: 'userId', select: 'name email' }
      })
      .populate('internshipId', 'title startWindow')
      .populate('applicationId')
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      onboardings,
    });

  } catch (error) {
    console.error('Error fetching onboardings:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch onboardings' },
      { status: 500 }
    );
  }
}

// POST /api/onboarding - Create new onboarding record
export async function POST(request) {
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

    const body = await request.json();
    const { applicationId, internshipId, candidateId } = body;

    // Verify the application exists and belongs to this company
    const application = await Application.findById(applicationId)
      .populate('internshipId');
    
    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    const internship = await Internship.findById(internshipId || application.internshipId);
    
    if (!internship || internship.companyId.toString() !== decoded.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Check if onboarding already exists
    const existing = await Onboarding.findOne({
      applicationId,
      candidateId: candidateId || application.candidateId,
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Onboarding already exists for this application' },
        { status: 400 }
      );
    }

    // Create onboarding record
    const onboarding = new Onboarding({
      applicationId,
      internshipId: internshipId || application.internshipId,
      candidateId: candidateId || application.candidateId,
      companyId: decoded.userId,
      status: 'pending',
      documents: [
        {
          type: 'internship_agreement',
          name: 'Internship Agreement',
          status: 'pending',
          uploadedBy: 'company',
        },
      ],
    });

    await onboarding.save();

    // Update application status
    await Application.findByIdAndUpdate(applicationId, {
      status: 'onboarding',
    });

    return NextResponse.json({
      success: true,
      message: 'Onboarding created successfully',
      onboarding,
    });

  } catch (error) {
    console.error('Error creating onboarding:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create onboarding' },
      { status: 500 }
    );
  }
}
