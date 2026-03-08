import { useState, useMemo } from 'react';
import { useDoses } from '../hooks/useDoses';
import { useClinicVisits } from '../hooks/useClinicVisits';
import { format, subDays, startOfDay, endOfDay, eachDayOfInterval, isWithinInterval } from 'date-fns';

export default function FortnightlyReport() {
  const { doses } = useDoses();
  const { visits, latestVisit } = useClinicVisits();

  const today = new Date();
  const [endDate, setEndDate] = useState(format(today, 'yyyy-MM-dd'));
  const [startDate, setStartDate] = useState(format(subDays(today, 13), 'yyyy-MM-dd'));

  const report = useMemo(() => {
    const start = startOfDay(new Date(startDate));
    const end = endOfDay(new Date(endDate));
    const interval = { start, end };
    const days = eachDayOfInterval({ start, end: startOfDay(new Date(endDate)) });
    const expectedDoses = days.length;

    const periodDoses = doses.filter(d => {
      const date = d.date?.toDate ? d.date.toDate() : new Date(d.date);
      return isWithinInterval(date, interval);
    });

    const totalLogged = periodDoses.length;
    const adherence = expectedDoses > 0 ? Math.round((totalLogged / expectedDoses) * 100) : 0;

    const annaCount = periodDoses.filter(d => d.givenBy === 'Anna').length;
    const dougCount = periodDoses.filter(d => d.givenBy === 'Doug').length;

    const reactions = periodDoses.filter(d => d.reactionSeverity !== 'none');
    const antihistamineUses = periodDoses.filter(d => d.antihistamineGiven);

    const periodVisits = visits.filter(v => {
      const date = v.date?.toDate ? v.date.toDate() : new Date(v.date);
      return isWithinInterval(date, interval);
    });

    // Find missed days
    const doseDates = new Set(periodDoses.map(d => {
      const date = d.date?.toDate ? d.date.toDate() : new Date(d.date);
      return format(startOfDay(date), 'yyyy-MM-dd');
    }));
    // Exclude today (not over yet) and clinic visit days (dose given at clinic)
    const todayStr = format(startOfDay(new Date()), 'yyyy-MM-dd');
    const visitDates = new Set(visits.map(v => {
      const date = v.date?.toDate ? v.date.toDate() : new Date(v.date);
      return format(startOfDay(date), 'yyyy-MM-dd');
    }));
    const missedDays = days.filter(day => {
      const dayStr = format(day, 'yyyy-MM-dd');
      return dayStr !== todayStr && !visitDates.has(dayStr) && !doseDates.has(dayStr);
    });

    return {
      startDate: start,
      endDate: end,
      expectedDoses,
      totalLogged,
      adherence,
      annaCount,
      dougCount,
      reactions,
      antihistamineUses,
      periodVisits,
      periodDoses,
      missedDays,
      currentDose: latestVisit?.newDose || 0,
    };
  }, [doses, visits, latestVisit, startDate, endDate]);

  return (
    <div className="page-container">
      <h2>Fortnightly Report</h2>

      <div className="filter-bar">
        <label>From:</label>
        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
        <label>To:</label>
        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
      </div>

      <div className="report" id="fortnightly-report">
        <div className="report-header">
          <h3>Edward — Palforzia Immunotherapy Report</h3>
          <p>{format(report.startDate, 'dd MMM yyyy')} – {format(report.endDate, 'dd MMM yyyy')}</p>
        </div>

        <div className="report-summary">
          <div className="summary-card">
            <span className="summary-label">Current Dose</span>
            <span className="summary-value">{report.currentDose}mg</span>
          </div>
          <div className="summary-card">
            <span className="summary-label">Adherence</span>
            <span className="summary-value">{report.adherence}%</span>
          </div>
          <div className="summary-card">
            <span className="summary-label">Doses Logged</span>
            <span className="summary-value">{report.totalLogged} / {report.expectedDoses}</span>
          </div>
          <div className="summary-card">
            <span className="summary-label">Missed Days</span>
            <span className="summary-value">{report.missedDays.length}</span>
          </div>
        </div>

        <div className="report-section">
          <h4>Administered By</h4>
          <p>Anna: {report.annaCount} doses | Doug: {report.dougCount} doses</p>
        </div>

        {report.reactions.length > 0 && (
          <div className="report-section">
            <h4>Reactions ({report.reactions.length})</h4>
            {report.reactions.map((d, i) => {
              const date = d.date?.toDate ? d.date.toDate() : new Date(d.date);
              return (
                <div key={i} className={`reaction-item severity-${d.reactionSeverity}`}>
                  <strong>{format(date, 'dd MMM')}</strong> — {d.reactionSeverity}
                  {d.notes && <span>: {d.notes}</span>}
                </div>
              );
            })}
          </div>
        )}

        {report.antihistamineUses.length > 0 && (
          <div className="report-section">
            <h4>Antihistamine Usage ({report.antihistamineUses.length})</h4>
            {report.antihistamineUses.map((d, i) => {
              const date = d.date?.toDate ? d.date.toDate() : new Date(d.date);
              return (
                <div key={i}>
                  <strong>{format(date, 'dd MMM')}</strong>
                  {d.antihistamineDetails && <span>: {d.antihistamineDetails}</span>}
                </div>
              );
            })}
          </div>
        )}

        {report.periodVisits.length > 0 && (
          <div className="report-section">
            <h4>Clinic Visits</h4>
            {report.periodVisits.map((v, i) => {
              const date = v.date?.toDate ? v.date.toDate() : new Date(v.date);
              return (
                <div key={i}>
                  <strong>{format(date, 'dd MMM')}</strong> — {v.previousDose}mg → {v.newDose}mg
                  {v.notes && <p>{v.notes}</p>}
                </div>
              );
            })}
          </div>
        )}

        <div className="report-section">
          <h4>All Doses</h4>
          <table className="dose-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Time</th>
                <th>Dose</th>
                <th>Given By</th>
                <th>Reaction</th>
                <th>Antihistamine</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {report.periodDoses.map((d, i) => {
                const date = d.date?.toDate ? d.date.toDate() : new Date(d.date);
                return (
                  <tr key={i}>
                    <td>{format(date, 'dd MMM')}</td>
                    <td>{d.time}</td>
                    <td>{d.doseAmount}mg</td>
                    <td>{d.givenBy}</td>
                    <td className={`severity-${d.reactionSeverity}`}>{d.reactionSeverity}</td>
                    <td>{d.antihistamineGiven ? 'Yes' : 'No'}</td>
                    <td>{d.notes || '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <button className="btn btn-outline mt-3" onClick={() => window.print()}>
        Print Report
      </button>
    </div>
  );
}
