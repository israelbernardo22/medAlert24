
import React from 'react';
import { UserIcon, HistoryIcon, ArrowLeftIcon, ClockIcon } from './Icons';

type View = 'dashboard' | 'add' | 'edit' | 'history' | 'profiles';

interface HeaderProps {
  currentView: View;
  onNavigate: (view: View) => void;
  onBack: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, onNavigate, onBack }) => {
  
  const getTitle = () => {
    switch (currentView) {
      case 'add': return 'Novo Medicamento';
      case 'edit': return 'Editar Medicamento';
      case 'history': return 'Histórico';
      case 'profiles': return 'Perfis';
      default: return 'MedAlert';
    }
  };

  const isDashboard = currentView === 'dashboard';
  const isSubPage = ['add', 'edit', 'history', 'profiles'].includes(currentView);

  return (
    <header className="bg-white sticky top-0 z-10 shadow-sm">
      <div className="max-w-md mx-auto p-4">
        {isDashboard && (
          <div className="flex justify-between items-center">
             <div className="flex items-center space-x-2">
                <div className="bg-blue-500 text-white p-2 rounded-full">
                    <ClockIcon className="w-6 h-6"/>
                </div>
                <h1 className="text-2xl font-bold text-slate-800">{getTitle()}</h1>
             </div>
             <div className="flex items-center space-x-2">
                <button onClick={() => onNavigate('profiles')} className="p-2 rounded-full hover:bg-slate-100 text-slate-600">
                    <UserIcon className="w-6 h-6"/>
                </button>
                 <button onClick={() => onNavigate('history')} className="p-2 rounded-full hover:bg-slate-100 text-slate-600">
                    <HistoryIcon className="w-6 h-6"/>
                </button>
             </div>
          </div>
        )}
        {isSubPage && (
            <div className="flex items-center space-x-4">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-slate-100 text-slate-600">
                    <ArrowLeftIcon className="w-6 h-6" />
                </button>
                <h1 className="text-xl font-bold text-slate-800">{getTitle()}</h1>
            </div>
        )}
      </div>
    </header>
  );
};

export default Header;
