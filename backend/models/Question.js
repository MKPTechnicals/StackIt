const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tags: [{ type: String, required: true }],
  votes: { type: Number, default: 0 },
  answers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Answer' }],
  acceptedAnswer: { type: mongoose.Schema.Types.ObjectId, ref: 'Answer', default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Question', QuestionSchema); 