import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, MessageSquare, ThumbsUp, CheckCircle, Clock, Edit } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

const Profile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('questions');

  const fetchUserData = useCallback(async () => {
    try {
      setLoading(true);
      const [userResponse, statsResponse] = await Promise.all([
        axios.get(`/api/users/${id}`),
        axios.get(`/api/users/${id}/stats`)
      ]);
      
      setUser(userResponse.data.user);
      setQuestions(userResponse.data.questions);
      setAnswers(userResponse.data.answers);
      setStats(statsResponse.data.stats);
    } catch (error) {
      toast.error('Error fetching user data');
      navigate('/');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">User not found</h2>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* User Header */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 mb-6">
        <div className="flex items-center space-x-4">
          <div className="relative">
            {user.profilePicture ? (
              <img
                src={`http://localhost:5000${user.profilePicture}`}
                alt={user.username}
                className="w-16 h-16 rounded-full object-cover border-2 border-gray-600"
              />
            ) : (
              <div className="w-16 h-16 bg-teal-500 rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-white" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-100">{user.username}</h1>
            <p className="text-gray-400">Member since {formatDate(user.createdAt)}</p>
            {user.isBanned && (
              <span className="inline-block mt-2 px-2 py-1 bg-red-900/30 text-red-300 text-sm rounded border border-red-700/50">
                Banned
              </span>
            )}
          </div>
          {currentUser?.id === user.id && (
            <button
              onClick={() => navigate(`/profile/${user.id}/edit`)}
              className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors flex items-center space-x-2"
            >
              <Edit className="h-4 w-4" />
              <span>Edit Profile</span>
            </button>
          )}
        </div>

        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="text-center p-4 bg-purple-900/20 rounded-lg border border-purple-700/50">
              <div className="text-2xl font-bold text-purple-400">{stats.questionsCount}</div>
              <div className="text-sm text-gray-400">Questions</div>
            </div>
            <div className="text-center p-4 bg-teal-900/20 rounded-lg border border-teal-700/50">
              <div className="text-2xl font-bold text-teal-400">{stats.answersCount}</div>
              <div className="text-sm text-gray-400">Answers</div>
            </div>
            <div className="text-center p-4 bg-yellow-900/20 rounded-lg border border-yellow-700/50">
              <div className="text-2xl font-bold text-yellow-400">{stats.acceptedAnswersCount}</div>
              <div className="text-sm text-gray-400">Accepted</div>
            </div>
            <div className="text-center p-4 bg-purple-900/20 rounded-lg border border-purple-700/50">
              <div className="text-2xl font-bold text-purple-400">{stats.totalVotes}</div>
              <div className="text-sm text-gray-400">Votes</div>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-gray-800 rounded-lg border border-gray-700">
        <div className="border-b border-gray-700">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('questions')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'questions'
                  ? 'border-teal-500 text-teal-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
              }`}
            >
              Questions ({questions.length})
            </button>
            <button
              onClick={() => setActiveTab('answers')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'answers'
                  ? 'border-purple-500 text-purple-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
              }`}
            >
              Answers ({answers.length})
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'questions' ? (
            <div className="space-y-4">
              {questions.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="mx-auto h-12 w-12 text-gray-500 mb-4" />
                  <h3 className="text-lg font-medium text-gray-100 mb-2">No questions yet</h3>
                  <p className="text-gray-400">This user hasn't asked any questions.</p>
                </div>
              ) : (
                questions.map((question) => (
                  <div
                    key={question.id}
                    className="border border-gray-700 rounded-lg p-4 hover:shadow-lg transition-shadow bg-gray-700/50"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-100 mb-2">
                          <a
                            href={`/question/${question.id}`}
                            className="hover:text-teal-400 transition-colors"
                          >
                            {question.title}
                          </a>
                        </h3>
                        <p className="text-gray-300 text-sm mb-3 line-clamp-2">
                          {question.description.replace(/<[^>]*>/g, '').substring(0, 150)}...
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-gray-400">
                          <div className="flex items-center space-x-1">
                            <ThumbsUp className="h-4 w-4" />
                            <span>{question.votes}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MessageSquare className="h-4 w-4" />
                            <span>{question.answers.length}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{formatDate(question.createdAt)}</span>
                          </div>
                          {question.acceptedAnswerId && (
                            <div className="flex items-center space-x-1 text-teal-400">
                              <CheckCircle className="h-4 w-4" />
                              <span>Answered</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {answers.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="mx-auto h-12 w-12 text-gray-500 mb-4" />
                  <h3 className="text-lg font-medium text-gray-100 mb-2">No answers yet</h3>
                  <p className="text-gray-400">This user hasn't answered any questions.</p>
                </div>
              ) : (
                answers.map((answer) => (
                  <div
                    key={answer.id}
                    className={`border rounded-lg p-4 hover:shadow-lg transition-shadow bg-gray-700/50 ${
                      answer.isAccepted ? 'border-teal-500 bg-teal-900/20' : 'border-gray-700'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-100">
                            <a
                              href={`/question/${answer.questionId}`}
                              className="hover:text-purple-400 transition-colors"
                            >
                              Answer to question
                            </a>
                          </h3>
                          {answer.isAccepted && (
                            <div className="flex items-center space-x-1 text-teal-400">
                              <CheckCircle className="h-4 w-4" />
                              <span className="text-sm font-medium">Accepted</span>
                            </div>
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
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile; 