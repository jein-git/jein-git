// 자산 카테고리
export type AssetCategory =
  | "cooking"      // 요리
  | "sewing"       // 바느질·수선
  | "talking"      // 말벗·경청
  | "gardening"    // 텃밭·화분
  | "teaching"     // 가르치기 (서예·뜨개질 등)
  | "repairing"    // 간단한 수리
  | "walking"      // 산책 동행
  | "cleaning";    // 청소

// 도움 카테고리 (받는 쪽)
export type HelpCategory =
  | "hospital"     // 병원 동행
  | "shopping"     // 장보기
  | "talking"      // 말벗
  | "repairing"    // 생활 수리
  | "moving"       // 이동
  | "other";

export interface User {
  id: string;
  name: string;          // 김순자
  nickname: string;      // 별명 (예: 순자할머니)
  age: number;
  district: string;      // 거주 동/읍/면 (예: 마포구 망원동)
  joinedAt: string;      // ISO date
  hasCoordinatorContact: boolean;
}

export interface Asset {
  id: string;
  category: AssetCategory;
  title: string;         // "한복 바느질"
  description: string;   // "30년 경력, 일상 수선까지"
  totalHours: number;    // 누적 활동 시간
  availability: {
    days: string[];      // ["월", "수", "금"]
    timeSlots: string[]; // ["오전", "오후"]
    distance: "walk10" | "town" | "car";
  };
}

export interface Transaction {
  id: string;
  date: string;          // ISO date
  type: "earn" | "spend"; // 적립/사용
  hours: number;         // 0.5 단위
  category: string;
  counterpartyNickname: string;
  activityTitle: string; // "장보기 동행"
  gratitudeMessage?: string;
}

export interface Meeting {
  id: string;
  title: string;
  category: "banchan" | "class" | "tea" | "walk"; // 만찬·강습·다과·산책
  date: string;          // ISO datetime
  location: string;
  hubName: string;       // "망원동 품터"
  participants: number;
  capacity: number;
  isJoined: boolean;
}

export interface HelpRequest {
  id: string;
  category: HelpCategory;
  preferredDate: string;
  timeSlot: string;
  location: "home" | "public";
  note: string;
  status: "pending" | "matched" | "completed";
  createdAt: string;
}

// 접근성 설정
export interface AccessibilitySettings {
  fontScale: "normal" | "large" | "xlarge"; // 1.0 / 1.15 / 1.3
  highContrast: boolean;
  voiceGuide: boolean;
}

// 코디네이터
export interface Coordinator {
  name: string;
  phone: string;
}

// 거점
export interface Hub {
  name: string;
  address: string;
  coordinator: Coordinator;
}
