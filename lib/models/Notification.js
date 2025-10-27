import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		role: {
			type: String,
			enum: ['candidate', 'company', 'admin'],
			required: true,
		},
		companyId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'CompanyProfile',
		},
		candidateId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'CandidateProfile',
		},
		title: {
			type: String,
			required: true,
			trim: true,
		},
		message: {
			type: String,
			required: true,
		},
		category: {
			type: String,
			enum: [
				'general',
				'match',
				'interview',
				'application',
				'offer',
				'reminder',
				'system',
			],
			default: 'general',
		},
		link: {
			type: String,
			default: '',
		},
		metadata: {
			type: mongoose.Schema.Types.Mixed,
		},
		read: {
			type: Boolean,
			default: false,
		},
		readAt: {
			type: Date,
		},
		expiresAt: {
			type: Date,
		},
	},
	{
		timestamps: true,
	}
);

notificationSchema.index({ userId: 1, read: 1 });
notificationSchema.index({ role: 1, createdAt: -1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0, partialFilterExpression: { expiresAt: { $exists: true } } });

export default mongoose.models.Notification ||
	mongoose.model('Notification', notificationSchema);
