import { useState, useEffect } from 'react';
import { 
  INITIAL_MATCHES, 
  INITIAL_PREDICTIONS, 
  INITIAL_USER_PROFILE, 
  MOCK_RANKING 
} from './data/initialData';
import { Match, Prediction, UserProfile, Screen, MatchStatus } from './types';
import Header from './components/Header';
import BottomNavBar from './components/BottomNavBar';
import MatchCard from './components/MatchCard';
import Leaderboard from './components/Leaderboard';
import MatchDetailBetting from './components/MatchDetailBetting';
import AdminPanel from './components/AdminPanel';
import ProfileEdit from './components/ProfileEdit';
import AuthScreens from './components/AuthScreens';
import { Trophy, Compass, Star, Flame, Award, ShieldAlert } from 'lucide-react';

export default function App() {
  // 1. Core Persistent States
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    const saved = localStorage.getItem('seman_isLoggedIn');
    return saved ? JSON.parse(saved) : false;
  });

  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('seman_user');
    return saved ? JSON.parse(saved) : INITIAL_USER_PROFILE;
  });

  const [matches, setMatches] = useState<Match[]>(() => {
    const saved = localStorage.getItem('seman_matches');
    return saved ? JSON.parse(saved) : INITIAL_MATCHES;
  });

  const [predictions, setPredictions] = useState<Prediction[]>(() => {
    const saved = localStorage.getItem('seman_predictions');
    return saved ? JSON.parse(saved) : INITIAL_PREDICTIONS;
  });

  const [authView, setAuthView] = useState<'login' | 'register' | 'recovery'>('login');
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('seman_isLoggedIn', JSON.stringify(isLoggedIn));
  }, [isLoggedIn]);

  useEffect(() => {
    localStorage.setItem('seman_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('seman_matches', JSON.stringify(matches));
  }, [matches]);

  useEffect(() => {
    localStorage.setItem('seman_predictions', JSON.stringify(predictions));
  }, [predictions]);

  // 2. Score Calculation Helpers (5 pts correct score, 3 pts correct outcome)
  const calculatePoints = (exactPred: Prediction, finishedMatch: Match): number => {
    const actH = finishedMatch.scoreHome;
    const actA = finishedMatch.scoreAway;
    const prdH = exactPred.scoreHome;
    const prdA = exactPred.scoreAway;

    if (actH === undefined || actA === undefined) return 0;

    // Exact Score Match
    if (actH === prdH && actA === prdA) {
      return 5;
    }

    // Outcome match (Draw or Winner matches)
    const actOutcome = Math.sign(actH - actA);
    const prdOutcome = Math.sign(prdH - prdA);
    if (actOutcome === prdOutcome) {
      return 3;
    }

    return 0;
  };

  // 3. Dynamic Ranking Computations
  const getComputedLeaderboard = () => {
    // Start with base family points from MOCK_RANKING
    const baseRanks = MOCK_RANKING.map(r => ({
      id: r.id,
      name: r.name,
      email: r.email,
      points: r.points,
      predictionsCount: r.predictionsCount
    }));

    // Recalculate dynamic points for each ranking user based on final matches
    return baseRanks.map(rank => {
      // Find predictions of this user
      const userPreds = predictions.filter(p => p.userEmail.toLowerCase() === rank.email.toLowerCase());
      
      let extraPoints = 0;
      userPreds.forEach(pred => {
        const correspondingMatch = matches.find(m => m.id === pred.matchId);
        if (correspondingMatch && correspondingMatch.status === 'Finalizado') {
          extraPoints += calculatePoints(pred, correspondingMatch);
        }
      });

      // Total count
      const totalCount = rank. predictionsCount + userPreds.filter(up => !INITIAL_PREDICTIONS.some(ip => ip.id === up.id)).length;

      // Update ranking points
      return {
        ...rank,
        points: rank.email === currentUser.email ? 185 + extraPoints : rank.points + extraPoints,
        predictionsCount: totalCount
      };
    });
  };

  const computedRanking = getComputedLeaderboard();

  // Update current user points on the fly for profile stats
  const activeUserPoints = computedRanking.find(r => r.email === currentUser.email)?.points || currentUser.totalPoints;

  // 4. Action Callback Handlers
  const handleLoginSuccess = (name: string, email: string) => {
    // Pre-fill or construct fresh user profile
    const freshUser: UserProfile = {
      name: name,
      email: email,
      avatar: currentUser.avatar || INITIAL_USER_PROFILE.avatar,
      role: email === 'manoel.neto.arq@gmail.com' ? 'Admin da Família' : 'Membro da Família',
      totalBets: 42,
      totalPoints: 185
    };
    setCurrentUser(freshUser);
    setIsLoggedIn(true);
    setCurrentScreen('home');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setAuthView('login');
    // We can clear some keys but keep matches and custom predictions for sandbox ease-of-use
  };

  const handleUpdateProfile = (name: string, email: string, avatar: string) => {
    setCurrentUser(prev => ({
      ...prev,
      name,
      email,
      avatar
    }));
  };

  const handleAddPrediction = (rawPred: Omit<Prediction, 'id' | 'createdAt'>) => {
    const newId = `pred-${Date.now()}`;
    const newPrediction: Prediction = {
      ...rawPred,
      id: newId,
      createdAt: new Date().toISOString()
    };

    // Filter out old prediction for same user and same match to avoid duplicate bets
    setPredictions(prev => [
      ...prev.filter(p => !(p.matchId === rawPred.matchId && p.userEmail === rawPred.userEmail)),
      newPrediction
    ]);
  };

  const handleAddMatch = (rawMatch: Omit<Match, 'id'>) => {
    const newId = `match-${Date.now()}`;
    const newMatch: Match = {
      ...rawMatch,
      id: newId
    };
    setMatches(prev => [...prev, newMatch]);
  };

  const handleUpdateMatchStatus = (matchId: string, status: MatchStatus) => {
    setMatches(prev => prev.map(m => m.id === matchId ? { ...m, status } : m));
  };

  const handleLaunchResults = (matchId: string, scoreHome: number, scoreAway: number) => {
    setMatches(prev => prev.map(m => m.id === matchId ? { 
      ...m, 
      status: 'Finalizado', 
      scoreHome, 
      scoreAway 
    } : m));
  };

  const handleDeletePrediction = (predictionId: string) => {
    setPredictions(prev => prev.filter(p => p.id !== predictionId));
  };

  // Navigations back helper
  const handleBack = () => {
    if (currentScreen === 'match-details') {
      setCurrentScreen('home');
      setSelectedMatchId(null);
    } else {
      setCurrentScreen('profile');
    }
  };

  // Routing render screen chooser
  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        const selectedMatch = matches.find(m => m.id === selectedMatchId);
        return (
          <div className="flex flex-col gap-6 animate-fade-in">
            {/* High Contrast Banner Welcome Section */}
            <section className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-[#006b2c] to-[#00873a] p-6 md:p-10 shadow-[0_10px_30px_rgba(15,23,42,0.08)] text-white mt-2">
              <div 
                className="absolute inset-0 opacity-10 pointer-events-none" 
                style={{
                  backgroundImage: 'radial-gradient(circle at 2px 2px, white 1.5px, transparent 0)',
                  backgroundSize: '24px 24px'
                }}
              ></div>
              <div className="relative z-10 max-w-2xl select-none">
                <h2 className="font-poppins font-bold text-2xl md:text-4xl text-white tracking-tight leading-tight">
                  Bem-vindo à resenha!
                </h2>
                <p className="font-sans text-sm md:text-base text-white/95 mt-2">
                  O bolão oficial da família para torcer, palpitar e zoar os tios com muito carinho.
                </p>
                <div className="mt-6 flex gap-3 flex-wrap">
                  <button 
                    onClick={() => {
                      const firstOpen = matches.find(m => m.status === 'Aberto');
                      if (firstOpen) {
                        setSelectedMatchId(firstOpen.id);
                        setCurrentScreen('match-details');
                      }
                    }}
                    className="bg-[#fed01b] hover:bg-[#ffe083] text-[#231b00] font-sans text-xs font-bold px-5 py-3 rounded-full shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Flame className="w-4 h-4 fill-[#fed01b] stroke-[#735c00]" />
                    <span>Fazer Palpites</span>
                  </button>
                  <button 
                    onClick={() => setCurrentScreen('ranking')}
                    className="bg-white/20 backdrop-blur-sm text-white border border-white/30 font-sans text-xs font-bold px-5 py-3 rounded-full hover:bg-white/35 transition-all active:scale-95 cursor-pointer"
                  >
                    Ver Ranking
                  </button>
                </div>
              </div>
            </section>

            {/* List block */}
            <section className="flex flex-col gap-4">
              <div className="flex items-center justify-between px-1">
                <h3 className="font-poppins font-bold text-[#191c1e] text-base md:text-lg flex items-center gap-1.5 select-none">
                  <Star className="w-4 h-4 text-[#fed01b] fill-[#fed01b]" />
                  <span>Jogos da Rodada</span>
                </h3>
                <span className="text-[#3e4a3d] font-sans text-xs font-semibold">
                  {matches.length} {matches.length === 1 ? 'jogo cadastrado' : 'jogos cadastrados'}
                </span>
              </div>

              {/* Horizontal scroll container on mobile, fits beautiful card list */}
              <div className="flex md:grid md:grid-cols-2 gap-4 overflow-x-auto no-scrollbar py-2 shrink-0 snap-x snap-mandatory -mx-4 px-4 md:mx-0 md:px-0">
                {matches.map((match) => (
                  <MatchCard 
                    key={match.id}
                    match={match}
                    predictions={predictions}
                    currentUserEmail={currentUser.email}
                    onSelect={(mid) => {
                      setSelectedMatchId(mid);
                      setCurrentScreen('match-details');
                    }}
                  />
                ))}
              </div>
            </section>
          </div>
        );

      case 'match-details':
        const activeMatch = matches.find(m => m.id === selectedMatchId);
        if (!activeMatch) return <p className="text-center">Jogo não encontrado.</p>;
        return (
          <MatchDetailBetting 
            match={activeMatch}
            predictions={predictions}
            currentUser={currentUser}
            onAddPrediction={handleAddPrediction}
          />
        );

      case 'ranking':
        return (
          <Leaderboard 
            rankingData={computedRanking}
            currentUser={currentUser}
          />
        );

      case 'admin':
        return (
          <AdminPanel 
            matches={matches}
            predictions={predictions}
            onAddMatch={handleAddMatch}
            onUpdateMatchStatus={handleUpdateMatchStatus}
            onLaunchResults={handleLaunchResults}
            onDeletePrediction={handleDeletePrediction}
          />
        );

      case 'profile':
        return (
          <ProfileEdit 
            currentUser={{
              ...currentUser,
              totalPoints: activeUserPoints,
              totalBets: currentUser.totalBets // base stats
            }}
            matches={matches}
            predictions={predictions}
            onUpdateProfile={handleUpdateProfile}
            onLogout={handleLogout}
            onNavigate={(scr) => {
              setCurrentScreen(scr);
            }}
          />
        );

      default:
        return null;
    }
  };

  // 5. Auth-Screen wrapper otherwise
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#f7f9fb] flex flex-col justify-center items-center">
        <AuthScreens 
          currentView={authView}
          onChangeView={(view) => setAuthView(view)}
          onLoginSuccess={handleLoginSuccess}
        />
      </div>
    );
  }

  // 6. Complete Inner Application Layout with Headers and Menus
  return (
    <div className="bg-[#f7f9fb] text-[#191c1e] min-h-screen font-sans antialiased flex flex-col pb-28 md:pb-8">
      {/* Premium Sticky Top Header Context */}
      <Header 
        currentScreen={currentScreen}
        onNavigate={(screen) => setCurrentScreen(screen)}
        onBack={handleBack}
        userAvatar={currentUser.avatar}
      />

      {/* Main Content Viewport */}
      <main className="flex-grow pt-24 md:pt-32 px-4 md:px-10 max-w-7xl mx-auto w-full transition-all">
        {renderScreen()}
      </main>

      {/* Responsive Sticky bottom menu navigation for hand-held viewports */}
      <BottomNavBar 
        currentScreen={currentScreen}
        onNavigate={(screen) => setCurrentScreen(screen)}
      />
    </div>
  );
}
