import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AskQuestion from './pages/AskQuestion';
import QuestionDetail from './pages/QuestionDetail';
import Profile from './pages/Profile';
import ProfileEdit from './pages/ProfileEdit';
import Admin from './pages/Admin';
import { useAuth } from './contexts/AuthContext';

function App() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <Navbar />
      <main className="w-full max-w-full sm:max-w-screen-sm md:max-w-2xl lg:max-w-4xl xl:max-w-6xl mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/ask" element={<AskQuestion />} />
          <Route path="/question/:id" element={<QuestionDetail />} />
          <Route path="/profile/:id" element={<Profile />} />
          <Route path="/profile/:id/edit" element={<ProfileEdit />} />
          {user?.role === 'admin' && (
            <Route path="/admin" element={<Admin />} />
          )}
        </Routes>
      </main>
    </div>
  );
}

export default App; 