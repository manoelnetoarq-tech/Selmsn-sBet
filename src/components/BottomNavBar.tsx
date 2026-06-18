import { Home, Trophy, Settings, MessageCircle } from 'lucide-react';
import { Screen } from '../types';

interface BottomNavBarProps {
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
  isAdmin?: boolean;
}

export default function BottomNavBar({ currentScreen, onNavigate, isAdmin }: BottomNavBarProps) {
  const isInicioActive = ['home', 'match-details'].includes(currentScreen);
  const isRankingActive = currentScreen === 'ranking';
  const isChatActive = currentScreen === 'chat';
  const isAdminActive = currentScreen === 'admin';

  const navItems = [
    { id: 'home', icon: Home, label: 'Início', isActive: isInicioActive },
    { id: 'chat', icon: MessageCircle, label: 'Resenha', isActive: isChatActive },
    { id: 'ranking', icon: Trophy, label: 'Ranking', isActive: isRankingActive },
  ];
  
  if (isAdmin) {
    navItems.push({ id: 'admin', icon: Settings, label: 'Admin', isActive: isAdminActive });
  }

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 bg-[#f7f9fb] shadow-[0_-10px_25px_rgba(15,23,42,0.06)] rounded-t-3xl flex justify-around px-2">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = item.isActive;
        
        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id as Screen)}
            className="relative flex-1 flex flex-col items-center justify-start pt-2 pb-[calc(14px+env(safe-area-inset-bottom,0px))]"
          >
            {/* O círculo flutuante com o ícone - usa a borda com a mesma cor do fundo para criar a ilusão de recorte (cutout) */}
            <div 
              className={`absolute flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] rounded-full ${
                isActive 
                  ? 'top-0 -translate-y-[40%] w-[64px] h-[64px] bg-[#fed01b] shadow-[0_8px_16px_rgba(254,208,27,0.3)] border-[6px] border-[#f7f9fb] z-20' 
                  : 'top-2 translate-y-0 w-[48px] h-[48px] bg-transparent border-[6px] border-transparent z-10'
              }`}
            >
              <Icon 
                className={`transition-all duration-500 ${
                  isActive 
                    ? 'w-6 h-6 stroke-[2.5] text-[#6f5900]' 
                    : 'w-[22px] h-[22px] stroke-[2] text-[#8e9894]'
                }`} 
              />
            </div>
            
            {/* Espaçador invisível para empurrar o texto para baixo, já que o ícone é absoluto */}
            <div className="w-full h-10" />

            {/* O texto abaixo do ícone */}
            <span 
              className={`text-[11px] font-sans font-semibold transition-all duration-500 ${
                isActive 
                  ? 'opacity-100 text-[#191c1e]' 
                  : 'opacity-100 text-[#8e9894]'
              }`}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
