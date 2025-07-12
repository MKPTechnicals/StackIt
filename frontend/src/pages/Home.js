import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { MessageSquare, ThumbsUp, Clock, User, Filter } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const Home = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [popularTags, setPopularTags] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sort, setSort] = useState('newest');
  const [answered, setAnswered] = useState('all');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const search = searchParams.get('search') || '';
  const tag = searchParams.get('tag') || '';

  const fetchPopularTags = async () => {
    try {
      const response = await axios.get('/api/questions/tags/popular');
      setPopularTags(response.data.tags);
    } catch (error) {
      console.error('Error fetching popular tags:', error);
    }
  };

  const fetchQuestions = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
        sort
      });
      
      if (search) params.append('search', search);
      if (tag) params.append('tag', tag);
      if (answered !== 'all') params.append('answered', answered);

      const response = await axios.get(`/api/questions?${params}`);
      setQuestions(response.data.questions);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      toast.error('Error fetching questions');
    } finally {
      setLoading(false);
    }
  }, [search, tag, currentPage, sort, answered]);

  useEffect(() => {
    fetchQuestions();
    fetchPopularTags();
  }, [fetchQuestions]);

  // Keyboard navigation for pagination
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (totalPages <= 1) return;
      
      if (event.key === 'ArrowLeft' && currentPage > 1) {
        handlePageChange(currentPage - 1);
      } else if (event.key === 'ArrowRight' && currentPage < totalPages) {
        handlePageChange(currentPage + 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, totalPages]);

  const handleTagClick = (tagName) => {
    setSearchParams({ tag: tagName });
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
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

  return (
    <div className="w-full max-w-full sm:max-w-screen-sm md:max-w-2xl lg:max-w-4xl xl:max-w-6xl mx-auto px-2 sm:px-4">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
            <h1 className="text-2xl font-bold text-gray-100">
              {search ? `Search results for "${search}"` : 
               tag ? `Questions tagged "${tag}"` : 'All Questions'}
            </h1>
            {/* Mobile Filter Button */}
            <div className="flex sm:hidden items-center gap-2">
              <button
                className="flex items-center px-4 py-2 bg-gray-700 text-gray-100 rounded-lg border border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-400"
                onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              >
                <Filter className="h-5 w-5 mr-2" /> Filters
              </button>
              <Link
                to="/ask"
                className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
              >
                Ask Question
              </Link>
            </div>
            {/* Desktop Filter & Ask Button */}
            <div className="hidden sm:flex items-center space-x-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <label htmlFor="sort" className="text-sm font-medium text-gray-300">Sort by:</label>
                  <select
                    id="sort"
                    value={sort}
                    onChange={e => { setSort(e.target.value); setCurrentPage(1); }}
                    className="px-4 py-2 pr-8 border border-teal-500 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 bg-gray-700 text-gray-100 shadow-sm appearance-none bg-no-repeat bg-right bg-contain"
                    style={{
                      backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e\")",
                      backgroundPosition: "right 0.5rem center",
                      backgroundSize: "1.5em 1.5em"
                    }}
                  >
                    <option value="newest">Newest</option>
                    <option value="oldest">Oldest</option>
                  </select>
                </div>
                <div className="flex items-center space-x-2">
                  <label htmlFor="answered" className="text-sm font-medium text-gray-300">Status:</label>
                  <select
                    id="answered"
                    value={answered}
                    onChange={e => { setAnswered(e.target.value); setCurrentPage(1); }}
                    className="px-4 py-2 pr-8 border border-teal-500 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 bg-gray-700 text-gray-100 shadow-sm appearance-none bg-no-repeat bg-right bg-contain"
                    style={{
                      backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e\")",
                      backgroundPosition: "right 0.5rem center",
                      backgroundSize: "1.5em 1.5em"
                    }}
                  >
                    <option value="all">All Questions</option>
                    <option value="true">Answered</option>
                    <option value="false">Unanswered</option>
                  </select>
                </div>
              </div>
              <Link
                to="/ask"
                className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
              >
                Ask Question
              </Link>
            </div>
          </div>
          {/* Mobile Filter Dropdown */}
          {mobileFilterOpen && (
            <div className="sm:hidden mb-4 bg-gray-800 border border-teal-500 rounded-lg p-4 space-y-4">
              <div className="flex flex-col gap-2">
                <label htmlFor="sort-mobile" className="text-sm font-medium text-gray-300">Sort by:</label>
                <select
                  id="sort-mobile"
                  value={sort}
                  onChange={e => { setSort(e.target.value); setCurrentPage(1); }}
                  className="px-4 py-2 pr-8 border border-teal-500 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 bg-gray-700 text-gray-100 shadow-sm appearance-none bg-no-repeat bg-right bg-contain"
                  style={{
                    backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e\")",
                    backgroundPosition: "right 0.5rem center",
                    backgroundSize: "1.5em 1.5em"
                  }}
                >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="answered-mobile" className="text-sm font-medium text-gray-300">Status:</label>
                <select
                  id="answered-mobile"
                  value={answered}
                  onChange={e => { setAnswered(e.target.value); setCurrentPage(1); }}
                  className="px-4 py-2 pr-8 border border-teal-500 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 bg-gray-700 text-gray-100 shadow-sm appearance-none bg-no-repeat bg-right bg-contain"
                  style={{
                    backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e\")",
                    backgroundPosition: "right 0.5rem center",
                    backgroundSize: "1.5em 1.5em"
                  }}
                >
                  <option value="all">All Questions</option>
                  <option value="true">Answered</option>
                  <option value="false">Unanswered</option>
                </select>
              </div>
            </div>
          )}

          {/* Questions List */}
          <div className="space-y-4">
            {questions.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg">
                  {search || tag ? 'No questions found' : 'No questions yet'}
                </p>
                {!search && !tag && (
                  <Link
                    to="/ask"
                    className="inline-block mt-4 px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
                  >
                    Ask the first question
                  </Link>
                )}
              </div>
            ) : (
              questions.map((question) => (
                <div
                  key={question._id || question.id}
                  className="bg-gray-800 rounded-lg border border-gray-700 p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start space-x-4">
                    {/* Stats */}
                    <div className="flex flex-col items-center space-y-1 text-sm text-gray-400">
                      <div className="flex items-center space-x-1">
                        <ThumbsUp className="h-4 w-4" />
                        <span>{question.votes}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MessageSquare className="h-4 w-4" />
                        <span>{question.answers.length}</span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <Link
                        to={`/question/${question._id || question.id}`}
                        className="block"
                      >
                        <h2 className="text-lg font-semibold text-gray-100 hover:text-teal-400 transition-colors mb-2">
                          {question.title}
                        </h2>
                      </Link>
                      
                      <p className="text-gray-300 text-sm mb-3 line-clamp-2">
                        {question.description.replace(/<[^>]*>/g, '').substring(0, 200)}...
                      </p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {question.tags.map((tag) => (
                          <button
                            key={tag}
                            onClick={() => handleTagClick(tag)}
                            className="px-2 py-1 bg-teal-900/30 text-teal-300 text-xs rounded hover:bg-teal-800/50 transition-colors border border-teal-700/50"
                          >
                            {tag}
                          </button>
                        ))}
                      </div>

                      {/* Meta */}
                      <div className="flex items-center justify-between text-sm text-gray-400">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1">
                            <User className="h-4 w-4" />
                            <span>{question.author?.username}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{formatDate(question.createdAt)}</span>
                          </div>
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
              ))
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8">
              {/* Page info */}
              <div className="text-center mb-4">
                <p className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages} 
                  {questions.length > 0 && (
                    <span className="ml-2">
                      ({questions.length} questions on this page)
                    </span>
                  )}
                </p>
              </div>
              
              <div className="flex justify-center">
                <div className="flex items-center space-x-2">
                  {/* Previous button */}
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-3 py-2 rounded-lg text-sm ${
                      currentPage === 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 border hover:bg-gray-50'
                    }`}
                  >
                    Previous
                  </button>

                  {/* Page numbers */}
                  {(() => {
                    const pages = [];
                    const maxVisible = 5;
                    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
                    let end = Math.min(totalPages, start + maxVisible - 1);
                    
                    if (end - start + 1 < maxVisible) {
                      start = Math.max(1, end - maxVisible + 1);
                    }

                    // Add first page and ellipsis if needed
                    if (start > 1) {
                      pages.push(
                        <button
                          key={1}
                          onClick={() => handlePageChange(1)}
                          className="px-3 py-2 rounded-lg text-sm bg-white text-gray-700 border hover:bg-gray-50"
                        >
                          1
                        </button>
                      );
                      if (start > 2) {
                        pages.push(
                          <span key="ellipsis1" className="px-2 text-gray-500">
                            ...
                          </span>
                        );
                      }
                    }

                    // Add visible page numbers
                    for (let i = start; i <= end; i++) {
                      pages.push(
                        <button
                          key={i}
                          onClick={() => handlePageChange(i)}
                          className={`px-3 py-2 rounded-lg text-sm ${
                            i === currentPage
                              ? 'bg-teal-600 text-white'
                              : 'bg-white text-gray-700 border hover:bg-gray-50'
                          }`}
                        >
                          {i}
                        </button>
                      );
                    }

                    // Add last page and ellipsis if needed
                    if (end < totalPages) {
                      if (end < totalPages - 1) {
                        pages.push(
                          <span key="ellipsis2" className="px-2 text-gray-500">
                            ...
                          </span>
                        );
                      }
                      pages.push(
                        <button
                          key={totalPages}
                          onClick={() => handlePageChange(totalPages)}
                          className="px-3 py-2 rounded-lg text-sm bg-white text-gray-700 border hover:bg-gray-50"
                        >
                          {totalPages}
                        </button>
                      );
                    }

                    return pages;
                  })()}

                  {/* Next button */}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-2 rounded-lg text-sm ${
                      currentPage === totalPages
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 border hover:bg-gray-50'
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar: stack below on mobile */}
        <div className="lg:col-span-1 mt-8 lg:mt-0">
          {/* Popular Tags */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-100 mb-4">Popular Tags</h3>
            <div className="flex flex-wrap gap-2">
              {popularTags.map((tag) => (
                <button
                  key={tag.tag}
                  onClick={() => handleTagClick(tag.tag)}
                  className="px-3 py-1 bg-gray-700 text-gray-300 text-sm rounded-full hover:bg-gray-600 transition-colors border border-gray-600"
                >
                  {tag.tag} ({tag.count})
                </button>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-100 mb-4">Platform Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Total Questions</span>
                <span className="font-semibold text-gray-100">{questions.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Popular Tag</span>
                <span className="font-semibold text-gray-100">
                  {popularTags[0]?.tag || 'None'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home; 