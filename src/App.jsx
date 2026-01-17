import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import ReactGA from 'react-ga4';
import { AuthProvider, useAuth } from './features/auth/AuthContext';
import Login from './features/auth/Login';
import MemberDashboard from './features/dashboard/MemberDashboard';
import AdminDashboard from './features/admin/AdminDashboard';
import Layout from './layouts/MainLayout';
import TransactionsPage from './features/transactions/TransactionsPage';
import MembersPage from './features/members/MembersPage';

// Guard Component: Checks if user is logged in
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { currentUser, userRole, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!currentUser) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(userRole)) return <Navigate to="/" />;

  return children;
};

// Redirects based on role
const DashboardRedirector = () => {
  const { userRole } = useAuth();
  if (userRole === 'admin') {
    return <Navigate to="/admin" replace />;
  }
  return <MemberDashboard />;
};

// Initialize GA4
ReactGA.initialize("G-FS4B683V8H");

const PageTracker = () => {

  useEffect(() => {
    ReactGA.send({ hitType: "pageview", page: window.location.pathname });
  }, []);

  return null;
};

export default function App() {
  return (
    <BrowserRouter>
      <PageTracker />
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Protected Area */}
        <Route element={<Layout />}>
          {/* Root Route: Redirects Admins to Admin Dashboard, others to Member Dashboard */}
          <Route path="/" element={
            <ProtectedRoute allowedRoles={['member', 'admin']}>
              <DashboardRedirector />
            </ProtectedRoute>
          } />

          {/* Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />

          {/* Shared Routes */}
          <Route path="/transactions" element={
            <ProtectedRoute allowedRoles={['member', 'admin']}>
              <TransactionsPage />
            </ProtectedRoute>
          } />

          {/* Admin Routes */}
          <Route path="/members" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <MembersPage />
            </ProtectedRoute>
          } />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
