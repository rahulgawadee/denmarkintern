import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema(
  {
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
    
    // Application Details
    coverLetter: String,
    attachments: [
      {
        filename: String,
        url: String,
        uploadedAt: Date,
      },
    ],
    
    // Status Management
    status: {
      type: String,
      enum: [
        'pending',
        'reviewed',
        'shortlisted',
        'interview_scheduled',
        'interviewed',
        'offered',
        'accepted',
        'rejected',
        'withdrawn',
      ],
      default: 'pending',
    },
    
    // Communication
    companyMessage: String,
    candidateResponse: String,
    
    // Interview Details
    interviewDetails: {
      scheduled: Boolean,
      date: Date,
      time: String,
      mode: {
        type: String,
        enum: ['video', 'onsite', 'phone'],
      },
      meetingLink: String,
      notes: String,
    },
    
    // Offer Details
    offerDetails: {
      message: String,
      joiningDate: Date,
      joiningMessage: String,
      attachments: [
        {
          filename: String,
          url: String,
          uploadedAt: Date,
        },
      ],
      sentAt: Date,
      respondedAt: Date,
    },
    
    // Timeline
    statusHistory: [
      {
        status: String,
        changedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        changedAt: {
          type: Date,
          default: Date.now,
        },
        notes: String,
      },
    ],
    
    // Feedback
    companyFeedback: {
      rating: Number,
      comment: String,
      createdAt: Date,
    },
    candidateFeedback: {
      rating: Number,
      comment: String,
      createdAt: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to prevent duplicate applications
applicationSchema.index({ internshipId: 1, candidateId: 1 }, { unique: true });
applicationSchema.index({ companyId: 1, status: 1 });
applicationSchema.index({ candidateId: 1, status: 1 });

export default mongoose.models.Application || 
  mongoose.model('Application', applicationSchema);
