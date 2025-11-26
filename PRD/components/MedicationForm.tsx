import React, { useState, useEffect } from 'react';
import { Medication, Schedule } from '../types';
import { TrashIcon, PlusIcon, ClockIcon } from './Icons';

interface MedicationFormProps {
  initialMedication?: Medication | null;
  onSave: (medication: Omit<Medication, 'id' | 'history' | 'profileId'>) => void;
  onCancel: () => void;
  onDelete?: (id: number) => void;
}

// A função onSave espera um objeto que inclua `doses`, não `schedule`.
// Esta função converte o estado do formulário para o formato correto.
const MedicationForm: React.FC<MedicationFormProps> = ({ initialMedication, onSave, onCancel, onDelete }) => {
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  // O estado interno do formulário ainda usa `schedule` para gerenciar a UI.
  const [schedule, setSchedule] = useState<Schedule>({ type: 'every_day', times: ['08:00'], days: [] });
  const [duration, setDuration] = useState<{ type: 'continuous' | 'days', value: number }>({ type: 'continuous', value: 0 });
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (initialMedication) {
      setName(initialMedication.name);
      setDosage(initialMedication.dosage);
      // Ao carregar um medicamento, garanta que `schedule` seja populado corretamente
      setSchedule(initialMedication.schedule || { type: 'every_day', times: initialMedication.doses || ['08:00'], days: [] });
      setDuration(initialMedication.duration || { type: 'continuous', value: 0 });
      setNotes(initialMedication.notes || '');
    } else {
      // Reset para um novo medicamento
      setName('');
      setDosage('');
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

  const addTime = () => {
    setSchedule({ ...schedule, times: [...schedule.times, '20:00'] });
  };

  const removeTime = (index: number) => {
    const newTimes = schedule.times.filter((_, i) => i !== index);
    setSchedule({ ...schedule, times: newTimes });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !dosage) return;
    
    // CORREÇÃO DEFINITIVA:
    // Cria o objeto `doses` a partir do estado `schedule.times` antes de salvar.
    const medicationToSave = {
      name,
      dosage,
      schedule, // Mantém a estrutura de agendamento para consistência
      doses: schedule.times, // **ESSA É A PROPRIEDADE QUE FALTAVA**
      notes,
      duration,
      info: '', 
    };
    
    onSave(medicationToSave);
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-6 bg-white h-full flex flex-col">
      <div className="flex-grow space-y-6 overflow-y-auto pr-2">
        <h2 className="text-2xl font-bold text-slate-800">{initialMedication ? 'Editar' : 'Adicionar'} Medicamento</h2>

        <div>
            <label htmlFor="med-name" className="block text-sm font-medium text-slate-700">Nome do Medicamento</label>
            <input
                id="med-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Paracetamol"
                className="mt-1 block w-full shadow-sm sm:text-sm border-slate-300 rounded-md"
                required
            />
        </div>

        <div>
            <label htmlFor="med-dosage" className="block text-sm font-medium text-slate-700">Dosagem</label>
            <input
                id="med-dosage"
                type="text"
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
                placeholder="Ex: 750mg, 1 comprimido, 10 gotas"
                className="mt-1 block w-full shadow-sm sm:text-sm border-slate-300 rounded-md"
                required
            />
        </div>

        <div className="space-y-4 rounded-md border border-slate-200 p-4">
          <h3 className="text-lg font-medium text-slate-800">Frequência e Horários</h3>
          {schedule.times.map((time, index) => (
            <div key={index} className="flex items-center space-x-2">
              <ClockIcon className="w-5 h-5 text-slate-400"/>
              <input
                type="time"
                value={time}
                onChange={(e) => handleTimeChange(index, e.target.value)}
                className="block w-full shadow-sm sm:text-sm border-slate-300 rounded-md"
                required
              />
              {schedule.times.length > 1 && (
                <button type="button" onClick={() => removeTime(index)} className="text-red-500 hover:text-red-700">
                  <TrashIcon className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={addTime} className="flex items-center space-x-2 text-sm font-medium text-blue-600 hover:text-blue-800">
            <PlusIcon className="w-4 h-4" />
            <span>Adicionar horário</span>
          </button>
        </div>

        <div className="space-y-4 rounded-md border border-slate-200 p-4">
            <h3 className="text-lg font-medium text-slate-800">Duração do Tratamento</h3>
            <div className="flex items-center space-x-4">
                <div className="flex items-center">
                    <input
                        id="duration-continuous"
                        type="radio"
                        name="duration-type"
                        checked={duration.type === 'continuous'}
                        onChange={() => setDuration({ type: 'continuous', value: 0 })}
                        className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-slate-300"
                    />
                    <label htmlFor="duration-continuous" className="ml-2 block text-sm text-slate-900">
                        Uso contínuo
                    </label>
                </div>
                <div className="flex items-center">
                    <input
                        id="duration-days"
                        type="radio"
                        name="duration-type"
                        checked={duration.type === 'days'}
                        onChange={() => setDuration({ type: 'days', value: 7 })}
                        className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-slate-300"
                    />
                     <label htmlFor="duration-days" className="ml-2 block text-sm text-slate-900">
                        Por um período
                    </label>
                </div>
            </div>
             {duration.type === 'days' && (
                <div className="flex items-center space-x-2 mt-2">
                    <input
                        type="number"
                        value={duration.value}
                        onChange={(e) => setDuration({ ...duration, value: parseInt(e.target.value, 10) || 0 })}
                        className="w-24 shadow-sm sm:text-sm border-slate-300 rounded-md"
                        min="1"
                    />
                    <span>dias</span>
                </div>
            )}
        </div>

        <div>
            <label htmlFor="med-notes" className="block text-sm font-medium text-slate-700">Notas Adicionais</label>
            <textarea
                id="med-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ex: Tomar com comida, não tomar com leite..."
                rows={3}
                className="mt-1 block w-full shadow-sm sm:text-sm border-slate-300 rounded-md"
            />
        </div>
      </div>

      <div className="flex-shrink-0 pt-4 border-t border-slate-200 flex items-center justify-between">
        <div>
            {onDelete && initialMedication && (
            <button type="button" onClick={() => onDelete(initialMedication.id)} className="text-red-600 hover:text-red-800 font-medium py-2 px-4 rounded-md">
                Excluir
            </button>
            )}
        </div>
        <div className="space-x-3">
            <button type="button" onClick={onCancel} className="bg-white py-2 px-4 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50">
            Cancelar
            </button>
            <button type="submit" className="bg-blue-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700">
            Salvar
            </button>
        </div>
      </div>
    </form>
  );
};

export default MedicationForm;
