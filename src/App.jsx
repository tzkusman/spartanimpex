import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ScrollToTop from './components/common/ScrollToTop';
import CyberItCursor from './components/common/CyberItCursor';
import VisitorTracker from './components/common/VisitorTracker';

import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import SkillsPage from './pages/SkillsPage';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import ServicesPage from './pages/ServicesPage';
import BlogPage from './pages/BlogPage';
import BlogDetailPage from './pages/BlogDetailPage';
import ContactPage from './pages/ContactPage';
import PricingPage from './pages/PricingPage';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="flex flex-col min-h-screen bg-navy text-navy-50 font-sans selection:bg-cyan-500/20 selection:text-cyan-300 relative">
      {/* Top-Tier Enterprise IT Custom Cursor */}
      <CyberItCursor />

      {/* Global Real-time Visitor Telemetry */}
      <VisitorTracker />

      <ScrollToTop />

      {/* Public Navbar - Hidden on Admin Console */}
      {!isAdminRoute && <Navbar />}

      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/skills" element={<SkillsPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/:slug" element={<ProjectDetailPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:slug" element={<BlogDetailPage />} />
          <Route path="/contact" element={<ContactPage />} />

          {/* Secure Admin Portal Routes */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin" element={<AdminDashboardPage />} />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      {/* Public Footer - Hidden on Admin Console */}
      {!isAdminRoute && <Footer />}
    </div>
  );
}
