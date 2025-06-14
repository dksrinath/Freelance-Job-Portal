const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Job, Proposal, Message } = require('../models');

const router = express.Router();

// Auth middleware
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'Access denied' });
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// === AUTH ROUTES ===
router.post('/auth/register', async (req, res) => {
  try {
    const { name, email, password, userType } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({ name, email, password: hashedPassword, userType });
    await user.save();

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.status(201).json({ 
      token, 
      user: { id: user._id, name: user.name, email: user.email, userType: user.userType } 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.json({ 
      token, 
      user: { id: user._id, name: user.name, email: user.email, userType: user.userType } 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// === USER ROUTES ===
router.get('/users/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/users/profile', auth, async (req, res) => {
  try {
    const updates = {};
    ['name', 'profile'].forEach(key => {
      if (req.body[key]) updates[key] = req.body[key];
    });

    const user = await User.findByIdAndUpdate(req.userId, updates, { new: true }).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/users/freelancers', async (req, res) => {
  try {
    const freelancers = await User.find({ userType: 'freelancer' })
      .select('-password')
      .sort({ 'rating.average': -1 });
    res.json(freelancers);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// === JOB ROUTES ===
router.get('/jobs', async (req, res) => {
  try {
    const { category, skills, budget, search } = req.query;
    const filter = { status: 'open' };

    if (category) filter.category = category;
    if (skills) filter.skills = { $in: skills.split(',') };
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const jobs = await Job.find(filter)
      .populate('client', 'name email')
      .populate('proposals')
      .sort({ createdAt: -1 });
    
    res.json({ jobs });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/jobs/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('client', 'name email profile')
      .populate({
        path: 'proposals',
        populate: { path: 'freelancer', select: 'name email profile rating' }
      });
    
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json(job);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/jobs', auth, async (req, res) => {
  try {
    const job = new Job({ ...req.body, client: req.userId });
    await job.save();
    await job.populate('client', 'name email');
    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/jobs/:id', auth, async (req, res) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, client: req.userId });
    if (!job) return res.status(404).json({ message: 'Job not found' });

    Object.assign(job, req.body);
    await job.save();
    res.json(job);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/jobs/:id', auth, async (req, res) => {
  try {
    const job = await Job.findOneAndDelete({ _id: req.params.id, client: req.userId });
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// === PROPOSAL ROUTES ===
router.get('/proposals/my', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const filter = user.userType === 'freelancer' 
      ? { freelancer: req.userId }
      : { job: { $in: await Job.find({ client: req.userId }).distinct('_id') } };

    const proposals = await Proposal.find(filter)
      .populate('job', 'title budget')
      .populate('freelancer', 'name email profile rating')
      .sort({ createdAt: -1 });
    
    res.json(proposals);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/proposals', auth, async (req, res) => {
  try {
    const { jobId, coverLetter, budget, timeline } = req.body;
    
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    const existingProposal = await Proposal.findOne({ job: jobId, freelancer: req.userId });
    if (existingProposal) return res.status(400).json({ message: 'Already submitted proposal' });

    const proposal = new Proposal({
      job: jobId,
      freelancer: req.userId,
      coverLetter,
      budget,
      timeline
    });

    await proposal.save();
    job.proposals.push(proposal._id);
    await job.save();

    await proposal.populate('freelancer', 'name email profile rating');
    res.status(201).json(proposal);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/proposals/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const proposal = await Proposal.findById(req.params.id).populate('job');
    
    if (!proposal) return res.status(404).json({ message: 'Proposal not found' });
    if (proposal.job.client.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    proposal.status = status;
    await proposal.save();

    if (status === 'accepted') {
      await Job.findByIdAndUpdate(proposal.job._id, { status: 'in-progress' });
    }

    res.json(proposal);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// MESSAGE ROUTES
// === MESSAGE ROUTES ===
router.get('/messages', auth, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [{ sender: req.userId }, { recipient: req.userId }]
    })
    .populate('sender', 'name')
    .populate('recipient', 'name')
    .sort({ createdAt: -1 });
    
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/messages', auth, async (req, res) => {
  try {
    const { recipient, content } = req.body;
    
    const message = new Message({
      sender: req.userId,
      recipient,
      content
    });

    await message.save();
    await message.populate('sender', 'name');
    await message.populate('recipient', 'name');
    
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
