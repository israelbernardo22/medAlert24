import React, { useMemo, useState, useEffect } from 'react';
import { Dose, Medication } from '../types';
import { PillIcon, CheckIcon, ClockIcon, SortAscendingIcon, BellAlertIcon } from './Icons'; // Ícones atualizados
import { SortType } from '../App'; // Importa o tipo do App

// --- Componentes de Ícones e Status --- //

const DoseStatusIcon: React.FC<{ status: Dose['status'] }> = ({ status }) => {
    const sharedClasses = "w-6 h-6";
    switch (status) {
        case 'taken': return <CheckIcon className={`${sharedClasses} text-green-500`} />;
        default: return <PillIcon className={`${sharedClasses} text-slate-400`} />;
    }
};

// --- Props do Componente --- //

interface MedicationDashboardProps {
  todaysDoses: Dose[];
  onTakeDose: (med: Medication, time: string) => void;
  onEditDose: (med: Medication) => void;
  snoozedAlerts: Map<string, number>;
  sortType: SortType;
  onSortChange: (sortType: SortType) => void;
}

// --- Lógica de Ordenação --- //

// Função para determinar a prioridade de uma dose para ordenação
const getDosePriority = (dose: Dose, snoozedAlerts: Map<string, number>): number => {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const alertId = `${dose.medication.id}-${dose.time}-${todayStr}`;
  const [hours, minutes] = dose.time.split(':').map(Number);
  const doseTimeToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);

  if (dose.status === 'taken') return 4; // Já tomados ficam por último
  if (now > doseTimeToday) return 1; // Atrasados primeiro
  if (snoozedAlerts.has(alertId)) return 2; // Adiados em segundo
  
  return 3; // Próximos a vencer
};

// --- Componente Principal --- //

const MedicationDashboard: React.FC<MedicationDashboardProps> = ({ todaysDoses, onTakeDose, onEditDose, snoozedAlerts, sortType, onSortChange }) => {
  const [, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick(prev => prev + 1), 10000);
    return () => clearInterval(timer);
  }, []);

  // Ordena a lista de doses com base no tipo de ordenação selecionado
  const sortedDoses = useMemo(() => {
    const pendingDoses = todaysDoses.filter(d => d.status === 'pending');
    const takenDoses = todaysDoses.filter(d => d.status === 'taken').sort((a,b) => b.time.localeCompare(a.time)); // Tomados mais recentes primeiro

    if (sortType === 'status') {
      pendingDoses.sort((a, b) => {
        const priorityA = getDosePriority(a, snoozedAlerts);
        const priorityB = getDosePriority(b, snoozedAlerts);
        if (priorityA !== priorityB) return priorityA - priorityB;
        return a.time.localeCompare(b.time); // Se a prioridade for a mesma, ordena por horário
      });
    } else { // sortType === 'time'
      pendingDoses.sort((a, b) => a.time.localeCompare(b.time));
    }
    
    return [...pendingDoses, ...takenDoses];
  }, [todaysDoses, sortType, snoozedAlerts]);

  if (todaysDoses.length === 0) {
    return (
      <div className="text-center p-8 mt-8">
        <PillIcon className="w-16 h-16 mx-auto text-slate-300" />
        <h3 className="mt-4 text-xl font-semibold text-slate-800">Nenhum medicamento hoje</h3>
        <p className="mt-2 text-slate-500">Adicione um medicamento para começar o acompanhamento.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Seletor de Ordenação */}
      <div className="px-1 mb-4">
        <div className="flex items-center justify-between mb-2">
            <h2 className="font-bold text-slate-700 text-lg">Doses de Hoje</h2>
            <div className="flex items-center bg-slate-100 rounded-full p-1">
                <button onClick={() => onSortChange('status')} className={`px-3 py-1 text-sm font-semibold rounded-full ${sortType === 'status' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}>
                    Status
                </button>
                <button onClick={() => onSortChange('time')} className={`px-3 py-1 text-sm font-semibold rounded-full ${sortType === 'time' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}>
                    Horário
                </button>
            </div>
        </div>
      </div>

      {/* Lista de Doses Ordenada */}
      {sortedDoses.map(dose => (
        <DoseCard key={`${dose.medication.id}-${dose.time}`} dose={dose} onTakeDose={onTakeDose} onEditDose={onEditDose} snoozedAlerts={snoozedAlerts} />
      ))}

      {sortedDoses.filter(d => d.status === 'pending').length === 0 && (
         <div className="text-center p-8 mt-4 rounded-xl bg-green-50/80">
            <CheckIcon className="w-12 h-12 mx-auto text-green-400" />
            <h3 className="mt-2 text-lg font-semibold text-green-800">Tudo certo por hoje!</h3>
            <p className="mt-1 text-sm text-green-600">Todas as doses de hoje foram tomadas.</p>
        </div>
      )}
    </div>
  );
};

