import { useState, useEffect } from 'react';
import { Medication, HistoryEntry, Profile } from '../types';

// =========================================================================
// DADOS INICIAIS MOCK (PARA DESENVOLVIMENTO)
// =========================================================================
const initialProfiles: Profile[] = [
  { id: 1, name: 'Vovó Ana', relation: 'Avó' },
  { id: 2, name: 'João', relation: 'Titular' },
];

const initialMedications: Medication[] = [
  { 
    id: 1, 
    profileId: 1,
    name: 'Losartana', 
    dosage: '50mg', 
    schedule: { type: 'every_day', times: ['08:00', '20:00'] },
    duration: { type: 'continuous', value: 0 },
    startDate: '2024-01-01',
    notes: 'Tomar com um copo de água.', 
    history: [],
    doses: ['08:00', '20:00'], // Manter por compatibilidade temporária
  },
  { 
    id: 2, 
    profileId: 1,
    name: 'Paracetamol', 
    dosage: '750mg', 
    schedule: { type: 'specific_days', days: ['monday', 'wednesday', 'friday'], times: ['10:00'] },
    duration: { type: 'days', value: 10 },
    startDate: '2024-05-20',
    notes: 'Apenas se sentir dor.', 
    history: [],
    doses: ['10:00'], // Manter por compatibilidade temporária
  },
];

const initialHistory: HistoryEntry[] = [
  // Exemplo: Losartana tomada hoje às 08:05 (atrasado)
  { id: 1, medicationId: 1, date: new Date().toISOString().split('T')[0], scheduledTime: '08:00', status: 'taken', takenAt: new Date(new Date().setHours(8, 5, 0, 0)).toISOString() },
];

// =========================================================================
// HOOK PRINCIPAL DA STORE
// =========================================================================
export const useMedicationStore = () => {
  const [medications, setMedications] = useState<Medication[]>(() => JSON.parse(localStorage.getItem('medications') || JSON.stringify(initialMedications)));
  const [history, setHistory] = useState<HistoryEntry[]>(() => JSON.parse(localStorage.getItem('history') || JSON.stringify(initialHistory)));
  const [profiles, setProfiles] = useState<Profile[]>(() => JSON.parse(localStorage.getItem('profiles') || JSON.stringify(initialProfiles)));
  const [currentProfileId, setCurrentProfileIdState] = useState<number | null>(() => JSON.parse(localStorage.getItem('currentProfileId') || 'null'));

  // Efeitos para persistir os dados no localStorage
  useEffect(() => { localStorage.setItem('medications', JSON.stringify(medications)); }, [medications]);
  useEffect(() => { localStorage.setItem('history', JSON.stringify(history)); }, [history]);
  useEffect(() => { localStorage.setItem('profiles', JSON.stringify(profiles)); }, [profiles]);
  useEffect(() => { localStorage.setItem('currentProfileId', JSON.stringify(currentProfileId)); }, [currentProfileId]);

  const setCurrentProfileId = (id: number | null) => {
    setCurrentProfileIdState(id);
  };

  const addMedication = (med: Omit<Medication, 'id' | 'history' | 'profileId'>) => {
    if (currentProfileId === null) return;
    setMedications(prev => [...prev, { ...med, id: Date.now(), history: [], profileId: currentProfileId }]);
  };

  const updateMedication = (med: Medication) => {
    setMedications(prev => prev.map(m => m.id === med.id ? med : m));
  };

  const removeMedication = (id: number) => {
    setMedications(prev => prev.filter(m => m.id !== id));
    // Opcional: remover histórico associado
    setHistory(prev => prev.filter(h => h.medicationId !== id));
  };

  const addHistoryEntry = (medicationId: number, scheduledTime: string, status: HistoryEntry['status']) => {
    const now = new Date();
    const newEntry: HistoryEntry = {
      id: Date.now(),
      medicationId,
      date: now.toISOString().split('T')[0],
      scheduledTime, // O horário que estava agendado
      status,
      takenAt: now.toISOString(), // A hora exata que a ação ocorreu
    };
    setHistory(prev => [...prev, newEntry]);
  };
  
  const addProfile = (profile: Omit<Profile, 'id'>) => {
    const newProfile = { ...profile, id: Date.now() };
    setProfiles(prev => [...prev, newProfile]);
    return newProfile;
  };

  const removeProfile = (id: number) => {
    setProfiles(prev => prev.filter(p => p.id !== id));
    // Remove medicamentos e histórico associados ao perfil
    const medsToRemove = medications.filter(m => m.profileId === id).map(m => m.id);
    setMedications(prev => prev.filter(m => m.profileId !== id));
    setHistory(prev => prev.filter(h => !medsToRemove.includes(h.medicationId)));
    if (currentProfileId === id) {
      setCurrentProfileId(null);
    }
  };

  return { medications, addMedication, updateMedication, removeMedication, history, addHistoryEntry, profiles, addProfile, removeProfile, currentProfileId, setCurrentProfileId };
};
