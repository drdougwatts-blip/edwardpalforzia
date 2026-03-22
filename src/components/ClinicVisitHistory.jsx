import { useState } from 'react';
import { useClinicVisits } from '../hooks/useClinicVisits';
import { format } from 'date-fns';

const DOSE_LEVELS = [0.5, 1, 1.5, 2, 3, 6, 12, 20, 40, 80, 120, 160, 200, 240, 300];

export default function ClinicVisitHistory() {
  const { visits, loading, editVisit } = useClinicVisits();
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);

  const startEdit = (visit) => {
    const date = visit.date?.toDate ? visit.date.toDate() : new Date(visit.date);
    const nextDate = visit.nextVisitDate?.toDate
      ? visit.nextVisitDate.toDate()
      : visit.nextVisitDate ? new Date(visit.nextVisitDate) : null;
    setFormData({
      date: format(date, 'yyyy-MM-dd'),
      previousDose: visit.previousDose,
      newDose: DOSE_LEVELS.includes(visit.newDose) ? visit.newDose : 'custom',
      customDose: DOSE_LEVELS.includes(visit.newDose) ? '' : visit.newDose,
      supervisedDoses: visit.supervisedDoses || '',
      notes: visit.notes || '',
      nextVisitDate: nextDate ? format(nextDate, 'yyyy-MM-dd') : '',
    });
    setEditId(visit.id);
  };

  const cancelEdit = () => {
    setEditId(null);
    setFormData({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newDose = formData.newDose === 'custom'
      ? parseFloat(formData.customDose)
      : parseFloat(formData.newDose);

    if (!newDose || isNaN(newDose)) return;

    setSaving(true);
    await editVisit(editId, {
      date: formData.date,
      previousDose: formData.previousDose,
      newDose,
      supervisedDoses: formData.supervisedDoses,
      notes: formData.notes,
      nextVisitDate: formData.nextVisitDate || null,
    });
    setSaving(false);
    cancelEdit();
  };

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

            if (editId === visit.id) {
              return (
                <form key={visit.id} onSubmit={handleSubmit} className="form visit-card editing">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Date</label>
                      <input type="date" value={formData.date} onChange={e => setFormData(f => ({ ...f, date: e.target.value }))} required />
                    </div>
                    <div className="form-group">
                      <label>New Dose (mg)</label>
                      <select value={formData.newDose} onChange={e => setFormData(f => ({ ...f, newDose: e.target.value }))}>
                        {DOSE_LEVELS.map(d => (
                          <option key={d} value={d}>{d}mg</option>
                        ))}
                        <option value="custom">Custom...</option>
                      </select>
                      {formData.newDose === 'custom' && (
                        <input
                          type="number"
                          step="0.5"
                          placeholder="Custom dose (mg)"
                          value={formData.customDose}
                          onChange={e => setFormData(f => ({ ...f, customDose: e.target.value }))}
                          className="mt-2"
                        />
                      )}
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Supervised Doses</label>
                    <textarea
                      value={formData.supervisedDoses}
                      onChange={e => setFormData(f => ({ ...f, supervisedDoses: e.target.value }))}
                      rows={2}
                    />
                  </div>
                  <div className="form-group">
                    <label>Notes</label>
                    <textarea
                      value={formData.notes}
                      onChange={e => setFormData(f => ({ ...f, notes: e.target.value }))}
                      rows={2}
                    />
                  </div>
                  <div className="form-group">
                    <label>Next Visit Date</label>
                    <input type="date" value={formData.nextVisitDate} onChange={e => setFormData(f => ({ ...f, nextVisitDate: e.target.value }))} />
                  </div>
                  <div className="appointment-actions">
                    <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                    <button type="button" className="btn btn-sm btn-outline" onClick={cancelEdit}>Cancel</button>
                  </div>
                </form>
              );
            }

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
                <div className="appointment-actions">
                  <button className="btn btn-sm" onClick={() => startEdit(visit)}>Edit</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
