require('dotenv').config();
const mongoose = require('mongoose');
const Question = require('../models/Question');

async function main() {
  const [, , idArg, ...solutionParts] = process.argv;
  const solutionArg = solutionParts.join(' ').trim();
  if (!idArg || !solutionArg) {
    console.error('Usage: node scripts/setSolution.js <questionId> <solution code>');
    process.exit(1);
  }
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI not set in environment. Add it to backend/.env');
    process.exit(1);
  }
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  try {
    const res = await Question.updateOne({ _id: idArg }, { $set: { solution: solutionArg } });
    if (res.matchedCount === 0) {
      console.error('No question found with the provided ID');
      process.exitCode = 2;
    } else {
      console.log(`Updated solution for question ${idArg}. modified: ${res.modifiedCount}`);
    }
  } catch (e) {
    console.error('Update failed:', e.message);
    process.exitCode = 3;
  } finally {
    await mongoose.disconnect();
  }
}

main();


