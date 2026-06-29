import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { Profile } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

type AuthContextType = {
  user: User | null;
  profile: Profile | null;
  profileError: string | null;   // 프로필 조회 오류 메시지
  profileLoading: boolean;       // 프로필 조회 진행 중 여부
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
      // role 컬럼을 명시적으로 포함해 조회
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, phone, address, profile_image_url, time_balance, intro, role, terms_agreed, privacy_agreed, marketing_agreed, agreed_at, created_at, updated_at')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        // 오류를 콘솔에 상세 출력 + 상태로 저장
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

      // 성공
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
    // 1단계: 초기 세션을 먼저 확인 (OAuth 콜백 포함)
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        setTimeout(() => fetchProfile(currentUser.id), 0);
      }
      setLoading(false);
    });

    // 2단계: 이후 세션 변화 감지 (로그인·로그아웃·토큰 갱신)
    // INITIAL_SESSION은 getSession()으로 이미 처리했으므로 건너뜀
    // 주의: 콜백 내에서 Supabase 메서드를 직접 await하면 auth lock 교착상태 발생 가능
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
    // 필수 약관 미동의 시 저장 차단
    if (!termsAgreed || !privacyAgreed) {
      return { error: new Error('필수 약관에 동의해야 회원가입을 진행할 수 있습니다.') };
    }

    try {
      // name을 메타데이터로 전달 → DB 트리거가 profiles 행 자동 생성 시 사용
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } },
      });

      if (error) throw error;

      if (data.user) {
        // 트리거가 생성한 프로필 행에 추가 정보 업데이트
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

        // upsert 완료 후 프로필을 명시적으로 재조회:
        // onAuthStateChange의 setTimeout(0) fetchProfile이 upsert보다 먼저 실행되는
        // 경쟁 상태를 방지해 phone/address가 있음에도 /profile-setup으로 이동하는 버그를 막음
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
      value={{ user, profile, profileError, profileLoading, loading, signUp, signIn, signOut, updateProfile, refreshProfile }}
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
