import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Medication, HistoryEntry, Profile, Dose } from './types';
import { useStore } from './hooks/useMedicationStore';
import { useAlerts } from './hooks/useAlerts';
import Header from './components/Header';
import MedicationDashboard from './components/MedicationDashboard';
import MedicationForm from './components/MedicationForm';
import HistoryView from './components/HistoryView';
import AlertModal from './components/AlertModal';
import { PlusIcon, UserIcon, PillIcon, ArrowLeftIcon, LogoutIcon, TrashIcon } from './components/Icons';

type AuthMode = 'login' | 'signup';

// --- Auth Screen ---
const AuthScreen: React.FC<{ 
    onLogin: () => void;
    onSignUp: (name: string) => void;
}> = ({ onLogin, onSignUp }) => {
    const [authMode, setAuthMode] = useState<AuthMode>('login');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (authMode === 'login') {
            if (email && password) onLogin();
        } else {
            if (name && email && password) onSignUp(name);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
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



// --- Profile Screen ---
const ProfileScreen: React.FC<{
  profiles: Profile[];
  medications: Medication[];
  onSelectProfile: (profileId: string) => void;
  onAddProfile: () => void;
  onDeleteProfile: (profileId: string) => void;
  onLogout: () => void;
}> = ({ profiles, medications, onSelectProfile, onAddProfile, onDeleteProfile, onLogout }) => (
  <div className="min-h-screen bg-slate-50">
     <header className="bg-white p-4 sticky top-0 z-10 shadow-sm flex justify-between items-center">
        <h1 className="text-xl font-bold text-slate-800">Perfis</h1>
        <button onClick={onLogout} title="Sair" className="p-2 rounded-full hover:bg-slate-100 text-slate-600">
            <LogoutIcon className="w-6 h-6"/>
        </button>
    </header>
    <main className="p-4 space-y-4">
        {profiles.length === 0 ? (
            <div className="text-center p-8">
                <UserIcon className="w-16 h-16 mx-auto text-slate-300" />
                <h3 className="mt-4 text-lg font-semibold text-slate-700">Nenhum perfil encontrado</h3>
                <p className="mt-1 text-slate-500">Adicione um perfil para começar a gerenciar medicamentos.</p>
             </div>
        ) : (
            <p className="text-slate-600 px-2">Gerencie os medicamentos de toda a família.</p>
        )}

        {profiles.map(p => {
            const medCount = medications.filter(m => m.profileId === p.id).length;
            return (
            <div key={p.id} className="bg-white rounded-xl shadow-sm flex items-center justify-between text-left transition-all">
                <button onClick={() => onSelectProfile(p.id)} className="flex-grow p-4 flex items-center space-x-4 hover:bg-slate-50 rounded-l-xl">
                    <div className="bg-slate-100 p-3 rounded-full">
                    <UserIcon className="w-6 h-6 text-slate-500" />
                    </div>
                    <div>
                    <p className="font-bold text-slate-800">{p.name}</p>
                    <p className="text-sm text-slate-500">{p.relation}</p>
                    <p className="text-sm text-blue-600">{medCount} medicamentos</p>
                    </div>
                </button>
                <button onClick={() => onDeleteProfile(p.id)} className="p-4 text-slate-400 hover:text-red-500 hover:bg-slate-50 rounded-r-xl" title={`Remover ${p.name}`}>
                    <TrashIcon className="w-5 h-5" />
                </button>
            </div>
            );
        })}
        <button onClick={onAddProfile} className="w-full border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:bg-slate-100 transition-all">
                <span className="text-blue-600 font-semibold">Adicionar Novo Perfil</span>
        </button>
    </main>
  </div>
);

// --- Add Profile Modal ---
const AddProfileModal: React.FC<{ onClose: () => void, onSave: (name: string, relation: string) => void }> = ({ onClose, onSave }) => {
    const [name, setName] = useState('');
    const [relation, setRelation] = useState('');

    const handleSave = () => {
        if(name && relation) {
            onSave(name, relation);
        }
    };

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


// --- Main Application ---
type View = 'dashboard' | 'add' | 'edit' | 'history' | 'profiles';

const App: React.FC = () => {
  const { profiles, setProfiles, medications, setMedications, history, setHistory } = useStore();
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentProfileId, setCurrentProfileId] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<View>('profiles');
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null);
  const [isAddingProfile, setIsAddingProfile] = useState(false);

  useEffect(() => {
    if (currentProfileId && !profiles.find(p => p.id === currentProfileId)) {
        setCurrentProfileId(null);
        setCurrentView('profiles');
    }
  }, [profiles, currentProfileId]);

  const currentProfile = useMemo(() => profiles.find(p => p.id === currentProfileId), [profiles, currentProfileId]);
  const profileMedications = useMemo(() => medications.filter(m => m.profileId === currentProfileId), [medications, currentProfileId]);
  const profileHistory = useMemo(() => history.filter(h => h.profileId === currentProfileId), [history, currentProfileId]);
  
  const todaysDoses = useMemo(() => {
    if (!currentProfileId) return [];
    const todayStr = new Date().toISOString().split('T')[0];
    const now = new Date();
    const currentTimeInMinutes = now.getHours() * 60 + now.getMinutes();

    const doses: Dose[] = [];
    profileMedications.forEach(med => {
      med.schedule.times.forEach(time => {
        const historyEntry = profileHistory.find(h => 
          h.medication.id === med.id &&
          h.scheduledTime === time &&
          new Date(h.timestamp).toISOString().split('T')[0] === todayStr
        );
        
        let status: Dose['status'] = 'pending';
        if (historyEntry) {
          status = historyEntry.status;
        } else {
          const [hours, minutes] = time.split(':').map(Number);
          const doseTimeInMinutes = hours * 60 + minutes;
          if (doseTimeInMinutes < currentTimeInMinutes) {
              status = 'missed';
          }
        }
        doses.push({ medication: med, time, status, historyEntry });
      });
    });
    return doses.sort((a,b) => a.time.localeCompare(b.time));
  }, [profileMedications, profileHistory, currentProfileId]);

  const { alert, clearAlert, snoozeAlert } = useAlerts(profileMedications);
  
  // --- Business Logic moved directly into App component ---

  const addProfile = (profileData: Omit<Profile, 'id' | 'userId'>) => {
    const newProfile = { ...profileData, id: `profile-${Date.now()}`, userId: 'local-user' };
    setProfiles(prev => [...prev, newProfile]);
    return newProfile;
  };

  const deleteProfile = (profileId: string) => {
    setProfiles(prev => prev.filter(p => p.id !== profileId));
    setMedications(prev => prev.filter(m => m.profileId !== profileId));
    setHistory(prev => prev.filter(h => h.profileId !== profileId));
  };

  const addMedication = (medData: Omit<Medication, 'id'>) => {
    const newMed = { ...medData, id: `med-${Date.now()}` };
    setMedications(prev => [...prev, newMed]);
  };

  const updateMedication = (updatedMed: Medication) => {
    setMedications(prev => prev.map(med => med.id === updatedMed.id ? updatedMed : med));
  };

  const deleteMedication = (medId: string) => {
    setMedications(prev => prev.filter(med => med.id !== medId));
    setHistory(prev => prev.filter(entry => entry.medication.id !== medId));
  };

  const recordDosage = (entryData: Omit<HistoryEntry, 'id'>) => {
    const newEntry = { ...entryData, id: `hist-${Date.now()}` };
    setHistory(prev => [newEntry, ...prev]);
  };

  // --- Event Handlers ---

  const handleTakeDose = useCallback((med: Medication, doseTime: string) => {
    if(!med.profileId) return;
    recordDosage({
      profileId: med.profileId,
      medication: { id: med.id, name: med.name, dosage: med.dosage },
      status: 'taken',
      timestamp: new Date().toISOString(),
      scheduledTime: doseTime,
    });
    clearAlert();
  }, [clearAlert]); // Dependencies updated

  const handleSnoozeDose = useCallback((med: Medication, doseTime: string) => {
    if(!med.profileId) return;
    snoozeAlert(med, doseTime);
    recordDosage({
      profileId: med.profileId,
      medication: { id: med.id, name: med.name, dosage: med.dosage },
      status: 'postponed',
      timestamp: new Date().toISOString(),
      scheduledTime: doseTime,
    });
  }, [snoozeAlert]); // Dependencies updated

  const handleLogin = () => {
    setIsAuthenticated(true);
    setCurrentView('profiles');
  };
  
  const handleSignUp = (name: string) => {
    const newProfile = addProfile({ name: name, relation: 'Titular' });
    setIsAuthenticated(true);
    setCurrentProfileId(newProfile.id);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setCurrentProfileId(null);
    setIsAuthenticated(false);
  };

  const handleSelectProfile = (profileId: string) => {
    setCurrentProfileId(profileId);
    setCurrentView('dashboard');
  };
  
  const handleBackToProfiles = () => {
    setCurrentProfileId(null);
    setCurrentView('profiles');
  };
  
  const handleSaveMedication = (med: Omit<Medication, 'id' | 'profileId'>) => {
    if (currentView === 'edit' && editingMedication && editingMedication.profileId) {
      updateMedication({ ...med, id: editingMedication.id, profileId: editingMedication.profileId });
    } else if(currentProfileId) {
      addMedication({ ...med, profileId: currentProfileId });
    }
    setEditingMedication(null);
    setCurrentView('dashboard');
  };
  
  const handleDeleteMedication = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este medicamento?')) {
      deleteMedication(id);
      setEditingMedication(null);
      setCurrentView('dashboard');
    }
  }

  const handleEditDose = (med: Medication) => {
    setEditingMedication(med);
    setCurrentView('edit');
  };

  const handleAddProfileSubmit = (name: string, relation: string) => {
    addProfile({ name, relation });
    setIsAddingProfile(false);
  };

  const handleDeleteProfile = (profileId: string) => {
    const profileName = profiles.find(p => p.id === profileId)?.name || 'este perfil';
    if (window.confirm(`Tem certeza que deseja remover ${profileName}? Todos os medicamentos e histórico associados serão perdidos.`)) {
        deleteProfile(profileId);
    }
  };

  // --- Render Logic ---

  const renderMainContent = () => {
    if (!currentProfile) {
        return <ProfileScreen profiles={profiles} medications={medications} onSelectProfile={handleSelectProfile} onAddProfile={() => setIsAddingProfile(true)} onDeleteProfile={handleDeleteProfile} onLogout={handleLogout} />;
    }

    switch (currentView) {
      case 'add':
      case 'edit':
        return (
          <MedicationForm 
            onSave={handleSaveMedication} 
            onCancel={() => { setEditingMedication(null); setCurrentView('dashboard');}}
            onDelete={handleDeleteMedication}
            initialMedication={editingMedication}
          />
        );
      case 'history':
        return <HistoryView history={profileHistory} />;
      case 'dashboard':
      default:
        return <MedicationDashboard todaysDoses={todaysDoses} onTakeDose={handleTakeDose} onEditDose={handleEditDose} />;
    }
  };

  let content;
  if (!isAuthenticated) {
      content = <AuthScreen onLogin={handleLogin} onSignUp={handleSignUp} />;
  } else {
      content = (
          <div className="flex flex-col h-full">
             <Header currentView={currentView} onNavigate={setCurrentView} onBack={handleBackToProfiles} showBackToProfiles={!!currentProfile}/>
            <main className="p-4 flex-grow">
              {renderMainContent()}
            </main>
            {currentView === 'dashboard' && (
              <div className="fixed bottom-6 right-1/2 translate-x-1/2 sm:absolute sm:right-6 sm:bottom-6 sm:translate-x-0 z-20">
                <button onClick={() => setCurrentView('add')} className="bg-blue-500 text-white rounded-full p-4 shadow-lg hover:bg-blue-600" aria-label="Adicionar novo medicamento">
                  <PlusIcon className="w-8 h-8" />
                </button>
              </div>
            )}
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      <div className="max-w-md mx-auto bg-white min-h-screen sm:shadow-lg sm:my-0 sm:rounded-lg flex flex-col relative">
        {content}
        {alert && isAuthenticated && (
          <AlertModal
            medication={alert.medication}
            doseTime={alert.doseTime}
            onTake={() => handleTakeDose(alert.medication, alert.doseTime)}
            onSnooze={() => handleSnoozeDose(alert.medication, alert.doseTime)}
          />
        )}
         {isAddingProfile && isAuthenticated && (
            <AddProfileModal 
                onClose={() => setIsAddingProfile(false)}
                onSave={handleAddProfileSubmit}
            />
        )}
      </div>
    </div>
  );
};

export default App;
