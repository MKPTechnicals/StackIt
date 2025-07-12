import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { ThumbsUp, ThumbsDown, CheckCircle, MessageSquare, User, Clock } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

const QuestionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [answerContent, setAnswerContent] = useState('');
  const [submittingAnswer, setSubmittingAnswer] = useState(false);

  const fetchQuestionAndAnswers = useCallback(async () => {
    try {
      setLoading(true);
      const [questionResponse, answersResponse] = await Promise.all([
        axios.get(`/api/questions/${id}`),
        axios.get(`/api/answers/question/${id}`)
      ]);
      
      setQuestion(questionResponse.data.question);
      setAnswers(answersResponse.data.answers);
    } catch (error) {
      toast.error('Error fetching question');
      navigate('/');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchQuestionAndAnswers();
  }, [fetchQuestionAndAnswers]);

  const handleVote = async (type, itemId, isQuestion = false) => {
    if (!user) {
      toast.error('Please log in to vote');
      return;
    }

    try {
      const endpoint = isQuestion 
        ? `/api/questions/${itemId}/vote`
        : `/api/answers/${itemId}/vote`;
      
      await axios.post(endpoint, { vote: type === 'up' ? 1 : -1 });
      
      // Refresh data
      fetchQuestionAndAnswers();
      toast.success('Vote recorded');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error recording vote');
    }
  };

  const handleAcceptAnswer = async (answerId) => {
    if (!user) {
      toast.error('Please log in to accept answers');
      return;
    }

    try {
      await axios.post(`/api/questions/${id}/accept-answer/${answerId}`);
      fetchQuestionAndAnswers();
      toast.success('Answer accepted');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error accepting answer');
    }
  };

  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    
    if (!answerContent.trim()) {
      toast.error('Please enter an answer');
      return;
    }

    setSubmittingAnswer(true);
    try {
      await axios.post('/api/answers', {
        questionId: id,
        content: answerContent
      });
      
      setAnswerContent('');
      fetchQuestionAndAnswers();
      toast.success('Answer posted successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error posting answer');
    } finally {
      setSubmittingAnswer(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Question not found</h2>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
        >
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Question */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 mb-6">
        <div className="flex items-start space-x-4">
          {/* Voting */}
          <div className="flex flex-col items-center space-y-2">
            <button
              onClick={() => handleVote('up', question._id || question.id, true)}
              className="p-1 text-gray-400 hover:text-teal-400 transition-colors"
              disabled={!user}
            >
              <ThumbsUp className="h-5 w-5" />
            </button>
            <span className="text-lg font-semibold text-gray-100">{question.votes}</span>
            <button
              onClick={() => handleVote('down', question._id || question.id, true)}
              className="p-1 text-gray-400 hover:text-red-400 transition-colors"
              disabled={!user}
            >
              <ThumbsDown className="h-5 w-5" />
            </button>
          </div>
          {/* Content */}
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-100 mb-2">{question.title}</h1>
            <div className="text-gray-300 mb-4" dangerouslySetInnerHTML={{ __html: question.description }} />
            <div className="flex flex-wrap gap-2 mb-3">
              {question.tags.map((tag) => (
                <span key={tag} className="px-2 py-1 bg-purple-900/30 text-purple-300 text-xs rounded border border-purple-700/50">
                  {tag}
                </span>
              ))}
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <div className="flex items-center space-x-1">
                <User className="h-4 w-4" />
                <span>{question.author?.username}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{formatDate(question.createdAt)}</span>
              </div>
              {question.acceptedAnswerId && (
                <span className="px-2 py-1 bg-teal-900/30 text-teal-300 text-xs rounded border border-teal-700/50">
                  Answered
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-100">
          {answers.length} Answer{answers.length !== 1 ? 's' : ''}
        </h2>
        {[...answers].sort((a, b) => (b.votes || 0) - (a.votes || 0)).map((answer) => (
          <div
            key={answer._id || answer.id}
            className={`bg-gray-800 rounded-lg border p-6 ${
              answer.isAccepted ? 'border-teal-500 bg-teal-900/20' : 'border-gray-700'
            }`}
          >
            <div className="flex items-start space-x-4">
              {/* Voting */}
              <div className="flex flex-col items-center space-y-2">
                <button
                  onClick={() => handleVote('up', answer._id || answer.id)}
                  className="p-1 text-gray-400 hover:text-teal-400 transition-colors"
                  disabled={!user}
                >
                  <ThumbsUp className="h-5 w-5" />
                </button>
                <span className="text-lg font-semibold text-gray-100">{answer.votes}</span>
                <button
                  onClick={() => handleVote('down', answer._id || answer.id)}
                  className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                  disabled={!user}
                >
                  <ThumbsDown className="h-5 w-5" />
                </button>
              </div>
              {/* Content */}
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  {answer.isAccepted && (
                    <span className="flex items-center space-x-1 text-teal-400">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">Accepted</span>
                    </span>
                  )}
                </div>
                <div
                  className="text-gray-300 text-sm mb-3 line-clamp-3"
                  dangerouslySetInnerHTML={{
                    __html: answer.content.replace(/<[^>]*>/g, '').substring(0, 200) + '...'
                  }}
                />
                <div className="flex items-center space-x-4 text-sm text-gray-400">
                  <div className="flex items-center space-x-1">
                    <ThumbsUp className="h-4 w-4" />
                    <span>{answer.votes}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{formatDate(answer.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Answer Form */}
      {user ? (
        <div className="bg-white rounded-lg border p-6 mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Answer</h3>
          <form onSubmit={handleSubmitAnswer}>
            <ReactQuill
              value={answerContent}
              onChange={setAnswerContent}
              className="mb-4"
            />
            <div className="flex justify-end space-x-4">
              <button
                type="submit"
                disabled={submittingAnswer || !answerContent.trim()}
                className="px-6 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {submittingAnswer ? 'Posting...' : 'Post Answer'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-white rounded-lg border p-6 mt-8 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Want to answer?</h3>
          <p className="text-gray-500 mb-4">
            Please log in to post an answer to this question.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            Log In
          </button>
        </div>
      )}
    </div>
  );
};

export default QuestionDetail; 