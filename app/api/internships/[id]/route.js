import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Internship from '@/lib/models/Internship';
import CompanyProfile from '@/lib/models/CompanyProfile';
import Application from '@/lib/models/Application';
import { verifyToken } from '@/lib/utils/auth';

// GET - Fetch single internship (accessible by both candidates and companies)
export async function GET(request, { params }) {
  try {
    console.log('📋 GET /api/internships/[id] - Fetching internship details');
    await connectDB();
    
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const { id } = await params;
    
    let decoded = null;
    let hasApplied = false;
    
    if (token) {
      decoded = verifyToken(token);
    }
    
    // Find the internship and populate company details
    const internship = await Internship.findById(id).populate('companyId');
    
    if (!internship) {
      return NextResponse.json({ error: 'Internship not found' }, { status: 404 });
    }
    
    // Fetch company details
    const company = await CompanyProfile.findOne({ userId: internship.companyId });
    
    // If user is a candidate, check if they've already applied
    if (decoded && decoded.role === 'candidate') {
      const application = await Application.findOne({
        candidateId: decoded.userId,
        internshipId: id,
      });
      hasApplied = !!application;
      console.log(`🔍 Candidate has applied: ${hasApplied}`);
    }
    
    // If user is company, verify ownership for edit access
    if (decoded && decoded.role === 'company') {
      const companyProfile = await CompanyProfile.findOne({ userId: decoded.userId });
      if (internship.companyId.toString() !== companyProfile?._id.toString()) {
        console.log('⚠️ Company trying to access another company\'s internship');
      }
    }
    
    console.log('✅ Internship details retrieved successfully');
    
    return NextResponse.json(
      { 
        success: true, 
        internship,
        company,
        hasApplied,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Get internship error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH - Update internship
export async function PATCH(request, { params }) {
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
    
    const { id } = await params;
    const body = await request.json();
    
    // Get company profile
    const companyProfile = await CompanyProfile.findOne({ userId: decoded.userId });
    
    if (!companyProfile) {
      return NextResponse.json({ error: 'Company profile not found' }, { status: 404 });
    }
    
    // Find the internship
    const internship = await Internship.findById(id);
    
    if (!internship) {
      return NextResponse.json({ error: 'Internship not found' }, { status: 404 });
    }
    
    // Verify ownership
    if (internship.companyId.toString() !== companyProfile._id.toString()) {
      return NextResponse.json({ error: 'Unauthorized to update this internship' }, { status: 403 });
    }
    
    // Update the internship
    const updatedInternship = await Internship.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    ).populate('companyId');
    
    return NextResponse.json(
      { success: true, internship: updatedInternship, message: 'Internship updated successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update internship error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
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
    
    const { id } = await params;
    
    // Get company profile
    const companyProfile = await CompanyProfile.findOne({ userId: decoded.userId });
    
    if (!companyProfile) {
      return NextResponse.json({ error: 'Company profile not found' }, { status: 404 });
    }
    
    // Find the internship
    const internship = await Internship.findById(id);
    
    if (!internship) {
      return NextResponse.json({ error: 'Internship not found' }, { status: 404 });
    }
    
    // Verify ownership
    if (internship.companyId.toString() !== companyProfile._id.toString()) {
      return NextResponse.json({ error: 'Unauthorized to delete this internship' }, { status: 403 });
    }
    
    // Delete the internship
    await Internship.findByIdAndDelete(id);
    
    return NextResponse.json(
      { success: true, message: 'Internship deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete internship error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
