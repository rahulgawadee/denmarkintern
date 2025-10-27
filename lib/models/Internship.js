import mongoose from 'mongoose';

const internshipSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CompanyProfile',
      required: true,
    },
    
    // Basic Information
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    department: {
      type: String,
      enum: ['Marketing', 'IT', 'HR', 'Sales', 'Finance', 'Operations', 'Design', 'Other'],
    },
    area: {
      type: [String],
      required: true,
      enum: [
        'business_marketing',
        'tech_data',
        'design_product',
        'operations_supply',
        'people_admin',
        'other',
      ],
    },
    subArea: [String],
    description: {
      type: String,
      trim: true,
    },
    responsibilities: {
      type: [String],
      default: [],
    },
    
    // Tasks & Requirements
    topTasks: {
      type: [String],
      validate: [arrayLimit, 'Top tasks should not exceed 5 items'],
    },
    tools: [String],
    expectedDeliverables: [String],
    mustHaveSkills: [String],
    niceToHaveSkills: [String],
    softSkills: [String],
    
    // Academic Requirements
    academicLevel: {
      type: [String],
      enum: ['bachelor', 'master', 'vocational', 'recent_graduate'],
    },
    fieldOfStudy: [String],
    
    // Work Logistics
    workMode: {
      type: String,
      required: true,
      enum: ['onsite', 'hybrid', 'remote'],
    },
    location: {
      address: String,
      city: String,
      postalCode: String,
    },
    onsiteExpectation: {
      type: String,
      enum: ['0', '1-2', '3+'],
    },
    weeklyHours: {
      type: String,
      required: true,
      enum: ['8-15', '16-20', '21-30', '31-37'],
    },
    duration: {
      type: String,
      required: true,
      enum: ['8-12', '13-16', '17-24', '25+'],
    },
    startWindow: {
      type: String,
      enum: ['asap', '2-4weeks', '1-2months', 'specific'],
      default: 'asap',
    },
    specificStartDate: Date,
    
    // Language Requirements
    languageRequirements: [
      {
        language: String,
        level: String,
      },
    ],
    
    // Compensation & Benefits
    stipend: {
      type: String,
      enum: ['none', '<2000', '2000-4999', '5000-7999', '8000+', 'not_decided', 'other'],
    },
    benefits: [String],
    
    // Additional Requirements
    ndaRequired: {
      type: Boolean,
      default: false,
    },
    accessLevel: {
      type: String,
      enum: ['public_only', 'internal_read', 'internal_write', 'client_data'],
    },
    drivingLicenseRequired: {
      type: Boolean,
      default: false,
    },
    
    // Supervision
    supervisionCapacity: {
      type: String,
      enum: ['1-2h', '3-5h', '6h+'],
    },
    
    // Status
    status: {
      type: String,
      enum: ['draft', 'under_review', 'shortlist_sent', 'matched', 'active', 'completed', 'closed'],
      default: 'draft',
    },
    
    // Attachments
    attachments: [
      {
        filename: String,
        url: String,
        uploadedAt: Date,
      },
    ],
    
    // Metrics
    views: {
      type: Number,
      default: 0,
    },
    applications: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Application',
      },
    ],
  },
  {
    timestamps: true,
  }
);

function arrayLimit(val) {
  return val.length <= 5;
}

// Indexes for better query performance
internshipSchema.index({ companyId: 1, status: 1 });
internshipSchema.index({ area: 1, workMode: 1 });
internshipSchema.index({ createdAt: -1 });

export default mongoose.models.Internship || 
  mongoose.model('Internship', internshipSchema);
