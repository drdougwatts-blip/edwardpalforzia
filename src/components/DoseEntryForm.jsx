import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDoses } from '../hooks/useDoses';
import { useClinicVisits } from '../hooks/useClinicVisits';
import { format } from 'date-fns';

const SEVERITY_OPTIONS = ['none', 'mild', 'moderate', 'severe'];

export default function DoseEntryForm() {
  const navigate = useNavigate();
  const { createDose } = useDoses();
  const { latestVisit } = useClinicVisits();

  const currentDose = latestVisit?.newDose || 0;

  const [formData, setFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    time: format(new Date(), 'HH:mm'),
    givenBy: '',
    reactionSeverity: 'none',
    antihistamineGiven: false,
    antihistamineDetails: '',
    notes: '',
    doseOverride: '',
  });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.givenBy) {
      setToast('Please select who gave the dose');
      return;
    }
    setSaving(true);
    try {
      const doseAmount = formData.doseOverride ? parseFloat(formData.doseOverride) : currentDose;
      await createDose({
        date: formData.date,
        time: formData.time,
        doseAmount,
        doseUnit: 'mg',
        givenBy: formData.givenBy,
        reactionSeverity: formData.reactionSeverity,
        antihistamineGiven: formData.antihistamineGiven,
        antihistamineDetails: formData.antihistamineGiven ? formData.antihistamineDetails : '',
        notes: formData.notes,
      });
      setToast('Dose saved!');
      setTimeout(() => navigate('/dose-log'), 1000);
    } catch (err) {
      console.error(err);
      setToast('Error saving dose. Please try again.');
    }
    setSaving(false);
  };

  return (
    <div className="page-container">
      <h2>Log Daily Dose</h2>
      {toast && <div className="toast">{toast}</div>}
      <form onSubmit={handleSubmit} className="form">
        <div className="form-row">
          <div className="form-group">
            <label>Date</label>
            <input
              type="date"
              value={formData.date}
              onChange={e => handleChange('date', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Time</label>
            <input
              type="time"
              value={formData.time}
              onChange={e => handleChange('time', e.target.value)}
            />
          </div>
        </div>

        <div className="form-group">
          <label>Dose Amount</label>
          <div className="dose-display">
            <span className="dose-amount">{currentDose}mg</span>
            <span className="dose-label">(current prescribed dose)</span>
          </div>
          <details className="dose-override">
            <summary>Override dose?</summary>
            <input
              type="number"
              step="0.5"
              placeholder="Custom dose (mg)"
              value={formData.doseOverride}
              onChange={e => handleChange('doseOverride', e.target.value)}
            />
          </details>
        </div>

        <div className="form-group">
          <label>Given by</label>
          <div className="toggle-group">
            {['Anna', 'Doug'].map(name => (
              <button
                key={name}
                type="button"
                className={`toggle-btn ${formData.givenBy === name ? 'active' : ''}`}
                onClick={() => handleChange('givenBy', name)}
              >
                {name}
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>Reaction Severity</label>
          <div className="severity-group">
            {SEVERITY_OPTIONS.map(sev => (
              <button
                key={sev}
                type="button"
                className={`severity-btn severity-${sev} ${formData.reactionSeverity === sev ? 'active' : ''}`}
                onClick={() => handleChange('reactionSeverity', sev)}
              >
                {sev.charAt(0).toUpperCase() + sev.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label className="toggle-label">
            <span>Antihistamine given?</span>
            <input
              type="checkbox"
              className="toggle-switch"
              checked={formData.antihistamineGiven}
              onChange={e => handleChange('antihistamineGiven', e.target.checked)}
            />
          </label>
          {formData.antihistamineGiven && (
            <input
              type="text"
              placeholder="e.g., Piriton 5ml, 30 mins before"
              value={formData.antihistamineDetails}
              onChange={e => handleChange('antihistamineDetails', e.target.value)}
            />
          )}
        </div>

        <div className="form-group">
          <label>Notes (optional)</label>
          <textarea
            placeholder="Any reaction details, observations..."
            value={formData.notes}
            onChange={e => handleChange('notes', e.target.value)}
            rows={3}
          />
        </div>

        <button type="submit" className="btn btn-primary btn-lg" disabled={saving}>
          {saving ? 'Saving...' : 'Save Dose'}
        </button>
      </form>
    </div>
  );
}
