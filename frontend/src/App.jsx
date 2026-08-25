import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './store/authStore.js';
import DashboardLayout from './layouts/DashboardLayout.jsx';
import AuthLayout from './layouts/AuthLayout.jsx';
import LoadingScreen from './components/common/LoadingScreen.jsx';

const Landing = lazy(() => import('./pages/Landing.jsx'));
const Login = lazy(() => import('./pages/Login.jsx'));
const Register = lazy(() => import('./pages/Register.jsx'));
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'));
const StartInterview = lazy(() => import('./pages/StartInterview.jsx'));
const InterviewSession = lazy(() => import('./pages/InterviewSession.jsx'));
const InterviewReport = lazy(() => import('./pages/InterviewReport.jsx'));
const ResumeUpload = lazy(() => import('./pages/ResumeUpload.jsx'));
const ATSAnalysis = lazy(() => import('./pages/ATSAnalysis.jsx'));
const History = lazy(() => import('./pages/History.jsx'));
const Analytics = lazy(() => import('./pages/Analytics.jsx'));
const Profile = lazy(() => import('./pages/Profile.jsx'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard.jsx'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers.jsx'));

const Protected = ({ children }) => useAuthStore(s => s.isAuthenticated) ? children : <Navigate to="/login" replace />;
const AdminOnly = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
};
const Public = ({ children }) => useAuthStore(s => s.isAuthenticated) ? <Navigate to="/dashboard" replace /> : children;

export default function App() {
  return (
    <>
      <Toaster position="top-right" toastOptions={{ style: { background:'#12121c', color:'#f1f5f9', border:'1px solid #1e1e2e' }, success:{ iconTheme:{ primary:'#10b981', secondary:'#f1f5f9' } }, error:{ iconTheme:{ primary:'#f43f5e', secondary:'#f1f5f9' } } }} />
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Public><Login /></Public>} />
            <Route path="/register" element={<Public><Register /></Public>} />
          </Route>
          <Route element={<Protected><DashboardLayout /></Protected>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/interview/start" element={<StartInterview />} />
            <Route path="/interview/session/:id" element={<InterviewSession />} />
            <Route path="/interview/report/:id" element={<InterviewReport />} />
            <Route path="/resume" element={<ResumeUpload />} />
            <Route path="/ats" element={<ATSAnalysis />} />
            <Route path="/history" element={<History />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
          <Route element={<AdminOnly><DashboardLayout /></AdminOnly>}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </>
  );
}
