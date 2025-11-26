import React, { useMemo } from 'react';
import { HistoryEntry, Medication } from '../types';
import { CalendarIcon, PillIcon } from './Icons';

const HistoryStatus: React.FC<{status: HistoryEntry['status']}> = ({ status }) => {
    const baseClasses = "text-xs font-semibold px-3 py-1 rounded-full";
    switch (status) {
        case 'taken':
            return <span className={`${baseClasses} bg-green-100 text-green-700`}>Tomada</span>;
        // Adicione outros casos se necessário, como 'postponed' ou 'skipped'
        default:
            return <span className={`${baseClasses} bg-red-100 text-red-700`}>Não tomada</span>;
    }
}

// CORREÇÃO: O componente agora recebe o medicamento como uma prop separada e segura.
const HistoryItem: React.FC<{ entry: HistoryEntry; medication: Medication }> = ({ entry, medication }) => {
  // Usa `entry.date` em vez de `timestamp` que não existe no tipo.
  const entryDate = new Date(entry.date);
  
  const getDayLabel = (date: Date) => {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    
    today.setHours(0,0,0,0);
    yesterday.setHours(0,0,0,0);
    date.setHours(0,0,0,0);

    if (date.getTime() === today.getTime()) return 'Hoje';
    if (date.getTime() === yesterday.getTime()) return 'Ontem';
    return date.toLocaleDateString('pt-BR', { weekday: 'long' });
  }

  return (
     <div className="bg-white rounded-xl shadow-sm overflow-hidden w-full">
      <div className="p-4 flex items-center justify-between">
        <div>
            {/* CORREÇÃO: Acessa o nome e a dosagem do medicamento de forma segura. */}
            <h3 className="text-lg font-bold text-slate-800">{medication.name}</h3>
            <p className="text-slate-500">{medication.dosage}</p>
            <p className="text-sm text-slate-400 mt-1">
                {getDayLabel(entryDate)} - {entry.time}
            </p>
        </div>
        <HistoryStatus status={entry.status} />
      </div>
    </div>
  );
};

// CORREÇÃO: O componente agora aceita `medications` para fazer a busca segura.
const HistoryView: React.FC<{history: HistoryEntry[], medications: Medication[]}> = ({ history, medications }) => {
  
  const sortedHistory = useMemo(() => {
      return [...history].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [history]);

  if (history.length === 0) {
    return (
       <div className="text-center py-16 px-6 bg-white rounded-lg shadow-sm">
            <CalendarIcon className="w-12 h-12 mx-auto text-slate-300"/>
            <h3 className="mt-2 text-lg font-medium text-slate-800">Nenhum Histórico</h3>
            <p className="mt-1 text-sm text-slate-500">Doses tomadas e não tomadas aparecerão aqui.</p>
        </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center px-1">
          <p className="text-sm font-medium text-slate-500">Eventos Recentes</p>
      </div>
      {sortedHistory.map(entry => {
        // CORREÇÃO: Procura o medicamento para cada entrada do histórico.
        const medication = medications.find(m => m.id === entry.medicationId);
        // Se o medicamento não for encontrado (foi deletado), simplesmente não renderiza o item.
        if (!medication) {
          return null;
        }
        // Se encontrou, renderiza o item passando o medicamento de forma segura.
        return <HistoryItem key={entry.id} entry={entry} medication={medication} />;
      })}
    </div>
  );
};

export default HistoryView;
