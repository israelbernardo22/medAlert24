import React, { useState, useMemo, useEffect } from 'react';
import { Medication, HistoryEntry, Profile, Dose } from './types';
import { useMedicationStore } from './hooks/useMedicationStore';
import { useAlerts } from './hooks/useAlerts';
import * as apiService from './src/services/apiService';
import Sidebar from './components/Sidebar';
import MedicationDashboard from './components/MedicationDashboard';
import MedicationForm from './components/MedicationForm';
import HistoryView from './components/HistoryView';
import AlertModal from './components/AlertModal';
import { PlusIcon, UserIcon, PillIcon, TrashIcon, MenuIcon, ArrowLeftIcon } from './components/Icons';

const getTodaysDoses = (medications: Medication[], history: HistoryEntry[]): Dose[] => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayStr = today.toISOString().split('T')[0];
  const dayOfWeek = today.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  const doses: Dose[] = [];

  medications.forEach(med => {
    if (!med?.schedule?.times) return;
    if (med.duration?.type === 'days' && med.startDate) {
      const start = new Date(med.startDate); start.setHours(0, 0, 0, 0);
      const end = new Date(start); end.setDate(start.getDate() + med.duration.value - 1);
      if (today < start || today > end) return;
    }

    let active = false;
    switch (med.schedule.type) {
      case 'every_day': active = true; break;
      case 'specific_days': active = !!med.schedule.days?.includes(dayOfWeek); break;
      case 'on_off':
        if (med.startDate && med.schedule.onDays && med.schedule.offDays) {
          const start = new Date(med.startDate); start.setHours(0, 0, 0, 0);
          const diff = Math.floor((today.getTime() - start.getTime()) / 86400000);
          if (diff >= 0) {
            const cycle = med.schedule.onDays + med.schedule.offDays;
            active = (diff % cycle) < med.schedule.onDays;
          }
        }
        break;
    }
    if (!active) return;

    med.schedule.times.forEach(doseTime => {
      const taken = history.find(h => h.medicationId === med.id && h.scheduledTime === doseTime && h.date === todayStr);
      doses.push({ medication: med, time: doseTime, status: taken ? 'taken' : 'pending' });
    });
  });

  return doses.sort((a, b) => a.time.localeCompare(b.time));
};

// --- Auth Screen --- //
type AuthMode = 'login' | 'signup';

