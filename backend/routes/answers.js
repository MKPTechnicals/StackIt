const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const Answer = require('../models/Answer');
const Question = require('../models/Question');
const User = require('../models/User');
const Notification = require('../models/Notification');

const router = express.Router();

// Get answers for a question
router.get('/question/:questionId', async (req, res) => {
  try {
    const questionId = req.params.questionId;
    const answers = await Answer.find({ question: questionId })
      .populate('author', 'username reputation')
      .sort({ isAccepted: -1, votes: -1, createdAt: -1 })
      .lean();

    res.json({ answers });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create answer
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { questionId, content } = req.body;
    if (!questionId || !content) {
      return res.status(400).json({ message: 'Question ID and content are required' });
    }

    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const answer = new Answer({
      question: questionId,
      content,
      author: req.user.id
    });
    await answer.save();

    // Add answer to question
    question.answers.push(answer._id);
    await question.save();

    // Create notification for question author
    if (question.author.toString() !== req.user.id) {
      const notification = new Notification({
        user: question.author,
        type: 'answer',
        message: `${req.user.username} answered your question "${question.title}"`,
        link: `/questions/${questionId}`
      });
      await notification.save();
    }

    await answer.populate('author', 'username reputation');
    res.status(201).json({
      message: 'Answer posted successfully',
      answer
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update answer
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.id);
    if (!answer) {
      return res.status(404).json({ message: 'Answer not found' });
    }

    if (answer.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to edit this answer' });
    }

    const { content } = req.body;
    if (content) {
      answer.content = content;
    }
    await answer.save();
    await answer.populate('author', 'username reputation');

    res.json({
      message: 'Answer updated successfully',
      answer
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete answer
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.id);
    if (!answer) {
      return res.status(404).json({ message: 'Answer not found' });
    }

    if (answer.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this answer' });
    }

    // Remove answer from question
    const question = await Question.findById(answer.question);
    if (question) {
      question.answers = question.answers.filter(id => id.toString() !== answer._id.toString());
      if (question.acceptedAnswer && question.acceptedAnswer.toString() === answer._id.toString()) {
        question.acceptedAnswer = null;
      }
      await question.save();
    }

    await answer.deleteOne();
    res.json({ message: 'Answer deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Vote on answer
router.post('/:id/vote', authenticateToken, async (req, res) => {
  try {
    const { vote } = req.body; // 1 for upvote, -1 for downvote
    const answer = await Answer.findById(req.params.id);

    if (!answer) {
      return res.status(404).json({ message: 'Answer not found' });
    }

    if (answer.author.toString() === req.user.id) {
      return res.status(400).json({ message: 'Cannot vote on your own answer' });
    }

    answer.votes += vote;
    await answer.save();

    res.json({ message: 'Vote recorded successfully', votes: answer.votes });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get answer by ID
router.get('/:id', async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.id)
      .populate('author', 'username reputation')
      .lean();

    if (!answer) {
      return res.status(404).json({ message: 'Answer not found' });
    }

    res.json({ answer });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 