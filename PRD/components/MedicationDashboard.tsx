import React from 'react';
import { Dose, Medication } from '../types';
import { ClockIcon, PillIcon } from './Icons';

interface MedicationDashboardProps {
  todaysDoses: Dose[];
  onTakeDose: (medication: Medication, time: string) => void;
}

const DoseStatusBadge: React.FC<{ status: Dose['status'] }> = ({ status }) => {
  const baseClasses = "text-xs font-semibold px-3 py-1 rounded-full";
  switch (status) {
    case 'taken':
      return <span className={`${baseClasses} bg-green-100 text-green-700`}>Tomada</span>;
    case 'missed':
       return <span className={`${baseClasses} bg-red-100 text-red-700`}>Não tomada</span>;
    case 'postponed':
        return <span className={`${baseClasses} bg-yellow-100 text-yellow-700`}>Adiada</span>;
    case 'pending':
    default:
      return <span className={`${baseClasses} bg-slate-100 text-slate-600`}>Pendente</span>;
  }
};

const calculateRemainingDays = (medication: Medication): number | null => {
    if (medication.duration === 'continuous') {
        return null;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const startDate = new Date(medication.startDate);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + medication.duration - 1); // -1 because start day is day 1
    
    if (today > endDate) {
        return 0; // Treatment finished
    }

    const diffTime = Math.abs(endDate.getTime() - today.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include today
    
    return diffDays;
};


const DoseCard: React.FC<{ dose: Dose, onTakeDose: (medication: Medication, time: string) => void }> = ({ dose, onTakeDose }) => {
  const remainingDays = calculateRemainingDays(dose.medication);
  const canTake = dose.status === 'pending' || dose.status === 'missed';

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden w-full">
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4 flex-1">
            <div className="flex-shrink-0">
               <div className={`w-3 h-16 rounded-full ${dose.status === 'taken' ? 'bg-green-400' : 'bg-slate-200'}`}></div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-slate-800">{dose.medication.name}</h3>
              <p className="text-slate-500">{dose.medication.dosage}</p>
              <div className="flex items-center text-slate-500 mt-1">
                <ClockIcon className="w-4 h-4 mr-1.5" />
                <span className="text-sm font-medium">{dose.time}</span>
              </div>
              {remainingDays !== null && remainingDays > 0 && (
                <p className="text-xs text-blue-600 font-medium mt-1">
                    Faltam {remainingDays} {remainingDays === 1 ? 'dia' : 'dias'}
                </p>
              )}
            </div>
        </div>
         {canTake ? (
            <button 
                onClick={() => onTakeDose(dose.medication, dose.time)}
                className="bg-green-500 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-green-600 transition-colors shadow-sm"
            >
                Tomar
            </button>
        ) : (
            <DoseStatusBadge status={dose.status} />
        )}
      </div>
    </div>
  );
};


const MedicationDashboard: React.FC<MedicationDashboardProps> = ({ todaysDoses, onTakeDose }) => {
  const today = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long', day: 'numeric', month: 'long'
  });

  return (
    <div className="space-y-4">
      <div className="px-1">
        <h2 className="text-lg font-semibold text-slate-800">Hoje</h2>
        <p className="text-sm text-slate-500 capitalize">{today}</p>
      </div>

      {todaysDoses.length === 0 ? (
        <div className="text-center py-16 px-6 bg-white rounded-lg shadow-sm mt-4">
            <PillIcon className="w-12 h-12 mx-auto text-slate-300"/>
            <h3 className="mt-2 text-lg font-medium text-slate-800">Nenhum medicamento hoje</h3>
            <p className="mt-1 text-sm text-slate-500">Adicione um medicamento para começar.</p>
        </div>
      ) : (
        todaysDoses.map(dose => (
          <DoseCard key={`${dose.medication.id}-${dose.time}`} dose={dose} onTakeDose={onTakeDose} />
        ))
      )}
    </div>
  );
};

export default MedicationDashboard;