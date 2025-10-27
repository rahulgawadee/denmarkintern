import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import User from '@/lib/models/User';
import CompanyProfile from '@/lib/models/CompanyProfile';
import CandidateProfile from '@/lib/models/CandidateProfile';
import { generateToken, generateVerificationToken } from '@/lib/utils/auth';
import { sendEmail, emailTemplates } from '@/lib/utils/email';

export async function POST(request) {
  try {
    console.log('📝 Signup API called');
    await connectDB();
    
    const {
      email,
      password,
      role,
      firstName,
      lastName,
      fullName,
      companyName,
      companyEmail,
      employerFullName,
      contactPerson,
      website,
      country,
      city,
      position,
      // Candidate-specific fields
      university,
      degree,
      yearOfStudy,
      languagePreference,
    } = await request.json();
    
    console.log('📧 Signup attempt - Email:', email, 'Role:', role);
    
    // Validation
    if (!email || !password || !role) {
      console.log('❌ Missing required fields');
      return NextResponse.json(
        { error: 'Please provide all required fields' },
        { status: 400 }
      );
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      console.log('❌ User already exists:', email);
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }
    
    // Create verification token
    const verificationToken = generateVerificationToken();
    
    // For candidates, split fullName into firstName and lastName if provided
    let userFirstName = firstName;
    let userLastName = lastName;
    
    if (role === 'candidate' && fullName && !firstName && !lastName) {
      const nameParts = fullName.trim().split(' ');
      userFirstName = nameParts[0];
      userLastName = nameParts.slice(1).join(' ') || '';
    }
    
    // Create user
    const user = await User.create({
      email: email.toLowerCase(),
      password,
      role,
      firstName: userFirstName,
      lastName: userLastName,
      companyName,
      companyEmail: companyEmail ? companyEmail.toLowerCase() : undefined,
      employerFullName,
      verificationToken,
      languagePreference: languagePreference || 'da',
    });
    
    console.log('✅ User created:', user._id);
    
    // If company role, create CompanyProfile
    if (role === 'company') {
      console.log('🏢 Creating company profile...');
      const profileData = {
        userId: user._id,
        companyName: companyName || employerFullName,
        status: 'active',
      };
      
      // Only add optional fields if they have actual values (not empty strings)
      if (website && website.trim()) profileData.website = website.trim();
      
      profileData.address = {};
      if (city && city.trim()) profileData.address.city = city.trim();
      if (country && country.trim()) profileData.address.country = country.trim();
      else profileData.address.country = 'Denmark';
      
      profileData.primaryContact = {
        name: employerFullName || contactPerson,
        email: companyEmail || email,
      };
      
      if (position && position.trim()) profileData.primaryContact.title = position.trim();
      
      await CompanyProfile.create(profileData);
      console.log('✅ Company profile created');
    }
    
    // If candidate role, create CandidateProfile
    if (role === 'candidate') {
      console.log('👤 Creating candidate profile...');
      const candidateProfileData = {
        userId: user._id,
        firstName: userFirstName || 'Student',
        lastName: userLastName || '',
        university: university || '',
      };
      
      // Add optional fields only if they have values
      if (yearOfStudy) candidateProfileData.graduationYear = parseInt(yearOfStudy) || null;
      
      await CandidateProfile.create(candidateProfileData);
      console.log('✅ Candidate profile created');
    }
    
    // Generate JWT
    const token = generateToken(user._id, user.role);
    
    // Send welcome email
    const userName = role === 'candidate' 
      ? (fullName || `${userFirstName} ${userLastName}`.trim())
      : (employerFullName || contactPerson || companyName);
      
    const verificationLink = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${verificationToken}`;
    
    console.log('📧 Sending welcome email to:', email);
    await sendEmail({
      to: email,
      subject: 'Welcome to Denmark Intern - Verify Your Email',
      html: emailTemplates.welcome(userName || email, verificationLink),
    });
    console.log('✅ Welcome email sent');
    
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
        message: 'Account created successfully. Please check your email to verify your account.',
        user: userData,
        token,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: error.message || 'Server error occurred' },
      { status: 500 }
    );
  }
}
