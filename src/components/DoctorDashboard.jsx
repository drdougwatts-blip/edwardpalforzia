import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useDoses } from '../hooks/useDoses';
import { useClinicVisits } from '../hooks/useClinicVisits';
import { useAppointments } from '../hooks/useAppointments';
import { format, subDays, startOfDay, endOfDay, differenceInDays, isFuture, isBefore, eachDayOfInterval, isWithinInterval } from 'date-fns';
import CurrentDoseBanner from './CurrentDoseBanner';

export default function DoctorDashboard() {
  const { doses } = useDoses();
  const { latestVisit } = useClinicVisits();
  const { appointments } = useAppointments();

  const nextAppt = appointments.find(a => {
    const date = a.date?.toDate ? a.date.toDate() : new Date(a.date);
    return isFuture(date) && a.status === 'scheduled';
  });

  const stats = useMemo(() => {
    const today = new Date();
    const start = startOfDay(subDays(today, 13));
    const end = endOfDay(today);
    const interval = { start, end };
    const days = eachDayOfInterval({ start, end: startOfDay(today) });

    const recentDoses = doses.filter(d => {
      const date = d.date?.toDate ? d.date.toDate() : new Date(d.date);
      return isWithinInterval(date, interval);
    });

    const doseDates = new Set(recentDoses.map(d => {
      const date = d.date?.toDate ? d.date.toDate() : new Date(d.date);
      return format(startOfDay(date), 'yyyy-MM-dd');
    }));

    // Only count past days excluding clinic visit days for adherence
    const todayStart = startOfDay(today);
    const visitDateStr = latestVisit?.date
      ? format(startOfDay(latestVisit.date?.toDate ? latestVisit.date.toDate() : new Date(latestVisit.date)), 'yyyy-MM-dd')
      : null;
    const eligibleDays = days.filter(day =>
      isBefore(day, todayStart) && format(day, 'yyyy-MM-dd') !== visitDateStr
    );
    const missedDays = eligibleDays.filter(day => !doseDates.has(format(day, 'yyyy-MM-dd')));
    const reactions = recentDoses.filter(d => d.reactionSeverity !== 'none');
    const antihistamineCount = recentDoses.filter(d => d.antihistamineGiven).length;
    const adherence = eligibleDays.length > 0 ? Math.round((recentDoses.length / eligibleDays.length) * 100) : 0;

    const lastVisitDate = latestVisit?.date?.toDate ? latestVisit.date.toDate() : latestVisit?.date ? new Date(latestVisit.date) : null;
    const daysSinceVisit = lastVisitDate ? differenceInDays(today, lastVisitDate) : null;

    return {
      recentDoses: recentDoses.length,
      expected: eligibleDays.length,
      adherence,
      missedCount: missedDays.length,
      reactionCount: reactions.length,
      antihistamineCount,
      daysSinceVisit,
    };
  }, [doses, latestVisit]);

  return (
    <div className="page-container">
      <h2>Doctor Dashboard</h2>
      <CurrentDoseBanner />

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h4>Last 14 Days</h4>
          <div className="stat-row">
            <span>Adherence</span>
            <strong>{stats.adherence}%</strong>
          </div>
          <div className="stat-row">
            <span>Doses logged</span>
            <strong>{stats.recentDoses} / {stats.expected}</strong>
          </div>
          <div className="stat-row">
            <span>Missed doses</span>
            <strong className={stats.missedCount > 0 ? 'text-danger' : ''}>{stats.missedCount}</strong>
          </div>
        </div>

        <div className="dashboard-card">
          <h4>Reactions & Antihistamine</h4>
          <div className="stat-row">
            <span>Reactions (14d)</span>
            <strong className={stats.reactionCount > 0 ? 'text-warning' : ''}>{stats.reactionCount}</strong>
          </div>
          <div className="stat-row">
            <span>Antihistamine uses (14d)</span>
            <strong>{stats.antihistamineCount}</strong>
          </div>
        </div>

        <div className="dashboard-card">
          <h4>Clinic</h4>
          <div className="stat-row">
            <span>Days since last visit</span>
            <strong>{stats.daysSinceVisit ?? '—'}</strong>
          </div>
          {nextAppt && (
            <div className="stat-row">
              <span>Next appointment</span>
              <strong>
                {format(
                  nextAppt.date?.toDate ? nextAppt.date.toDate() : new Date(nextAppt.date),
                  'dd MMM yyyy'
                )}
              </strong>
            </div>
          )}
        </div>
      </div>

      <div className="dashboard-links">
        <Link to="/dose-log" className="btn btn-outline">View Full Dose Log</Link>
        <Link to="/clinic-history" className="btn btn-outline">View Clinic Visit History</Link>
        <Link to="/report" className="btn btn-outline">View Reports</Link>
        <Link to="/pdf-export" className="btn btn-primary">Export PDF</Link>
      </div>
    </div>
  );
}
