import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

type LoginCredentials = {
  email: string;
  password: string;
};

type AuthSessionState = {
  session: Session | null;
  isAdmin: boolean;
  isLoading: boolean;
  authError: string | null;
  signIn: (credentials: LoginCredentials) => Promise<void>;
  signOut: () => Promise<void>;
};

export function useAuthSession(): AuthSessionState {
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const client = supabase;

    if (!client) {
      setIsLoading(false);
      return undefined;
    }

    let isMounted = true;

    async function resolveSession(nextSession: Session | null) {
      if (!isMounted) {
        return;
      }

      setSession(nextSession);

      if (!nextSession) {
        setIsAdmin(false);
        setIsLoading(false);
        return;
      }

      const { data, error } = await client!.rpc('is_admin');

      if (!isMounted) {
        return;
      }

      setIsAdmin(Boolean(data) && !error);
      setAuthError(error ? 'Usuário autenticado, mas sem permissão administrativa.' : null);
      setIsLoading(false);
    }

    client.auth.getSession().then(({ data }) => resolveSession(data.session));

    const { data: listener } = client.auth.onAuthStateChange((_event, nextSession) => {
      setIsLoading(true);
      resolveSession(nextSession);
    });

    return () => {
      isMounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  async function signIn({ email, password }: LoginCredentials) {
    if (!isSupabaseConfigured || !supabase) {
      setAuthError('Configure as variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.');
      return;
    }

    setIsLoading(true);
    setAuthError(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setAuthError(error.message);
      setIsLoading(false);
    }
  }

  async function signOut() {
    if (!supabase) {
      return;
    }

    await supabase.auth.signOut();
    setSession(null);
    setIsAdmin(false);
  }

  return {
    session,
    isAdmin,
    isLoading,
    authError,
    signIn,
    signOut,
  };
}
