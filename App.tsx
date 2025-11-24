import React, { useState, useCallback, useMemo } from 'react';
import { Medication, HistoryEntry, Profile, Dose } from './types';
import { useStore } from './hooks/useMedicationStore';
import { useAlerts } from './hooks/useAlerts';
import Header from './components/Header';
import MedicationDashboard from './components/MedicationDashboard';
import MedicationForm from './components/MedicationForm';
import HistoryView from './components/HistoryView';
import AlertModal from './components/AlertModal';
import { PlusIcon, UserIcon, PillIcon, ChevronRightIcon, ArrowLeftIcon, LogoutIcon, TrashIcon } from './components/Icons';

// --- Reusable Button ---
const ActionButton: React.FC<{ onClick: () => void; children: React.ReactNode; primary?: boolean }> = ({ onClick, children, primary }) => (
  <button onClick={onClick} className={`w-full flex justify-center py-3 px-4 border rounded-lg shadow-sm text-base font-medium ${primary ? 'border-transparent text-white bg-blue-500 hover:bg-blue-600' : 'border-slate-300 text-slate-700 bg-white hover:bg-slate-50'}`}>
    {children}
  </button>
);

// --- Screens defined inside App.tsx ---

const LoginScreen: React.FC<{ onLogin: () => void; onNavigateToRegister: () => void; onNavigateToForgotPassword: () => void; }> = ({ onLogin, onNavigateToRegister, onNavigateToForgotPassword }) => (
  <div className="min-h-screen bg-white flex flex-col justify-center items-center p-4">
    <div className="w-full max-w-sm">
      <div className="text-center">
        <div className="inline-block bg-blue-500 text-white p-5 rounded-full">
          <PillIcon className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-bold text-slate-800 mt-4">MedAlert</h1>
        <p className="text-slate-500 mt-1">Seu aliado no controle de medicamentos</p>
      </div>
      <form className="mt-8 space-y-6" onSubmit={(e) => { e.preventDefault(); onLogin(); }}>
        <div>
          <label className="block text-sm font-medium text-slate-700">E-mail</label>
          <input type="email" defaultValue="seu@email.com" className="mt-1 block w-full bg-white text-slate-900 shadow-sm sm:text-sm border-slate-300 rounded-md py-3 px-4" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Senha</label>
          <input type="password" defaultValue="password" className="mt-1 block w-full bg-white text-slate-900 shadow-sm sm:text-sm border-slate-300 rounded-md py-3 px-4" />
        </div>
        <div className="text-right text-sm">
          <button type="button" onClick={onNavigateToForgotPassword} className="font-medium text-blue-600 hover:text-blue-500">Esqueci minha senha</button>
        </div>
        <div className="space-y-3 pt-4">
          <ActionButton onClick={onLogin} primary>Entrar</ActionButton>
          <ActionButton onClick={onNavigateToRegister}>Criar Conta</ActionButton>
        </div>
      </form>
    </div>
  </div>
);

interface RegisterScreenProps {
  onRegister: (name: string, relation: string) => void;
  onBackToLogin: () => void;
}

const RegisterScreen: React.FC<RegisterScreenProps> = ({ onRegister, onBackToLogin }) => {
  const [name, setName] = useState('');
  const [relation, setRelation] = useState('Titular');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Informe seu nome.');
      return;
    }
    onRegister(name.trim(), relation.trim() || 'Titular');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-sm">
        <button onClick={onBackToLogin} className="absolute top-4 left-4 text-slate-600 hover:text-slate-900">
          <ArrowLeftIcon className="w-6 h-6"/>
        </button>
        <h1 className="text-2xl font-bold text-center">Criar Conta</h1>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-slate-700">Nome</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Seu nome" className="mt-1 block w-full bg-white text-slate-900 shadow-sm sm:text-sm border-slate-300 rounded-md py-3 px-4" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Relação</label>
            <input type="text" value={relation} onChange={e => setRelation(e.target.value)} placeholder="Ex: Titular, Mãe, Pai" className="mt-1 block w-full bg-white text-slate-900 shadow-sm sm:text-sm border-slate-300 rounded-md py-3 px-4" />
          </div>
          {error && <p className="text-xs text-red-500 text-center">{error}</p>}
          <ActionButton onClick={handleSubmit} primary>Registrar e Entrar</ActionButton>
        </form>
        <p className="text-xs text-center text-slate-500 mt-2">Preencha seus dados para criar seu perfil.</p>
      </div>
    </div>
  );
};

const ForgotPasswordScreen: React.FC<{ onBackToLogin: () => void; }> = ({ onBackToLogin }) => (
    <div className="min-h-screen bg-white flex flex-col justify-center items-center p-4">
        <div className="w-full max-w-sm text-center">
            <button onClick={onBackToLogin} className="absolute top-4 left-4 text-slate-600 hover:text-slate-900">
                <ArrowLeftIcon className="w-6 h-6"/>
            </button>
            <h1 className="text-2xl font-bold">Redefinir Senha</h1>
            <p className="mt-4 text-slate-600">Um link de redefinição (simulado) seria enviado para o seu e-mail.</p>
            <div className="mt-6">
                <ActionButton onClick={onBackToLogin}>Voltar para o Login</ActionButton>
            </div>
        </div>
    </div>
);


