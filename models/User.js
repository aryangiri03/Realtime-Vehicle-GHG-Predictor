const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    match: [/^[6-9]\d{9}$/, 'Please enter a valid Indian phone number']
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  otp: {
    code: String,
    expiresAt: Date
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  vehicles: [{
    registrationNumber: {
      type: String,
      uppercase: true,
      trim: true
    },
    isDefault: {
      type: Boolean,
      default: false
    }
  }],
  notifications: [{
    title: String,
    message: String,
    type: {
      type: String,
      enum: ['info', 'warning', 'alert', 'success'],
      default: 'info'
    },
    isRead: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  preferences: {
    emailNotifications: { type: Boolean, default: true },
    smsNotifications: { type: Boolean, default: true },
    pushNotifications: { type: Boolean, default: true }
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Method to check password
userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.index({ phone: 1 });
userSchema.index({ email: 1 });

module.exports = mongoose.model('User', userSchema);