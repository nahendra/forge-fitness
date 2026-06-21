import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { fetchMe, loginRequest, logoutRequest, registerRequest, updateProfile as updateProfileApi } from '../api/auth.api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // No need to pre-fetch a CSRF token here — api/client.js fetches one
    // lazily (and dedupes concurrent callers) the first time a mutating
    // request actually needs it, which is both simpler and avoids two
    // independent fetches ever racing each other for separate tokens.
    (async () => {
      try {
        const { user: me } = await fetchMe();
        setUser(me);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = useCallback(async (credentials) => {
    const { user: loggedIn } = await loginRequest(credentials);
    setUser(loggedIn);
    return loggedIn;
  }, []);

  const register = useCallback(async (data) => {
    const { user: created } = await registerRequest(data);
    setUser(created);
    return created;
  }, []);

  const logout = useCallback(async () => {
    await logoutRequest();
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (data) => {
    const { user: updated } = await updateProfileApi(data);
    setUser(updated);
    return updated;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