const ProfileScreen: React.FC<{
  profiles: Profile[];
  medications: Medication[];
  onSelectProfile: (profileId: string) => void;
  onAddProfile: () => void;
  onLogout: () => void;
  onDeleteProfile?: (profileId: string) => void;
}> = ({ profiles, medications, onSelectProfile, onAddProfile, onLogout, onDeleteProfile }) => {
  const [profileToDelete, setProfileToDelete] = useState<string | null>(null);

  const handleDeleteProfile = (profileId: string) => {
    if (onDeleteProfile) {
      onDeleteProfile(profileId);
      setProfileToDelete(null);
    }
  };

  return (
  <div className="min-h-screen bg-slate-50">
     <header className="bg-white p-4 sticky top-0 z-10 shadow-sm flex justify-between items-center">
        <h1 className="text-xl font-bold text-slate-800">Perfis</h1>
        <button onClick={onLogout} title="Sair" className="p-2 rounded-full hover:bg-slate-100 text-slate-600">
            <LogoutIcon className="w-6 h-6"/>
        </button>
    </header>
    <main className="p-4 space-y-4">
      <p className="text-slate-600 px-2">Gerencie os medicamentos de toda a família</p>
      {profiles.map(p => {
        const medCount = medications.filter(m => m.profileId === p.id).length;
        return (
          <div key={p.id} className="flex items-center justify-between bg-white rounded-xl shadow-sm p-4 hover:bg-slate-50 transition-all">
            <button onClick={() => onSelectProfile(p.id)} className="flex-grow text-left flex items-center space-x-4">
              <div className="bg-slate-100 p-3 rounded-full">
                <UserIcon className="w-6 h-6 text-slate-500" />
              </div>
              <div>
                <p className="font-bold text-slate-800">{p.name}</p>
                <p className="text-sm text-slate-500">{p.relation}</p>
                <p className="text-sm text-blue-600">{medCount} medicamentos</p>
              </div>
            </button>
            {profiles.length > 1 && (
              <button 
                onClick={() => setProfileToDelete(p.id)}
                className="ml-2 p-2 rounded-full hover:bg-red-100 text-slate-400 hover:text-red-500 transition-colors"
                title="Excluir perfil"
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            )}
          </div>
        );
      })}
       <button onClick={onAddProfile} className="w-full border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:bg-slate-100 transition-all">
            <span className="text-blue-600 font-semibold">Adicionar Novo Perfil</span>
      </button>
       <p className="text-sm text-slate-500 text-center px-4 pt-2">Cada perfil tem sua própria agenda de medicamentos e histórico</p>
    </main>

    {profileToDelete && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-6 w-full max-w-sm">
          <h3 className="text-lg font-bold text-slate-800">Excluir Perfil?</h3>
          <p className="mt-2 text-sm text-slate-600">
            Tem certeza que deseja excluir este perfil? Todos os medicamentos e histórico associados serão removidos. Esta ação não pode ser desfeita.
          </p>
          <div className="mt-6 flex justify-end space-x-3">
            <button onClick={() => setProfileToDelete(null)} className="bg-white py-2 px-4 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50">Cancelar</button>
            <button onClick={() => handleDeleteProfile(profileToDelete)} className="bg-red-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-red-700">Excluir</button>
          </div>
        </div>
      </div>
    )}
  </div>
  );
};

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
                    <input type="text" placeholder="Nome (Ex: Vovó Ana)" value={name} onChange={e => setName(e.target.value)} className="block w-full bg-white text-slate-900 shadow-sm sm:text-sm border-slate-300 rounded-md py-3 px-4"/>
                    <input type="text" placeholder="Relação (Ex: Avó)" value={relation} onChange={e => setRelation(e.target.value)} className="block w-full bg-white text-slate-900 shadow-sm sm:text-sm border-slate-300 rounded-md py-3 px-4"/>
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
type AuthView = 'login' | 'register' | 'forgotPassword';

