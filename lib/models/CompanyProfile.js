import mongoose from 'mongoose';

const companyProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    // Company Information
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    cvr: {
      type: String,
      sparse: true,
      validate: {
        validator: function(v) {
          // Only validate if value is provided
          if (!v || v === '') return true;
          return /^\d{8}$/.test(v);
        },
        message: 'CVR must be 8 digits'
      }
    },
    website: {
      type: String,
      trim: true,
    },
    industry: {
      type: String,
      enum: ['tech', 'saas', 'manufacturing', 'retail', 'consulting', 'public_ngo', 'other'],
    },
    companySize: {
      type: String,
      enum: ['1-10', '11-50', '51-200', '201-500', '501+'],
    },
    
    // Contact Information
    address: {
      street: String,
      postalCode: String,
      city: String,
      country: {
        type: String,
        default: 'Denmark',
      },
    },
    primaryContact: {
      name: String,
      title: String,
      phone: String,
      email: String,
    },
    
    // Company Details
    description: String,
    logo: String,
    
    // Account Status
    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended'],
      default: 'active',
    },
    
    // Verification
    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending',
    },
    verificationDocuments: [String],
    verifiedAt: Date,
    
    // Preferences
    languagePreference: {
      type: String,
      enum: ['en', 'da', 'sv'],
      default: 'da',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.CompanyProfile || 
  mongoose.model('CompanyProfile', companyProfileSchema);
