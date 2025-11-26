import React from 'react';
import { PillIcon, HistoryIcon, ArrowLeftIcon } from './Icons';

type View = 'dashboard' | 'add' | 'edit' | 'history';

interface HeaderProps {
  title: string;
  profileName?: string; 
  showBackArrow: boolean; 
  onBack: () => void;
  
  currentView: View;
  onNavigate: (view: View) => void;
}

const Header: React.FC<HeaderProps> = ({ title, profileName, showBackArrow, onBack, currentView, onNavigate }) => {
  const isDashboard = currentView === 'dashboard';
  const isHistory = currentView === 'history';

  // O título principal é o nome do perfil no dashboard, ou o título da tela atual.
  const finalTitle = currentView === 'dashboard' ? (profileName || title) : title;

  return (
    <header className="bg-white p-4 sticky top-0 z-10 shadow-sm flex-shrink-0">
      <div className="flex items-center justify-between">
        <div className="w-14">
          {showBackArrow && (
            <button onClick={onBack} className="p-2 rounded-full hover:bg-slate-100 text-slate-600">
              <ArrowLeftIcon className="w-6 h-6" />
            </button>
          )}
        </div>
        
        <h1 className="text-lg font-bold text-slate-800 truncate px-2 text-center">{finalTitle}</h1>

        <div className="w-14 flex items-center justify-end">
            {/* Mostra os ícones de navegação apenas se estivermos em um perfil */}
            {profileName && (
                <div className="flex items-center bg-slate-100 rounded-full">
                    <button onClick={() => onNavigate('dashboard')} title="Painel" className={`p-2 rounded-full text-sm ${isDashboard ? "text-blue-600" : "text-slate-500"}`}>
                        <PillIcon className="w-5 h-5" />
                    </button>
                    <button onClick={() => onNavigate('history')} title="Histórico" className={`p-2 rounded-full text-sm ${isHistory ? "text-blue-600" : "text-slate-500"}`}>
                        <HistoryIcon className="w-5 h-5" />
                    </button>
                </div>
            )}
        </div>
      </div>
    </header>
  );
};

export default Header;
