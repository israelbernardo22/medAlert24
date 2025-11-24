import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
});

// --- Auth ---
export const register = async (credentials: any) => {
    const response = await api.post('/auth/register', credentials);
    return response.data;
};

export const login = async (credentials: any) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
};


// --- Family & Profiles ---
export const getFamily = async (userId: string) => {
    const response = await api.get(`/family/${userId}`);
    return response.data;
};

export const addProfile = async (userId: string, profileData: any) => {
    const response = await api.post(`/family/${userId}/profiles`, profileData);
    return response.data;
};
