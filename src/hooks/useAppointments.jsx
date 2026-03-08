import { useState, useEffect, useCallback } from 'react';
import { getAppointments, addAppointment, updateAppointment, deleteAppointment } from '../firebase/firestore';

export function useAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAppointments();
      setAppointments(data);
    } catch (err) {
      console.error('Error fetching appointments:', err);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchAppointments(); }, [fetchAppointments]);

  const createAppointment = async (data) => {
    await addAppointment(data);
    await fetchAppointments();
  };

  const editAppointment = async (id, data) => {
    await updateAppointment(id, data);
    await fetchAppointments();
  };

  const removeAppointment = async (id) => {
    await deleteAppointment(id);
    await fetchAppointments();
  };

  return { appointments, loading, fetchAppointments, createAppointment, editAppointment, removeAppointment };
}
