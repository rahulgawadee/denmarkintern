import mongoose from 'mongoose';

const onboardingSchema = new mongoose.Schema({
  applicationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application',
    required: true,
  },
  internshipId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Internship',
    required: true,
  },
  candidateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CandidateProfile',
    required: true,
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CompanyProfile',
    required: true,
  },
  
  // Onboarding status
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'cancelled'],
    default: 'pending',
  },
  
  // Start date information
  startDate: {
    type: Date,
    required: false,
  },
  endDate: {
    type: Date,
    required: false,
  },
  
  // Supervisor information
  supervisor: {
    name: String,
    email: String,
    phone: String,
    position: String,
  },
  
  // Documents
  documents: [{
    type: {
      type: String,
      enum: ['internship_agreement', 'nda', 'code_of_conduct', 'confidentiality_agreement', 'other'],
      required: true,
    },
    name: String,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
    uploadedBy: {
      type: String,
      enum: ['company', 'candidate'],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'uploaded', 'signed', 'approved', 'rejected'],
      default: 'pending',
    },
  }],
  
  // Agreement template tracking
  agreementTemplateDownloaded: {
    type: Boolean,
    default: false,
  },
  agreementSigned: {
    type: Boolean,
    default: false,
  },
  
  // Additional information
  workLocation: String,
  department: String,
  equipmentProvided: [String],
  accessGranted: {
    email: { type: Boolean, default: false },
    slack: { type: Boolean, default: false },
    github: { type: Boolean, default: false },
    tools: { type: Boolean, default: false },
  },
  
  // Notes
  companyNotes: String,
  candidateNotes: String,
  
  // Dates
  onboardingStartedAt: Date,
  onboardingCompletedAt: Date,
  
}, { timestamps: true });

// Indexes
onboardingSchema.index({ candidateId: 1 });
onboardingSchema.index({ companyId: 1 });
onboardingSchema.index({ internshipId: 1 });
onboardingSchema.index({ status: 1 });

const Onboarding = mongoose.models.Onboarding || mongoose.model('Onboarding', onboardingSchema);

export default Onboarding;
