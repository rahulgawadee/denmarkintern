import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import Onboarding from '@/lib/models/Onboarding';
import { verifyToken } from '@/lib/utils/auth';
import { writeFile } from 'fs/promises';
import path from 'path';

// POST /api/onboarding/upload - Upload document
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

    const formData = await request.formData();
    const file = formData.get('file');
    const onboardingId = formData.get('onboardingId');
    const documentType = formData.get('documentType') || 'other';

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Verify onboarding belongs to company
    const onboarding = await Onboarding.findById(onboardingId);
    if (!onboarding) {
      return NextResponse.json(
        { error: 'Onboarding not found' },
        { status: 404 }
      );
    }

    if (onboarding.companyId.toString() !== decoded.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename
    const timestamp = Date.now();
    const ext = path.extname(file.name);
    const filename = `onboarding_${onboardingId}_${documentType}_${timestamp}${ext}`;
    const filepath = path.join(process.cwd(), 'public', 'uploads', 'onboarding', filename);

    // Ensure directory exists
    const fs = require('fs');
    const dir = path.join(process.cwd(), 'public', 'uploads', 'onboarding');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    await writeFile(filepath, buffer);

    // Update onboarding with document
    const documentUrl = `/uploads/onboarding/${filename}`;
    
    onboarding.documents.push({
      type: documentType,
      name: file.name,
      url: documentUrl,
      uploadedBy: 'company',
      status: 'uploaded',
      uploadedAt: new Date(),
    });

    // Update agreement tracking if it's the agreement
    if (documentType === 'internship_agreement') {
      onboarding.agreementSigned = true;
    }

    await onboarding.save();

    return NextResponse.json({
      success: true,
      message: 'Document uploaded successfully',
      document: {
        type: documentType,
        name: file.name,
        url: documentUrl,
      },
      onboarding,
    });

  } catch (error) {
    console.error('Error uploading document:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload document' },
      { status: 500 }
    );
  }
}
