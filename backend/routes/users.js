const express = require('express');
const User = require('../models/User');
const Question = require('../models/Question');
const Answer = require('../models/Answer');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get user profile
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user's questions and answers
    const userQuestions = await Question.find({ author: req.params.id })
      .sort({ createdAt: -1 })
      .lean();

    const userAnswers = await Answer.find({ author: req.params.id })
      .populate('question', 'title')
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      user,
      questions: userQuestions,
      answers: userAnswers
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all users (admin only)
router.get('/', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const users = await User.find().select('-password').lean();
    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Ban user (admin only)
router.put('/:id/ban', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Cannot ban admin users' });
    }

    user.banned = true;
    await user.save();

    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.json({
      message: 'User banned successfully',
      user: userResponse
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Unban user (admin only)
router.put('/:id/unban', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.banned = false;
    await user.save();

    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.json({
      message: 'User unbanned successfully',
      user: userResponse
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user stats
router.get('/:id/stats', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userQuestions = await Question.find({ author: req.params.id });
    const userAnswers = await Answer.find({ author: req.params.id });

    const acceptedAnswers = userAnswers.filter(a => a.isAccepted);
    const totalVotes = userQuestions.reduce((sum, q) => sum + q.votes, 0) +
                      userAnswers.reduce((sum, a) => sum + a.votes, 0);

    const stats = {
      questionsCount: userQuestions.length,
      answersCount: userAnswers.length,
      acceptedAnswersCount: acceptedAnswers.length,
      totalVotes,
      reputation: user.reputation,
      memberSince: user.createdAt
    };

    res.json({ stats });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get popular tags
router.get('/tags/popular', async (req, res) => {
  try {
    const popularTags = await Question.aggregate([
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]);

    res.json({ tags: popularTags });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 