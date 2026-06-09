import React, { useMemo } from 'react';
import { HistoryEntry, Medication } from '../types';
import { CalendarIcon } from './Icons';

const StatusBadge: React.FC<{ status: HistoryEntry['status'] }> = ({ status }) => {
  const base = 'text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap';
  if (status === 'taken') return <span className={`${base} bg-green-100 text-green-700`}>Tomada</span>;
  if (status === 'rescheduled') return <span className={`${base} bg-yellow-100 text-yellow-700`}>Reagendada</span>;
  return <span className={`${base} bg-red-100 text-red-600`}>Não tomada</span>;
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

  if (sameDay(date, today)) return 'Hoje';
  if (sameDay(date, yesterday)) return 'Ontem';
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const HistoryView: React.FC<{ history: HistoryEntry[]; medications: Medication[] }> = ({ history, medications }) => {
  const sorted = useMemo(
    () => [...history].sort((a, b) => {
      const dateCompare = new Date(b.date).getTime() - new Date(a.date).getTime();
      if (dateCompare !== 0) return dateCompare;
      return b.scheduledTime.localeCompare(a.scheduledTime);
    }),
    [history]
  );

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="bg-slate-100 p-6 rounded-full mb-4">
          <CalendarIcon className="w-12 h-12 text-slate-400" />
        </div>
        <h3 className="text-xl font-semibold text-slate-700">Nenhum histórico</h3>
        <p className="mt-1 text-slate-500">Doses registradas aparecerão aqui.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Tabela - desktop */}
      <div className="hidden md:block bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left px-5 py-3.5 font-semibold text-slate-600">Medicamento</th>
              <th className="text-left px-5 py-3.5 font-semibold text-slate-600">Dosagem</th>
              <th className="text-left px-5 py-3.5 font-semibold text-slate-600">Data</th>
              <th className="text-left px-5 py-3.5 font-semibold text-slate-600">Horário</th>
              <th className="text-left px-5 py-3.5 font-semibold text-slate-600">Tomada às</th>
              <th className="text-left px-5 py-3.5 font-semibold text-slate-600">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sorted.map(entry => {
              const med = medications.find(m => m.id === entry.medicationId);
              if (!med) return null;
              const takenTime = entry.takenAt
                ? new Date(entry.takenAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
                : '—';
              return (
                <tr key={entry.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5 font-semibold text-slate-800">{med.name}</td>
                  <td className="px-5 py-3.5 text-slate-500">{med.dosage}</td>
                  <td className="px-5 py-3.5 text-slate-600">{formatDate(entry.date)}</td>
                  <td className="px-5 py-3.5 text-slate-600 tabular-nums font-medium">{entry.scheduledTime}</td>
                  <td className="px-5 py-3.5 text-slate-500 tabular-nums">{takenTime}</td>
                  <td className="px-5 py-3.5"><StatusBadge status={entry.status} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Cards - mobile */}
      <div className="md:hidden space-y-3">
        {sorted.map(entry => {
          const med = medications.find(m => m.id === entry.medicationId);
          if (!med) return null;
          const takenTime = entry.takenAt
            ? new Date(entry.takenAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
            : null;
          return (
            <div key={entry.id} className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-bold text-slate-800">{med.name}</p>
                  <p className="text-sm text-slate-500">{med.dosage}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {formatDate(entry.date)} · {entry.scheduledTime}
                    {takenTime && ` · tomada às ${takenTime}`}
                  </p>
                </div>
                <StatusBadge status={entry.status} />
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-slate-400 text-center pb-2">{sorted.length} registro{sorted.length !== 1 ? 's' : ''}</p>
    </div>
  );
};

export default HistoryView;
