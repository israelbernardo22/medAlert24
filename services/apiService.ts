import { Medication, Profile, User } from '../types';

// --- Mock Data ---
const mockUsers: User[] = [
    { id: 'user-1', email: 'seu@email.com' },
];

const mockProfiles: Profile[] = [
    { id: 'profile-1', name: 'Eu', relation: 'auto-gerenciado', userId: 'user-1' },
    { id: 'profile-2', name: 'Vovó Ana', relation: 'Avó', userId: 'user-1' },
];

let mockMedications: Medication[] = [
    {
        id: 'med-1',
        profileId: 'profile-1',
        name: 'Losartana',
        dosage: '50mg',
        schedule: { type: 'daily', times: ['08:00', '20:00'] },
        startDate: '2023-01-15',
        duration: 'continuous',
    },
    {
        id: 'med-2',
        profileId: 'profile-1',
        name: 'Vitamina D',
        dosage: '2000 UI',
        schedule: { type: 'daily', times: ['12:00'] },
        startDate: '2024-05-01',
        duration: 90,
    },
    {
        id: 'med-3',
        profileId: 'profile-2',
        name: 'Glifage',
        dosage: '850mg',
        schedule: { type: 'daily', times: ['07:00', '19:00'] },
        startDate: '2022-11-20',
        duration: 'continuous',
    },
];

// --- Mock API ---

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const login = async (email: string, password: string): Promise<User> => {
    await wait(500);
    const user = mockUsers.find(u => u.email === email);
    if (!user || password !== 'password') { // Simplified password check
        throw new Error('Invalid credentials');
    }
    return user;
};

export const register = async (email: string, password: string): Promise<User> => {
    await wait(700);
    if (mockUsers.some(u => u.email === email)) {
        throw new Error('User already exists');
    }
    const newUser: User = { id: `user-${Date.now()}`, email };
    mockUsers.push(newUser);
    // Also create a default profile for the new user
    const newProfile: Profile = { id: `profile-${Date.now()}`, name: 'Eu', relation: 'auto-gerenciado', userId: newUser.id };
    mockProfiles.push(newProfile);
    return newUser;
};

export const getFamily = async (userId: string): Promise<{ profiles: Profile[] }> => {
    await wait(400);
    const profiles = mockProfiles.filter(p => p.userId === userId);
    return { profiles };
};

export const addProfile = async (userId: string, profile: Omit<Profile, 'id' | 'userId'>): Promise<Profile> => {
    await wait(300);
    const newProfile: Profile = { ...profile, id: `profile-${Date.now()}`, userId };
    mockProfiles.push(newProfile);
    return newProfile;
}

export const getMedications = async (profileId: string): Promise<Medication[]> => {
    await wait(500);
    return mockMedications.filter(med => med.profileId === profileId);
};

export const addMedication = async (med: Omit<Medication, 'id'>): Promise<Medication> => {
    await wait(600);
    const newMed: Medication = { ...med, id: `med-${Date.now()}` };
    mockMedications.push(newMed);
    return newMed;
};
