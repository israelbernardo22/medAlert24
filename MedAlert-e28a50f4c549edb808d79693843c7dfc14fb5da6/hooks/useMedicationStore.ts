import { useState, useEffect, useCallback } from 'react';
import { Medication as MedicationType, HistoryEntry, Profile } from '../types';


// Classe Medication
export class Medication {
  id: string;
  profileId: string;
  name: string;
  dosage: string;
  schedule: { type: 'daily'; times: string[] };
  startDate: string;
  duration: 'continuous' | number;

  constructor(data: Omit<MedicationType, 'id'>) {
    this.id = `med-${Date.now()}`;
    this.profileId = data.profileId;
    this.name = data.name;
    this.dosage = data.dosage;
    this.schedule = data.schedule;
    this.startDate = data.startDate;
    this.duration = data.duration;
  }

  isContinuous() {
    return this.duration === 'continuous';
  }

  getEndDate(): string | null {
    if (typeof this.duration === 'number') {
      const start = new Date(this.startDate);
      start.setDate(start.getDate() + this.duration - 1);
      return start.toISOString().split('T')[0];
    }
    return null;
  }
}

// Classe MedicationStore
class MedicationStore {
  private storageKey = 'medalert-data';

  save(data: AppData) {
    localStorage.setItem(this.storageKey, JSON.stringify(data));
  }

  load(): AppData {
    try {
      const storedData = localStorage.getItem(this.storageKey);
      if (storedData) {
        const parsed = JSON.parse(storedData);
        if (parsed.profiles && parsed.medications && parsed.history) {
          return parsed;
        }
      }
    } catch (error) {
      console.error("Failed to load data from localStorage", error);
    }
    return {
      profiles: initialProfiles,
      medications: initialMedications,
      history: [{
        id: 'hist-1',
        profileId: 'user-1',
        medication: { id: 'med-1', name: 'Losartana', dosage: '50mg' },
        status: 'taken',
        timestamp: new Date().toISOString(),
        scheduledTime: '08:00',
      }],
    };
  }

  addMedication(data: AppData, med: Medication) {
    return { ...data, medications: [...data.medications, med] };
  }

  updateMedication(data: AppData, updatedMed: MedicationType) {
    return {
      ...data,
      medications: data.medications.map(med => med.id === updatedMed.id ? updatedMed : med)
    };
  }

  deleteMedication(data: AppData, id: string) {
    const newMeds = data.medications.filter(med => med.id !== id);
    const newHistory = data.history.filter(entry => entry.medication.id !== id);
    return { ...data, medications: newMeds, history: newHistory };
  }
}

const medicationStore = new MedicationStore();


const getTodayDateString = () => new Date().toISOString().split('T')[0];

const initialProfiles: Profile[] = [
  { id: 'user-1', name: 'Você', relation: 'Titular' },
  { id: 'user-2', name: 'Maria Silva', relation: 'Mãe' },
  { id: 'user-3', name: 'João Silva', relation: 'Pai' },
];

const initialMedications: MedicationType[] = [
  { id: 'med-1', profileId: 'user-1', name: 'Losartana', dosage: '50mg', schedule: { type: 'daily', times: ['08:00'] }, startDate: getTodayDateString(), duration: 'continuous' },
  { id: 'med-2', profileId: 'user-1', name: 'Metformina', dosage: '850mg', schedule: { type: 'daily', times: ['12:00'] }, startDate: getTodayDateString(), duration: 'continuous' },
  { id: 'med-3', profileId: 'user-1', name: 'Omeprazol', dosage: '20mg', schedule: { type: 'daily', times: ['14:00'] }, startDate: getTodayDateString(), duration: 30 },
  { id: 'med-4', profileId: 'user-1', name: 'Sinvastatina', dosage: '40mg', schedule: { type: 'daily', times: ['20:00'] }, startDate: getTodayDateString(), duration: 'continuous' },
  { id: 'med-5', profileId: 'user-2', name: 'Atenolol', dosage: '25mg', schedule: { type: 'daily', times: ['09:00', '21:00'] }, startDate: getTodayDateString(), duration: 'continuous' },
  { id: 'med-6', profileId: 'user-3', name: 'Clopidogrel', dosage: '75mg', schedule: { type: 'daily', times: ['10:00'] }, startDate: getTodayDateString(), duration: 90 },
];


interface AppData {
  profiles: Profile[];
  medications: MedicationType[];
  history: HistoryEntry[];
}



export const useStore = () => {
  const [data, setData] = useState<AppData>(medicationStore.load());
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!isLoaded) {
      setData(medicationStore.load());
      setIsLoaded(true);
    }
  }, [isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      medicationStore.save(data);
    }
  }, [data, isLoaded]);

  const addMedication = useCallback((med: Omit<MedicationType, 'id'>) => {
    const newMed = new Medication(med);
    setData(prev => medicationStore.addMedication(prev, newMed));
  }, []);

  const updateMedication = useCallback((updatedMed: MedicationType) => {
    setData(prev => medicationStore.updateMedication(prev, updatedMed));
  }, []);
  
  const deleteMedication = useCallback((id: string) => {
    setData(prev => medicationStore.deleteMedication(prev, id));
  }, []);

  const recordDosage = useCallback((entry: Omit<HistoryEntry, 'id'>) => {
    const newEntry = { ...entry, id: `hist-${Date.now()}` };
    setData(prev => ({...prev, history: [newEntry, ...prev.history]}));
  }, []);

  const addProfile = useCallback((profile: Omit<Profile, 'id'>) => {
    const newProfile = { ...profile, id: `user-${Date.now()}` };
    setData(prev => ({ ...prev, profiles: [...prev.profiles, newProfile] }));
  }, []);

  return { ...data, addMedication, updateMedication, deleteMedication, recordDosage, addProfile };
};