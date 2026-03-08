import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { seedAppointmentsIfEmpty } from './firebase/seedAppointments';
import Navigation from './components/Navigation';
import ParentHome from './pages/ParentHome';
import DoseEntryForm from './components/DoseEntryForm';
import DoseLog from './components/DoseLog';
import ClinicVisitForm from './components/ClinicVisitForm';
import ClinicVisitHistory from './components/ClinicVisitHistory';
import AppointmentCalendar from './components/AppointmentCalendar';
import FortnightlyReport from './components/FortnightlyReport';
import DoctorDashboard from './components/DoctorDashboard';
import PdfExport from './components/PdfExport';

function AppRoutes() {
  useEffect(() => {
    seedAppointmentsIfEmpty().catch(console.error);
  }, []);

  return (
    <>
      <Navigation />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<ParentHome />} />
          <Route path="/log-dose" element={<DoseEntryForm />} />
          <Route path="/dose-log" element={<DoseLog />} />
          <Route path="/clinic-visit" element={<ClinicVisitForm />} />
          <Route path="/clinic-history" element={<ClinicVisitHistory />} />
          <Route path="/appointments" element={<AppointmentCalendar />} />
          <Route path="/report" element={<FortnightlyReport />} />
          <Route path="/dashboard" element={<DoctorDashboard />} />
          <Route path="/pdf-export" element={<PdfExport />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter basename="/edwardpalforzia">
      <AppRoutes />
    </BrowserRouter>
  );
}
