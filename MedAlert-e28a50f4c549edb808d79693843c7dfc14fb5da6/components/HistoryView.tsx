
import React, { useMemo } from 'react';
import { HistoryEntry } from '../types';
import { CalendarIcon } from './Icons';

const HistoryStatus: React.FC<{status: HistoryEntry['status']}> = ({ status }) => {
    const baseClasses = "text-xs font-semibold px-3 py-1 rounded-full";
    switch (status) {
        case 'taken':
            return <span className={`${baseClasses} bg-green-100 text-green-700`}>Tomada</span>;
        case 'postponed':
            return <span className={`${baseClasses} bg-yellow-100 text-yellow-700`}>Adiada</span>;
        case 'skipped':
        default:
            return <span className={`${baseClasses} bg-red-100 text-red-700`}>Não tomada</span>;
    }
}

const HistoryItem: React.FC<{ entry: HistoryEntry }> = ({ entry }) => {
  const entryDate = new Date(entry.timestamp);
  
  const getDayLabel = (date: Date) => {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) return 'Hoje';
    if (date.toDateString() === yesterday.toDateString()) return 'Ontem';
    return date.toLocaleDateString('pt-BR', { weekday: 'long' });
  }

  return (
     <div className="bg-white rounded-xl shadow-sm overflow-hidden w-full">
      <div className="p-4 flex items-center justify-between">
        <div>
            <h3 className="text-lg font-bold text-slate-800">{entry.medication.name}</h3>
            <p className="text-slate-500">{entry.medication.dosage}</p>
            <p className="text-sm text-slate-400 mt-1">
                {getDayLabel(entryDate)} - {entryDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </p>
        </div>
        <HistoryStatus status={entry.status} />
      </div>
    </div>
  );
};

const HistoryView: React.FC<{history: HistoryEntry[]}> = ({ history }) => {
  if (history.length === 0) {
    return (
       <div className="text-center py-16 px-6 bg-white rounded-lg shadow-sm">
            <CalendarIcon className="w-12 h-12 mx-auto text-slate-300"/>
            <h3 className="mt-2 text-lg font-medium text-slate-800">Nenhum Histórico</h3>
            <p className="mt-1 text-sm text-slate-500">Doses tomadas e puladas aparecerão aqui.</p>
        </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center px-1">
          <p className="text-sm font-medium text-slate-500">Últimos 7 dias</p>
          {/* Filter icon can be added here */}
      </div>
      {history.map(entry => (
        <HistoryItem key={entry.id} entry={entry} />
      ))}
    </div>
  );
};

export default HistoryView;
