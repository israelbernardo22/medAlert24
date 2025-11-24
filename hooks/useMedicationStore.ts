import { useState, useEffect } from 'react';
import { Medication, HistoryEntry, Profile } from '../types';

// --- Helper Function for LocalStorage ---
const useStickyState = <T>(key: string, defaultValue: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
    const [value, setValue] = useState<T>(() => {
        try {
            const stickyValue = window.localStorage.getItem(key);
            return stickyValue !== null
                ? JSON.parse(stickyValue)
                : defaultValue;
        } catch (error) {
            console.error(`Error reading ${key} from localStorage`, error);
            return defaultValue;
        }
    });

    useEffect(() => {
        try {
            window.localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error(`Error setting ${key} in localStorage`, error);
        }
    }, [key, value]);

    return [value, setValue];
};

// --- The Store Hook ---
// This hook now only manages state persistence and returns the state and its setter.
// All business logic (add, delete, update) is moved into the App component for clarity and reliability.
export const useStore = () => {
  const [profiles, setProfiles] = useStickyState<Profile[]>('medalert_profiles', []);
  const [medications, setMedications] = useStickyState<Medication[]>('medalert_medications', []);
  const [history, setHistory] = useStickyState<HistoryEntry[]>('medalert_history', []);

  return { 
    profiles, setProfiles,
    medications, setMedications,
    history, setHistory
  };
};
