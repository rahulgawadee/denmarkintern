import mongoose from 'mongoose';

const interviewSchema = new mongoose.Schema(
  {
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
      required: false, // Optional - can be from invitation or application
    },
    invitationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Invitation',
      required: false, // Reference to invitation if created from invitation acceptance
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
    
    // Interview Details
    scheduledDate: {
      type: Date,
      required: false, // Optional initially - will be set when company schedules
    },
    duration: {
      type: Number, // in minutes
      default: 30,
    },
    mode: {
      type: String,
      enum: ['video', 'onsite', 'phone'],
      required: true,
    },
    location: {
      address: String,
      city: String,
      instructions: String,
    },
    meetingLink: String,
    
    // Status
    status: {
      type: String,
      enum: ['pending', 'scheduled', 'rescheduled', 'completed', 'cancelled', 'no_show'],
      default: 'pending',
    },
    
    // Meeting Details (set by company when scheduling)
    meetingPassword: String,
    additionalNotes: String,
    
    // Participants
    interviewers: [
      {
        name: String,
        email: String,
        role: String,
      },
    ],
    
    // Candidate Response
    candidateResponse: {
      type: String,
      enum: ['pending', 'accepted', 'declined', 'reschedule_requested'],
      default: 'pending',
    },
    candidateNotes: String,
    
    // Company Notes
    companyNotes: String,
    internalNotes: String,
    
    // Rescheduling History
    rescheduleHistory: [
      {
        previousDate: Date,
        newDate: Date,
        reason: String,
        requestedBy: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    
    // Outcome
    outcome: {
      decision: {
        type: String,
        enum: ['accepted', 'rejected', 'pending'],
        default: 'pending',
      },
      feedback: String,
      rating: Number,
      decidedAt: Date,
    },
    
    // Offer Letter (if accepted)
    offerLetter: {
      filename: String,
      url: String,
      uploadedAt: Date,
    },
    joiningDate: Date,
    joiningMessage: String,
    
    // Reminders
    remindersSent: [
      {
        type: {
          type: String,
          enum: ['24h', '1h', 'post_interview'],
        },
        sentAt: Date,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes
interviewSchema.index({ applicationId: 1 });
interviewSchema.index({ candidateId: 1, status: 1 });
interviewSchema.index({ companyId: 1, status: 1 });
interviewSchema.index({ scheduledDate: 1 });

// Delete cached model in development to avoid schema conflicts
if (process.env.NODE_ENV !== 'production' && mongoose.models.Interview) {
  delete mongoose.models.Interview;
}

export default mongoose.models.Interview || 
  mongoose.model('Interview', interviewSchema);
