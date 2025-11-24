export interface Profile {
  id: string;
  name: string;
  relation: string;
  avatar?: string;
}

export interface Schedule {
  type: 'daily';
  times: string[]; 
}

export interface Medication {
  id: string;
  profileId: string;
  name: string;
  dosage: string;
  schedule: Schedule;
  startDate: string; // YYYY-MM-DD
  duration: 'continuous' | number; // in days
}

export interface HistoryEntry {
  id: string;
  profileId: string;
  medication: {
    id: string;
    name: string;
    dosage: string;
  }
  status: 'taken' | 'skipped' | 'postponed';
  timestamp: string;
  scheduledTime: string;
}

export interface AlertInfo {
  medication: Medication;
  doseTime: string;
}

export interface Dose {
    medication: Medication;
    time: string;
    status: 'taken' | 'skipped' | 'postponed' | 'pending' | 'missed';
    historyEntry?: HistoryEntry;
}