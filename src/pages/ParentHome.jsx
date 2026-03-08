import { Link } from 'react-router-dom';
import { useDoses } from '../hooks/useDoses';
import { useClinicVisits } from '../hooks/useClinicVisits';
import { useAppointments } from '../hooks/useAppointments';
import { format, differenceInDays, isFuture } from 'date-fns';
import CurrentDoseBanner from '../components/CurrentDoseBanner';
import MissedDoseAlert from '../components/MissedDoseAlert';

export default function ParentHome() {
  const { doses } = useDoses();
  const { latestVisit } = useClinicVisits();
  const { appointments } = useAppointments();

  const nextAppt = appointments.find(a => {
    const date = a.date?.toDate ? a.date.toDate() : new Date(a.date);
    return isFuture(date) && a.status === 'scheduled';
  });

  const recentDoses = doses.slice(0, 5);

  return (
    <div className="page-container">
      <h2>Home</h2>
      <CurrentDoseBanner />
      <MissedDoseAlert doses={doses} latestVisit={latestVisit} />

      {nextAppt && (
        <div className="next-appointment-banner">
          <strong>Next appointment:</strong>{' '}
          {format(
            nextAppt.date?.toDate ? nextAppt.date.toDate() : new Date(nextAppt.date),
            'dd MMM yyyy'
          )}
          {' — '}
          {differenceInDays(
            nextAppt.date?.toDate ? nextAppt.date.toDate() : new Date(nextAppt.date),
            new Date()
          )} days away
        </div>
      )}

      <div className="quick-actions">
        <Link to="/log-dose" className="btn btn-primary btn-lg">Log Today's Dose</Link>
        <Link to="/clinic-visit" className="btn btn-outline">Log Clinic Visit</Link>
      </div>

      <div className="recent-section">
        <h3>Recent Doses</h3>
        {recentDoses.length === 0 ? (
          <p className="empty-state">No doses logged yet.</p>
        ) : (
          <div className="dose-list compact">
            {recentDoses.map(dose => {
              const date = dose.date?.toDate ? dose.date.toDate() : new Date(dose.date);
              return (
                <div key={dose.id} className="dose-card compact">
                  <span>{format(date, 'dd MMM')} {dose.time}</span>
                  <span>{dose.doseAmount}mg</span>
                  <span>{dose.givenBy}</span>
                  <span className={`severity-dot severity-${dose.reactionSeverity}`} />
                </div>
              );
            })}
          </div>
        )}
        <Link to="/dose-log" className="btn btn-sm btn-outline mt-2">View All</Link>
      </div>
    </div>
  );
}
