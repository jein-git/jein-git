import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export type Profile = {
  id: string;
  name: string;
  phone?: string;
  address?: string;
  profile_image_url?: string;
  time_balance: number;
  intro: string;
  role?: string; // 'user'(기본) 또는 'admin'
  terms_agreed?: boolean;
  privacy_agreed?: boolean;
  marketing_agreed?: boolean;
  agreed_at?: string;
  created_at: string;
  updated_at: string;
};

export type Service = {
  id: string;
  provider_id: string;
  title: string;
  description: string;
  category: string;
  time_cost: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  provider?: Profile;
};

export type HelpRequest = {
  id: string;
  requester_id: string;
  title: string;
  description: string;
  category: string;
  urgency: 'low' | 'normal' | 'high' | 'urgent';
  time_cost: number;
  status: 'open' | 'matched' | 'in_progress' | 'completed' | 'cancelled';
  matched_provider_id?: string;
  created_at: string;
  updated_at: string;
  requester?: Profile;
  matched_provider?: Profile;
};

export type Transaction = {
  id: string;
  provider_id: string;
  requester_id: string;
  service_id?: string;
  help_request_id?: string;
  time_amount: number;
  status: 'pending' | 'completed' | 'cancelled';
  completed_at: string;
  created_at: string;
  provider?: Profile;
  requester?: Profile;
  service?: Service;
  help_request?: HelpRequest;
};

export type ThankYouMessage = {
  id: string;
  transaction_id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  created_at: string;
  sender?: Profile;
  receiver?: Profile;
};

// time_transactions 테이블 행 타입
export type TimeTransaction = {
  id: string;
  user_id: string;
  care_match_id: string | null;
  type: 'earn' | 'spend';
  amount: number;
  balance_after: number;
  description: string;
  created_at: string;
};

// community_posts 테이블 행 타입
export type CommunityPost = {
  id: string;
  author_id: string;
  post_type: 'notice' | 'review';
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
};

export type Notification = {
  id: string;
  user_id: string;
  type: 'help_request' | 'service_matched' | 'transaction' | 'thank_you' | 'system';
  title: string;
  content?: string;
  is_read: boolean;
  created_at: string;
};

export const SERVICE_CATEGORIES = [
  '가사 도우미',
  '식사 배달',
  '이동 지원',
  '동거/동행',
  '건강 관리',
  '기술 지원',
  '정서 지원',
  '기타',
] as const;

export const URGENCY_LABELS = {
  low: '여유 있음',
  normal: '보통',
  high: '급함',
  urgent: '매우 급함',
} as const;

export const STATUS_LABELS = {
  open: '대기중',
  matched: '매칭됨',
  in_progress: '진행중',
  completed: '완료',
  cancelled: '취소',
} as const;
