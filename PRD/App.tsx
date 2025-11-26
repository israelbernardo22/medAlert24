import React, { useState, useMemo, useEffect } from 'react';
import { Medication, HistoryEntry, Profile, Dose } from './types';
import { useMedicationStore } from './hooks/useMedicationStore';
import { useAlerts } from './hooks/useAlerts';
import Header from './components/Header';
import MedicationDashboard from './components/MedicationDashboard';
import MedicationForm from './components/MedicationForm';
import HistoryView from './components/HistoryView';
import AlertModal from './components/AlertModal';
import { PlusIcon, UserIcon, PillIcon, LogoutIcon, TrashIcon } from './components/Icons';

// Ordena as doses por horário por padrão
const getTodaysDoses = (medications: Medication[], history: HistoryEntry[]): Dose[] => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayStr = today.toISOString().split('T')[0];
    const dayOfWeek = today.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const doses: Dose[] = [];

    medications.forEach(med => {
        if (!med || !med.schedule || !med.schedule.times) return;
        if (med.duration?.type === 'days' && med.startDate) {
            const startDate = new Date(med.startDate);
            startDate.setHours(0, 0, 0, 0);
            const endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + med.duration.value - 1);
            if (today < startDate || today > endDate) return;
        }

        let isActiveToday = false;
        switch (med.schedule.type) {
            case 'every_day': isActiveToday = true; break;
            case 'specific_days': if (med.schedule.days?.includes(dayOfWeek)) isActiveToday = true; break;
            case 'on_off':
                if (med.startDate && med.schedule.onDays && med.schedule.offDays) {
                    const startDate = new Date(med.startDate);
                    startDate.setHours(0, 0, 0, 0);
                    const diffDays = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
                    if (diffDays >= 0) {
                      const cycleLength = med.schedule.onDays + med.schedule.offDays;
                      const dayInCycle = diffDays % cycleLength;
                      if (dayInCycle < med.schedule.onDays) isActiveToday = true;
                    }
                }
                break;
        }

        if (!isActiveToday) return;

        med.schedule.times.forEach(doseTime => {
            const historyEntry = history.find(h => h.medicationId === med.id && h.scheduledTime === doseTime && h.date === todayStr);
            doses.push({ medication: med, time: doseTime, status: historyEntry ? 'taken' : 'pending' });
        });
    });
    
    return doses.sort((a, b) => a.time.localeCompare(b.time));
};

type AuthMode = 'login' | 'signup';

const AuthScreen: React.FC<{ onLogin: () => void; onSignUp: (name: string) => void; }> = ({ onLogin, onSignUp }) => {
    const [authMode, setAuthMode] = useState<AuthMode>('login');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (authMode === 'login') { if (email && password) onLogin(); }
        else { if (name && email && password) onSignUp(name); }
    };

    return (
      <div className="h-full flex flex-col justify-center items-center p-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <PillIcon className="w-16 h-16 mx-auto text-blue-500" />
            <h1 className="text-2xl font-bold text-slate-800 mt-2">MedAlert</h1>
            <p className="text-slate-500">Seu assistente de medicação</p>
          </div>
          <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6 space-y-4">
              <h2 className="text-xl font-semibold text-center text-slate-700">{authMode === 'login' ? 'Entrar' : 'Criar Conta'}</h2>
              {authMode === 'signup' && (
                  <div>
                      <label htmlFor="name" className="text-sm font-medium text-slate-700">Nome</label>
                      <input id="name" type="text" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full bg-white text-slate-900 shadow-sm sm:text-sm border-slate-300 rounded-md py-3 px-4"/>
                  </div>
              )}
              <div>
                  <label htmlFor="email" className="text-sm font-medium text-slate-700">Email</label>
                  <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required className="mt-1 block w-full bg-white text-slate-900 shadow-sm sm:text-sm border-slate-300 rounded-md py-3 px-4"/>
              </div>
              <div>
                  <label htmlFor="password" className="text-sm font-medium text-slate-700">Senha</label>
                  <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required className="mt-1 block w-full bg-white text-slate-900 shadow-sm sm:text-sm border-slate-300 rounded-md py-3 px-4"/>
              </div>
              <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-blue-500 hover:bg-blue-600">
                  {authMode === 'login' ? 'Entrar' : 'Criar e Entrar'}
              </button>
          </form>
          <div className="text-center mt-4">
              <button onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')} className="text-sm font-medium text-blue-600 hover:underline">
                  {authMode === 'login' ? 'Não tem uma conta? Crie aqui' : 'Já tem uma conta? Entre aqui'}
              </button>
          </div>
        </div>
      </div>
    );
};

