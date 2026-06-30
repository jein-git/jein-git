import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { Profile } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

const TERMS_VERSION = '2026-06-30';

type AuthContextType = {
  user: User | null;
  profile: Profile | null;
  profileError: string | null;
  profileLoading: boolean;
  loading: boolean;
  signUp: (
    email: string,
    password: string,
    name: string,
    phone?: string,
    address?: string,
    termsAgreed?: boolean,
    privacyAgreed?: boolean,
    marketingAgreed?: boolean,
  ) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<void>;
  saveUserConsents: (params: {
    userId: string;
    marketingAgreed: boolean;
  }) => Promise<{ error: Error | null }>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Supabase 영문 오류 → 쉬운 한국어 변환
export function mapAuthError(message: string): string {
  if (message.includes('User already registered') || message.includes('already been registered')) {
    return '이미 가입된 이메일입니다. 로그인을 해주세요.';
  }
  if (message.includes('Invalid login credentials')) {
    return '이메일 또는 비밀번호가 틀렸습니다.';
  }
  if (message.includes('Email not confirmed')) {
    return '이메일 인증이 필요합니다. 받은 편지함을 확인해주세요.';
  }
  if (message.includes('Password should be at least') || message.includes('weak_password')) {
    return '비밀번호는 6자 이상이어야 합니다.';
  }
  if (message.includes('Unable to validate email') || message.includes('valid email')) {
    return '올바른 이메일 주소를 입력해주세요.';
  }
  if (message.includes('network') || message.includes('fetch')) {
    return '인터넷 연결을 확인하고 다시 시도해주세요.';
  }
  return '오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    setProfileLoading(true);
    setProfileError(null);

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('[AuthContext] 프로필 조회 오류:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
        });
        setProfileError('프로필 정보를 불러오지 못했습니다.');
        return;
      }

      if (!data) {
        console.warn('[AuthContext] 프로필 행 없음: userId =', userId);
        setProfileError('프로필 정보를 찾을 수 없습니다.');
        return;
      }

      setProfile(data as Profile);
      setProfileError(null);
    } catch (e) {
      console.error('[AuthContext] 프로필 조회 예외:', e);
      setProfileError('프로필 정보를 불러오지 못했습니다.');
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        setTimeout(() => fetchProfile(currentUser.id), 0);
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'INITIAL_SESSION') return;

      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (!currentUser) {
        setProfile(null);
        setLoading(false);
        return;
      }

      setLoading(false);
      setTimeout(() => fetchProfile(currentUser.id), 0);
    });

    return () => subscription.unsubscribe();
  }, []);

  // user_consents 테이블에 약관 동의 저장 (upsert, user_id 기준)
  const saveUserConsents = async ({
    userId,
    marketingAgreed,
  }: {
    userId: string;
    marketingAgreed: boolean;
  }): Promise<{ error: Error | null }> => {
    const { error } = await supabase
      .from('user_consents')
      .upsert(
        {
          user_id: userId,
          terms_agreed: true,
          privacy_agreed: true,
          marketing_agreed: marketingAgreed,
          terms_version: TERMS_VERSION,
          privacy_version: TERMS_VERSION,
          marketing_version: TERMS_VERSION,
          agreed_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      );

    if (error) {
      console.error('[saveUserConsents] 약관 동의 저장 오류:', error.message);
      return { error: new Error('약관 동의 저장 중 오류가 발생했습니다. 다시 시도해주세요.') };
    }

    return { error: null };
  };

  const signUp = async (
    email: string,
    password: string,
    name: string,
    phone?: string,
    address?: string,
    termsAgreed?: boolean,
    privacyAgreed?: boolean,
    marketingAgreed?: boolean,
  ) => {
    // 필수 약관 미동의 시 진행 차단
    if (!termsAgreed || !privacyAgreed) {
      return { error: new Error('필수 약관에 동의해야 회원가입을 진행할 수 있습니다.') };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } },
      });

      if (error) throw error;

      if (data.user) {
        // profiles 테이블 업데이트
        await supabase.from('profiles').upsert(
          {
            id: data.user.id,
            name,
            phone: phone || null,
            address: address || null,
            time_balance: 0,
            terms_agreed: true,
            privacy_agreed: true,
            marketing_agreed: marketingAgreed ?? false,
            agreed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'id' }
        );

        // user_consents 테이블에 약관 동의 저장
        const { error: consentError } = await saveUserConsents({
          userId: data.user.id,
          marketingAgreed: marketingAgreed ?? false,
        });
        if (consentError) return { error: consentError };

        // onAuthStateChange의 fetchProfile 경쟁 상태 방지를 위해 명시적으로 재조회
        await fetchProfile(data.user.id);
      }

      return { error: null };
    } catch (e) {
      return { error: e as Error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error: error as Error | null };
    } catch (e) {
      return { error: e as Error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: new Error('로그인이 필요합니다.') };

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', user.id);

      if (!error) {
        await refreshProfile();
      }

      return { error: error as Error | null };
    } catch (e) {
      return { error: e as Error };
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, profile, profileError, profileLoading, loading, signUp, signIn, signOut, updateProfile, refreshProfile, saveUserConsents }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
