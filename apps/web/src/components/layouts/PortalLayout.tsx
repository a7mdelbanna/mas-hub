import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { toggleSidebar, setSidebarCollapsed } from '../../store/slices/uiSlice';
import { PortalHeader } from './PortalHeader';
import { PortalSidebar } from './PortalSidebar';
import { User, PortalType } from '../../types/models';
import { cn } from '../../lib/utils/cn';

interface SidebarItem {
  id: string;
  label: string;
  path: string;
  icon: string;
  badge?: string | number;
  children?: SidebarItem[];
}

interface PortalLayoutProps {
  portalType: PortalType | 'admin';
  user: User | null;
  children: React.ReactNode;
  sidebarItems: SidebarItem[];
}

export function PortalLayout({
  portalType,
  user,
  children,
  sidebarItems
}: PortalLayoutProps) {
  const { sidebarOpen, sidebarCollapsed } = useSelector((state: RootState) => state.ui);
  const dispatch = useDispatch();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  React.useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);

      // Auto-collapse sidebar on mobile
      if (mobile && sidebarOpen) {
        dispatch(setSidebarCollapsed(true));
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [dispatch, sidebarOpen]);

  const handleSidebarToggle = () => {
    dispatch(toggleSidebar());
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <PortalSidebar
        portalType={portalType}
        items={sidebarItems}
        isOpen={sidebarOpen}
        isCollapsed={sidebarCollapsed}
        isMobile={isMobile}
        onToggle={handleSidebarToggle}
      />

      {/* Main Content */}
      <div className={cn(
        'transition-all duration-300 ease-in-out',
        sidebarOpen && !isMobile
          ? sidebarCollapsed
            ? 'ml-16'
            : 'ml-64'
          : 'ml-0'
      )}>
        {/* Header */}
        <PortalHeader
          portalType={portalType}
          user={user}
          onSidebarToggle={handleSidebarToggle}
          sidebarOpen={sidebarOpen}
        />

        {/* Page Content */}
        <main className="min-h-[calc(100vh-4rem)] bg-white dark:bg-gray-800">
          {children}
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={handleSidebarToggle}
        />
      )}
    </div>
  );
}