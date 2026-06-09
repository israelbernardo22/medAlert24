import React, { useState, useEffect } from 'react';
import { Medication, Schedule } from '../types';
import { TrashIcon, PlusIcon, ClockIcon } from './Icons';

interface MedicationFormProps {
  initialMedication?: Medication | null;
  onSave: (medication: Omit<Medication, 'id' | 'history' | 'profileId'>) => void;
  onCancel: () => void;
  onDelete?: (id: number) => void;
}

const MedicationForm: React.FC<MedicationFormProps> = ({ initialMedication, onSave, onCancel, onDelete }) => {
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [schedule, setSchedule] = useState<Schedule>({ type: 'every_day', times: ['08:00'], days: [] });
  const [duration, setDuration] = useState<{ type: 'continuous' | 'days'; value: number }>({ type: 'continuous', value: 0 });
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (initialMedication) {
      setName(initialMedication.name);
      setDosage(initialMedication.dosage);
      setSchedule(initialMedication.schedule || { type: 'every_day', times: initialMedication.doses || ['08:00'], days: [] });
      setDuration(initialMedication.duration || { type: 'continuous', value: 0 });
      setNotes(initialMedication.notes || '');
    } else {
      setName(''); setDosage('');
      setSchedule({ type: 'every_day', times: ['08:00'], days: [] });
      setDuration({ type: 'continuous', value: 0 });
      setNotes('');
    }
  }, [initialMedication]);

  const handleTimeChange = (index: number, value: string) => {
    const newTimes = [...schedule.times];
    newTimes[index] = value;
    setSchedule({ ...schedule, times: newTimes });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !dosage) return;
    onSave({ name, dosage, schedule, doses: schedule.times, notes, duration, info: '' });
  };

  const inputClass = "mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500";
  const labelClass = "block text-sm font-medium text-slate-700";

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Nome + Dosagem */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className={labelClass}>Nome do Medicamento</label>
            <input
              type="text" value={name} onChange={e => setName(e.target.value)}
              placeholder="Ex: Paracetamol" className={inputClass} required
            />
          </div>
          <div>
            <label className={labelClass}>Dosagem</label>
            <input
              type="text" value={dosage} onChange={e => setDosage(e.target.value)}
              placeholder="Ex: 750mg, 1 comprimido" className={inputClass} required
            />
          </div>
        </div>

        {/* Horários */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-base font-semibold text-slate-800 mb-4">Horários de Dose</h3>
          <div className="space-y-3">
            {schedule.times.map((time, index) => (
              <div key={index} className="flex items-center gap-3">
                <ClockIcon className="w-5 h-5 text-slate-400 flex-shrink-0" />
                <input
                  type="time" value={time} onChange={e => handleTimeChange(index, e.target.value)}
                  className={inputClass} required
                />
                {schedule.times.length > 1 && (
                  <button type="button"
                    onClick={() => setSchedule({ ...schedule, times: schedule.times.filter((_, i) => i !== index) })}
                    className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            <button type="button"
              onClick={() => setSchedule({ ...schedule, times: [...schedule.times, '20:00'] })}
              className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 mt-1"
            >
              <PlusIcon className="w-4 h-4" />
              Adicionar horário
            </button>
          </div>
        </div>

        {/* Duração */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-base font-semibold text-slate-800 mb-4">Duração do Tratamento</h3>
          <div className="flex gap-6">
            {(['continuous', 'days'] as const).map(type => (
              <label key={type} className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="duration-type" checked={duration.type === type}
                  onChange={() => setDuration({ type, value: type === 'days' ? 7 : 0 })}
                  className="h-4 w-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-700">
                  {type === 'continuous' ? 'Uso contínuo' : 'Por um período'}
                </span>
              </label>
            ))}
          </div>
          {duration.type === 'days' && (
            <div className="flex items-center gap-3 mt-4">
              <input type="number" value={duration.value} min="1"
                onChange={e => setDuration({ ...duration, value: parseInt(e.target.value, 10) || 1 })}
                className="w-24 rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
              />
              <span className="text-sm text-slate-600">dias</span>
            </div>
          )}
        </div>

        {/* Notas */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <label className={labelClass}>Notas Adicionais <span className="text-slate-400 font-normal">(opcional)</span></label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
            placeholder="Ex: Tomar com comida, não tomar com leite..."
            className={`${inputClass} resize-none`}
          />
        </div>

        {/* Ações */}
        <div className="flex items-center justify-between pb-4">
          <div>
            {onDelete && initialMedication && (
              <button type="button"
                onClick={() => onDelete(initialMedication.id)}
                className="flex items-center gap-2 text-red-600 hover:text-red-700 font-medium text-sm px-4 py-2 rounded-lg hover:bg-red-50 transition-colors"
              >
                <TrashIcon className="w-4 h-4" />
                Excluir medicamento
              </button>
            )}
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onCancel}
              className="px-5 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button type="submit"
              className="px-5 py-2 bg-blue-600 rounded-lg text-sm font-medium text-white hover:bg-blue-700 shadow-sm transition-colors"
            >
              Salvar Medicamento
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default MedicationForm;
