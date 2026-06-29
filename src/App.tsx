import { Routes, Route, Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

import { AuthProvider, useAuth } from './context/AuthContext';
import { UserProvider } from './context/UserContext';
import { AppShellWrapper } from './components/layout/AppShell';

import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { HomePage } from './pages/HomePage';
import { MyAssetsPage } from './pages/MyAssetsPage';
import { AddAssetPage } from './pages/AddAssetPage';
import { HelpExchangePage } from './pages/HelpExchangePage';
import { HelpRequestPage } from './pages/HelpRequestPage';
import { CareRequestListPage } from './pages/CareRequestListPage';
import { CareRequestDetailPage } from './pages/CareRequestDetailPage';
import { BankbookPage } from './pages/BankbookPage';
import { VillagePage } from './pages/VillagePage';
import { MyInfoPage } from './pages/MyInfoPage';
import { SettingsPage } from './pages/SettingsPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { ReportPage } from './pages/ReportPage';
import { MyMatchesPage } from './pages/MyMatchesPage';
import { CommunityPage } from './pages/CommunityPage';
import { CommunityDetailPage } from './pages/CommunityDetailPage';
import { CommunityWritePage } from './pages/CommunityWritePage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { ProfileSetupPage } from './pages/ProfileSetupPage';
import { TermsAgreementPage } from './pages/TermsAgreementPage';

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-surface-base flex flex-col items-center justify-center gap-4">
      <Loader2 className="w-12 h-12 animate-spin text-primary" />
      <p className="text-body-lg text-ink-muted">잠깐만요...</p>
    </div>
  );
}

function AppRoutes() {
  const { user, profile, profileLoading, profileError, loading } = useAuth();

  // 인증·프로필 중 하나라도 미확정이면 스피너 유지
  // (loading→false 직후 profileLoading이 시작되기 전 한 프레임 빈틈 방지)
  if (loading || profileLoading || (!!user && !profile && !profileError)) {
    return <LoadingScreen />;
  }

  // 비로그인: 로그인/회원가입 화면만 접근 가능
  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/terms-agreement" element={<TermsAgreementPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // 로그인했지만 약관 미동의 시 약관 동의 강제 (구글 OAuth 신규 가입 등)
  // terms_agreed === false: DB에 컬럼이 있고 명시적으로 미동의인 경우만 게이트
  // undefined (컬럼 미존재) 는 false가 아니므로 게이트 건너뜀
  if (profile && (profile.terms_agreed === false || profile.privacy_agreed === false)) {
    return (
      <Routes>
        <Route path="/terms-agreement" element={<TermsAgreementPage />} />
        <Route path="*" element={<Navigate to="/terms-agreement" replace />} />
      </Routes>
    );
  }

  // 로그인했지만 phone 또는 address 미입력 시 프로필 설정 강제
  if (profile && (!profile.phone || !profile.address)) {
    return (
      <Routes>
        <Route path="/profile-setup" element={<ProfileSetupPage />} />
        <Route path="*" element={<Navigate to="/profile-setup" replace />} />
      </Routes>
    );
  }

  // 로그인 상태: UserProvider는 mock 데이터(거래내역·자산)를 위해 유지
  return (
    <UserProvider>
      <Routes>
        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route path="/signup" element={<Navigate to="/" replace />} />
        <Route path="/terms-agreement" element={<Navigate to="/" replace />} />
        <Route path="/profile-setup" element={<Navigate to="/" replace />} />

        <Route
          path="/"
          element={
            <AppShellWrapper>
              <HomePage />
            </AppShellWrapper>
          }
        />
        <Route
          path="/assets"
          element={
            <AppShellWrapper title="내 자산">
              <MyAssetsPage />
            </AppShellWrapper>
          }
        />
        <Route path="/assets/new" element={<AddAssetPage />} />
        <Route
          path="/help"
          element={
            <AppShellWrapper title="주고받기">
              <HelpExchangePage />
            </AppShellWrapper>
          }
        />
        {/* 도움 요청 작성 폼 */}
        <Route path="/help/request" element={<HelpRequestPage />} />
        {/* 도움 요청 상세 (id는 UUID) */}
        <Route path="/help/request/:id" element={<CareRequestDetailPage />} />
        {/* 도움 요청 목록 (open 상태만) */}
        <Route path="/help/offer" element={<CareRequestListPage />} />
        <Route
          path="/bankbook"
          element={
            <AppShellWrapper title="내 시간">
              <BankbookPage />
            </AppShellWrapper>
          }
        />
        <Route
          path="/village"
          element={
            <AppShellWrapper title="마을 사랑방">
              <VillagePage />
            </AppShellWrapper>
          }
        />
        <Route
          path="/me"
          element={
            <AppShellWrapper title="내 정보">
              <MyInfoPage />
            </AppShellWrapper>
          }
        />
        {/* 내 매칭 내역 */}
        <Route path="/matches" element={<MyMatchesPage />} />
        <Route path="/me/settings" element={<SettingsPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/report" element={<ReportPage />} />

        {/* 커뮤니티: 공지사항·돌봄 후기 */}
        <Route
          path="/community"
          element={
            <AppShellWrapper title="공지·후기">
              <CommunityPage />
            </AppShellWrapper>
          }
        />
        {/* 글쓰기는 AppShell 없이 독립 페이지 */}
        <Route path="/community/write" element={<CommunityWritePage />} />
        {/* 상세 보기: /write 보다 뒤에 정의 */}
        <Route path="/community/:id" element={<CommunityDetailPage />} />

        {/* 관리자 대시보드 */}
        <Route path="/admin" element={<AdminDashboardPage />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </UserProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
