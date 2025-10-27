import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import CandidateProfile from '@/lib/models/CandidateProfile';
import User from '@/lib/models/User';
import { verifyToken } from '@/lib/utils/auth';

export async function GET(request) {
  try {
    console.log('📋 GET /api/profile/candidate - Fetching candidate profile');
    await connectDB();
    
    // Get token from header
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      console.log('❌ No token provided');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const decoded = verifyToken(token);
    if (!decoded) {
      console.log('❌ Invalid token');
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    console.log('👤 User ID:', decoded.userId);
    
    // Get profile with user info
    const profile = await CandidateProfile.findOne({ userId: decoded.userId });
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!profile) {
      console.log('⚠️  Profile not found, creating basic profile');
      // Create a basic profile if it doesn't exist
      const newProfile = await CandidateProfile.create({
        userId: decoded.userId,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
      });
      
      return NextResponse.json({ 
        success: true, 
        profile: newProfile,
        user: {
          email: user.email,
          role: user.role,
        }
      }, { status: 200 });
    }
    
    console.log('✅ Profile found - Completion:', profile.profileCompletion + '%');
    
    return NextResponse.json({ 
      success: true, 
      profile,
      user: {
        email: user.email,
        role: user.role,
      }
    }, { status: 200 });
  } catch (error) {
    console.error('❌ Get profile error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    console.log('💾 POST /api/profile/candidate - Updating profile');
    await connectDB();
    
    // Get token from header
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      console.log('❌ No token provided');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'candidate') {
      console.log('❌ Unauthorized - Not a candidate');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const profileData = await request.json();
    console.log('📝 Profile data received:', JSON.stringify(profileData, null, 2));
    console.log('📝 Skills type:', typeof profileData.skills, 'Is Array:', Array.isArray(profileData.skills));
    console.log('📝 Skills value:', profileData.skills);
    
    // Remove fields that shouldn't be updated directly
    delete profileData.userId;
    delete profileData._id;
    delete profileData.createdAt;
    delete profileData.updatedAt;
    
    // Ensure arrays are properly formatted
    if (profileData.skills && !Array.isArray(profileData.skills)) {
      console.log('⚠️  Converting skills to array');
      profileData.skills = [profileData.skills];
    }
    if (profileData.tools && !Array.isArray(profileData.tools)) {
      console.log('⚠️  Converting tools to array');
      profileData.tools = [profileData.tools];
    }
    if (profileData.workMode && !Array.isArray(profileData.workMode)) {
      console.log('⚠️  Converting workMode to array');
      profileData.workMode = [profileData.workMode];
    }
    
    // Log detailed info before save
    console.log('📋 About to save:');
    console.log('  Skills:', JSON.stringify(profileData.skills));
    console.log('  Skills type:', typeof profileData.skills);
    console.log('  Skills isArray:', Array.isArray(profileData.skills));
    if (Array.isArray(profileData.skills)) {
      console.log('  First skill type:', typeof profileData.skills[0]);
      console.log('  First skill value:', profileData.skills[0]);
    }
    console.log('  Languages:', JSON.stringify(profileData.languages));
    if (profileData.languages && profileData.languages.length > 0) {
      console.log('  First language:', JSON.stringify(profileData.languages[0]));
    }
    
    // Check if profile already exists
    let profile = await CandidateProfile.findOne({ userId: decoded.userId });
    
    if (profile) {
      console.log('🔄 Updating existing profile');
      
      // Delete the old profile and create a new one to avoid schema conflicts
      // This is safer when dealing with potential data corruption
      await CandidateProfile.deleteOne({ userId: decoded.userId });
      
      profile = await CandidateProfile.create({
        ...profileData,
        userId: decoded.userId,
      });
      
      console.log('✅ Profile recreated successfully');
    } else {
      console.log('➕ Creating new profile');
      // Create new profile
      profile = await CandidateProfile.create({
        ...profileData,
        userId: decoded.userId,
      });
    }
    
    console.log('✅ Profile saved - Completion:', profile.profileCompletion + '%', 'Can Apply:', profile.canApply);
    
    // Update user profileCompleted status if completion >= 80%
    if (profile.profileCompletion >= 80) {
      await User.findByIdAndUpdate(decoded.userId, { profileCompleted: true });
      console.log('✅ User profileCompleted set to true');
    }
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'Profile saved successfully', 
        profile,
        profileCompletion: profile.profileCompletion,
        canApply: profile.canApply,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Save profile error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  return POST(request);
}
