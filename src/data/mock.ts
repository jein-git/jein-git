import type { User, Asset, Transaction, Meeting, Hub } from "../types";

export const mockUser: User = {
  id: "u_001",
  name: "김순자",
  nickname: "순자할머니",
  age: 72,
  district: "마포구 망원동",
  joinedAt: "2026-01-15",
  hasCoordinatorContact: true,
};

export const mockAssets: Asset[] = [
  {
    id: "a_001",
    category: "sewing",
    title: "한복 바느질",
    description: "30년 경력, 한복부터 일상 수선까지",
    totalHours: 12,
    availability: { days: ["월","수","금"], timeSlots: ["오전"], distance: "town" },
  },
  {
    id: "a_002",
    category: "talking",
    title: "말벗 · 안부 전화",
    description: "혼자 계신 분과 따뜻한 대화 나누기",
    totalHours: 8,
    availability: { days: ["화","목"], timeSlots: ["오후"], distance: "walk10" },
  },
  {
    id: "a_003",
    category: "gardening",
    title: "텃밭 · 화분 가꾸기",
    description: "베란다 텃밭과 화분 관리법 알려드려요",
    totalHours: 4,
    availability: { days: ["토"], timeSlots: ["오전"], distance: "town" },
  },
];

export const mockTransactions: Transaction[] = [
  {
    id: "t_001",
    date: "2026-05-18",
    type: "spend",
    hours: 1,
    category: "병원 동행",
    counterpartyNickname: "지영씨",
    activityTitle: "정형외과 진료 동행",
    gratitudeMessage: "지영씨 덕분에 모처럼 손주 만나러 다녀왔어요. 정말 고마워요.",
  },
  {
    id: "t_002",
    date: "2026-05-12",
    type: "earn",
    hours: 2,
    category: "한복 바느질",
    counterpartyNickname: "민서엄마",
    activityTitle: "한복 치마 수선",
    gratitudeMessage: "정성스럽게 봐주셔서 감사해요.",
  },
  {
    id: "t_003",
    date: "2026-05-05",
    type: "earn",
    hours: 1,
    category: "말벗",
    counterpartyNickname: "영수할아버지",
    activityTitle: "안부 전화 30분",
  },
];

export const mockBalance = {
  total: 24,
  thisMonth: { earned: 3, spent: 1 },
};

export const mockMeetings: Meeting[] = [
  {
    id: "m_001",
    title: "수요일 점심 만찬",
    category: "banchan",
    date: "2026-05-22T12:00:00",
    location: "망원동 품터 1층",
    hubName: "망원동 품터",
    participants: 12,
    capacity: 20,
    isJoined: false,
  },
  {
    id: "m_002",
    title: "한복 바느질 함께 배우기",
    category: "class",
    date: "2026-05-24T14:00:00",
    location: "망원동 품터 2층",
    hubName: "망원동 품터",
    participants: 6,
    capacity: 10,
    isJoined: true,
  },
];

export const mockHub: Hub = {
  name: "망원동 품터",
  address: "서울 마포구 망원동 123",
  coordinator: { name: "정민호", phone: "010-1234-5678" },
};

export const ASSET_CATEGORY_LABELS: Record<AssetCategory, string> = {
  cooking: "요리",
  sewing: "바늘질",
  talking: "말벗",
  gardening: "텃밭",
  teaching: "가르치기",
  repairing: "수리",
  walking: "산책",
  cleaning: "청소",
};

export const ASSET_CATEGORY_ICONS: Record<AssetCategory, string> = {
  cooking: "👨‍🍳",
  sewing: "🧵",
  talking: "💬",
  gardening: "🌱",
  teaching: "📚",
  repairing: "🔧",
  walking: "🚶",
  cleaning: "🧹",
};

export const HELP_CATEGORY_LABELS: Record<HelpCategory, string> = {
  hospital: "병원 동행",
  shopping: "장보기",
  talking: "말벗",
  repairing: "생활 수리",
  moving: "이동",
  other: "기타",
};

export const HELP_CATEGORY_ICONS: Record<HelpCategory, string> = {
  hospital: "🏥",
  shopping: "🛒",
  talking: "💬",
  repairing: "🔧",
  moving: "🚗",
  other: "➕",
};

export const MEETING_CATEGORY_LABELS: Record<Meeting["category"], string> = {
  banchan: "만찬",
  class: "강습",
  tea: "다과",
  walk: "산책",
};
