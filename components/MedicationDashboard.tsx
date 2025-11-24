import React from 'react';
import { Dose } from '../types';
import { PillIcon, CheckIcon, XIcon, ClockIcon } from './Icons';

const DoseStatusIcon: React.FC<{ status: Dose['status'] }> = ({ status }) => {
    switch (status) {
        case 'taken': return <CheckIcon className="w-6 h-6 text-green-500" />;
        case 'missed': return <XIcon className="w-6 h-6 text-red-500" />;
        case 'postponed': return <ClockIcon className="w-6 h-6 text-yellow-500" />;
        default: return <PillIcon className="w-6 h-6 text-slate-400" />;
    }
};

interface MedicationDashboardProps {
  todaysDoses: Dose[];
  onTakeDose: (med: Dose['medication'], time: string) => void;
  onEditDose: (med: Dose['medication']) => void;
}

const MedicationDashboard: React.FC<MedicationDashboardProps> = ({ todaysDoses, onTakeDose, onEditDose }) => {
  if (todaysDoses.length === 0) {
    return (
      <div className="text-center p-8">
        <PillIcon className="w-16 h-16 mx-auto text-slate-300" />
        <h3 className="mt-4 text-lg font-semibold text-slate-700">Nenhum medicamento para hoje</h3>
        <p className="mt-1 text-slate-500">Adicione um medicamento para começar.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {todaysDoses.map(({ medication, time, status }, index) => (
        <div key={`${medication.id}-${time}-${index}`} className="bg-white rounded-lg shadow-sm overflow-hidden">
          <button onClick={() => onEditDose(medication)} className="w-full text-left p-4 flex items-center justify-between hover:bg-slate-50">
            <div className="flex items-center">
              <DoseStatusIcon status={status} />
              <div className="ml-4">
                <p className="font-bold text-slate-800">{medication.name}</p>
                <p className="text-sm text-slate-500">{medication.dosage}</p>
              </div>
            </div>
            <p className={`font-bold text-lg ${status === 'taken' ? 'text-green-500' : 'text-slate-800'}`}>{time}</p>
          </button>
          {status === 'pending' && (
             <div className="bg-slate-50/50 px-4 py-2 flex justify-end space-x-2">
               <button onClick={() => onTakeDose(medication, time)} className="px-3 py-1 text-sm font-semibold text-white bg-blue-500 rounded-md hover:bg-blue-600">Tomar</button>
             </div>
           )}
        </div>
      ))}
    </div>
  );
};

export default MedicationDashboard;
