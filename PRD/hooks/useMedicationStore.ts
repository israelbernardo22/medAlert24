import { useState, useEffect, useCallback } from 'react';
import { Medication, HistoryEntry, Profile } from '../types';
import * as api from '../src/services/apiService';

export const useMedicationStore = () => {
  const [medications, setMedications] = useState<Medication[]>(() =>
    JSON.parse(localStorage.getItem('medications') || '[]')
  );
  const [history, setHistory] = useState<HistoryEntry[]>(() =>
    JSON.parse(localStorage.getItem('history') || '[]')
  );
  const [profiles, setProfiles] = useState<Profile[]>(() =>
    JSON.parse(localStorage.getItem('profiles') || '[]')
  );
  const [currentProfileId, setCurrentProfileIdState] = useState<number | null>(() =>
    JSON.parse(localStorage.getItem('currentProfileId') || 'null')
  );

  useEffect(() => { localStorage.setItem('medications', JSON.stringify(medications)); }, [medications]);
  useEffect(() => { localStorage.setItem('history', JSON.stringify(history)); }, [history]);
  useEffect(() => { localStorage.setItem('profiles', JSON.stringify(profiles)); }, [profiles]);
  useEffect(() => { localStorage.setItem('currentProfileId', JSON.stringify(currentProfileId)); }, [currentProfileId]);

  const setCurrentProfileId = (id: number | null) => setCurrentProfileIdState(id);

  const loadFromApi = useCallback(async () => {
    const [profs, meds, hist] = await Promise.all([
      api.fetchProfiles(),
      api.fetchMedications(),
      api.fetchHistory(),
    ]);
    setProfiles(profs);
    setMedications(meds);
    setHistory(hist);
  }, []);

  const addMedication = async (med: Omit<Medication, 'id' | 'history' | 'profileId'>) => {
    if (currentProfileId === null) return;
    const saved = await api.createMedication({ ...med, profileId: currentProfileId });
    setMedications(prev => [...prev, { ...saved, history: [] }]);
  };

  const updateMedication = async (med: Medication) => {
    setMedications(prev => prev.map(m => m.id === med.id ? med : m));
    api.updateMedicationApi(med.id, med).catch(console.error);
  };

  const removeMedication = async (id: number) => {
    setMedications(prev => prev.filter(m => m.id !== id));
    setHistory(prev => prev.filter(h => h.medicationId !== id));
    api.deleteMedicationApi(id).catch(console.error);
  };

  const addHistoryEntry = async (medicationId: number, scheduledTime: string, status: HistoryEntry['status']) => {
    const now = new Date();
    const newEntry: HistoryEntry = {
      id: Date.now(),
      medicationId,
      date: now.toISOString().split('T')[0],
      scheduledTime,
      status,
      takenAt: now.toISOString(),
    };
    setHistory(prev => [...prev, newEntry]);
    api.createHistoryEntry({
      medicationId,
      date: newEntry.date,
      scheduledTime,
      status,
      takenAt: newEntry.takenAt,
    }).catch(console.error);
  };

  const addProfile = async (profile: Omit<Profile, 'id'>): Promise<Profile> => {
    const saved = await api.createProfile(profile);
    setProfiles(prev => [...prev, saved]);
    return saved;
  };

  const removeProfile = async (id: number) => {
    setProfiles(prev => prev.filter(p => p.id !== id));
    const medsToRemove = medications.filter(m => m.profileId === id).map(m => m.id);
    setMedications(prev => prev.filter(m => m.profileId !== id));
    setHistory(prev => prev.filter(h => !medsToRemove.includes(h.medicationId)));
    if (currentProfileId === id) setCurrentProfileId(null);
    api.deleteProfileApi(id).catch(console.error);
  };

  return {
    medications, addMedication, updateMedication, removeMedication,
    history, addHistoryEntry,
    profiles, addProfile, removeProfile,
    currentProfileId, setCurrentProfileId,
    loadFromApi,
  };
};
