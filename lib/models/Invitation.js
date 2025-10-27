import mongoose from 'mongoose';

const invitationSchema = new mongoose.Schema(
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
    
    // Invitation Status
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'expired'],
      default: 'pending',
    },
    
    // Company Message
    message: {
      type: String,
      default: '',
    },
    
    // Candidate Response
    candidateResponse: {
      type: String,
      default: '',
    },
    
    // Timestamps for actions
    sentAt: {
      type: Date,
      default: Date.now,
    },
    respondedAt: {
      type: Date,
    },
    expiresAt: {
      type: Date,
      // Default: 7 days from creation
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
invitationSchema.index({ internshipId: 1, candidateId: 1 }, { unique: true });
invitationSchema.index({ companyId: 1, status: 1 });
invitationSchema.index({ candidateId: 1, status: 1 });
invitationSchema.index({ status: 1, expiresAt: 1 });

// Virtual to check if expired
invitationSchema.virtual('isExpired').get(function() {
  return this.status === 'pending' && this.expiresAt < new Date();
});

export default mongoose.models.Invitation || 
  mongoose.model('Invitation', invitationSchema);
