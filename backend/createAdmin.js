require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
  email: String,
  password: String,
});
const Admin = mongoose.model('Admin', adminSchema);

async function createAdmin() {
  await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  });
  const email = process.env.ADMIN_EMAIL || 'smitbcastudent@gmail.com';
  const password = process.env.ADMIN_PASSWORD || 'admin123';
  const hash = await bcrypt.hash(password, 10);
  const existing = await Admin.findOne({ email });
  if (!existing) {
    await Admin.create({ email, password: hash });
    console.log('Admin user created');
  } else {
    console.log('Admin user already exists');
  }
  mongoose.disconnect();
}

createAdmin(); 