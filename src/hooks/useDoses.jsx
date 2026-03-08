import { useState, useEffect, useCallback } from 'react';
import { getDoses, getDosesByDateRange, addDose, updateDose, deleteDose } from '../firebase/firestore';

export function useDoses() {
  const [doses, setDoses] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDoses = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getDoses();
      setDoses(data);
    } catch (err) {
      console.error('Error fetching doses:', err);
    }
    setLoading(false);
  }, []);

  const fetchDosesByRange = useCallback(async (start, end) => {
    setLoading(true);
    try {
      const data = await getDosesByDateRange(start, end);
      setDoses(data);
    } catch (err) {
      console.error('Error fetching doses by range:', err);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchDoses(); }, [fetchDoses]);

  const createDose = async (data) => {
    await addDose(data);
    await fetchDoses();
  };

  const editDose = async (id, data) => {
    await updateDose(id, data);
    await fetchDoses();
  };

  const removeDose = async (id) => {
    await deleteDose(id);
    await fetchDoses();
  };

  return { doses, loading, fetchDoses, fetchDosesByRange, createDose, editDose, removeDose };
}
