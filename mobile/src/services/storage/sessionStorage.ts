import * as SecureStore from 'expo-secure-store';

import type { AuthSession } from '../../types/api';

const SESSION_KEY = 'drive.session';

export const sessionStorage = {
  async load(): Promise<AuthSession | null> {
    const raw = await SecureStore.getItemAsync(SESSION_KEY);
    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as AuthSession;
    } catch {
      await SecureStore.deleteItemAsync(SESSION_KEY);
      return null;
    }
  },

  async save(session: AuthSession) {
    await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session));
  },

  async clear() {
    await SecureStore.deleteItemAsync(SESSION_KEY);
  },
};
