import React, { createContext, useEffect, useMemo, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';

export type HireLankaAuthUser = {
  id: string;
  email: string;
  fullName: string;
  role: 'client' | 'freelancer';
  avatarUrl: string;
};

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  profile: HireLankaAuthUser | null;
  loading: boolean;
};

export const AuthContext = createContext<AuthContextValue>({
  session: null,
  user: null,
  profile: null,
  loading: true,
});

function snapshotToLocalStorage(profile: HireLankaAuthUser | null) {
  try {
    if (!profile) {
      localStorage.removeItem('hirelanka_session');
      localStorage.removeItem('hirelanka_authed');
      return;
    }
    localStorage.setItem('hirelanka_session', JSON.stringify({ ...profile, loggedInAt: Date.now() }));
    localStorage.setItem('hirelanka_authed', 'true');
  } catch {
    // ignore
  }
}

function buildProfile(user: User | null, avatarUrl?: string): HireLankaAuthUser | null {
  if (!user) return null;
  const email = user.email || '';
  const meta = (user.user_metadata || {}) as any;
  const fullName = String(meta.fullName || meta.full_name || '');
  const roleRaw = String(meta.role || 'client');
  const role = roleRaw === 'freelancer' ? 'freelancer' : 'client';

  return {
    id: user.id,
    email,
    fullName: fullName || email.split('@')[0] || 'User',
    role,
    avatarUrl: avatarUrl || '',
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState('');

  const fetchAvatar = async (userId: string) => {
    try {
      const { data } = await supabase.from('profiles').select('avatar_url').eq('id', userId).single();
      if (data?.avatar_url) setAvatarUrl(data.avatar_url);
      else setAvatarUrl('');
    } catch { /* ignore */ }
  };

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      const s = data.session || null;
      setSession(s);
      setUser(s?.user || null);
      const p = buildProfile(s?.user || null);
      snapshotToLocalStorage(p);
      if (s?.user?.id) fetchAvatar(s.user.id);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user || null);
      const p = buildProfile(s?.user || null);
      snapshotToLocalStorage(p);
      if (s?.user?.id) fetchAvatar(s.user.id);
      setLoading(false);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    const profile = buildProfile(user, avatarUrl);
    return { session, user, profile, loading };
  }, [session, user, loading, avatarUrl]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
