const mongoose = require('mongoose');

// === USER SCHEMA ===
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  userType: { type: String, enum: ['client', 'freelancer'], required: true },
  profile: {
    bio: String,
    skills: [String],
    hourlyRate: Number,
    location: String,
    phone: String
  },
  rating: { average: { type: Number, default: 0 }, count: { type: Number, default: 0 } },
  isVerified: { type: Boolean, default: false }
}, { timestamps: true });

// === JOB SCHEMA ===
const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  skills: [String],
  budget: {
    type: { type: String, enum: ['fixed', 'hourly'], required: true },
    min: { type: Number, required: true },
    max: { type: Number, required: true }
  },
  deadline: Date,
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['open', 'in-progress', 'completed', 'cancelled'], default: 'open' },
  proposals: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Proposal' }]
}, { timestamps: true });

// === PROPOSAL SCHEMA ===
const proposalSchema = new mongoose.Schema({
  job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  freelancer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  coverLetter: { type: String, required: true },
  budget: { type: Number, required: true },
  timeline: { type: String, required: true },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' }
}, { timestamps: true });

// === MESSAGE SCHEMA ===
const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  isRead: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = {
  User: mongoose.model('User', userSchema),
  Job: mongoose.model('Job', jobSchema),
  Proposal: mongoose.model('Proposal', proposalSchema),
  Message: mongoose.model('Message', messageSchema)
};
