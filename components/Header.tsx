import React from 'react';
import { PillIcon, HistoryIcon, ArrowLeftIcon, UserIcon } from './Icons';

type View = 'dashboard' | 'add' | 'edit' | 'history' | 'profiles';

interface HeaderProps {
  currentView: View;
  onNavigate: (view: View) => void;
  onBack: () => void;
  showBackToProfiles: boolean;
}

const Header: React.FC<HeaderProps> = ({ currentView, onNavigate, onBack, showBackToProfiles }) => {
  const isDashboard = currentView === 'dashboard';
  const isHistory = currentView === 'history';

  let title = "Painel";
  if (currentView === 'add') title = "Adicionar Medicamento";
  if (currentView === 'edit') title = "Editar Medicamento";
  if (currentView === 'history') title = "Histórico de Doses";

  return (
    <header className="bg-white p-4 sticky top-0 z-10 shadow-sm">
      <div className="flex items-center justify-between">
        {(currentView === 'add' || currentView === 'edit') ? (
            <button onClick={onBack} className="p-2 rounded-full hover:bg-slate-100 text-slate-600">
              <ArrowLeftIcon className="w-6 h-6" />
            </button>
        ) : showBackToProfiles ? (
            <button onClick={onBack} className="p-2 rounded-full hover:bg-slate-100 text-slate-600">
              <UserIcon className="w-6 h-6" />
            </button>
        ) : <div className="w-10"></div>} 
        
        <h1 className="text-xl font-bold text-slate-800">{title}</h1>

        <div className="flex items-center space-x-2">
            <button onClick={() => onNavigate('dashboard')} className={`p-2 rounded-full ${isDashboard ? "text-blue-500 bg-blue-100/50" : "text-slate-600 hover:bg-slate-100"}`}>
              <PillIcon className="w-6 h-6" />
            </button>
            <button onClick={() => onNavigate('history')} className={`p-2 rounded-full ${isHistory ? "text-blue-500 bg-blue-100/50" : "text-slate-600 hover:bg-slate-100"}`}>
              <HistoryIcon className="w-6 h-6" />
            </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
