import { useClinicVisits } from '../hooks/useClinicVisits';
import { format } from 'date-fns';

export default function CurrentDoseBanner() {
  const { latestVisit, loading } = useClinicVisits();

  if (loading) return <div className="dose-banner loading">Loading current dose...</div>;

  if (!latestVisit) {
    return (
      <div className="dose-banner">
        <strong>No clinic visits recorded yet.</strong> Log a clinic visit to set the current dose.
      </div>
    );
  }

  const date = latestVisit.date?.toDate ? latestVisit.date.toDate() : new Date(latestVisit.date);

  return (
    <div className="dose-banner">
      <strong>Current dose: {latestVisit.newDose}mg</strong>
      <span className="dose-banner-detail">
        since {format(date, 'd MMMM yyyy')} — Southampton clinic visit
      </span>
    </div>
  );
}
