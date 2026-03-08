import { useState, useEffect, useCallback } from 'react';
import { getClinicVisits, getLatestClinicVisit, addClinicVisit, updateClinicVisit } from '../firebase/firestore';

export function useClinicVisits() {
  const [visits, setVisits] = useState([]);
  const [latestVisit, setLatestVisit] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchVisits = useCallback(async () => {
    setLoading(true);
    try {
      const [all, latest] = await Promise.all([getClinicVisits(), getLatestClinicVisit()]);
      setVisits(all);
      setLatestVisit(latest);
    } catch (err) {
      console.error('Error fetching clinic visits:', err);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchVisits(); }, [fetchVisits]);

  const createVisit = async (data) => {
    await addClinicVisit(data);
    await fetchVisits();
  };

  const editVisit = async (id, data) => {
    await updateClinicVisit(id, data);
    await fetchVisits();
  };

  return { visits, latestVisit, loading, fetchVisits, createVisit, editVisit };
}
