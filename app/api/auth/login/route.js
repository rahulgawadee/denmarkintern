import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import User from '@/lib/models/User';
import { generateToken } from '@/lib/utils/auth';

export async function POST(request) {
  try {
    console.log('🔐 Login API called');
    await connectDB();
    
    const { email, password } = await request.json();
    console.log('📧 Login attempt for email:', email);
    
    // Validation
    if (!email || !password) {
      console.log('❌ Missing email or password');
      return NextResponse.json(
        { error: 'Please provide email and password' },
        { status: 400 }
      );
    }
    
    // Find user with password field
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    console.log('👤 User found:', user ? `Yes (ID: ${user._id}, Role: ${user.role})` : 'No');
    
    if (!user) {
      console.log('❌ No user found with email:', email);
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    // Check password
    console.log('🔑 Checking password...');
    const isPasswordValid = await user.comparePassword(password);
    console.log('🔑 Password valid:', isPasswordValid ? 'Yes' : 'No');
    
    if (!isPasswordValid) {
      console.log('❌ Invalid password for user:', email);
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    // Generate JWT
    const token = generateToken(user._id, user.role);
    console.log('✅ Login successful for:', email);
    
    // Return user data (without password)
    const userData = {
      _id: user._id,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      profileCompleted: user.profileCompleted,
      firstName: user.firstName,
      lastName: user.lastName,
      companyName: user.companyName,
      companyEmail: user.companyEmail,
      employerFullName: user.employerFullName,
    };
    
    return NextResponse.json(
      {
        success: true,
        message: 'Login successful',
        user: userData,
        token,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: error.message || 'Server error occurred' },
      { status: 500 }
    );
  }
}
