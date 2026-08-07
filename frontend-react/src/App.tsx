import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { ScrollToTop } from './components/common/ScrollToTop';
import { StudentLayout } from './components/layout/StudentLayout';
import { AdminLayout } from './components/layout/AdminLayout';

import { Landing } from './pages/Landing';
import { ContactUs } from './pages/ContactUs';
import { ReviewsPage } from './pages/ReviewsPage';
import { Blog } from './pages/Blog';
import { BlogPostPage } from './pages/BlogPostPage';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';

import { StudentDashboard } from './pages/student/Dashboard';
import { Scholarships } from './pages/student/Scholarships';
import { ScholarshipDetail } from './pages/student/ScholarshipDetail';
import { Applications } from './pages/student/Applications';
import { Saved } from './pages/student/Saved';
import { Profile } from './pages/student/Profile';
import { MyReview } from './pages/student/MyReview';

import { AdminDashboard } from './pages/admin/Dashboard';
import { AdminScholarships } from './pages/admin/Scholarships';
import { AdminApplications } from './pages/admin/Applications';
import { AdminInquiries } from './pages/admin/Inquiries';
import { AdminReviews } from './pages/admin/Reviews';
import { AdminStudents } from './pages/admin/Students';

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Toaster position="top-right" toastOptions={{
        duration: 3500,
        style: { borderRadius: 10, fontSize: 13.5, fontWeight: 500 },
        success: { style: { background:'#f0fdf4', border:'1px solid #bbf7d0', color:'#15803d' } },
        error:   { style: { background:'#fef2f2', border:'1px solid #fecaca', color:'#dc2626' } },
      }} />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/reviews" element={<ReviewsPage />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPostPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<StudentLayout />}>
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student/scholarships" element={<Scholarships />} />
            <Route path="/student/scholarships/:id" element={<ScholarshipDetail />} />
            <Route path="/student/applications" element={<Applications />} />
            <Route path="/student/saved" element={<Saved />} />
            <Route path="/student/profile" element={<Profile />} />
            <Route path="/student/reviews" element={<MyReview />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute adminOnly />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/scholarships" element={<AdminScholarships />} />
            <Route path="/admin/applications" element={<AdminApplications />} />
            <Route path="/admin/students" element={<AdminStudents />} />
            <Route path="/admin/inquiries" element={<AdminInquiries />} />
            <Route path="/admin/reviews" element={<AdminReviews />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
