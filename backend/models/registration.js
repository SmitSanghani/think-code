const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true },
  username: { type: String, required: true, trim: true, unique: true, index: true },
  email: { type: String, required: true, trim: true, lowercase: true, unique: true, index: true },
  phone: { type: String, required: true, trim: true },
  gender: { type: String, enum: ['Male', 'Female', 'Prefer not to say'], required: true },
  // Store hashed password in DB; confirmPassword is validated in route and not stored
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Registration', registrationSchema);


