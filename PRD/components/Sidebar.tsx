import React from 'react';
import { Medication, Profile } from '../types';
import { PillIcon, HistoryIcon, UserIcon, LogoutIcon, PlusIcon, XIcon } from './Icons';

type View = 'dashboard' | 'add' | 'edit' | 'history';

interface SidebarProps {
  profiles: Profile[];
  allMedications: Medication[];
  currentProfileId: number | null;
  currentView: View;
  isOpen: boolean;
  onSelectProfile: (id: number) => void;
  onAddProfile: () => void;
  onNavigate: (view: View) => void;
  onLogout: () => void;
  onClose: () => void;
}

const NavItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}> = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
      active ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
    }`}
  >
    {icon}
    <span className="text-sm font-medium">{label}</span>
  </button>
);

const Sidebar: React.FC<SidebarProps> = ({
  profiles, allMedications, currentProfileId, currentView,
  isOpen, onSelectProfile, onAddProfile, onNavigate, onLogout, onClose,
}) => {
  return (
    <>
      {/* Overlay mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 md:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-slate-200 flex flex-col
        transition-transform duration-200 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:static md:z-auto
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center space-x-2">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <PillIcon className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-800">MedAlert</span>
          </div>
          <button onClick={onClose} className="md:hidden p-1 rounded-full hover:bg-slate-100">
            <XIcon className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
          {/* Navegação (só quando perfil selecionado) */}
          {currentProfileId && (
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">Menu</p>
              <nav className="space-y-1">
                <NavItem
                  icon={<PillIcon className="w-5 h-5" />}
                  label="Painel"
                  active={currentView === 'dashboard'}
                  onClick={() => { onNavigate('dashboard'); onClose(); }}
                />
                <NavItem
                  icon={<HistoryIcon className="w-5 h-5" />}
                  label="Histórico"
                  active={currentView === 'history'}
                  onClick={() => { onNavigate('history'); onClose(); }}
                />
                <NavItem
                  icon={<PlusIcon className="w-5 h-5" />}
                  label="Novo Medicamento"
                  active={currentView === 'add'}
                  onClick={() => { onNavigate('add'); onClose(); }}
                />
              </nav>
            </div>
          )}

          {/* Perfis */}
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">Perfis</p>
            <div className="space-y-1">
              {profiles.map(p => {
                const medCount = allMedications.filter(m => m.profileId === p.id).length;
                const isActive = p.id === currentProfileId;
                return (
                  <button
                    key={p.id}
                    onClick={() => { onSelectProfile(p.id); onClose(); }}
                    className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                      isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`p-1.5 rounded-full flex-shrink-0 ${isActive ? 'bg-blue-100' : 'bg-slate-100'}`}>
                      <UserIcon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">{p.name}</p>
                      <p className="text-xs text-slate-400">{p.relation} · {medCount} med.</p>
                    </div>
                  </button>
                );
              })}
              <button
                onClick={() => { onAddProfile(); onClose(); }}
                className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-slate-500 hover:bg-slate-50 transition-colors border-2 border-dashed border-slate-200 hover:border-blue-300 mt-2"
              >
                <PlusIcon className="w-4 h-4" />
                <span className="text-sm">Novo perfil</span>
              </button>
            </div>
          </div>
        </div>

        {/* Logout */}
        <div className="p-3 border-t border-slate-100 flex-shrink-0">
          <button
            onClick={onLogout}
            className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogoutIcon className="w-5 h-5" />
            <span className="text-sm font-medium">Sair da conta</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
