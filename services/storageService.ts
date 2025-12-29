import { AppState, User } from '../types';

// In a real implementation, you would import supabase client here
// import { createClient } from '@supabase/supabase-js';

const STORAGE_KEY = 'lifesync_data_v1';

export const loadState = (): Partial<AppState> => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    return JSON.parse(saved);
  }
  return {};
};

export const saveState = (state: AppState) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

export const clearState = () => {
  localStorage.removeItem(STORAGE_KEY);
};

// Mock Cloudinary Upload
export const uploadImage = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

// Mock Supabase Auth
export const mockLogin = async (email: string): Promise<User> => {
  await new Promise(r => setTimeout(r, 800)); // Simulate network
  return {
    id: 'user_123',
    email,
    name: email.split('@')[0],
    avatar: 'https://picsum.photos/200',
    bio: 'Determined to improve everyday!',
    gender: 'Not specified',
    dob: ''
  };
};