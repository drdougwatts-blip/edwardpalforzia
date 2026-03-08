import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { useEffect } from 'react';
import { seedAppointmentsIfEmpty } from './firebase/seedAppointments';
import Navigation from './components/Navigation';
import LoginPage from './pages/LoginPage';
import ParentHome from './pages/ParentHome';
import DoseEntryForm from './components/DoseEntryForm';
import DoseLog from './components/DoseLog';
import ClinicVisitForm from './components/ClinicVisitForm';
import ClinicVisitHistory from './components/ClinicVisitHistory';
import AppointmentCalendar from './components/AppointmentCalendar';
import FortnightlyReport from './components/FortnightlyReport';
import DoctorDashboard from './components/DoctorDashboard';
import PdfExport from './components/PdfExport';

function ProtectedRoute({ children, allowedRoles }) {
  const { user, role, loading } = useAuth();
  if (loading) return <div className="loading-screen">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(role)) return <Navigate to="/" />;
  return children;
}

function AppRoutes() {
  const { user, role, loading } = useAuth();

  useEffect(() => {
    if (user) {
      seedAppointmentsIfEmpty().catch(console.error);
    }
  }, [user]);

  if (loading) return <div className="loading-screen">Loading...</div>;

  return (
    <>
      {user && <Navigation />}
      <main className="main-content">
        <Routes>
          <Route path="/login" element={user ? <Navigate to="/" /> : <LoginPage />} />

          <Route path="/" element={
            <ProtectedRoute>
              {role === 'doctor' ? <DoctorDashboard /> : <ParentHome />}
            </ProtectedRoute>
          } />

          <Route path="/log-dose" element={
            <ProtectedRoute allowedRoles={['parent']}>
              <DoseEntryForm />
            </ProtectedRoute>
          } />

          <Route path="/dose-log" element={
            <ProtectedRoute>
              <DoseLog />
            </ProtectedRoute>
          } />

          <Route path="/clinic-visit" element={
            <ProtectedRoute allowedRoles={['parent']}>
              <ClinicVisitForm />
            </ProtectedRoute>
          } />

          <Route path="/clinic-history" element={
            <ProtectedRoute>
              <ClinicVisitHistory />
            </ProtectedRoute>
          } />

          <Route path="/appointments" element={
            <ProtectedRoute>
              <AppointmentCalendar />
            </ProtectedRoute>
          } />

          <Route path="/report" element={
            <ProtectedRoute>
              <FortnightlyReport />
            </ProtectedRoute>
          } />

          <Route path="/pdf-export" element={
            <ProtectedRoute allowedRoles={['doctor']}>
              <PdfExport />
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