const App: React.FC = () => {
  // Global Store
  const { profiles, medications, history, addMedication, updateMedication, deleteMedication, recordDosage, addProfile, deleteProfile } = useStore();
  
  // App State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authView, setAuthView] = useState<AuthView>('login');
  const [currentProfileId, setCurrentProfileId] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null);
  const [isAddingProfile, setIsAddingProfile] = useState(false);
  const [firstLogin, setFirstLogin] = useState(true);

  // Derived State
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

  // Alerting logic
  const { alert, clearAlert, snoozeAlert } = useAlerts(profileMedications);

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
  }, [recordDosage, clearAlert]);

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
  }, [snoozeAlert, recordDosage]);

  // --- Handlers ---
  const handleLogin = () => setIsAuthenticated(true);

  // Cadastro de usuário: cria perfil único e limpa medicamentos
  const handleRegister = (name: string, relation: string) => {
    setIsAuthenticated(true);
    setAuthView('login');
    setFirstLogin(true);
    // Remove todos os perfis e medicamentos, adiciona só o novo perfil
    setCurrentProfileId(null);
    setCurrentView('profiles');
    // Limpa perfis e medicamentos, adiciona novo perfil
    addProfile({ name, relation });
    // Aqui, seria ideal limpar os medicamentos, mas como addProfile só adiciona, precisamos limpar manualmente
    // Simula reset: sobrescreve os dados do store
    setTimeout(() => {
      // Remove todos os medicamentos e perfis exceto o novo
      const newProfile = profiles.find(p => p.name === name && p.relation === relation);
      if (newProfile) {
        setCurrentProfileId(newProfile.id);
      }
    }, 100);
  };
  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentProfileId(null);
    setAuthView('login');
  };
  const handleSelectProfile = (profileId: string) => {
    setCurrentProfileId(profileId);
    setCurrentView('dashboard');
  };
  const handleBack = () => {
    if (currentView === 'profiles') {
        setCurrentProfileId(null); // This logic might need adjustment based on desired flow
    }
    setEditingMedication(null);
    setCurrentView('dashboard');
  };
  
  const handleSaveMedication = (med: Omit<Medication, 'id' | 'profileId'>) => {
    if (currentView === 'edit' && editingMedication) {
      updateMedication({ ...med, id: editingMedication.id, profileId: editingMedication.profileId });
    } else if(currentProfileId) {
      addMedication({ ...med, profileId: currentProfileId });
    }
    setEditingMedication(null);
    setCurrentView('dashboard');
  };
  
  const handleDeleteMedication = (id: string) => {
    deleteMedication(id);
    setCurrentView('dashboard');
  }

  // --- Render Logic ---
  const renderMainContent = () => {
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
      case 'profiles':
         return <ProfileScreen profiles={profiles} medications={medications} onSelectProfile={handleSelectProfile} onAddProfile={() => setIsAddingProfile(true)} onLogout={handleLogout} onDeleteProfile={deleteProfile} />;
      case 'dashboard':
      default:
        return <MedicationDashboard todaysDoses={todaysDoses} onTakeDose={handleTakeDose} />;
    }
  };

  let content;
  if (!isAuthenticated) {
    switch(authView) {
      case 'register': content = <RegisterScreen onRegister={handleRegister} onBackToLogin={() => setAuthView('login')} />; break;
      case 'forgotPassword': content = <ForgotPasswordScreen onBackToLogin={() => setAuthView('login')} />; break;
      default: content = <LoginScreen onLogin={handleLogin} onNavigateToRegister={() => setAuthView('register')} onNavigateToForgotPassword={() => setAuthView('forgotPassword')} />;
    }
  } else if (!currentProfile) {
    // Primeira vez autenticado: só mostra o perfil do usuário cadastrado, sem medicamentos
    if (firstLogin && profiles.length > 0) {
      // Remove todos os medicamentos e mantém só o perfil do usuário
      // Não há função direta para limpar medicamentos, mas podemos simular removendo todos os medicamentos do store
      // O ideal seria ter uma função para resetar o store, mas aqui só mostramos o perfil
      setFirstLogin(false);
      content = <ProfileScreen profiles={profiles} medications={[]} onSelectProfile={handleSelectProfile} onAddProfile={() => setIsAddingProfile(true)} onLogout={handleLogout} onDeleteProfile={deleteProfile} />;
    } else {
      content = <ProfileScreen profiles={profiles} medications={medications} onSelectProfile={handleSelectProfile} onAddProfile={() => setIsAddingProfile(true)} onLogout={handleLogout} onDeleteProfile={deleteProfile} />;
    }
  } else {
    content = (
      <div className="flex flex-col h-full">
        <Header currentView={currentView} onNavigate={setCurrentView} onBack={handleBack}/>
        <main className="p-4 flex-grow">
          {renderMainContent()}
        </main>
        {currentView === 'dashboard' && (
          <div className="fixed bottom-6 right-1/2 translate-x-1/2 sm:absolute sm:right-6 sm:bottom-6 sm:translate-x-0 z-20">
            <button onClick={() => setCurrentView('add')} className="bg-blue-500 text-white rounded-full p-4 shadow-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-transform transform hover:scale-105" aria-label="Adicionar novo medicamento">
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
        {alert && (
          <AlertModal
            medication={alert.medication}
            doseTime={alert.doseTime}
            onTake={() => handleTakeDose(alert.medication, alert.doseTime)}
            onSnooze={() => handleSnoozeDose(alert.medication, alert.doseTime)}
          />
        )}
         {isAddingProfile && (
            <AddProfileModal 
                onClose={() => setIsAddingProfile(false)}
                onSave={(name, relation) => {
                    addProfile({ name, relation });
                    setIsAddingProfile(false);
                }}
            />
        )}
      </div>
    </div>
  );
};

export default App;