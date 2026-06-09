import axios from 'axios';
import { Medication, Profile, HistoryEntry } from '../../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const api = axios.create({ baseURL: `${API_URL}/api` });

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth
export const register = (data: { name: string; email: string; password: string }) =>
  api.post('/auth/register', data).then(r => r.data);

export const login = (data: { email: string; password: string }) =>
  api.post('/auth/login', data).then(r => r.data);

// Profiles
export const fetchProfiles = (): Promise<Profile[]> =>
  api.get('/profiles').then(r => r.data);

export const createProfile = (data: Omit<Profile, 'id'>): Promise<Profile> =>
  api.post('/profiles', data).then(r => r.data);

export const deleteProfileApi = (id: number): Promise<void> =>
  api.delete(`/profiles/${id}`).then(r => r.data);

// Medications
export const fetchMedications = (): Promise<Medication[]> =>
  api.get('/medications').then(r => r.data);

export const createMedication = (data: Omit<Medication, 'id' | 'history'>): Promise<Medication> =>
  api.post('/medications', data).then(r => r.data);

export const updateMedicationApi = (id: number, data: Omit<Medication, 'id' | 'history'>): Promise<Medication> =>
  api.put(`/medications/${id}`, data).then(r => r.data);

export const deleteMedicationApi = (id: number): Promise<void> =>
  api.delete(`/medications/${id}`).then(r => r.data);

// History
export const fetchHistory = (): Promise<HistoryEntry[]> =>
  api.get('/history').then(r => r.data);

export const createHistoryEntry = (data: Omit<HistoryEntry, 'id'>): Promise<HistoryEntry> =>
  api.post('/history', data).then(r => r.data);
