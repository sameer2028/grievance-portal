const mongoose = require('mongoose');

/**
 * Comment model — threaded discussion on a grievance.
 *
 * Visibility rules (enforced in service layer):
 *   isInternal: true  → only officers/admins see it
 *   isInternal: false → citizen + officers see it
 */
const commentSchema = new mongoose.Schema(
  {
    grievance: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Grievance',
      required: true,
      index: true,
    },

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    text: {
      type: String,
      required: [true, 'Comment text is required'],
      trim: true,
      minlength: [2, 'Comment must be at least 2 characters'],
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
    },

    // Internal comments are staff-only (not shown to citizen)
    isInternal: {
      type: Boolean,
      default: false,
    },

    // Optional: reply to another comment
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment',
      default: null,
    },

    // Soft delete — keeps audit trail
    isDeleted: {
      type: Boolean,
      default: false,
    },

    attachments: {
      type: [String], // URLs
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

commentSchema.index({ grievance: 1, createdAt: 1 });

const Comment = mongoose.model('Comment', commentSchema);
module.exports = Comment;