// --- Componente do Card de Dose (extraído para clareza) --- //

interface DoseCardProps {
    dose: Dose;
    onTakeDose: (med: Medication, time: string) => void;
    onEditDose: (med: Medication) => void;
    snoozedAlerts: Map<string, number>;
}

const DoseCard: React.FC<DoseCardProps> = ({ dose, onTakeDose, onEditDose, snoozedAlerts }) => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const alertId = `${dose.medication.id}-${dose.time}-${todayStr}`;
    const snoozedUntil = snoozedAlerts.get(alertId);

    let statusMessage = null;
    let isLate = false;

    if (dose.status === 'pending') {
      if (snoozedUntil && now.getTime() < snoozedUntil) {
        const remainingMinutes = Math.ceil((snoozedUntil - now.getTime()) / (1000 * 60));
        statusMessage = (
          <span className="text-xs font-semibold text-yellow-600 flex items-center"><ClockIcon className="w-3 h-3 mr-1" /> Adiado (~{remainingMinutes} min)</span>
        );
      } else {
        const [hours, minutes] = dose.time.split(':').map(Number);
        const doseTimeToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);
        if (now > doseTimeToday) {
          isLate = true;
          statusMessage = <span className="text-xs font-bold text-red-500 flex items-center"><BellAlertIcon className="w-3 h-3 mr-1"/>ATRASADO</span>;
        }
      }
    }

    return (
        <div className={`bg-white rounded-xl shadow-sm border ${isLate ? 'border-red-200' : 'border-slate-200/80'} ${dose.status === 'taken' ? 'bg-slate-50 opacity-80' : ''}`}>
            {/* Informações do Medicamento */}
            <div className="p-4 flex justify-between items-start">
                <div>
                    <p className="font-bold text-slate-800 text-lg">{dose.medication.name}</p>
                    <p className="text-sm text-slate-500">{dose.medication.dosage}</p>
                </div>
                <button onClick={() => onEditDose(dose.medication)} className="text-xs font-semibold text-blue-600 hover:underline px-2 py-1">Editar</button>
            </div>

            {/* Detalhes da Dose */}
            <div className={`rounded-b-xl px-4 py-3 flex items-center justify-between ${isLate ? 'bg-red-50/50' : 'bg-slate-50/70'} ${dose.status === 'taken' ? 'bg-slate-100/50' : ''}`}>
              <div className="flex items-center space-x-3">
                <DoseStatusIcon status={dose.status} />
                <span className={`font-semibold text-xl ${dose.status === 'taken' ? 'text-slate-400 line-through' : 'text-slate-700'}`}>{dose.time}</span>
              </div>
              
              <div className="flex flex-col items-end">
                {dose.status === 'pending' ? (
                  <button onClick={() => onTakeDose(dose.medication, dose.time)} className="px-5 py-2 text-base font-bold text-white bg-blue-500 rounded-lg hover:bg-blue-600 shadow-sm transition-all">
                    Tomar
                  </button>
                ) : (
                  <span className="text-sm font-semibold text-green-600 pr-2">Tomado</span>
                )}
                <div className="h-4 mt-1.5 flex items-center">
                  {statusMessage}
                </div>
              </div>
            </div>
        </div>
    );
}

export default MedicationDashboard;
