
// Estrutura para um único horário de dose
export interface Dose {
  medication: Medication;
  time: string;
  status: 'pending' | 'taken' | 'missed' | 'postponed';
}

// Estrutura para uma entrada no histórico
export interface HistoryEntry {
  id: number;
  medicationId: number;
  date: string; // Data em que a dose deveria ter sido tomada (YYYY-MM-DD)
  scheduledTime: string; // Horário agendado da dose (HH:MM)
  status: 'taken' | 'skipped' | 'rescheduled';
  takenAt?: string; // Horário exato em que a dose foi marcada como tomada (ISO 8601 completo)
}

// Estrutura para a configuração de agendamento
export interface Schedule {
  type: 'every_day' | 'specific_days' | 'on_off';
  days?: string[]; // Para specific_days
  onDays?: number; // Para on_off
  offDays?: number; // Para on_off
  times: string[];
}

// Estrutura principal do medicamento
export interface Medication {
  id: number;
  profileId: number;
  name: string;
  dosage: string;
  doses: string[]; // Lista de horários (ex: ['08:00', '20:00'])
  schedule: Schedule;
  duration: {
    type: 'continuous' | 'days';
    value: number;
  };
  startDate?: string; // <-- CORREÇÃO: Adicionada data de início do tratamento
  notes?: string;
  info?: string;
  history: HistoryEntry[];
}

// Estrutura para os perfis de usuário
export interface Profile {
    id: number;
    name: string;
    relation: string;
}

// Estrutura para a informação de um alerta
export interface AlertInfo {
  medication: Medication;
  doseTime: string;
}