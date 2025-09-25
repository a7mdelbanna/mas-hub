import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cn } from '../../lib/utils/cn';
import * as Icons from 'lucide-react';

type PortalType = 'admin' | 'employee' | 'client' | 'candidate';

interface SidebarItem {
  id: string;
  label: string;
  path: string;
  icon: string;
  badge?: string | number;
  children?: SidebarItem[];
}

interface PortalSidebarProps {
  portalType: PortalType;
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
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  // Ultra-premium portal gradients
  const portalThemes = {
    admin: 'from-slate-950 via-slate-900 to-slate-950',
    employee: 'from-blue-950 via-blue-900 to-blue-950',
    client: 'from-indigo-950 via-indigo-900 to-indigo-950',
    candidate: 'from-green-950 via-green-900 to-green-950',
  };

  const portalAccents = {
    admin: 'from-blue-500 via-purple-500 to-pink-500',
    employee: 'from-blue-400 via-cyan-400 to-teal-400',
    client: 'from-indigo-400 via-purple-400 to-pink-400',
    candidate: 'from-green-400 via-emerald-400 to-teal-400',
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
    const isHovered = hoveredItem === item.id;

    return (
      <div key={item.id}>
        <NavLink
          to={item.path}
          onClick={isMobile ? onToggle : undefined}
          onMouseEnter={() => setHoveredItem(item.id)}
          onMouseLeave={() => setHoveredItem(null)}
          className={({ isActive: navIsActive }) =>
            cn(
              'relative flex items-center px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-300 group overflow-hidden',
              depth > 0 ? 'ml-6' : '',
              isCollapsed && !isMobile ? 'justify-center' : ''
            )
          }
        >
          {({ isActive: navIsActive }) => (
            <>
              {/* Active Background with Glassmorphism */}
              {(navIsActive || isActive) && (
                <div className="absolute inset-0">
                  <div className={`absolute inset-0 bg-gradient-to-r ${portalAccents[portalType]} opacity-20 rounded-2xl`}></div>
                  <div className="absolute inset-0 bg-white/10 backdrop-blur-xl rounded-2xl"></div>
                  <div className={`absolute inset-0 bg-gradient-to-r ${portalAccents[portalType]} opacity-30 blur-xl rounded-2xl`}></div>
                  {/* Active Indicator */}
                  <div className={`absolute left-0 inset-y-2 w-1 bg-gradient-to-b ${portalAccents[portalType]} rounded-r-full shadow-lg`}></div>
                </div>
              )}

              {/* Hover Effect */}
              {!navIsActive && !isActive && isHovered && (
                <div className="absolute inset-0 bg-white/5 backdrop-blur-sm rounded-2xl transition-all duration-300"></div>
              )}

              <div className="relative flex items-center flex-1 min-w-0 z-10">
                {/* Icon with Gradient on Active */}
                <div className={cn(
                  'relative p-2 rounded-xl transition-all duration-300',
                  (navIsActive || isActive) ? `bg-gradient-to-br ${portalAccents[portalType]} shadow-lg` : 'bg-transparent'
                )}>
                  {(navIsActive || isActive) && (
                    <div className={`absolute inset-0 bg-gradient-to-br ${portalAccents[portalType]} blur-md opacity-50 rounded-xl`}></div>
                  )}
                  {renderIcon(
                    item.icon,
                    cn(
                      'relative h-5 w-5 flex-shrink-0 transition-colors duration-300',
                      (navIsActive || isActive) ? 'text-white' : 'text-gray-400 group-hover:text-white'
                    )
                  )}
                </div>

                {(!isCollapsed || isMobile) && (
                  <>
                    <span className={cn(
                      'ml-3 truncate transition-colors duration-300',
                      (navIsActive || isActive) ? 'text-white font-semibold' : 'text-gray-300 group-hover:text-white'
                    )}>
                      {item.label}
                    </span>
                    {item.badge && (
                      <span className={`ml-auto px-2.5 py-1 rounded-full text-xs font-bold transition-all duration-300 ${
                        (navIsActive || isActive)
                          ? `bg-white/20 text-white`
                          : 'bg-white/10 text-gray-300'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                    {hasChildren && (
                      <Icons.ChevronRight className={cn(
                        'ml-auto h-4 w-4 transition-all duration-300',
                        (navIsActive || isActive) ? 'text-white rotate-90' : 'text-gray-400 group-hover:translate-x-1'
                      )} />
                    )}
                  </>
                )}
              </div>
            </>
          )}
        </NavLink>

        {/* Render children items with slide animation */}
        {hasChildren && (!isCollapsed || isMobile) && (
          <div className="mt-1 space-y-1 overflow-hidden transition-all duration-300">
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
          'fixed top-0 left-0 z-50 h-full transition-all duration-500 ease-in-out',
          isCollapsed && !isMobile ? 'w-20' : 'w-72',
          isMobile ? 'z-50' : 'z-40'
        )}
      >
        {/* Glassmorphic Background */}
        <div className={`absolute inset-0 bg-gradient-to-b ${portalThemes[portalType]}`}>
          {/* Glass overlay */}
          <div className="absolute inset-0 bg-black/20 backdrop-blur-2xl"></div>
          {/* Border gradient */}
          <div className={`absolute inset-y-0 right-0 w-px bg-gradient-to-b ${portalAccents[portalType]} opacity-30`}></div>
          {/* Decorative gradient orbs */}
          <div className={`absolute top-20 -right-10 w-40 h-40 bg-gradient-to-br ${portalAccents[portalType]} rounded-full blur-3xl opacity-10 animate-pulse-slow`}></div>
          <div className={`absolute bottom-20 -left-10 w-40 h-40 bg-gradient-to-tr ${portalAccents[portalType]} rounded-full blur-3xl opacity-10 animate-pulse-slow animation-delay-2000`}></div>
        </div>

        <div className="relative z-10 h-full flex flex-col">
          {/* Ultra-Premium Logo/Brand Area */}
          <div className="h-20 flex items-center justify-center">
            {isCollapsed && !isMobile ? (
              <div className={`relative p-3 rounded-2xl bg-gradient-to-br ${portalAccents[portalType]} shadow-2xl`}>
                <div className={`absolute inset-0 bg-gradient-to-br ${portalAccents[portalType]} blur-xl opacity-50 rounded-2xl`}></div>
                <span className="relative text-white font-bold text-xl">M</span>
              </div>
            ) : (
              <div className="px-6 flex items-center space-x-4 w-full">
                <div className={`relative p-3 rounded-2xl bg-gradient-to-br ${portalAccents[portalType]} shadow-2xl group-hover:scale-110 transition-transform duration-300`}>
                  <div className={`absolute inset-0 bg-gradient-to-br ${portalAccents[portalType]} blur-xl opacity-50 rounded-2xl animate-pulse-slow`}></div>
                  <Icons.Zap className="relative h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h1 className="text-white font-bold text-xl tracking-tight">MAS</h1>
                  <p className={`text-xs font-medium bg-gradient-to-r ${portalAccents[portalType]} bg-clip-text text-transparent capitalize`}>
                    {portalType === 'admin' ? 'Admin Portal' : `${portalType} Portal`}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className={`mx-4 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent`}></div>

          {/* Navigation Items with Custom Scrollbar */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            {items.map(item => renderNavItem(item))}
          </nav>

          {/* Premium Footer */}
          {(!isCollapsed || isMobile) && (
            <div className="p-4">
              <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${portalAccents[portalType]} p-4`}>
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-semibold text-sm">MAS Business OS</span>
                    <span className="text-white/80 text-xs">v1.0</span>
                  </div>
                  <div className="h-1 bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full bg-white/50 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                  <p className="text-white/70 text-xs mt-2">System performing optimally</p>
                </div>
                <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}