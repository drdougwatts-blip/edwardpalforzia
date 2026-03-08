import { useClinicVisits } from '../hooks/useClinicVisits';
import { format } from 'date-fns';

export default function ClinicVisitHistory() {
  const { visits, loading } = useClinicVisits();

  if (loading) return <div className="page-container"><p>Loading clinic visits...</p></div>;

  return (
    <div className="page-container">
      <h2>Clinic Visit History</h2>
      {visits.length === 0 ? (
        <p className="empty-state">No clinic visits recorded yet.</p>
      ) : (
        <div className="visit-list">
          {visits.map(visit => {
            const date = visit.date?.toDate ? visit.date.toDate() : new Date(visit.date);
            const nextDate = visit.nextVisitDate?.toDate
              ? visit.nextVisitDate.toDate()
              : visit.nextVisitDate ? new Date(visit.nextVisitDate) : null;
            return (
              <div key={visit.id} className="visit-card">
                <div className="visit-card-header">
                  <strong>{format(date, 'dd MMM yyyy')}</strong>
                  <span className="dose-change">
                    {visit.previousDose}mg → <strong>{visit.newDose}mg</strong>
                  </span>
                </div>
                {visit.supervisedDoses && (
                  <p><strong>Supervised doses:</strong> {visit.supervisedDoses}</p>
                )}
                {visit.notes && <p><strong>Notes:</strong> {visit.notes}</p>}
                {nextDate && (
                  <p className="next-visit">Next visit: {format(nextDate, 'dd MMM yyyy')}</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
