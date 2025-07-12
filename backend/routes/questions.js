const express = require('express');
const { authenticateToken, requireRole } = require('../middleware/auth');
const Question = require('../models/Question');
const User = require('../models/User');
const Answer = require('../models/Answer');
const { createNotification } = require('./notifications');

const router = express.Router();

// Get all questions
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, tag, search, sort = 'newest', answered } = req.query;
    const query = {};
    
    if (tag) query.tags = tag;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (answered === 'true') query.answers = { $exists: true, $not: { $size: 0 } };
    if (answered === 'false') query.answers = { $size: 0 };

    let sortOption = { createdAt: -1 };
    if (sort === 'oldest') sortOption = { createdAt: 1 };

    const total = await Question.countDocuments(query);
    const questions = await Question.find(query)
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('author', 'username reputation')
      .lean();

    res.json({
      questions,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single question
router.get('/:id', async (req, res) => {
  try {
    const question = await Question.findById(req.params.id)
      .populate('author', 'username reputation')
      .lean();
      
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    res.json({ question });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create question
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, description, tags } = req.body;

    if (!title || !description || !tags || !Array.isArray(tags)) {
      return res.status(400).json({ message: 'Title, description, and tags are required' });
    }

    const question = new Question({
      title,
      description,
      author: req.user.id,
      tags
    });

    await question.save();
    await question.populate('author', 'username reputation');

    res.status(201).json({
      message: 'Question created successfully',
      question
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update question
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    if (question.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to edit this question' });
    }

    const { title, description, tags } = req.body;
    if (title) question.title = title;
    if (description) question.description = description;
    if (tags) question.tags = tags;
    question.updatedAt = new Date();

    await question.save();
    await question.populate('author', 'username reputation');

    res.json({
      message: 'Question updated successfully',
      question
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete question
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    if (question.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this question' });
    }

    // Delete associated answers
    await Answer.deleteMany({ question: question._id });
    await question.deleteOne();
    
    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Vote on question
router.post('/:id/vote', authenticateToken, async (req, res) => {
  try {
    const { vote } = req.body; // 1 for upvote, -1 for downvote
    const question = await Question.findById(req.params.id);
    
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    if (question.author.toString() === req.user.id) {
      return res.status(400).json({ message: 'Cannot vote on your own question' });
    }

    question.votes += vote;
    await question.save();

    res.json({ message: 'Vote recorded successfully', votes: question.votes });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Accept answer
router.post('/:id/accept-answer/:answerId', authenticateToken, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    if (question.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only question author can accept answers' });
    }

    const answer = await Answer.findById(req.params.answerId);
    if (!answer) {
      return res.status(404).json({ message: 'Answer not found' });
    }

    if (answer.question.toString() !== question._id.toString()) {
      return res.status(400).json({ message: 'Answer does not belong to this question' });
    }

    // Unaccept previous answer if any
    if (question.acceptedAnswer) {
      const prevAnswer = await Answer.findById(question.acceptedAnswer);
      if (prevAnswer) {
        prevAnswer.isAccepted = false;
        await prevAnswer.save();
      }
    }

    // Accept new answer
    question.acceptedAnswer = answer._id;
    answer.isAccepted = true;
    
    await question.save();
    await answer.save();

    // Create notification for answer author
    await createNotification(
      answer.author,
      'answer-accepted',
      `Your answer to "${question.title}" has been accepted!`,
      `/questions/${question._id}`
    );

    res.json({ message: 'Answer accepted successfully' });
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

    res.json({ tags: popularTags.map(t => ({ tag: t._id, count: t.count })) });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 