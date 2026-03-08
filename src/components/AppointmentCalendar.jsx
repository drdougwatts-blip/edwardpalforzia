import { useState } from 'react';
import { useAppointments } from '../hooks/useAppointments';
import { useAuth } from '../hooks/useAuth';
import { format, differenceInDays, isFuture, isPast } from 'date-fns';

export default function AppointmentCalendar() {
  const { appointments, loading, createAppointment, editAppointment, removeAppointment } = useAppointments();
  const { role } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    date: '',
    location: "Southampton Children's Hospital",
    notes: '',
    status: 'scheduled',
  });

  const nextAppointment = appointments.find(a => {
    const date = a.date?.toDate ? a.date.toDate() : new Date(a.date);
    return isFuture(date) && a.status === 'scheduled';
  });

  const resetForm = () => {
    setFormData({ date: '', location: "Southampton Children's Hospital", notes: '', status: 'scheduled' });
    setEditId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editId) {
      await editAppointment(editId, formData);
    } else {
      await createAppointment(formData);
    }
    resetForm();
  };

  const startEdit = (appt) => {
    const date = appt.date?.toDate ? appt.date.toDate() : new Date(appt.date);
    setFormData({
      date: format(date, 'yyyy-MM-dd'),
      location: appt.location,
      notes: appt.notes || '',
      status: appt.status,
    });
    setEditId(appt.id);
    setShowForm(true);
  };

  if (loading) return <div className="page-container"><p>Loading appointments...</p></div>;

  return (
    <div className="page-container">
      <h2>Appointment Calendar</h2>

      {nextAppointment && (
        <div className="next-appointment-banner">
          <strong>Next appointment:</strong>{' '}
          {format(
            nextAppointment.date?.toDate ? nextAppointment.date.toDate() : new Date(nextAppointment.date),
            'dd MMM yyyy'
          )}
          {' — '}
          {differenceInDays(
            nextAppointment.date?.toDate ? nextAppointment.date.toDate() : new Date(nextAppointment.date),
            new Date()
          )} days away
        </div>
      )}

      {role === 'parent' && (
        <div className="mb-3">
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : 'Add Appointment'}
          </button>
        </div>
      )}

      {showForm && role === 'parent' && (
        <form onSubmit={handleSubmit} className="form appointment-form">
          <div className="form-row">
            <div className="form-group">
              <label>Date</label>
              <input type="date" value={formData.date} onChange={e => setFormData(f => ({ ...f, date: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label>Location</label>
              <input type="text" value={formData.location} onChange={e => setFormData(f => ({ ...f, location: e.target.value }))} />
            </div>
          </div>
          <div className="form-group">
            <label>Status</label>
            <select value={formData.status} onChange={e => setFormData(f => ({ ...f, status: e.target.value }))}>
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className="form-group">
            <label>Notes</label>
            <input type="text" value={formData.notes} onChange={e => setFormData(f => ({ ...f, notes: e.target.value }))} />
          </div>
          <button type="submit" className="btn btn-primary">{editId ? 'Update' : 'Add'}</button>
          {editId && <button type="button" className="btn btn-outline ml-2" onClick={resetForm}>Cancel Edit</button>}
        </form>
      )}

      <div className="appointment-list">
        {appointments.map(appt => {
          const date = appt.date?.toDate ? appt.date.toDate() : new Date(appt.date);
          const past = isPast(date);
          return (
            <div key={appt.id} className={`appointment-card ${appt.status} ${past ? 'past' : ''}`}>
              <div className="appointment-card-header">
                <strong>{format(date, 'dd MMM yyyy')}</strong>
                <span className={`status-badge status-${appt.status}`}>{appt.status}</span>
              </div>
              <p className="appointment-location">{appt.location}</p>
              {appt.notes && <p className="appointment-notes">{appt.notes}</p>}
              {role === 'parent' && (
                <div className="appointment-actions">
                  <button className="btn btn-sm" onClick={() => startEdit(appt)}>Edit</button>
                  <button className="btn btn-sm btn-danger" onClick={() => removeAppointment(appt.id)}>Delete</button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
