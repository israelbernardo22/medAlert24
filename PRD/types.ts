
export class Profile {
  id: string;
  name: string;
  relation: string;
  avatar?: string;

  constructor(data: Omit<Profile, 'id'>) {
    this.id = `user-${Date.now()}`;
    this.name = data.name;
    this.relation = data.relation;
    this.avatar = data.avatar;
  }
}


export interface Schedule {
  type: 'daily';
  times: string[];
}

// Medication já está como classe em useMedicationStore.ts


export class HistoryEntry {
  id: string;
  profileId: string;
  medication: { id: string; name: string; dosage: string };
  status: 'taken' | 'skipped' | 'postponed';
  timestamp: string;
  scheduledTime: string;

  constructor(data: Omit<HistoryEntry, 'id'>) {
    this.id = `hist-${Date.now()}`;
    this.profileId = data.profileId;
    this.medication = data.medication;
    this.status = data.status;
    this.timestamp = data.timestamp;
    this.scheduledTime = data.scheduledTime;
  }
}


export interface AlertInfo {
  medication: Medication;
  doseTime: string;
}


export class Dose {
  medication: Medication;
  time: string;
  status: 'taken' | 'skipped' | 'postponed' | 'pending' | 'missed';
  historyEntry?: HistoryEntry;

  constructor(data: Dose) {
    this.medication = data.medication;
    this.time = data.time;
    this.status = data.status;
    this.historyEntry = data.historyEntry;
  }
}