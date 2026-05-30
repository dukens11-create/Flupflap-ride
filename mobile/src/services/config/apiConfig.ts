import Constants from 'expo-constants';

type ExpoExtra = {
  apiBaseUrl?: string;
};

const expoExtra = (Constants.expoConfig?.extra ?? {}) as ExpoExtra;
const runtimeApiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;

export const apiBaseUrl = (runtimeApiBaseUrl || expoExtra.apiBaseUrl || 'http://localhost:3000').replace(/\/$/, '');
