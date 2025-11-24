import React, { useState, useEffect } from 'react';
import { Medication, Schedule } from '../types';
import { getMedicationInfo } from '../services/geminiService';
import { TrashIcon, PlusIcon, PillIcon, XIcon } from './Icons';

interface MedicationFormProps {
  onSave: (medication: Omit<Medication, 'id' | 'profileId'>) => void;
  onCancel: () => void;
  onDelete?: (id: string) => void;
  initialMedication: Medication | null;
}

const MedicationForm: React.FC<MedicationFormProps> = ({ onSave, onCancel, onDelete, initialMedication }) => {
  const getTodayDateString = () => new Date().toISOString().split('T')[0];
  
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [schedule, setSchedule] = useState<Schedule>({ type: 'daily', times: ['08:00'] });
  const [startDate, setStartDate] = useState(getTodayDateString());
  const [duration, setDuration] = useState<'continuous' | number>('continuous');

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (initialMedication) {
      setName(initialMedication.name);
      setDosage(initialMedication.dosage);
      setSchedule(initialMedication.schedule);
      setStartDate(initialMedication.startDate);
      setDuration(initialMedication.duration);
    }
  }, [initialMedication]);

  const handleScheduleChange = (index: number, value: string) => {
    const newTimes = [...schedule.times];
    newTimes[index] = value;
    setSchedule(prev => ({ ...prev, times: newTimes }));
  };
  
  const addScheduleTime = () => {
    setSchedule(prev => ({ ...prev, times: [...prev.times, '20:00'] }));
  }
  
  const removeScheduleTime = (index: number) => {
     setSchedule(prev => ({ ...prev, times: schedule.times.filter((_, i) => i !== index) }));
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && dosage) {
      onSave({ name, dosage, schedule, startDate, duration });
    }
  };
  
  const handleDelete = () => {
    if (initialMedication && onDelete) {
        onDelete(initialMedication.id);
    }
    setShowDeleteConfirm(false);
  }

  return (
    <div className="h-full flex flex-col">
    <form id="medication-form" onSubmit={handleSubmit} className="space-y-6 flex-grow">
      <div className="text-center">
        <div className="inline-block bg-blue-100 text-blue-500 p-4 rounded-full">
            <PillIcon className="w-8 h-8"/>
        </div>
      </div>
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-slate-700">Nome do Medicamento</label>
        <div className="mt-1">
          <input type="text" name="name" id="name" placeholder="Ex: Losartana" value={name} onChange={e => setName(e.target.value)} className="block w-full bg-white text-slate-900 shadow-sm sm:text-sm border-slate-300 rounded-md py-3 px-4 focus:ring-blue-500 focus:border-blue-500" required />
        </div>
      </div>

      <div>
        <label htmlFor="dosage" className="block text-sm font-medium text-slate-700">Dosagem</label>
        <input type="text" name="dosage" id="dosage" placeholder="Ex: 50mg" value={dosage} onChange={e => setDosage(e.target.value)} className="mt-1 block w-full bg-white text-slate-900 shadow-sm sm:text-sm border-slate-300 rounded-md py-3 px-4 focus:ring-blue-500 focus:border-blue-500" required />
      </div>

      <div>
        <h3 className="text-sm font-medium text-slate-700">Horários</h3>
        <div className="mt-2 space-y-2">
          {schedule.times.map((time, index) => (
            <div key={index} className="flex items-center space-x-2">
              <input type="time" value={time} onChange={e => handleScheduleChange(index, e.target.value)} className="block w-full bg-white text-slate-900 shadow-sm sm:text-sm border-slate-300 rounded-md py-3 px-4 focus:ring-blue-500 focus:border-blue-500" />
              {schedule.times.length > 1 && (
                  <button type="button" onClick={() => removeScheduleTime(index)} className="p-2 rounded-full text-slate-400 hover:bg-red-100 hover:text-red-500">
                      <XIcon className="w-5 h-5" />
                  </button>
              )}
            </div>
          ))}
          <button type="button" onClick={addScheduleTime} className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 pt-2">
            <PlusIcon className="w-4 h-4 mr-1" />
            Adicionar Horário
          </button>
        </div>
      </div>
      
       <div>
        <label htmlFor="startDate" className="block text-sm font-medium text-slate-700">Início do Tratamento</label>
        <input type="date" name="startDate" id="startDate" value={startDate} onChange={e => setStartDate(e.target.value)} className="mt-1 block w-full bg-white text-slate-900 shadow-sm sm:text-sm border-slate-300 rounded-md py-3 px-4 focus:ring-blue-500 focus:border-blue-500" required />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">Duração do Tratamento</label>
        <div className="mt-2 space-y-2">
            <div className="flex items-center">
                <input id="duration-continuous" name="duration-type" type="radio" className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-slate-300" checked={duration === 'continuous'} onChange={() => setDuration('continuous')} />
                <label htmlFor="duration-continuous" className="ml-3 block text-sm font-medium text-slate-700">Contínuo (sem fim)</label>
            </div>
            <div className="flex items-center">
                 <input id="duration-days" name="duration-type" type="radio" className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-slate-300" checked={typeof duration === 'number'} onChange={() => setDuration(30)} />
                 <label htmlFor="duration-days" className="ml-3 block text-sm font-medium text-slate-700">Duração específica (dias)</label>
            </div>
            {typeof duration === 'number' && (
                <input type="number" value={duration} onChange={e => setDuration(parseInt(e.target.value, 10) || 1)} className="mt-1 block w-full bg-white text-slate-900 shadow-sm sm:text-sm border-slate-300 rounded-md py-3 px-4 focus:ring-blue-500 focus:border-blue-500" />
            )}
        </div>
      </div>

        <button type="submit" className="w-full inline-flex justify-center py-3 px-4 border border-transparent shadow-sm text-base font-medium rounded-lg text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
          {initialMedication ? 'Salvar Alterações' : 'Salvar Medicamento'}
        </button>
      </form>
      <div className="mt-8 space-y-3">
        <button type="button" onClick={onCancel} className="w-full text-center py-3 px-4 border border-slate-300 rounded-lg shadow-sm text-base font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
          Cancelar
        </button>
        {initialMedication && onDelete && (
          <button type="button" onClick={() => setShowDeleteConfirm(true)} className="w-full text-center py-2 px-4 text-sm font-medium text-red-600 hover:text-red-800">
            <TrashIcon className="w-4 h-4 inline mr-1" />
            Excluir Medicamento
          </button>
        )}
      </div>
      
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 m-4 max-w-sm w-full">
                <h3 className="text-lg font-bold">Excluir Medicamento?</h3>
                <p className="mt-2 text-sm text-slate-600">Tem certeza que deseja excluir {initialMedication?.name}? Esta ação não pode ser desfeita.</p>
                <div className="mt-6 flex justify-end space-x-3">
                    <button onClick={() => setShowDeleteConfirm(false)} className="bg-white py-2 px-4 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50">Cancelar</button>
                    <button onClick={handleDelete} className="bg-red-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-red-700">Excluir</button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
};

export default MedicationForm;