const ProfileScreen: React.FC<{ profiles: Profile[]; allMedications: Medication[]; onSelectProfile: (profileId: number) => void; onAddProfile: () => void; onDeleteProfile: (profileId: number) => void; onLogout: () => void; }> = ({ profiles, allMedications, onSelectProfile, onAddProfile, onDeleteProfile, onLogout }) => (
    <div className="h-full flex flex-col">
        <header className="bg-white p-4 sticky top-0 z-10 shadow-sm flex justify-between items-center flex-shrink-0">
            <h1 className="text-xl font-bold text-slate-800">Perfis</h1>
            <button onClick={onLogout} title="Sair" className="p-2 rounded-full hover:bg-slate-100 text-slate-600"><LogoutIcon className="w-6 h-6"/></button>
        </header>
        <main className="flex-grow p-4 space-y-4 overflow-y-auto">
            {profiles.length === 0 ? (
                <div className="text-center p-8">
                    <UserIcon className="w-16 h-16 mx-auto text-slate-300" />
                    <h3 className="mt-4 text-lg font-semibold text-slate-700">Nenhum perfil</h3>
                    <p className="mt-1 text-slate-500">Adicione um perfil para começar.</p>
                </div>
            ) : <p className="text-slate-600 px-2">Selecione um perfil para gerenciar.</p>}
            {profiles.map(p => {
                const medCount = allMedications.filter(m => m.profileId === p.id).length;
                return (
                    <div key={p.id} className="bg-white rounded-xl shadow-sm flex items-center justify-between text-left transition-all">
                        <button onClick={() => onSelectProfile(p.id)} className="flex-grow p-4 flex items-center space-x-4 hover:bg-slate-50 rounded-l-xl">
                            <div className="bg-slate-100 p-3 rounded-full"><UserIcon className="w-6 h-6 text-slate-500" /></div>
                            <div>
                                <p className="font-bold text-slate-800">{p.name}</p>
                                <p className="text-sm text-slate-500">{p.relation}</p>
                                <p className="text-sm text-blue-600">{medCount} medicamentos</p>
                            </div>
                        </button>
                        <button onClick={() => onDeleteProfile(p.id)} className="p-4 text-slate-400 hover:text-red-500 hover:bg-slate-50 rounded-r-xl" title={`Remover ${p.name}`}><TrashIcon className="w-5 h-5" /></button>
                    </div>
                );
            })}
            <button onClick={onAddProfile} className="w-full border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:bg-slate-100 transition-all">
                <span className="text-blue-600 font-semibold">Adicionar Novo Perfil</span>
            </button>
        </main>
    </div>
);

const AddProfileModal: React.FC<{ onClose: () => void; onSave: (name: string, relation: string) => void; }> = ({ onClose, onSave }) => {
    const [name, setName] = useState('');
    const [relation, setRelation] = useState('');
    const handleSave = () => { if (name && relation) { onSave(name, relation); } };
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-sm">
                <h3 className="text-lg font-bold text-slate-800">Adicionar Novo Perfil</h3>
                <div className="mt-4 space-y-4">
                    <div>
                        <label htmlFor="profile-name" className="text-sm font-medium text-slate-700">Nome</label>
                        <input id="profile-name" type="text" placeholder="Ex: Vovó Ana" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full bg-white text-slate-900 shadow-sm sm:text-sm border-slate-300 rounded-md py-3 px-4"/>
                    </div>
                    <div>
                        <label htmlFor="profile-relation" className="text-sm font-medium text-slate-700">Relação</label>
                        <input id="profile-relation" type="text" placeholder="Ex: Avó" value={relation} onChange={e => setRelation(e.target.value)} className="mt-1 block w-full bg-white text-slate-900 shadow-sm sm:text-sm border-slate-300 rounded-md py-3 px-4"/>
                    </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                    <button onClick={onClose} className="bg-white py-2 px-4 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50">Cancelar</button>
                    <button onClick={handleSave} className="bg-blue-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700">Salvar</button>
                </div>
            </div>
        </div>
    );
};

type View = 'dashboard' | 'add' | 'edit' | 'history';
export type SortType = 'status' | 'time';

