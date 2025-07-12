// In-memory database for StackIt
const users = new Map();
const questions = new Map();
const answers = new Map();
const notifications = new Map();
const tags = new Set();

// Initialize with sample data
const initializeData = () => {
  // Sample users
  users.set('1', {
    id: '1',
    username: 'admin',
    email: 'admin@stackit.com',
    password: '$2a$10$rQZ8K9mP2nL1vX3yW4cD5eF6gH7iJ8kL9mN0oP1qR2sT3uV4wX5yZ6',
    role: 'admin',
    reputation: 1000,
    profilePicture: null,
    createdAt: new Date().toISOString()
  });

  users.set('2', {
    id: '2',
    username: 'john_doe',
    email: 'john@example.com',
    password: '$2a$10$rQZ8K9mP2nL1vX3yW4cD5eF6gH7iJ8kL9mN0oP1qR2sT3uV4wX5yZ6',
    role: 'user',
    reputation: 150,
    profilePicture: null,
    createdAt: new Date().toISOString()
  });

  // Sample questions
  questions.set('1', {
    id: '1',
    title: 'How to implement JWT authentication in React?',
    description: 'I\'m building a React app and need to implement JWT authentication. What\'s the best approach?',
    authorId: '2',
    tags: ['React', 'JWT', 'Authentication'],
    votes: 5,
    answers: ['1', '2'],
    acceptedAnswerId: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  questions.set('2', {
    id: '2',
    title: 'Best practices for state management in React',
    description: 'What are the current best practices for state management in React applications?',
    authorId: '2',
    tags: ['React', 'State Management'],
    votes: 3,
    answers: ['3'],
    acceptedAnswerId: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  questions.set('3', {
    id: '3',
    title: 'How to optimize performance in Node.js applications?',
    description: 'What are the key techniques for improving performance in Node.js applications?',
    authorId: '1',
    tags: ['Node.js', 'Performance', 'Backend'],
    votes: 7,
    answers: [],
    acceptedAnswerId: null,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString()
  });

  questions.set('4', {
    id: '4',
    title: 'TypeScript vs JavaScript: When to use which?',
    description: 'I\'m starting a new project and wondering whether to use TypeScript or JavaScript. What are the pros and cons?',
    authorId: '2',
    tags: ['TypeScript', 'JavaScript', 'Programming'],
    votes: 12,
    answers: [],
    acceptedAnswerId: null,
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    updatedAt: new Date(Date.now() - 172800000).toISOString()
  });

  questions.set('5', {
    id: '5',
    title: 'How to deploy a React app to AWS?',
    description: 'What\'s the best way to deploy a React application to AWS? Looking for step-by-step guidance.',
    authorId: '1',
    tags: ['React', 'AWS', 'Deployment', 'DevOps'],
    votes: 9,
    answers: [],
    acceptedAnswerId: null,
    createdAt: new Date(Date.now() - 259200000).toISOString(),
    updatedAt: new Date(Date.now() - 259200000).toISOString()
  });

  questions.set('6', {
    id: '6',
    title: 'Database design patterns for microservices',
    description: 'What are the best database design patterns when working with microservices architecture?',
    authorId: '2',
    tags: ['Database', 'Microservices', 'Architecture'],
    votes: 15,
    answers: [],
    acceptedAnswerId: null,
    createdAt: new Date(Date.now() - 345600000).toISOString(),
    updatedAt: new Date(Date.now() - 345600000).toISOString()
  });

  questions.set('7', {
    id: '7',
    title: 'How to implement real-time features with WebSockets?',
    description: 'I need to add real-time chat functionality to my app. What\'s the best approach using WebSockets?',
    authorId: '1',
    tags: ['WebSockets', 'Real-time', 'JavaScript'],
    votes: 6,
    answers: [],
    acceptedAnswerId: null,
    createdAt: new Date(Date.now() - 432000000).toISOString(),
    updatedAt: new Date(Date.now() - 432000000).toISOString()
  });

  questions.set('8', {
    id: '8',
    title: 'Testing strategies for React components',
    description: 'What testing strategies and tools do you recommend for React components?',
    authorId: '2',
    tags: ['React', 'Testing', 'Jest', 'Enzyme'],
    votes: 8,
    answers: [],
    acceptedAnswerId: null,
    createdAt: new Date(Date.now() - 518400000).toISOString(),
    updatedAt: new Date(Date.now() - 518400000).toISOString()
  });

  questions.set('9', {
    id: '9',
    title: 'How to handle authentication in Express.js?',
    description: 'I\'m building an Express.js API and need to implement user authentication. What\'s the recommended approach?',
    authorId: '1',
    tags: ['Express.js', 'Authentication', 'Node.js'],
    votes: 11,
    answers: [],
    acceptedAnswerId: null,
    createdAt: new Date(Date.now() - 604800000).toISOString(),
    updatedAt: new Date(Date.now() - 604800000).toISOString()
  });

  questions.set('10', {
    id: '10',
    title: 'CSS Grid vs Flexbox: When to use which?',
    description: 'I\'m learning CSS layout techniques. When should I use CSS Grid vs Flexbox?',
    authorId: '2',
    tags: ['CSS', 'Grid', 'Flexbox', 'Frontend'],
    votes: 4,
    answers: [],
    acceptedAnswerId: null,
    createdAt: new Date(Date.now() - 691200000).toISOString(),
    updatedAt: new Date(Date.now() - 691200000).toISOString()
  });

  questions.set('11', {
    id: '11',
    title: 'How to implement search functionality in React?',
    description: 'I need to add search functionality to my React app. What\'s the best way to implement it?',
    authorId: '1',
    tags: ['React', 'Search', 'Frontend'],
    votes: 13,
    answers: [],
    acceptedAnswerId: null,
    createdAt: new Date(Date.now() - 777600000).toISOString(),
    updatedAt: new Date(Date.now() - 777600000).toISOString()
  });

  questions.set('12', {
    id: '12',
    title: 'Docker best practices for Node.js applications',
    description: 'What are the best practices for containerizing Node.js applications with Docker?',
    authorId: '2',
    tags: ['Docker', 'Node.js', 'DevOps', 'Containerization'],
    votes: 10,
    answers: [],
    acceptedAnswerId: null,
    createdAt: new Date(Date.now() - 864000000).toISOString(),
    updatedAt: new Date(Date.now() - 864000000).toISOString()
  });

  // Sample answers
  answers.set('1', {
    id: '1',
    questionId: '1',
    content: 'You can use libraries like `react-jwt` or implement it manually with axios interceptors.',
    authorId: '1',
    votes: 8,
    isAccepted: false,
    createdAt: new Date().toISOString()
  });

  answers.set('2', {
    id: '2',
    questionId: '1',
    content: 'I recommend using `@auth0/auth0-react` for a complete authentication solution.',
    authorId: '2',
    votes: 12,
    isAccepted: true,
    createdAt: new Date().toISOString()
  });

  answers.set('3', {
    id: '3',
    questionId: '2',
    content: 'Redux Toolkit is currently the recommended approach for complex state management.',
    authorId: '1',
    votes: 15,
    isAccepted: false,
    createdAt: new Date().toISOString()
  });

  // Sample notifications
  notifications.set('1', {
    id: '1',
    userId: '2',
    type: 'answer',
    message: 'John Doe answered your question "How to implement JWT authentication in React?"',
    questionId: '1',
    answerId: '1',
    isRead: false,
    createdAt: new Date().toISOString()
  });

  // Sample tags
  ['React', 'JWT', 'Authentication', 'State Management', 'JavaScript', 'TypeScript', 'Node.js', 'Express', 'Performance', 'Backend', 'Programming', 'AWS', 'Deployment', 'DevOps', 'Database', 'Microservices', 'Architecture', 'WebSockets', 'Real-time', 'Testing', 'Jest', 'Enzyme', 'CSS', 'Grid', 'Flexbox', 'Frontend', 'Search', 'Docker', 'Containerization'].forEach(tag => {
    tags.add(tag);
  });
};

initializeData();

module.exports = {
  users,
  questions,
  answers,
  notifications,
  tags
}; 