import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PortalType } from '../../types/models';
import { cn } from '../../lib/utils/cn';
import * as Icons from 'lucide-react';

interface SidebarItem {
  id: string;
  label: string;
  path: string;
  icon: string;
  badge?: string | number;
  children?: SidebarItem[];
}

interface PortalSidebarProps {
  portalType: PortalType | 'admin';
  items: SidebarItem[];
  isOpen: boolean;
  isCollapsed: boolean;
  isMobile: boolean;
  onToggle: () => void;
}

export function PortalSidebar({
  portalType,
  items,
  isOpen,
  isCollapsed,
  isMobile,
  onToggle
}: PortalSidebarProps) {
  const { t } = useTranslation();
  const location = useLocation();

  // Portal theme colors
  const portalThemes = {
    admin: 'bg-slate-900 border-slate-700',
    employee: 'bg-blue-900 border-blue-700',
    client: 'bg-indigo-900 border-indigo-700',
    candidate: 'bg-green-900 border-green-700',
  };

  const renderIcon = (iconName: string, className: string) => {
    const IconComponent = (Icons as any)[iconName];
    return IconComponent ? (
      <IconComponent className={className} />
    ) : (
      <Icons.Circle className={className} />
    );
  };

  const renderNavItem = (item: SidebarItem, depth = 0) => {
    const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
    const hasChildren = item.children && item.children.length > 0;

    return (
      <div key={item.id}>
        <NavLink
          to={item.path}
          onClick={isMobile ? onToggle : undefined}
          className={({ isActive: navIsActive }) =>
            cn(
              'flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors group',
              depth > 0 ? 'ml-6' : '',
              navIsActive || isActive
                ? 'bg-white/10 text-white'
                : 'text-gray-300 hover:text-white hover:bg-white/5',
              isCollapsed && !isMobile ? 'justify-center' : ''
            )
          }
        >
          <div className="flex items-center flex-1 min-w-0">
            {renderIcon(item.icon, 'h-5 w-5 flex-shrink-0')}
            {(!isCollapsed || isMobile) && (
              <>
                <span className="ml-3 truncate">{item.label}</span>
                {item.badge && (
                  <span className="ml-auto bg-white/20 text-xs px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
                {hasChildren && (
                  <Icons.ChevronRight className="ml-auto h-4 w-4 transition-transform group-hover:translate-x-1" />
                )}
              </>
            )}
          </div>
        </NavLink>

        {/* Render children items */}
        {hasChildren && (!isCollapsed || isMobile) && (
          <div className="mt-1 space-y-1">
            {item.children!.map(child => renderNavItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  if (!isOpen && !isMobile) {
    return null;
  }

  return (
    <>
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full transition-all duration-300 ease-in-out border-r',
          portalThemes[portalType],
          isCollapsed && !isMobile ? 'w-16' : 'w-64',
          isMobile ? 'z-50' : 'z-40'
        )}
      >
        {/* Logo/Brand Area */}
        <div className="h-16 flex items-center justify-center border-b border-white/10">
          {isCollapsed && !isMobile ? (
            <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
          ) : (
            <div className="px-4 flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">M</span>
              </div>
              <div>
                <h1 className="text-white font-semibold text-lg">MAS</h1>
                <p className="text-gray-300 text-xs capitalize">
                  {portalType === 'admin' ? 'Admin' : `${portalType} Portal`}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-2 overflow-y-auto">
          {items.map(item => renderNavItem(item))}
        </nav>

        {/* Footer/User Info */}
        {(!isCollapsed || isMobile) && (
          <div className="p-4 border-t border-white/10">
            <div className="text-xs text-gray-400 text-center">
              MAS Business OS v1.0
            </div>
          </div>
        )}
      </aside>
    </>
  );
}