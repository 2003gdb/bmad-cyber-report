import React from 'react';
import { Button } from './ui/button';
import { Home, Plus, BarChart3, User } from 'lucide-react';
import type { Screen } from '../App';

interface BottomNavigationProps {
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
}

export function BottomNavigation({ currentScreen, onNavigate }: BottomNavigationProps) {
  const navItems = [
    {
      key: 'insights' as Screen,
      icon: Home,
      label: 'Inicio'
    },
    {
      key: 'report' as Screen,
      icon: Plus,
      label: 'Reportar',
      isSpecial: true
    },
    {
      key: 'reports' as Screen,
      icon: BarChart3,
      label: 'Estadísticas'
    },
    {
      key: 'profile' as Screen,
      icon: User,
      label: 'Perfil'
    }
  ];

  return (
    <div className="bg-white/90 backdrop-blur-lg border-t border-[#A1CDF4]/20 p-4 safe-area-bottom">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = currentScreen === item.key;
          
          return (
            <Button
              key={item.key}
              variant="ghost"
              size="sm"
              onClick={() => onNavigate(item.key)}
              className={`flex flex-col items-center gap-1 p-2 h-auto ${
                item.isSpecial
                  ? 'bg-[#F5853F] hover:bg-[#F5853F]/90 text-white rounded-full w-14 h-14'
                  : isActive
                  ? 'text-[#F5853F]'
                  : 'text-muted-foreground hover:text-[#25283D]'
              }`}
            >
              <IconComponent className={`${item.isSpecial ? 'w-6 h-6' : 'w-5 h-5'}`} />
              {!item.isSpecial && (
                <span className="text-xs font-medium">{item.label}</span>
              )}
            </Button>
          );
        })}
      </div>
    </div>
  );
}