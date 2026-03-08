import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  setDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './config';

// --- Doses ---

export async function addDose(doseData) {
  return addDoc(collection(db, 'doses'), {
    ...doseData,
    date: Timestamp.fromDate(new Date(doseData.date)),
    createdAt: serverTimestamp()
  });
}

export async function updateDose(id, doseData) {
  const ref = doc(db, 'doses', id);
  const updates = { ...doseData };
  if (updates.date) {
    updates.date = Timestamp.fromDate(new Date(updates.date));
  }
  return updateDoc(ref, updates);
}

export async function deleteDose(id) {
  return deleteDoc(doc(db, 'doses', id));
}

export async function getDoses() {
  const q = query(collection(db, 'doses'), orderBy('date', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getDosesByDateRange(startDate, endDate) {
  const q = query(
    collection(db, 'doses'),
    where('date', '>=', Timestamp.fromDate(startDate)),
    where('date', '<=', Timestamp.fromDate(endDate)),
    orderBy('date', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

// --- Clinic Visits ---

export async function addClinicVisit(visitData) {
  return addDoc(collection(db, 'clinicVisits'), {
    ...visitData,
    date: Timestamp.fromDate(new Date(visitData.date)),
    nextVisitDate: visitData.nextVisitDate ? Timestamp.fromDate(new Date(visitData.nextVisitDate)) : null,
    createdAt: serverTimestamp()
  });
}

export async function updateClinicVisit(id, visitData) {
  const ref = doc(db, 'clinicVisits', id);
  const updates = { ...visitData };
  if (updates.date) updates.date = Timestamp.fromDate(new Date(updates.date));
  if (updates.nextVisitDate) updates.nextVisitDate = Timestamp.fromDate(new Date(updates.nextVisitDate));
  return updateDoc(ref, updates);
}

export async function getClinicVisits() {
  const q = query(collection(db, 'clinicVisits'), orderBy('date', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getLatestClinicVisit() {
  const q = query(collection(db, 'clinicVisits'), orderBy('date', 'desc'), limit(1));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const d = snapshot.docs[0];
  return { id: d.id, ...d.data() };
}

// --- Appointments ---

export async function addAppointment(appointmentData) {
  return addDoc(collection(db, 'appointments'), {
    ...appointmentData,
    date: Timestamp.fromDate(new Date(appointmentData.date)),
    createdAt: serverTimestamp()
  });
}

export async function updateAppointment(id, data) {
  const ref = doc(db, 'appointments', id);
  const updates = { ...data };
  if (updates.date) updates.date = Timestamp.fromDate(new Date(updates.date));
  return updateDoc(ref, updates);
}

export async function deleteAppointment(id) {
  return deleteDoc(doc(db, 'appointments', id));
}

export async function getAppointments() {
  const q = query(collection(db, 'appointments'), orderBy('date', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

// --- Users ---

export async function getUserRole(uid) {
  const ref = doc(db, 'users', uid);
  const snapshot = await getDoc(ref);
  if (!snapshot.exists()) return null;
  return snapshot.data().role;
}

export async function setUserDoc(uid, data) {
  return setDoc(doc(db, 'users', uid), data);
}
