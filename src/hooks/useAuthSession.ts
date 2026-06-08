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
    let activeSessionUserId: string | null = null;
    let resolvedAdminUserId: string | null = null;

    async function resolveSession(nextSession: Session | null, forceAdminCheck = false) {
      if (!isMounted) {
        return;
      }

      const nextUserId = nextSession?.user.id ?? null;
      activeSessionUserId = nextUserId;
      setSession(nextSession);

      if (!nextSession) {
        resolvedAdminUserId = null;
        setIsAdmin(false);
        setAuthError(null);
        setIsLoading(false);
        return;
      }

      if (!forceAdminCheck && resolvedAdminUserId === nextUserId) {
        setIsLoading(false);
        return;
      }

      const { data, error } = await client!.rpc('is_admin');

      if (!isMounted || activeSessionUserId !== nextUserId) {
        return;
      }

      const hasAdminRole = Boolean(data) && !error;

      resolvedAdminUserId = hasAdminRole ? nextUserId : null;
      setIsAdmin(hasAdminRole);
      setAuthError(
        hasAdminRole ? null : 'Seu usuário ainda não possui permissão de administrador.',
      );
      setIsLoading(false);
    }

    client.auth.getSession().then(({ data }) => resolveSession(data.session, true));

    const { data: listener } = client.auth.onAuthStateChange((event, nextSession) => {
      const nextUserId = nextSession?.user.id ?? null;
      const isSameUser = Boolean(nextUserId && nextUserId === activeSessionUserId);
      const canReuseAdminCheck = Boolean(isSameUser && resolvedAdminUserId === nextUserId);

      if ((event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN') && canReuseAdminCheck) {
        setSession(nextSession);
        return;
      }

      if (event === 'SIGNED_OUT') {
        setIsLoading(true);
        resolveSession(null, true);
        return;
      }

      if (!isSameUser || event === 'USER_UPDATED') {
        setIsLoading(true);
      }

      resolveSession(nextSession, !isSameUser || event === 'USER_UPDATED');
    });

    return () => {
      isMounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  async function signIn({ email, password }: LoginCredentials) {
    if (!isSupabaseConfigured || !supabase) {
      setAuthError(
        'Configure as variáveis VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY.',
      );
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
