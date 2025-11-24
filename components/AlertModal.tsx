
import React from 'react';
import { Medication } from '../types';
import { BellIcon, PillIcon, ClockIcon } from './Icons';

interface AlertModalProps {
  medication: Medication;
  doseTime: string;
  onTake: () => void;
  onSnooze: () => void;
}

const AlertModal: React.FC<AlertModalProps> = ({ medication, doseTime, onTake, onSnooze }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm text-center transform transition-all scale-100 opacity-100">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-4 ring-8 ring-blue-50">
            <div className="relative">
                <BellIcon className="h-8 w-8 text-blue-500" />
                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-white"></span>
                </span>
            </div>
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Hora do Medicamento!</h2>
        
        <div className="bg-slate-50 rounded-lg p-4 mt-4 text-left space-y-3">
            <div className="flex items-center">
                <PillIcon className="w-5 h-5 text-slate-500 mr-3" />
                <div>
                    <p className="font-bold text-slate-800">{medication.name}</p>
                    <p className="text-sm text-slate-600">{medication.dosage}</p>
                </div>
            </div>
            <div className="flex items-center">
                <ClockIcon className="w-5 h-5 text-slate-500 mr-3" />
                 <p className="text-sm text-slate-600">Horário agendado: <span className="font-bold text-slate-800">{doseTime}</span></p>
            </div>
        </div>
        <p className="mt-4 text-sm text-slate-500">Você precisa tomar este medicamento agora.</p>
        
        <div className="mt-6 space-y-3">
          <button
            onClick={onTake}
            className="w-full inline-flex justify-center items-center rounded-lg border border-transparent bg-green-500 px-4 py-3 text-base font-medium text-white shadow-sm hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Tomar Agora
          </button>
          <button
            onClick={onSnooze}
            className="w-full inline-flex justify-center rounded-lg border border-transparent bg-yellow-400 px-4 py-3 text-base font-medium text-yellow-900 shadow-sm hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400"
          >
            Adiar
          </button>
        </div>
        <p className="mt-4 text-xs text-slate-400">Toque em "Tomar Agora" para confirmar a dose</p>
      </div>
    </div>
  );
};

export default AlertModal;
