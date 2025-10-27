import mongoose from 'mongoose';

// Helper function to calculate profile completion
function calculateProfileCompletion(profile) {
  const weights = {
    // Personal Info (20%)
    firstName: 3,
    lastName: 3,
    phone: 3,
    city: 3,
    country: 3,
    // Education (20%)
    university: 5,
    degree: 5,
    major: 5,
    graduationYear: 5,
    // Skills & Tools (20%)
    skills: 10,
    tools: 10,
    // Languages (10%)
    languages: 10,
    // Availability (15%)
    availability: 7.5,
    weeklyHours: 7.5,
    // Work Mode (5%)
    workMode: 5,
    // Resume (10%)
    cv: 10,
  };

  let totalScore = 0;

  // Personal Info
  if (profile.firstName) totalScore += weights.firstName;
  if (profile.lastName) totalScore += weights.lastName;
  if (profile.phone) totalScore += weights.phone;
  if (profile.city) totalScore += weights.city;
  if (profile.country) totalScore += weights.country;

  // Education
  if (profile.university) totalScore += weights.university;
  if (profile.degree) totalScore += weights.degree;
  if (profile.major) totalScore += weights.major;
  if (profile.graduationYear) totalScore += weights.graduationYear;

  // Skills & Tools
  if (profile.skills && profile.skills.length > 0) totalScore += weights.skills;
  if (profile.tools && profile.tools.length > 0) totalScore += weights.tools;

  // Languages
  if (profile.languages && profile.languages.length > 0) totalScore += weights.languages;

  // Availability
  if (profile.availability && profile.availability.startDate) totalScore += weights.availability;
  if (profile.weeklyHours) totalScore += weights.weeklyHours;

  // Work Mode
  if (profile.workMode && profile.workMode.length > 0) totalScore += weights.workMode;

  // Resume
  if (profile.cv) totalScore += weights.cv;

  return Math.round(totalScore);
}

const candidateProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    // Personal Information
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    country: {
      type: String,
      trim: true,
    },
    profilePhoto: {
      type: String,
    },
    
    // Education
    university: {
      type: String,
      trim: true,
    },
    degree: {
      type: String,
      enum: ['bachelor', 'master', 'phd', 'vocational', 'diploma', 'other'],
    },
    major: {
      type: String,
      trim: true,
    },
    graduationYear: Number,
    academicLevel: {
      type: String,
      enum: ['bachelor', 'master', 'vocational', 'recent_graduate'],
    },
    fieldOfStudy: [String],
    
    // Skills & Experience
    skills: [String], // Tag-based: e.g., ["React", "Marketing", "Excel"]
    tools: [String], // Tag-based: e.g., ["Figma", "Python", "Adobe XD"]
    languages: [
      {
        language: String,
        proficiency: {
          type: String,
          enum: ['beginner', 'intermediate', 'advanced', 'fluent', 'native'],
        },
      },
    ],
    experience: {
      type: String,
      maxlength: 2000,
    },
    
    // Work Preferences
    workMode: {
      type: [String],
      enum: ['onsite', 'hybrid', 'remote'],
    },
    weeklyHours: {
      type: String,
      enum: ['8-15', '16-20', '21-30', '31-37', 'full-time'],
    },
    internshipDuration: {
      type: String,
      enum: ['1-3 months', '3-6 months', '6-12 months', '12+ months'],
    },
    availability: {
      startDate: Date,
      endDate: Date,
    },
    
    // Additional Info
    portfolio: String,
    linkedIn: String,
    github: String,
    cv: String, // Resume file path
    coverLetter: String,
    bio: String,
    
    // Visibility
    profileVisibility: {
      type: String,
      enum: ['public', 'private', 'companies_only'],
      default: 'public',
    },
    
    // Preferences
    interestedAreas: [String],
    softSkills: [String],
    drivingLicense: Boolean,
    
    // Profile Completion Tracking
    profileCompletion: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    canApply: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to calculate profile completion
candidateProfileSchema.pre('save', function (next) {
  this.profileCompletion = calculateProfileCompletion(this);
  this.canApply = this.profileCompletion >= 80;
  next();
});

// Pre-update hook for findOneAndUpdate
candidateProfileSchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate();
  if (update.$set) {
    update.$set.profileCompletion = calculateProfileCompletion(update.$set);
    update.$set.canApply = update.$set.profileCompletion >= 80;
  }
  next();
});

// Force delete old model to ensure schema updates
if (mongoose.models.CandidateProfile) {
  delete mongoose.models.CandidateProfile;
}

export default mongoose.model('CandidateProfile', candidateProfileSchema);
