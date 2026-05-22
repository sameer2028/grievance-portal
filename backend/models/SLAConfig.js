const mongoose = require('mongoose');
const { DEPARTMENTS, PRIORITY_LEVELS } = require('../config/constants');

/**
 * SLA Configuration per department + priority combination.
 * Example: water_supply + critical → must be resolved in 24 hours
 *
 * The escalation cron job reads this table and escalates
 * any grievance that has exceeded its SLA deadline.
 */
const slaConfigSchema = new mongoose.Schema(
  {
    department: {
      type: String,
      enum: Object.values(DEPARTMENTS),
      required: true,
    },

    priority: {
      type: String,
      enum: Object.values(PRIORITY_LEVELS),
      required: true,
    },

    // How many hours before the grievance must be resolved
    resolutionHours: {
      type: Number,
      required: true,
      min: 1,
    },

    // How many hours before escalation warning is sent
    warningHours: {
      type: Number,
      required: true,
      min: 1,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    // Who last updated this config
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

// Each dept+priority combo is unique
slaConfigSchema.index({ department: 1, priority: 1 }, { unique: true });

const SLAConfig = mongoose.model('SLAConfig', slaConfigSchema);

// ── Default SLA values seeded on first use ─────────────────────────────────
const DEFAULT_SLAS = [];
Object.values(DEPARTMENTS).forEach((dept) => {
  const configs = [
    { priority: PRIORITY_LEVELS.CRITICAL, resolutionHours: 24,  warningHours: 12  },
    { priority: PRIORITY_LEVELS.HIGH,     resolutionHours: 72,  warningHours: 48  },
    { priority: PRIORITY_LEVELS.MEDIUM,   resolutionHours: 168, warningHours: 120 },
    { priority: PRIORITY_LEVELS.LOW,      resolutionHours: 336, warningHours: 240 },
  ];
  configs.forEach((c) => DEFAULT_SLAS.push({ department: dept, ...c }));
});

/**
 * Upserts default SLA configs if they don't exist.
 * Called once at server startup.
 */
const seedDefaultSLAs = async () => {
  for (const sla of DEFAULT_SLAS) {
    await SLAConfig.findOneAndUpdate(
      { department: sla.department, priority: sla.priority },
      { $setOnInsert: sla },
      { upsert: true, new: true }
    );
  }
};

module.exports = SLAConfig;
module.exports.seedDefaultSLAs = seedDefaultSLAs;
