const mongoose = require('mongoose');
const { GRIEVANCE_STATUS, PRIORITY_LEVELS, DEPARTMENTS, SENTIMENT } = require('../config/constants');

const grievanceSchema = new mongoose.Schema(
  {
    // ─── Citizen Input ─────────────────────────────────────────────────────────
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [10, 'Title must be at least 10 characters'],
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },

    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      minlength: [30, 'Description must be at least 30 characters'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },

    // File attachments (photos, documents) stored as URLs
    attachments: {
      type: [String],
      default: [],
    },
    imageHash: {
      type: String,
      default: null,
      select: false, // Don't normally send it to the frontend to keep payloads small
    },

    // ─── Location ──────────────────────────────────────────────────────────────
    location: {
      address: { type: String, trim: true },
      district: { type: String, trim: true },
      state: { type: String, trim: true, default: 'Uttar Pradesh' },
      pincode: { type: String },
      // GeoJSON point for map queries
      coordinates: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], default: [0, 0] }, // [longitude, latitude]
      },
    },

    // ─── AI-Generated Fields ───────────────────────────────────────────────────
    // These are populated by the AI service after submission
    aiAnalysis: {
      category: {
        type: String,
        enum: [...Object.values(DEPARTMENTS), null],
        default: null,
      },
      categoryConfidence: { type: Number, default: null }, // 0.0 - 1.0
      sentiment: {
        type: String,
        enum: [...Object.values(SENTIMENT), null],
        default: null,
      },
      sentimentScore: { type: Number, default: null }, // -1.0 to 1.0
      urgencyScore: { type: Number, default: null },   // 0.0 - 1.0
      isDuplicate: { type: Boolean, default: false },
      duplicateOf: { type: mongoose.Schema.Types.ObjectId, ref: 'Grievance', default: null },
      analysisStatus: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed'],
        default: 'pending',
      },
      analyzedAt: { type: Date, default: null },
    },

    // ─── Routing & Status ──────────────────────────────────────────────────────
    status: {
      type: String,
      enum: Object.values(GRIEVANCE_STATUS),
      default: GRIEVANCE_STATUS.PENDING,
    },

    priority: {
      type: String,
      enum: Object.values(PRIORITY_LEVELS),
      default: PRIORITY_LEVELS.MEDIUM,
    },

    department: {
      type: String,
      enum: Object.values(DEPARTMENTS),
      default: DEPARTMENTS.OTHER,
    },

    // ─── References ────────────────────────────────────────────────────────────
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    // ─── Tracking ──────────────────────────────────────────────────────────────
    ticketNumber: {
      type: String,
      unique: true,
    },

    resolvedAt: { type: Date, default: null },
    escalatedAt: { type: Date, default: null },

    // Status change history for audit trail
    statusHistory: [
      {
        status: { type: String, enum: Object.values(GRIEVANCE_STATUS) },
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        note: { type: String },
        changedAt: { type: Date, default: Date.now },
      },
    ],

    // Officer/admin notes (not visible to citizen)
    internalNotes: {
      type: String,
      default: '',
    },

    // Public response to citizen
    officialResponse: {
      type: String,
      default: '',
    },

    viewCount: { type: Number, default: 0 },
    upvotes: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes ───────────────────────────────────────────────────────────────────
grievanceSchema.index({ status: 1 });
grievanceSchema.index({ department: 1 });
grievanceSchema.index({ priority: 1 });
grievanceSchema.index({ submittedBy: 1 });
grievanceSchema.index({ assignedTo: 1 });

grievanceSchema.index({ createdAt: -1 });
grievanceSchema.index({ 'location.coordinates': '2dsphere' }); // Geospatial queries
grievanceSchema.index({ 'aiAnalysis.analysisStatus': 1 });

// ─── Pre-save: Auto-generate ticket number ─────────────────────────────────────
grievanceSchema.pre('save', async function (next) {
  if (!this.ticketNumber) {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.ticketNumber = `GRV-${timestamp}-${random}`;
  }
  next();
});

// ─── Virtual: Days since submission ───────────────────────────────────────────
grievanceSchema.virtual('daysOpen').get(function () {
  const end = this.resolvedAt || new Date();
  return Math.floor((end - this.createdAt) / (1000 * 60 * 60 * 24));
});

const Grievance = mongoose.model('Grievance', grievanceSchema);

module.exports = Grievance;
