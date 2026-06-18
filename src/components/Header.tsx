import { User, ArrowLeft } from 'lucide-react';
import { Screen } from '../types';

interface HeaderProps {
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
  onBack?: () => void;
  userAvatar: string;
  isAdmin?: boolean;
}

export default function Header({ currentScreen, onNavigate, onBack, userAvatar, isAdmin }: HeaderProps) {
  // Check if current screen is transactional / has back button
  const hasBack = ['match-details', 'edit-profile', 'change-password'].includes(currentScreen);

  const getTitle = () => {
    switch (currentScreen) {
      case 'match-details':
        return 'Palpite do Jogo';
      case 'edit-profile':
        return 'Editar Perfil';
      case 'change-password':
        return 'Alterar Senha';
      case 'admin':
        return 'Área do Admin';
      case 'ranking':
        return 'Ranking da Resenha';
      case 'profile':
        return 'Meu Perfil';
      default:
        return "Selman's Bet";
    }
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-[#f7f9fb] shadow-[0_10px_30px_rgba(15,23,42,0.06)] h-20 md:h-24 flex items-center transition-all">
      <div className="w-full max-w-7xl mx-auto px-4 md:px-10 flex items-center justify-between h-full">
        <div className="flex items-center gap-3">
          {hasBack && (
            <button
              onClick={onBack}
              aria-label="Voltar"
              className="p-2 -ml-2 rounded-full text-[#006b2c] hover:bg-[#eceef0] active:scale-95 transition-all cursor-pointer flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          )}

          <div 
            onClick={() => onNavigate('home')} 
            className="flex items-center gap-3 cursor-pointer active:scale-98 transition-transform"
          >
            <img 
              src="/Logo.png" 
              alt="Selman's Bet Logo" 
              className="h-10 md:h-12 w-auto object-contain"
              referrerPolicy="no-referrer"
            />
            <span className="font-poppins font-bold text-[#191c1e] text-lg md:text-xl tracking-tight">
              Selman'sBet
            </span>
          </div>

          {!hasBack && currentScreen !== 'home' && (
            <span className="hidden md:inline font-poppins font-medium text-lg text-[#191c1e] border-l-2 border-[#bdcaba] pl-4 ml-4">
              {getTitle()}
            </span>
          )}
        </div>

        {/* Desktop inline navigator */}
        <nav className="hidden md:flex items-center gap-8">
          <button
            onClick={() => onNavigate('home')}
            className={`font-sans text-sm font-semibold px-1 py-1 transition-all hover:text-[#006b2c] cursor-pointer ${
              currentScreen === 'home' || currentScreen === 'match-details'
                ? 'text-[#006b2c] border-b-2 border-[#006b2c]'
                : 'text-[#3e4a3d]'
            }`}
          >
            Início
          </button>
          <button
            onClick={() => onNavigate('ranking')}
            className={`font-sans text-sm font-semibold px-1 py-1 transition-all hover:text-[#006b2c] cursor-pointer ${
              currentScreen === 'ranking'
                ? 'text-[#006b2c] border-b-2 border-[#006b2c]'
                : 'text-[#3e4a3d]'
            }`}
          >
            Ranking
          </button>
          {isAdmin && (
            <button
              onClick={() => onNavigate('admin')}
              className={`font-sans text-sm font-semibold px-1 py-1 transition-all hover:text-[#006b2c] cursor-pointer ${
                currentScreen === 'admin'
                  ? 'text-[#006b2c] border-b-2 border-[#006b2c]'
                  : 'text-[#3e4a3d]'
              }`}
            >
              Admin
            </button>
          )}
        </nav>

        {/* Profile trigger */}
        <button
          onClick={() => onNavigate('profile')}
          aria-label="Perfil do usuário"
          className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-transparent hover:border-[#006b2c] overflow-hidden flex items-center justify-center shadow-sm hover:scale-105 active:scale-95 transition-all cursor-pointer bg-[#eceef0]"
        >
          {userAvatar ? (
            <img 
              src={userAvatar} 
              alt="Avatar" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <User className="w-5 h-5 text-[#3e4a3d]" />
          )}
        </button>
      </div>
    </header>
  );
}
