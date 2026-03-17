import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import UserHome from './pages/UserHome';
import AdminDashboard from './pages/AdminDashboard';
import ArticlesPage from './pages/ArticlesPage';
import ArticleDetailPage from './pages/ArticleDetailPage';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<UserHome />} />
        <Route path="/articles" element={<ArticlesPage />} />
        <Route path="/articles/:slug" element={<ArticleDetailPage />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}
