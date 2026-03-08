import { useState } from 'react';
import { useDoses } from '../hooks/useDoses';
import { useAuth } from '../hooks/useAuth';
import { format } from 'date-fns';

const SEVERITY_COLORS = {
  none: '#4caf50',
  mild: '#ffc107',
  moderate: '#ff9800',
  severe: '#f44336',
};

export default function DoseLog() {
  const { doses, loading, removeDose, fetchDosesByRange, fetchDoses } = useDoses();
  const { role } = useAuth();
  const [filters, setFilters] = useState({ startDate: '', endDate: '', givenBy: '', severity: '' });
  const [expandedId, setExpandedId] = useState(null);

  const handleFilter = () => {
    if (filters.startDate && filters.endDate) {
      fetchDosesByRange(new Date(filters.startDate), new Date(filters.endDate + 'T23:59:59'));
    } else {
      fetchDoses();
    }
  };

  const clearFilters = () => {
    setFilters({ startDate: '', endDate: '', givenBy: '', severity: '' });
    fetchDoses();
  };

  const filteredDoses = doses.filter(d => {
    if (filters.givenBy && d.givenBy !== filters.givenBy) return false;
    if (filters.severity && d.reactionSeverity !== filters.severity) return false;
    return true;
  });

  if (loading) return <div className="page-container"><p>Loading doses...</p></div>;

  return (
    <div className="page-container">
      <h2>Dose History</h2>

      <div className="filter-bar">
        <input type="date" value={filters.startDate} onChange={e => setFilters(f => ({ ...f, startDate: e.target.value }))} />
        <input type="date" value={filters.endDate} onChange={e => setFilters(f => ({ ...f, endDate: e.target.value }))} />
        <select value={filters.givenBy} onChange={e => setFilters(f => ({ ...f, givenBy: e.target.value }))}>
          <option value="">All givers</option>
          <option value="Anna">Anna</option>
          <option value="Doug">Doug</option>
        </select>
        <select value={filters.severity} onChange={e => setFilters(f => ({ ...f, severity: e.target.value }))}>
          <option value="">All severities</option>
          <option value="none">None</option>
          <option value="mild">Mild</option>
          <option value="moderate">Moderate</option>
          <option value="severe">Severe</option>
        </select>
        <button className="btn btn-sm" onClick={handleFilter}>Apply</button>
        <button className="btn btn-sm btn-outline" onClick={clearFilters}>Clear</button>
      </div>

      {filteredDoses.length === 0 ? (
        <p className="empty-state">No doses recorded yet.</p>
      ) : (
        <div className="dose-list">
          {filteredDoses.map(dose => {
            const date = dose.date?.toDate ? dose.date.toDate() : new Date(dose.date);
            const isExpanded = expandedId === dose.id;
            return (
              <div key={dose.id} className="dose-card" onClick={() => setExpandedId(isExpanded ? null : dose.id)}>
                <div className="dose-card-header">
                  <div className="dose-card-date">
                    <strong>{format(date, 'dd MMM yyyy')}</strong>
                    <span className="dose-card-time">{dose.time}</span>
                  </div>
                  <div className="dose-card-info">
                    <span className="dose-card-amount">{dose.doseAmount}mg</span>
                    <span className="dose-card-giver">{dose.givenBy}</span>
                    <span
                      className="severity-badge"
                      style={{ backgroundColor: SEVERITY_COLORS[dose.reactionSeverity] }}
                    >
                      {dose.reactionSeverity}
                    </span>
                    {dose.antihistamineGiven && <span className="antihistamine-badge" title="Antihistamine given">💊</span>}
                  </div>
                </div>
                {isExpanded && (
                  <div className="dose-card-details">
                    {dose.notes && <p><strong>Notes:</strong> {dose.notes}</p>}
                    {dose.antihistamineGiven && dose.antihistamineDetails && (
                      <p><strong>Antihistamine:</strong> {dose.antihistamineDetails}</p>
                    )}
                    {role === 'parent' && (
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={(e) => { e.stopPropagation(); removeDose(dose.id); }}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
