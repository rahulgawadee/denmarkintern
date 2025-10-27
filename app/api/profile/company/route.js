import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import CompanyProfile from '@/lib/models/CompanyProfile';
import User from '@/lib/models/User';
import { verifyToken } from '@/lib/utils/auth';

// Helper function to remove empty strings from object
function cleanProfileData(data) {
  const cleaned = {};
  
  for (const [key, value] of Object.entries(data)) {
    if (value === null || value === undefined || value === '') {
      continue; // Skip empty values
    }
    
    if (typeof value === 'object' && !Array.isArray(value)) {
      const cleanedNested = cleanProfileData(value);
      if (Object.keys(cleanedNested).length > 0) {
        cleaned[key] = cleanedNested;
      }
    } else if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed) cleaned[key] = trimmed;
    } else {
      cleaned[key] = value;
    }
  }
  
  return cleaned;
}

export async function GET(request) {
  try {
    await connectDB();
    
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    const profile = await CompanyProfile.findOne({ userId: decoded.userId });
    
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, profile }, { status: 200 });
  } catch (error) {
    console.error('Get company profile error:', error);
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
    
    const profileData = await request.json();
    
    // Clean the data to remove empty strings
    const cleanedData = cleanProfileData(profileData);
    
    let profile = await CompanyProfile.findOne({ userId: decoded.userId });
    
    if (profile) {
      profile = await CompanyProfile.findOneAndUpdate(
        { userId: decoded.userId },
        { ...cleanedData, userId: decoded.userId },
        { new: true, runValidators: true }
      );
    } else {
      profile = await CompanyProfile.create({
        ...cleanedData,
        userId: decoded.userId,
      });
      
      await User.findByIdAndUpdate(decoded.userId, { profileCompleted: true });
    }
    
    return NextResponse.json(
      { success: true, message: 'Company profile saved successfully', profile },
      { status: 200 }
    );
  } catch (error) {
    console.error('Save company profile error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  return POST(request);
}

export async function PATCH(request) {
  try {
    await connectDB();
    
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    const updates = await request.json();
    
    // Clean the data to remove empty strings
    const cleanedUpdates = cleanProfileData(updates);
    
    const profile = await CompanyProfile.findOneAndUpdate(
      { userId: decoded.userId },
      { $set: cleanedUpdates },
      { new: true, runValidators: true }
    );
    
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }
    
    return NextResponse.json(
      { success: true, message: 'Profile updated successfully', profile },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update company profile error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
