const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { ROLES } = require('../config/constants');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [80, 'Name cannot exceed 80 characters'],
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email format'],
    },

    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [4, 'Password must be at least 4 characters'],
      select: false, // Never returned in queries by default — must use .select('+password')
    },

    phone: {
      type: String,
      trim: true,
      match: [/^[6-9]\d{9}$/, 'Invalid Indian phone number'],
    },

    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.CITIZEN,
    },

    // For officers — which department they belong to
    department: {
      type: String,
      default: null,
    },

    // For officers — which districts/zones they manage
    jurisdiction: {
      type: [String],
      default: [],
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    refreshToken: {
      type: String,
      select: false,
    },

    lastLogin: {
      type: Date,
    },

    profilePhoto: {
      type: String, // URL
      default: null,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes ───────────────────────────────────────────────────────────────────
// email is already indexed via unique: true
userSchema.index({ role: 1 });
userSchema.index({ department: 1 });

// ─── Pre-save Hook: hash password ─────────────────────────────────────────────
userSchema.pre('save', async function (next) {
  // Only hash if password field was modified (avoids re-hashing on other updates)
  if (!this.isModified('password')) return next();

  const saltRounds = 12;
  this.password = await bcrypt.hash(this.password, saltRounds);
  next();
});

// ─── Instance Methods ─────────────────────────────────────────────────────────

/**
 * Compare plaintext password with stored hash.
 * Used during login — never compare passwords manually outside this method.
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

/**
 * Return a safe user object (no sensitive fields).
 * Used when returning user data in API responses.
 */
userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.refreshToken;
  return obj;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
