# StackIt - Q&A Platform

StackIt is a minimal question-and-answer platform that supports collaborative learning and structured knowledge sharing. It's designed to be simple, user-friendly, and focused on the core experience of asking and answering questions within a community.

## Features

### Core Features
- **Ask Questions**: Users can submit questions with titles, rich text descriptions, and tags
- **Rich Text Editor**: Support for formatting, lists, links, images, and text alignment
- **Answer Questions**: Users can post formatted answers to questions
- **Voting System**: Upvote/downvote questions and answers
- **Accept Answers**: Question owners can mark answers as accepted
- **Tagging System**: Questions must include relevant tags for categorization
- **Notification System**: Real-time notifications for answers, comments, and mentions

### User Roles
- **Guest**: View all questions and answers
- **User**: Register, log in, post questions/answers, vote
- **Admin**: Moderate content, ban users, view platform statistics

### Rich Text Editor Features
- Bold, Italic, Strikethrough
- Numbered lists, Bullet points
- Emoji insertion
- Hyperlink insertion (URL)
- Image upload
- Text alignment – Left, Center, Right

## Technology Stack

### Backend
- **Node.js** with Express.js
- **MongoDB Atlas** for database
- **Mongoose** for ODM
- **JWT** for authentication
- **bcryptjs** for password hashing
- **Cloudinary** for image uploads
- **Express Validator** for input validation

### Frontend
- **React** with functional components and hooks
- **React Router** for navigation
- **React Quill** for rich text editing
- **Tailwind CSS** for styling
- **Axios** for API communication
- **React Hot Toast** for notifications

## Project Structure

```
stackit/
├── backend/
│   ├── index.js              # Main server file
│   ├── middleware/
│   │   └── auth.js           # Authentication middleware
│   ├── routes/
│   │   ├── auth.js           # Authentication routes
│   │   ├── questions.js      # Question management
│   │   ├── answers.js        # Answer management
│   │   ├── users.js          # User management
│   │   └── notifications.js  # Notification system
│   └── data/
│       └── db.js             # In-memory database
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── Navbar.js     # Navigation component
│   │   ├── contexts/
│   │   │   └── AuthContext.js # Authentication context
│   │   ├── pages/
│   │   │   ├── Home.js       # Home page
│   │   │   ├── Login.js      # Login page
│   │   │   ├── Register.js   # Registration page
│   │   │   ├── AskQuestion.js # Ask question page
│   │   │   ├── QuestionDetail.js # Question detail page
│   │   │   ├── Profile.js    # User profile page
│   │   │   └── Admin.js      # Admin dashboard
│   │   ├── App.js            # Main app component
│   │   └── index.js          # React entry point
│   ├── package.json          # Frontend dependencies
│   └── tailwind.config.js    # Tailwind configuration
├── package.json              # Backend dependencies
└── README.md                 # This file
```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MongoDB Atlas account
- Cloudinary account (optional, for image uploads)

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd stackit
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Configure environment variables**
   - Copy `.env.example` to `.env`
   - Update the following variables:
     - `MONGODB_URI`: Your MongoDB Atlas connection string
     - `JWT_SECRET`: A secure random string for JWT signing
     - `CLOUDINARY_CLOUD_NAME`: Your Cloudinary cloud name
     - `CLOUDINARY_API_KEY`: Your Cloudinary API key
     - `CLOUDINARY_API_SECRET`: Your Cloudinary API secret

4. **Seed the database**
   ```bash
   npm run seed
   ```

5. **Start the development servers**
   ```bash
   # Start both backend and frontend
   npm run dev
   
   # Or start them separately:
   npm run server    # Backend on port 5000
   npm run client    # Frontend on port 3000
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

### Default Users
After seeding the database, you can login with:
- **Admin**: admin@stackit.com / admin123
- **User**: john@example.com / user123

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Questions
- `GET /api/questions` - Get all questions (with pagination, search, tags)
- `GET /api/questions/:id` - Get single question
- `POST /api/questions` - Create new question
- `PUT /api/questions/:id` - Update question
- `DELETE /api/questions/:id` - Delete question
- `POST /api/questions/:id/vote` - Vote on question
- `POST /api/questions/:id/accept-answer/:answerId` - Accept answer
- `GET /api/questions/tags/popular` - Get popular tags

### Answers
- `GET /api/answers/question/:questionId` - Get answers for question
- `POST /api/answers` - Create new answer
- `PUT /api/answers/:id` - Update answer
- `DELETE /api/answers/:id` - Delete answer
- `POST /api/answers/:id/vote` - Vote on answer
- `GET /api/answers/:id` - Get single answer

### Users
- `GET /api/users/:id` - Get user profile
- `GET /api/users` - Get all users (admin only)
- `PUT /api/users/:id/ban` - Ban user (admin only)
- `PUT /api/users/:id/unban` - Unban user (admin only)
- `GET /api/users/:id/stats` - Get user statistics

### Notifications
- `GET /api/notifications` - Get user notifications
- `GET /api/notifications/unread-count` - Get unread count
- `PUT /api/notifications/:id/read` - Mark notification as read
- `PUT /api/notifications/mark-all-read` - Mark all as read
- `DELETE /api/notifications/:id` - Delete notification
- `POST /api/notifications/broadcast` - Send platform-wide message (admin only)

### Tags
- `GET /api/users/tags/popular` - Get popular tags
- `GET /api/questions/tags/popular` - Get popular tags from questions

## Sample Data

The application comes with sample data including:
- Admin user (username: admin, email: admin@stackit.com)
- Sample user (username: john_doe, email: john@example.com)
- Sample questions and answers
- Popular tags

## Features in Detail

### Rich Text Editor
The platform uses React Quill for rich text editing, supporting:
- Text formatting (bold, italic, underline, strikethrough)
- Lists (ordered and unordered)
- Text alignment
- Links and images
- Code blocks

### Notification System
- Real-time notifications for new answers
- Unread notification count in navbar
- Notification dropdown with recent notifications
- Mark as read functionality

### Admin Features
- User management (view all users, ban/unban)
- Platform statistics dashboard
- Content moderation capabilities

### Responsive Design
- Mobile-first approach
- Responsive navigation
- Optimized for all screen sizes

## Development

### Adding New Features
1. Create new routes in `backend/routes/`
2. Add corresponding frontend components in `frontend/src/`
3. Update the main server file to include new routes
4. Test thoroughly before deployment

### Database Migration
The current implementation uses in-memory storage. To add a real database:
1. Install database driver (e.g., `mongoose` for MongoDB)
2. Replace data access in `server/data/db.js`
3. Update environment variables for database connection

### Styling
The project uses Tailwind CSS. To add custom styles:
1. Modify `client/tailwind.config.js`
2. Add custom classes in `client/src/index.css`
3. Use Tailwind utility classes in components

## Deployment

### Backend Deployment
1. Set environment variables (JWT_SECRET, PORT, etc.)
2. Install production dependencies
3. Build the application
4. Use a process manager like PM2

### Frontend Deployment
1. Build the React app: `npm run build`
2. Serve the `build` folder
3. Configure reverse proxy for API calls

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions, please open an issue in the repository. 