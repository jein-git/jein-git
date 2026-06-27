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

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-surface-base flex flex-col items-center justify-center gap-4">
      <Loader2 className="w-12 h-12 animate-spin text-primary" />
      <p className="text-body-lg text-ink-muted">잠깐만요...</p>
    </div>
  );
}

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;

  // 비로그인: 로그인/회원가입 화면만 접근 가능
  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // 로그인 상태: UserProvider는 mock 데이터(거래내역·자산)를 위해 유지
  return (
    <UserProvider>
      <Routes>
        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route path="/signup" element={<Navigate to="/" replace />} />

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