const App: React.FC = () => {
    const { medications, addMedication, updateMedication, removeMedication, history, addHistoryEntry, profiles, addProfile, removeProfile, currentProfileId, setCurrentProfileId } = useMedicationStore();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [currentView, setCurrentView] = useState<View>('dashboard');
    const [editingMedication, setEditingMedication] = useState<Medication | null>(null);
    const [isAddingProfile, setIsAddingProfile] = useState(false);
    const [sortType, setSortType] = useState<SortType>('status');

    useEffect(() => {
        if (isAuthenticated && currentProfileId && !profiles.some(p => p.id === currentProfileId)) {
            setCurrentProfileId(null);
        }
    }, [profiles, currentProfileId, isAuthenticated, setCurrentProfileId]);

    const currentProfile = useMemo(() => profiles.find(p => p.id === currentProfileId), [profiles, currentProfileId]);
    const medicationsForCurrentProfile = useMemo(() => medications.filter(m => m.profileId === currentProfileId), [medications, currentProfileId]);
    const historyForCurrentProfile = useMemo(() => history.filter(h => medicationsForCurrentProfile.some(m => m.id === h.medicationId)), [history, medicationsForCurrentProfile]);
    
    const todaysDoses = useMemo(() => getTodaysDoses(medicationsForCurrentProfile, historyForCurrentProfile), [medicationsForCurrentProfile, historyForCurrentProfile]);

    const { alert, clearAlert, snoozeAlert, snoozedAlerts } = useAlerts(todaysDoses);

    const handleLogin = () => setIsAuthenticated(true);
    const handleSignUp = (name: string) => {
        const newProfile = addProfile({ name, relation: 'Titular' });
        setCurrentProfileId(newProfile.id);
        setIsAuthenticated(true);
    };
    const handleLogout = () => { setCurrentProfileId(null); setIsAuthenticated(false); };
    const handleSelectProfile = (profileId: number) => { setCurrentProfileId(profileId); setCurrentView('dashboard'); };
    
    const handleTakeDose = (med: Medication, scheduledTime: string) => { 
        addHistoryEntry(med.id, scheduledTime, 'taken'); 
    };

    const handleSaveMedication = (med: Omit<Medication, 'id' | 'history' | 'profileId'>) => {
        if (editingMedication) { updateMedication({ ...editingMedication, ...med }); }
        else { addMedication(med); }
        setEditingMedication(null);
        setCurrentView('dashboard');
    };
    const handleDeleteMedication = (id: number) => {
        if (window.confirm('Tem certeza que deseja excluir este medicamento?')) {
            removeMedication(id);
            setCurrentView('dashboard');
            setEditingMedication(null);
        }
    };
    const handleAddProfileSubmit = (name: string, relation: string) => {
        const newProfile = addProfile({ name, relation });
        setIsAddingProfile(false);
        setCurrentProfileId(newProfile.id);
    };
    const handleDeleteProfile = (profileId: number) => {
        const profileName = profiles.find(p => p.id === profileId)?.name || 'este perfil';
        if (window.confirm(`Tem certeza que deseja remover ${profileName}?`)) {
            removeProfile(profileId);
        }
    };

    let headerTitle: string;
    let showBackArrow = false;
    let backAction = () => {};

    if (!currentProfileId) {
        headerTitle = "Perfis";
        showBackArrow = false;
    } else {
        showBackArrow = true;
        if (currentView === 'dashboard') { headerTitle = currentProfile?.name || 'Painel'; backAction = () => setCurrentProfileId(null); }
        else if (currentView === 'add') { headerTitle = "Adicionar Medicamento"; backAction = () => setCurrentView('dashboard'); }
        else if (currentView === 'edit') { headerTitle = "Editar Medicamento"; backAction = () => setCurrentView('dashboard'); }
        else if (currentView === 'history') { headerTitle = "Histórico"; backAction = () => setCurrentView('dashboard'); }
        else { headerTitle = currentProfile?.name || 'Painel'; }
    }

    const mainContent = !currentProfileId ? (
        <ProfileScreen profiles={profiles} allMedications={medications} onSelectProfile={handleSelectProfile} onAddProfile={() => setIsAddingProfile(true)} onDeleteProfile={handleDeleteProfile} onLogout={handleLogout} />
    ) : (
        <div className="flex flex-col h-full">
            <Header title={headerTitle!} profileName={currentProfile?.name} showBackArrow={showBackArrow} onBack={backAction} currentView={currentView} onNavigate={setCurrentView} />
            <main className="flex-grow overflow-y-auto p-4">
                {currentView === 'dashboard' && (
                  <MedicationDashboard 
                    todaysDoses={todaysDoses} 
                    onTakeDose={handleTakeDose} 
                    onEditDose={(med) => { setEditingMedication(med); setCurrentView('edit'); }} 
                    snoozedAlerts={snoozedAlerts} 
                    sortType={sortType}
                    onSortChange={setSortType}
                  />
                )}
                {/* CORREÇÃO LÓGICA APLICADA AQUI */}
                {(currentView === 'add' || currentView === 'edit') && <MedicationForm onSave={handleSaveMedication} onCancel={() => { setEditingMedication(null); setCurrentView('dashboard'); }} onDelete={editingMedication ? handleDeleteMedication : undefined} initialMedication={editingMedication} />}
                {currentView === 'history' && <HistoryView history={historyForCurrentProfile} medications={medicationsForCurrentProfile} />}
            </main>
            {currentView === 'dashboard' && (
                <div className="absolute bottom-6 right-6 z-20">
                    <button onClick={() => setCurrentView('add')} className="bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700" aria-label="Adicionar Medicamento"><PlusIcon className="w-8 h-8" /></button>
                </div>
            )}
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
            <div className="max-w-md mx-auto bg-white min-h-screen sm:shadow-lg sm:my-0 sm:rounded-lg flex flex-col relative">
              {isAuthenticated ? mainContent : <AuthScreen onLogin={handleLogin} onSignUp={handleSignUp} />}
              {alert && <AlertModal medication={alert.medication} doseTime={alert.doseTime} onTake={() => { handleTakeDose(alert.medication, alert.doseTime); clearAlert(); }} onSnooze={snoozeAlert} />}
              {isAddingProfile && <AddProfileModal onClose={() => setIsAddingProfile(false)} onSave={handleAddProfileSubmit} />}
            </div>
        </div>
    );
};

export default App;
