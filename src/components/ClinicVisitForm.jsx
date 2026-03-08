import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClinicVisits } from '../hooks/useClinicVisits';
import { format } from 'date-fns';

const DOSE_LEVELS = [0.5, 1, 1.5, 3, 6, 12, 20, 40, 80, 120, 160, 200, 240, 300];

export default function ClinicVisitForm() {
  const navigate = useNavigate();
  const { latestVisit, createVisit } = useClinicVisits();

  const [formData, setFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    previousDose: latestVisit?.newDose || 0,
    newDose: '',
    customDose: '',
    supervisedDoses: '',
    notes: '',
    nextVisitDate: '',
  });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newDose = formData.newDose === 'custom'
      ? parseFloat(formData.customDose)
      : parseFloat(formData.newDose);

    if (!newDose || isNaN(newDose)) {
      setToast('Please select a new dose amount');
      return;
    }

    setSaving(true);
    try {
      await createVisit({
        date: formData.date,
        previousDose: latestVisit?.newDose || 0,
        newDose,
        supervisedDoses: formData.supervisedDoses,
        notes: formData.notes,
        nextVisitDate: formData.nextVisitDate || null,
      });
      setToast('Clinic visit saved!');
      setTimeout(() => navigate('/clinic-history'), 1000);
    } catch (err) {
      console.error(err);
      setToast('Error saving. Please try again.');
    }
    setSaving(false);
  };

  return (
    <div className="page-container">
      <h2>Log Clinic Visit</h2>
      {toast && <div className="toast">{toast}</div>}
      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label>Date of Visit</label>
          <input type="date" value={formData.date} onChange={e => handleChange('date', e.target.value)} />
        </div>

        <div className="form-group">
          <label>Previous Dose</label>
          <div className="dose-display">
            <span className="dose-amount">{latestVisit?.newDose || 0}mg</span>
          </div>
        </div>

        <div className="form-group">
          <label>New Prescribed Dose (mg)</label>
          <select value={formData.newDose} onChange={e => handleChange('newDose', e.target.value)}>
            <option value="">Select dose...</option>
            {DOSE_LEVELS.map(d => (
              <option key={d} value={d}>{d}mg</option>
            ))}
            <option value="custom">Custom...</option>
          </select>
          {formData.newDose === 'custom' && (
            <input
              type="number"
              step="0.5"
              placeholder="Enter custom dose (mg)"
              value={formData.customDose}
              onChange={e => handleChange('customDose', e.target.value)}
              className="mt-2"
            />
          )}
        </div>

        <div className="form-group">
          <label>Supervised Doses at Clinic</label>
          <textarea
            placeholder="Notes on doses given under supervision..."
            value={formData.supervisedDoses}
            onChange={e => handleChange('supervisedDoses', e.target.value)}
            rows={3}
          />
        </div>

        <div className="form-group">
          <label>General Notes</label>
          <textarea
            placeholder="Clinician observations, instructions..."
            value={formData.notes}
            onChange={e => handleChange('notes', e.target.value)}
            rows={3}
          />
        </div>

        <div className="form-group">
          <label>Next Visit Date (optional)</label>
          <input type="date" value={formData.nextVisitDate} onChange={e => handleChange('nextVisitDate', e.target.value)} />
        </div>

        <button type="submit" className="btn btn-primary btn-lg" disabled={saving}>
          {saving ? 'Saving...' : 'Save Clinic Visit'}
        </button>
      </form>
    </div>
  );
}
