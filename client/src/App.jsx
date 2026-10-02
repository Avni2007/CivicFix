import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import MunicipalLoginPage from './pages/MunicipalLoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ReportIssuePage from './pages/ReportIssuePage';
import ComplaintDetailsPage from './pages/ComplaintDetailsPage';
import CitizenDashboard from './pages/CitizenDashboard';
import AuthorityDashboard from './pages/AuthorityDashboard';
import AdminDashboard from './pages/AdminDashboard';
import MapDashboardPage from './pages/MapDashboardPage';
import PublicDashboardPage from './pages/PublicDashboardPage';

// Protected Route Guard
function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="py-20 text-center text-xs text-slate-500 font-bold">Verifying authorization token...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                {/* Separate municipal (officer/admin) sign-in — no public registration counterpart */}
                <Route path="/municipal-login" element={<MunicipalLoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/map" element={<MapDashboardPage />} />
                <Route path="/public-dashboard" element={<PublicDashboardPage />} />
                <Route path="/complaints/:id" element={<ComplaintDetailsPage />} />
                
                {/* Protected Citizen Routes */}
                <Route 
                  path="/report" 
                  element={
                    <ProtectedRoute>
                      <ReportIssuePage />
                    </ProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/citizen-dashboard" 
                  element={
                    <ProtectedRoute allowedRoles={['citizen', 'authority', 'admin']}>
                      <CitizenDashboard />
                    </ProtectedRoute>
                  } 
                />

                {/* Protected Officer Routes */}
                <Route 
                  path="/authority-dashboard" 
                  element={
                    <ProtectedRoute allowedRoles={['authority', 'admin']}>
                      <AuthorityDashboard />
                    </ProtectedRoute>
                  } 
                />

                {/* Protected Admin Routes */}
                <Route 
                  path="/admin-dashboard" 
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  } 
                />

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}
