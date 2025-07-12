const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Question = require('./models/Question');
const Answer = require('./models/Answer');
const Tag = require('./models/Tag');

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Question.deleteMany({});
    await Answer.deleteMany({});
    await Tag.deleteMany({});

    console.log('Cleared existing data');

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = new User({
      username: 'admin',
      email: 'admin@stackit.com',
      password: adminPassword,
      role: 'admin',
      reputation: 1000
    });
    await admin.save();

    // Create regular user
    const userPassword = await bcrypt.hash('user123', 10);
    const user = new User({
      username: 'john_doe',
      email: 'john@example.com',
      password: userPassword,
      role: 'user',
      reputation: 150
    });
    await user.save();

    // Create sample questions
    const questions = [
      {
        title: 'How to implement JWT authentication in React?',
        description: 'I\'m building a React app and need to implement JWT authentication. What\'s the best approach?',
        author: user._id,
        tags: ['React', 'JWT', 'Authentication'],
        votes: 5
      },
      {
        title: 'Best practices for state management in React',
        description: 'What are the current best practices for state management in React applications?',
        author: user._id,
        tags: ['React', 'State Management'],
        votes: 3
      },
      {
        title: 'How to optimize performance in Node.js applications?',
        description: 'What are the key techniques for improving performance in Node.js applications?',
        author: admin._id,
        tags: ['Node.js', 'Performance', 'Backend'],
        votes: 7
      },
      {
        title: 'TypeScript vs JavaScript: When to use which?',
        description: 'I\'m starting a new project and wondering whether to use TypeScript or JavaScript. What are the pros and cons?',
        author: user._id,
        tags: ['TypeScript', 'JavaScript', 'Programming'],
        votes: 12
      },
      {
        title: 'How to deploy a React app to AWS?',
        description: 'What\'s the best way to deploy a React application to AWS? Looking for step-by-step guidance.',
        author: admin._id,
        tags: ['React', 'AWS', 'Deployment', 'DevOps'],
        votes: 9
      }
    ];

    const savedQuestions = await Question.insertMany(questions);

    // Create sample answers
    const answers = [
      {
        question: savedQuestions[0]._id,
        content: 'You can use libraries like `react-jwt` or implement it manually with axios interceptors. Here\'s a basic example...',
        author: admin._id,
        votes: 8
      },
      {
        question: savedQuestions[0]._id,
        content: 'Another approach is to use React Context API with JWT tokens stored in localStorage...',
        author: user._id,
        votes: 5
      },
      {
        question: savedQuestions[1]._id,
        content: 'For state management, I recommend using Redux Toolkit for complex applications or Zustand for simpler ones...',
        author: admin._id,
        votes: 6
      }
    ];

    const savedAnswers = await Answer.insertMany(answers);

    // Update questions with answers
    await Question.findByIdAndUpdate(savedQuestions[0]._id, {
      answers: [savedAnswers[0]._id, savedAnswers[1]._id]
    });

    await Question.findByIdAndUpdate(savedQuestions[1]._id, {
      answers: [savedAnswers[2]._id]
    });

    // Create popular tags
    const tags = [
      'React', 'JavaScript', 'Node.js', 'TypeScript', 'Python', 'Java', 'C++',
      'HTML', 'CSS', 'SQL', 'MongoDB', 'PostgreSQL', 'Docker', 'Kubernetes',
      'AWS', 'Azure', 'Google Cloud', 'Git', 'GitHub', 'DevOps'
    ];

    const tagDocuments = tags.map(tag => ({ name: tag }));
    await Tag.insertMany(tagDocuments);

    console.log('Database seeded successfully!');
    console.log(`Created ${await User.countDocuments()} users`);
    console.log(`Created ${await Question.countDocuments()} questions`);
    console.log(`Created ${await Answer.countDocuments()} answers`);
    console.log(`Created ${await Tag.countDocuments()} tags`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase(); 