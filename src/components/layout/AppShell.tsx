import { ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { BottomTabBar } from './BottomTabBar';
import { SosButton } from './SosButton';
import { FloatingHelp } from './FloatingHelp';
import { PhoneHelpModal } from './PhoneHelpModal';

type AppShellProps = {
  title?: string;
  showBack?: boolean;
  hideBottomTab?: boolean;
};

export function AppShell({ title, showBack = false, hideBottomTab = false }: AppShellProps) {
  return (
    <div className="min-h-screen bg-surface-base flex flex-col">
      <Header title={title} showBack={showBack} right={<SosButton />} />

      <main className={`flex-1 overflow-y-auto ${!hideBottomTab ? 'pb-24' : ''}`}>
        <Outlet />
      </main>

      {!hideBottomTab && <BottomTabBar />}

      <div className="fixed bottom-[100px] right-6 z-40">
        <FloatingHelp />
      </div>

      <PhoneHelpModal />
    </div>
  );
}

export function AppShellWrapper({
  children,
  title,
  showBack,
  hideBottomTab = false,
}: {
  children: ReactNode;
  title?: string;
  showBack?: boolean;
  hideBottomTab?: boolean;
}) {
  return (
    <div className="min-h-screen bg-surface-base flex flex-col">
      <Header title={title} showBack={showBack} right={<SosButton />} />

      <main className={`flex-1 overflow-y-auto ${!hideBottomTab ? 'pb-24' : ''}`}>
        {children}
      </main>

      {!hideBottomTab && <BottomTabBar />}

      <div className="fixed bottom-[100px] right-6 z-40">
        <FloatingHelp />
      </div>

      <PhoneHelpModal />
    </div>
  );
}
