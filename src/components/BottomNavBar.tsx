import { Home, Trophy, Settings } from 'lucide-react';
import { Screen } from '../types';

interface BottomNavBarProps {
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
}

export default function BottomNavBar({ currentScreen, onNavigate }: BottomNavBarProps) {
  const isInicioActive = ['home', 'match-details'].includes(currentScreen);
  const isRankingActive = currentScreen === 'ranking';
  const isAdminActive = currentScreen === 'admin';

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 py-3 pb-[env(safe-area-inset-bottom,16px)] bg-[#f7f9fb]/90 backdrop-blur-md rounded-t-2xl border-t border-[#bdcaba]/30 shadow-[0_-10px_25px_rgba(15,23,42,0.08)]">
      {/* Tab: Início */}
      <button
        onClick={() => onNavigate('home')}
        className={`flex flex-col items-center justify-center transition-all active:scale-90 duration-150 py-1 px-4 rounded-full ${
          isInicioActive
            ? 'bg-[#fed01b] text-[#6f5900] font-bold shadow-sm'
            : 'text-[#3e4a3d] hover:bg-[#eceef0]/60'
        }`}
      >
        <Home className={`w-5 h-5 ${isInicioActive ? 'stroke-[2.5]' : 'stroke-[2]'}`} />
        <span className="text-[11px] font-sans font-medium mt-1">Início</span>
      </button>

      {/* Tab: Ranking */}
      <button
        onClick={() => onNavigate('ranking')}
        className={`flex flex-col items-center justify-center transition-all active:scale-90 duration-150 py-1 px-4 rounded-full ${
          isRankingActive
            ? 'bg-[#fed01b] text-[#6f5900] font-bold shadow-sm'
            : 'text-[#3e4a3d] hover:bg-[#eceef0]/60'
        }`}
      >
        <Trophy className={`w-5 h-5 ${isRankingActive ? 'stroke-[2.5]' : 'stroke-[2]'}`} />
        <span className="text-[11px] font-sans font-medium mt-1">Ranking</span>
      </button>

      {/* Tab: Admin */}
      <button
        onClick={() => onNavigate('admin')}
        className={`flex flex-col items-center justify-center transition-all active:scale-90 duration-150 py-1 px-4 rounded-full ${
          isAdminActive
            ? 'bg-[#fed01b] text-[#6f5900] font-bold shadow-sm'
            : 'text-[#3e4a3d] hover:bg-[#eceef0]/60'
        }`}
      >
        <Settings className={`w-5 h-5 ${isAdminActive ? 'stroke-[2.5]' : 'stroke-[2]'}`} />
        <span className="text-[11px] font-sans font-medium mt-1">Admin</span>
      </button>
    </nav>
  );
}
