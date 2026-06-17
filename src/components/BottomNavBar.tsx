import { Home, Trophy, Settings } from 'lucide-react';
import { Screen } from '../types';

interface BottomNavBarProps {
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
  isAdmin?: boolean;
}

export default function BottomNavBar({ currentScreen, onNavigate, isAdmin }: BottomNavBarProps) {
  const isInicioActive = ['home', 'match-details'].includes(currentScreen);
  const isRankingActive = currentScreen === 'ranking';
  const isAdminActive = currentScreen === 'admin';

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 py-3 pb-[env(safe-area-inset-bottom,16px)] bg-[#f7f9fb]/90 backdrop-blur-md rounded-t-2xl border-t border-[#bdcaba]/30 shadow-[0_-10px_25px_rgba(15,23,42,0.08)]">
      {/* Tab: Início */}
      <button
        onClick={() => onNavigate('home')}
        className={`flex flex-col items-center justify-center transition-all duration-300 relative rounded-t-xl px-5 pt-3 pb-4 -mb-3 ${
          isInicioActive
            ? 'bg-[#fed01b] text-[#6f5900] font-bold shadow-[0_-4px_12px_rgba(254,208,27,0.3)] -translate-y-2 z-10'
            : 'text-[#3e4a3d] hover:bg-[#eceef0]/60 translate-y-1'
        }`}
      >
        <Home className={`w-5 h-5 ${isInicioActive ? 'stroke-[2.5]' : 'stroke-[2]'}`} />
        <span className="text-[11px] font-sans font-medium mt-1">Início</span>
      </button>

      {/* Tab: Ranking */}
      <button
        onClick={() => onNavigate('ranking')}
        className={`flex flex-col items-center justify-center transition-all duration-300 relative rounded-t-xl px-5 pt-3 pb-4 -mb-3 ${
          isRankingActive
            ? 'bg-[#fed01b] text-[#6f5900] font-bold shadow-[0_-4px_12px_rgba(254,208,27,0.3)] -translate-y-2 z-10'
            : 'text-[#3e4a3d] hover:bg-[#eceef0]/60 translate-y-1'
        }`}
      >
        <Trophy className={`w-5 h-5 ${isRankingActive ? 'stroke-[2.5]' : 'stroke-[2]'}`} />
        <span className="text-[11px] font-sans font-medium mt-1">Ranking</span>
      </button>

      {/* Tab: Admin */}
      {isAdmin && (
        <button
          onClick={() => onNavigate('admin')}
          className={`flex flex-col items-center justify-center transition-all duration-300 relative rounded-t-xl px-5 pt-3 pb-4 -mb-3 ${
            isAdminActive
              ? 'bg-[#fed01b] text-[#6f5900] font-bold shadow-[0_-4px_12px_rgba(254,208,27,0.3)] -translate-y-2 z-10'
              : 'text-[#3e4a3d] hover:bg-[#eceef0]/60 translate-y-1'
          }`}
        >
          <Settings className={`w-5 h-5 ${isAdminActive ? 'stroke-[2.5]' : 'stroke-[2]'}`} />
          <span className="text-[11px] font-sans font-medium mt-1">Admin</span>
        </button>
      )}
    </nav>
  );
}
