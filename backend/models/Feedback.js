const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema(
  {
    grievance: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Grievance',
      required: true,
      unique: true, // One feedback per grievance only
    },

    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // Overall satisfaction: 1 (very dissatisfied) to 5 (very satisfied)
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },

    // Specific dimensions
    resolutionQuality: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },

    responseTime: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },

    officerBehavior: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },

    comment: {
      type: String,
      trim: true,
      maxlength: [500, 'Feedback comment cannot exceed 500 characters'],
      default: '',
    },

    // Was the issue actually resolved to citizen's satisfaction?
    isIssueResolved: {
      type: Boolean,
      required: true,
    },

    // If not resolved — citizen can request re-opening
    requestReopening: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

feedbackSchema.index({ grievance: 1 });
feedbackSchema.index({ submittedBy: 1 });

const Feedback = mongoose.model('Feedback', feedbackSchema);
module.exports = Feedback;