const AuthScreen: React.FC<{
  onLogin: (email: string, password: string) => Promise<void>;
  onSignUp: (name: string, email: string, password: string) => Promise<void>;
}> = ({ onLogin, onSignUp }) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      if (mode === 'login') await onLogin(email, password);
      else await onSignUp(name, email, password);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Erro ao conectar. Verifique sua conexão.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center bg-blue-600 p-4 rounded-2xl shadow-lg mb-4">
            <PillIcon className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800">MedAlert</h1>
          <p className="text-slate-500 mt-1">Gestão inteligente de medicamentos</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-xl font-bold text-slate-800 mb-6 text-center">
            {mode === 'login' ? 'Entrar na sua conta' : 'Criar nova conta'}
          </h2>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nome completo</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} required
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Senha</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg shadow-sm transition-colors disabled:opacity-60 mt-2">
              {loading ? 'Aguarde...' : mode === 'login' ? 'Entrar' : 'Criar conta'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}
              className="text-sm text-blue-600 hover:underline font-medium">
              {mode === 'login' ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Entre aqui'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Modal Adicionar Perfil --- //
const AddProfileModal: React.FC<{ onClose: () => void; onSave: (name: string, relation: string) => void }> = ({ onClose, onSave }) => {
  const [name, setName] = useState('');
  const [relation, setRelation] = useState('');
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Novo Perfil</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nome</label>
            <input type="text" placeholder="Ex: Vovó Ana" value={name} onChange={e => setName(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 focus:outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Relação</label>
            <input type="text" placeholder="Ex: Avó, Filho, Paciente" value={relation} onChange={e => setRelation(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 focus:outline-none focus:border-blue-500" />
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">Cancelar</button>
          <button onClick={() => { if (name && relation) onSave(name, relation); }}
            className="px-4 py-2 bg-blue-600 rounded-lg text-sm font-medium text-white hover:bg-blue-700">Salvar</button>
        </div>
      </div>
    </div>
  );
};

// --- Tela de Seleção de Perfis --- //
const ProfileGrid: React.FC<{
  profiles: Profile[];
  allMedications: Medication[];
  onSelect: (id: number) => void;
  onAdd: () => void;
  onDelete: (id: number) => void;
}> = ({ profiles, allMedications, onSelect, onAdd, onDelete }) => (
  <div>
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-slate-800">Selecione um Perfil</h1>
      <p className="mt-1 text-slate-500">Escolha para quem deseja gerenciar os medicamentos.</p>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {profiles.map(p => {
        const medCount = allMedications.filter(m => m.profileId === p.id).length;
        return (
          <div key={p.id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col">
            <div className="p-6 flex-1">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-blue-100 p-3 rounded-xl">
                  <UserIcon className="w-7 h-7 text-blue-600" />
                </div>
                <button onClick={() => onDelete(p.id)} className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-colors">
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
              <h3 className="text-xl font-bold text-slate-800">{p.name}</h3>
              <p className="text-sm text-slate-500 mt-1">{p.relation}</p>
              <p className="text-sm font-semibold text-blue-600 mt-2">{medCount} medicamento{medCount !== 1 ? 's' : ''}</p>
            </div>
            <div className="px-6 pb-6">
              <button onClick={() => onSelect(p.id)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors">
                Acessar perfil
              </button>
            </div>
          </div>
        );
      })}

      <button onClick={onAdd}
        className="bg-white rounded-xl border-2 border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50/50 transition-all p-6 flex flex-col items-center justify-center min-h-[200px] gap-3">
        <div className="bg-slate-100 p-3 rounded-xl">
          <PlusIcon className="w-7 h-7 text-slate-400" />
        </div>
        <span className="font-semibold text-slate-600">Novo perfil</span>
      </button>
    </div>
  </div>
);

// --- App Principal --- //
export type SortType = 'status' | 'time';
type View = 'dashboard' | 'add' | 'edit' | 'history';

const App: React.FC = () => {
  const {
    medications, addMedication, updateMedication, removeMedication,
    history, addHistoryEntry,
    profiles, addProfile, removeProfile,
    currentProfileId, setCurrentProfileId,
    loadFromApi,
  } = useMedicationStore();

  const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem('token'));
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null);
  const [isAddingProfile, setIsAddingProfile] = useState(false);
  const [sortType, setSortType] = useState<SortType>('status');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated) loadFromApi().catch(console.error);
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && currentProfileId && !profiles.some(p => p.id === currentProfileId)) {
      setCurrentProfileId(null);
    }
  }, [profiles, currentProfileId, isAuthenticated]);

  const currentProfile = useMemo(() => profiles.find(p => p.id === currentProfileId), [profiles, currentProfileId]);
  const medsForProfile = useMemo(() => medications.filter(m => m.profileId === currentProfileId), [medications, currentProfileId]);
  const historyForProfile = useMemo(() => history.filter(h => medsForProfile.some(m => m.id === h.medicationId)), [history, medsForProfile]);
  const todaysDoses = useMemo(() => getTodaysDoses(medsForProfile, historyForProfile), [medsForProfile, historyForProfile]);
  const { alert, clearAlert, snoozeAlert, snoozedAlerts } = useAlerts(todaysDoses);

  const handleLogin = async (email: string, password: string) => {
    const result = await apiService.login({ email, password });
    localStorage.setItem('token', result.token);
    setIsAuthenticated(true);
  };

  const handleSignUp = async (name: string, email: string, password: string) => {
    const result = await apiService.register({ name, email, password });
    localStorage.setItem('token', result.token);
    const newProfile = await addProfile({ name, relation: 'Titular' });
    setCurrentProfileId(newProfile.id);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    ['token', 'medications', 'history', 'profiles', 'currentProfileId'].forEach(k => localStorage.removeItem(k));
    setCurrentProfileId(null);
    setIsAuthenticated(false);
  };

  const handleSelectProfile = (id: number) => { setCurrentProfileId(id); setCurrentView('dashboard'); };

  const handleTakeDose = (med: Medication, scheduledTime: string) => addHistoryEntry(med.id, scheduledTime, 'taken');

  const handleSaveMedication = async (med: Omit<Medication, 'id' | 'history' | 'profileId'>) => {
    if (editingMedication) await updateMedication({ ...editingMedication, ...med });
    else await addMedication(med);
    setEditingMedication(null);
    setCurrentView('dashboard');
  };

  const handleDeleteMedication = (id: number) => {
    if (window.confirm('Excluir este medicamento?')) {
      removeMedication(id);
      setCurrentView('dashboard');
      setEditingMedication(null);
    }
  };

  const handleAddProfileSubmit = async (name: string, relation: string) => {
    const newProfile = await addProfile({ name, relation });
    setIsAddingProfile(false);
    setCurrentProfileId(newProfile.id);
  };

  const handleDeleteProfile = (id: number) => {
    const name = profiles.find(p => p.id === id)?.name || 'este perfil';
    if (window.confirm(`Remover ${name}?`)) removeProfile(id);
  };

  if (!isAuthenticated) {
    return <AuthScreen onLogin={handleLogin} onSignUp={handleSignUp} />;
  }

  const pageTitle = !currentProfileId
    ? 'Perfis'
    : currentView === 'dashboard' ? `Painel — ${currentProfile?.name}`
    : currentView === 'history' ? 'Histórico de Doses'
    : currentView === 'add' ? 'Novo Medicamento'
    : 'Editar Medicamento';

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      <Sidebar
        profiles={profiles}
        allMedications={medications}
        currentProfileId={currentProfileId}
        currentView={currentView}
        isOpen={sidebarOpen}
        onSelectProfile={handleSelectProfile}
        onAddProfile={() => setIsAddingProfile(true)}
        onNavigate={v => { setCurrentView(v); setEditingMedication(null); }}
        onLogout={handleLogout}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Área principal */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-slate-200 h-16 flex items-center px-4 md:px-6 flex-shrink-0 gap-3">
          <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-600">
            <MenuIcon className="w-5 h-5" />
          </button>

          {/* Breadcrumb / voltar */}
          {currentProfileId && (currentView === 'add' || currentView === 'edit' || currentView === 'history') && (
            <button onClick={() => { setCurrentView('dashboard'); setEditingMedication(null); }}
              className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 text-sm font-medium transition-colors">
              <ArrowLeftIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Voltar</span>
            </button>
          )}

          <h1 className="font-semibold text-slate-800 text-base flex-1 truncate">{pageTitle}</h1>

          {/* Ação principal */}
          {currentProfileId && currentView === 'dashboard' && (
            <button onClick={() => setCurrentView('add')}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg shadow-sm transition-colors">
              <PlusIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Adicionar</span>
            </button>
          )}

          {/* Data */}
          <span className="hidden lg:block text-sm text-slate-400">
            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </span>
        </header>

        {/* Conteúdo */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {!currentProfileId ? (
            <ProfileGrid
              profiles={profiles}
              allMedications={medications}
              onSelect={handleSelectProfile}
              onAdd={() => setIsAddingProfile(true)}
              onDelete={handleDeleteProfile}
            />
          ) : (
            <>
              {currentView === 'dashboard' && (
                <MedicationDashboard
                  todaysDoses={todaysDoses}
                  onTakeDose={handleTakeDose}
                  onEditDose={med => { setEditingMedication(med); setCurrentView('edit'); }}
                  snoozedAlerts={snoozedAlerts}
                  sortType={sortType}
                  onSortChange={setSortType}
                />
              )}
              {(currentView === 'add' || currentView === 'edit') && (
                <MedicationForm
                  onSave={handleSaveMedication}
                  onCancel={() => { setEditingMedication(null); setCurrentView('dashboard'); }}
                  onDelete={editingMedication ? handleDeleteMedication : undefined}
                  initialMedication={editingMedication}
                />
              )}
              {currentView === 'history' && (
                <HistoryView history={historyForProfile} medications={medsForProfile} />
              )}
            </>
          )}
        </main>
      </div>

      {alert && (
        <AlertModal
          medication={alert.medication}
          doseTime={alert.doseTime}
          onTake={() => { handleTakeDose(alert.medication, alert.doseTime); clearAlert(); }}
          onSnooze={snoozeAlert}
        />
      )}
      {isAddingProfile && (
        <AddProfileModal onClose={() => setIsAddingProfile(false)} onSave={handleAddProfileSubmit} />
      )}
    </div>
  );
};

export default App;
