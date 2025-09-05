const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  // Core auth fields
  email: { type: String, required: true, unique: true, index: true },
  password: { type: String, required: true },

  // Profile
  name: { type: String },
  username: { type: String, unique: true, sparse: true },
  phone: { type: String },
  gender: { type: String, enum: ['Male', 'Female', 'Prefer not to say', undefined], default: undefined },

  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

studentSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Student', studentSchema);


