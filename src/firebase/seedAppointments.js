import { collection, getDocs, query, limit } from 'firebase/firestore';
import { db } from './config';
import { addAppointment } from './firestore';

const SEED_APPOINTMENTS = [
  { date: '2026-03-07', notes: 'Appointment 1' },
  { date: '2026-03-21', notes: 'Appointment 2' },
  { date: '2026-04-04', notes: 'Appointment 3' },
  { date: '2026-04-18', notes: 'Appointment 4' },
  { date: '2026-05-02', notes: 'Appointment 5' },
  { date: '2026-05-16', notes: 'Appointment 6' },
  { date: '2026-05-30', notes: 'Appointment 7' },
  { date: '2026-06-27', notes: 'Appointment 8 (4-week gap — no appointment on 13 June)' },
  { date: '2026-07-11', notes: 'Appointment 9' },
  { date: '2026-07-25', notes: 'Appointment 10' },
  { date: '2026-08-08', notes: 'Appointment 11' },
  { date: '2026-08-22', notes: 'Appointment 12' },
];

export async function seedAppointmentsIfEmpty() {
  const q = query(collection(db, 'appointments'), limit(1));
  const snapshot = await getDocs(q);
  if (!snapshot.empty) return false;

  for (const appt of SEED_APPOINTMENTS) {
    await addAppointment({
      date: appt.date,
      location: 'Southampton Children\'s Hospital',
      notes: appt.notes,
      status: 'scheduled',
      linkedClinicVisitId: null
    });
  }
  return true;
}
