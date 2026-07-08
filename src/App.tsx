import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import AuthPage from '@/pages/AuthPage';
import LandingPage from '@/pages/LandingPage';
import DashboardHome from '@/pages/dashboard/DashboardHome';
import { DashboardLayout } from '@/components/DashboardLayout';
import { navConfig } from '@/config/nav';
import { Role } from '@/types';
import { ReactNode } from 'react';
import GenericPage from '@/pages/dashboard/GenericPage';
import { Toaster } from '@/components/ui/toaster';

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function DashboardRouter() {
  const { profile, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }
  if (!profile) return <Navigate to="/login" replace />;

  const sections = navConfig[profile.role as Role] || [];
  const currentPath = window.location.pathname;

  return (
    <DashboardLayout sections={sections} currentPath={currentPath} onNavigate={(path) => navigate(path)}>
      <Routes>
        <Route path="/" element={<DashboardHome />} />
        <Route path="*" element={<GenericPage />} />
      </Routes>
    </DashboardLayout>
  );
}

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <AuthPage />} />
      <Route
        path="/dashboard/*"
        element={
          <ProtectedRoute>
            <DashboardRouter />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
          <Toaster />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
