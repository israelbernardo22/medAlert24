import React, { useMemo, useState, useEffect } from 'react';
import { Dose, Medication } from '../types';
import { PillIcon, CheckIcon, ClockIcon, BellAlertIcon } from './Icons';
import { SortType } from '../App';

const getDosePriority = (dose: Dose, snoozedAlerts: Map<string, number>): number => {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const alertId = `${dose.medication.id}-${dose.time}-${todayStr}`;
  const [hours, minutes] = dose.time.split(':').map(Number);
  const doseTimeToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);
  if (dose.status === 'taken') return 4;
  if (now > doseTimeToday) return 1;
  if (snoozedAlerts.has(alertId)) return 2;
  return 3;
};

// --- Card de Dose --- //

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
  const [hours, minutes] = dose.time.split(':').map(Number);
  const doseTimeToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);
  const isLate = dose.status === 'pending' && now > doseTimeToday && !snoozedUntil;
  const isSnoozed = !!snoozedUntil && now.getTime() < snoozedUntil;
  const isTaken = dose.status === 'taken';

  let badge = null;
  if (isTaken) {
    badge = <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-green-100 text-green-700">Tomado</span>;
  } else if (isLate) {
    badge = <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-red-100 text-red-600 flex items-center gap-1"><BellAlertIcon className="w-3 h-3" />Atrasado</span>;
  } else if (isSnoozed) {
    const remaining = Math.ceil((snoozedUntil! - now.getTime()) / 60000);
    badge = <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-yellow-100 text-yellow-700 flex items-center gap-1"><ClockIcon className="w-3 h-3" />~{remaining} min</span>;
  }

  return (
    <div className={`bg-white rounded-xl border flex flex-col justify-between transition-all hover:shadow-md
      ${isLate ? 'border-red-200 shadow-red-50' : isTaken ? 'border-slate-100 opacity-70' : 'border-slate-200'}
    `}>
      <div className="p-5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className={`font-bold text-lg ${isTaken ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
              {dose.medication.name}
            </p>
            <p className="text-sm text-slate-500 mt-0.5">{dose.medication.dosage}</p>
            {dose.medication.notes && (
              <p className="text-xs text-slate-400 mt-1 italic">{dose.medication.notes}</p>
            )}
          </div>
          {badge}
        </div>
      </div>

      <div className={`px-5 py-3 rounded-b-xl flex items-center justify-between border-t
        ${isLate ? 'bg-red-50/40 border-red-100' : isTaken ? 'bg-slate-50 border-slate-100' : 'bg-slate-50/60 border-slate-100'}
      `}>
        <div className="flex items-center gap-2">
          {isTaken
            ? <CheckIcon className="w-5 h-5 text-green-500" />
            : <ClockIcon className="w-5 h-5 text-slate-400" />
          }
          <span className={`font-bold text-xl tabular-nums ${isTaken ? 'text-slate-400' : 'text-slate-700'}`}>
            {dose.time}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEditDose(dose.medication)}
            className="text-xs font-medium text-slate-500 hover:text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
          >
            Editar
          </button>
          {!isTaken && (
            <button
              onClick={() => onTakeDose(dose.medication, dose.time)}
              className="text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 px-4 py-1.5 rounded-lg shadow-sm transition-colors"
            >
              Tomar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// --- Dashboard Principal --- //

interface MedicationDashboardProps {
  todaysDoses: Dose[];
  onTakeDose: (med: Medication, time: string) => void;
  onEditDose: (med: Medication) => void;
  snoozedAlerts: Map<string, number>;
  sortType: SortType;
  onSortChange: (s: SortType) => void;
}

const MedicationDashboard: React.FC<MedicationDashboardProps> = ({
  todaysDoses, onTakeDose, onEditDose, snoozedAlerts, sortType, onSortChange,
}) => {
  const [, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick(n => n + 1), 10000);
    return () => clearInterval(t);
  }, []);

  const taken = todaysDoses.filter(d => d.status === 'taken').length;
  const pending = todaysDoses.filter(d => d.status === 'pending').length;

  const sortedDoses = useMemo(() => {
    const pendingDoses = todaysDoses.filter(d => d.status === 'pending');
    const takenDoses = todaysDoses.filter(d => d.status === 'taken').sort((a, b) => b.time.localeCompare(a.time));
    if (sortType === 'status') {
      pendingDoses.sort((a, b) => {
        const diff = getDosePriority(a, snoozedAlerts) - getDosePriority(b, snoozedAlerts);
        return diff !== 0 ? diff : a.time.localeCompare(b.time);
      });
    } else {
      pendingDoses.sort((a, b) => a.time.localeCompare(b.time));
    }
    return [...pendingDoses, ...takenDoses];
  }, [todaysDoses, sortType, snoozedAlerts]);

  if (todaysDoses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="bg-slate-100 p-6 rounded-full mb-4">
          <PillIcon className="w-12 h-12 text-slate-400" />
        </div>
        <h3 className="text-xl font-semibold text-slate-700">Nenhum medicamento hoje</h3>
        <p className="mt-1 text-slate-500 max-w-xs">Clique em "Novo Medicamento" na barra lateral para começar.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <p className="text-3xl font-bold text-slate-800">{todaysDoses.length}</p>
          <p className="text-sm text-slate-500 mt-1">Total hoje</p>
        </div>
        <div className="bg-white rounded-xl border border-green-200 p-4 text-center">
          <p className="text-3xl font-bold text-green-600">{taken}</p>
          <p className="text-sm text-slate-500 mt-1">Tomadas</p>
        </div>
        <div className={`rounded-xl border p-4 text-center ${pending > 0 ? 'bg-white border-blue-200' : 'bg-green-50 border-green-200'}`}>
          <p className={`text-3xl font-bold ${pending > 0 ? 'text-blue-600' : 'text-green-600'}`}>{pending}</p>
          <p className="text-sm text-slate-500 mt-1">Pendentes</p>
        </div>
      </div>

      {/* Lista */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-slate-700 text-lg">Doses de Hoje</h2>
          <div className="flex items-center bg-slate-100 rounded-full p-1">
            <button
              onClick={() => onSortChange('status')}
              className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors ${sortType === 'status' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}
            >
              Status
            </button>
            <button
              onClick={() => onSortChange('time')}
              className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors ${sortType === 'time' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}
            >
              Horário
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {sortedDoses.map(dose => (
            <DoseCard
              key={`${dose.medication.id}-${dose.time}`}
              dose={dose}
              onTakeDose={onTakeDose}
              onEditDose={onEditDose}
              snoozedAlerts={snoozedAlerts}
            />
          ))}
        </div>

        {pending === 0 && taken > 0 && (
          <div className="mt-6 text-center py-8 rounded-xl bg-green-50 border border-green-100">
            <CheckIcon className="w-10 h-10 mx-auto text-green-400" />
            <h3 className="mt-2 text-lg font-semibold text-green-800">Tudo certo por hoje!</h3>
            <p className="text-sm text-green-600 mt-1">Todas as doses foram tomadas.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicationDashboard;
