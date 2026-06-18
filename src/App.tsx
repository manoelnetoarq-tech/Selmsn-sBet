import { useState, useEffect } from 'react';
import { 
  INITIAL_MATCHES, 
  INITIAL_USER_PROFILE 
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
import ChatScreen from './components/ChatScreen';
import { Trophy, Compass, Star, Flame, Award, ShieldAlert } from 'lucide-react';

import { supabase } from './lib/supabase';

export default function App() {
  // 1. Core Persistent States
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [authChecking, setAuthChecking] = useState<boolean>(true);
  const [currentUser, setCurrentUser] = useState<UserProfile>(INITIAL_USER_PROFILE);
  const [matches, setMatches] = useState<Match[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [allProfiles, setAllProfiles] = useState<any[]>([]);

  const [authView, setAuthView] = useState<'login' | 'register' | 'recovery'>('login');
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
      if (session?.user) {
        loadUserProfile(session.user.id);
      } else {
        setAuthChecking(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
      if (session?.user) {
        loadUserProfile(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      loadData();
    }
  }, [isLoggedIn]);

  useEffect(() => {
    const channel = supabase
      .channel('public:matches:live_score')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'matches' },
        (payload) => {
          const newMatch = payload.new;
          const oldMatch = payload.old;
          
          if (newMatch.status === 'Ao Vivo') {
            // Trigger push notification if score changed
            if (newMatch.score_home !== oldMatch.score_home || newMatch.score_away !== oldMatch.score_away) {
              if ('Notification' in window && Notification.permission === 'granted') {
                new Notification('⚽ GOOOOOL na Resenha!', {
                  body: `${newMatch.team_home} ${newMatch.score_home || 0} x ${newMatch.score_away || 0} ${newMatch.team_away}`,
                  icon: '/boladacopa.png',
                  badge: '/boladacopa.png',
                  tag: `goal-${newMatch.id}`,
                  renotify: true
                });
              }
            }
          }
          
          // Reload matches to reflect UI changes
          loadData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadUserProfile = async (userId: string) => {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (!error && data) {
      setCurrentUser({
        name: data.name || '',
        email: data.email || '',
        avatar: data.avatar || INITIAL_USER_PROFILE.avatar,
        role: data.role || 'Membro da Resenha',
        totalBets: data.total_bets || 0,
        totalPoints: data.total_points || 0
      });
    }
    setAuthChecking(false);
  };

  const loadData = async () => {
    const [matchesRes, predictionsRes, profilesRes] = await Promise.all([
      supabase.from('matches').select('*'),
      supabase.from('predictions').select(`
        *,
        profiles!inner(email, name, avatar)
      `),
      supabase.from('profiles').select('id, email, name, avatar')
    ]);

    if (!matchesRes.error && matchesRes.data) {
      setMatches(matchesRes.data.map(m => ({
        id: m.id,
        teamHome: m.team_home,
        teamAway: m.team_away,
        flagHome: m.flag_home,
        flagAway: m.flag_away,
        group: m.group,
        dateStr: m.date_str,
        status: m.status,
        scoreHome: m.score_home,
        scoreAway: m.score_away,
        prize: m.prize,
        prizeImage: m.prize_image
      })));
    }

    if (!predictionsRes.error && predictionsRes.data) {
      setPredictions(predictionsRes.data.map(p => ({
        id: p.id,
        matchId: p.match_id,
        userEmail: p.profiles.email,
        userName: p.profiles.name,
        userAvatar: p.profiles.avatar,
        scoreHome: p.score_home,
        scoreAway: p.score_away,
        betValue: p.bet_value,
        pointsCalculated: p.points_calculated,
        createdAt: p.created_at
      })));
    }

    if (!profilesRes.error && profilesRes.data) {
      setAllProfiles(profilesRes.data);
    }
  };

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
    // Agrupa todos os usuários que têm palpites
    const ranksMap: Record<string, { id: string; name: string; email: string; avatar?: string; points: number; predictionsCount: number }> = {};

    // Adiciona TODOS os perfis cadastrados no sistema com 0 pontos por padrão
    allProfiles.forEach(profile => {
      ranksMap[profile.email] = {
        id: profile.email,
        name: profile.name || 'Sem Nome',
        email: profile.email,
        avatar: profile.avatar || '',
        points: 0,
        predictionsCount: 0
      };
    });

    // Garante que o usuário atual também esteja na lista (mesmo antes de atualizar do Supabase)
    if (currentUser.email && !ranksMap[currentUser.email]) {
      ranksMap[currentUser.email] = {
        id: currentUser.email,
        name: currentUser.name || 'Eu',
        email: currentUser.email,
        avatar: currentUser.avatar || '',
        points: 0,
        predictionsCount: 0
      };
    }

    predictions.forEach(pred => {
      const email = pred.userEmail;
      if (!email) return;

      if (!ranksMap[email]) {
        ranksMap[email] = {
          id: email,
          name: pred.userName || 'Usuário',
          email: email,
          avatar: pred.userAvatar || '',
          points: 0,
          predictionsCount: 0
        };
      }
      
      ranksMap[email].predictionsCount += 1;

      const correspondingMatch = matches.find(m => m.id === pred.matchId);
      if (correspondingMatch && correspondingMatch.status === 'Finalizado') {
        ranksMap[email].points += calculatePoints(pred, correspondingMatch);
      }
    });

    return Object.values(ranksMap).sort((a, b) => b.points - a.points || b.predictionsCount - a.predictionsCount);
  };

  const computedRanking = getComputedLeaderboard();

  // Update current user points on the fly for profile stats
  const activeUserPoints = computedRanking.find(r => r.email === currentUser.email)?.points || currentUser.totalPoints;

  // 4. Action Callback Handlers
  const handleLoginSuccess = async (name: string, email: string) => {
    setIsLoggedIn(true);
    setCurrentScreen('home');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    setAuthView('login');
  };

  const handleUpdateProfile = async (name: string, email: string, avatar: string) => {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user) return;
    
    await supabase.from('profiles').update({ name, avatar }).eq('id', session.session.user.id);
    setCurrentUser(prev => ({ ...prev, name, email, avatar }));
  };

  const handleAddPrediction = async (rawPred: Omit<Prediction, 'id' | 'createdAt'>) => {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user) return;

    const { data, error } = await supabase.from('predictions').upsert({
      match_id: rawPred.matchId,
      user_id: session.session.user.id,
      score_home: rawPred.scoreHome,
      score_away: rawPred.scoreAway
    }, { onConflict: 'match_id, user_id' }).select().single();

    if (!error) {
      loadData(); // recarrega para ter os joins corretos
    }
  };

  const handleAddMatch = async (rawMatch: Omit<Match, 'id'>) => {
    const { error } = await supabase.from('matches').insert({
      team_home: rawMatch.teamHome,
      team_away: rawMatch.teamAway,
      flag_home: rawMatch.flagHome,
      flag_away: rawMatch.flagAway,
      group: rawMatch.group,
      date_str: rawMatch.dateStr,
      status: rawMatch.status,
      prize: rawMatch.prize,
      prize_image: rawMatch.prizeImage
    });
    if (!error) loadData();
  };

  const handleEditMatch = async (matchId: string, updatedMatch: Omit<Match, 'id'>) => {
    const { error } = await supabase.from('matches').update({
      team_home: updatedMatch.teamHome,
      team_away: updatedMatch.teamAway,
      flag_home: updatedMatch.flagHome,
      flag_away: updatedMatch.flagAway,
      group: updatedMatch.group,
      date_str: updatedMatch.dateStr,
      status: updatedMatch.status,
      prize: updatedMatch.prize,
      prize_image: updatedMatch.prizeImage
    }).eq('id', matchId);
    if (!error) loadData();
  };

  const handleUpdateMatchStatus = async (matchId: string, status: MatchStatus) => {
    const { error } = await supabase.from('matches').update({ status }).eq('id', matchId);
    if (!error) {
      loadData();
    }
  };

  const handleUpdateLiveScore = async (matchId: string, scoreHome: number, scoreAway: number) => {
    const { error } = await supabase.from('matches').update({
      score_home: scoreHome,
      score_away: scoreAway,
      status: 'Ao Vivo'
    }).eq('id', matchId);

    if (!error) {
      loadData();
    }
  };

  const handleUpdateLiveScore = async (matchId: string, scoreHome: number, scoreAway: number) => {
    await supabase.from('matches').update({ score_home: scoreHome, score_away: scoreAway }).eq('id', matchId);
    loadData();
  };

  const handleLaunchResults = async (matchId: string, scoreHome: number, scoreAway: number) => {
    await supabase.from('matches').update({ status: 'Finalizado', score_home: scoreHome, score_away: scoreAway }).eq('id', matchId);
    loadData();
  };

  const handleDeletePrediction = async (predictionId: string) => {
    await supabase.from('predictions').delete().eq('id', predictionId);
    loadData();
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
        const parseDateStr = (dateStr: string) => {
          try {
            const [datePart, timePart] = dateStr.split(' às ');
            const [day, month, year] = datePart.split('/');
            const [hour, minute] = timePart.split(':');
            return new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute)).getTime();
          } catch (e) {
            return 0;
          }
        };

        const sortedMatches = [...matches].sort((a, b) => {
          if (a.status === 'Ao Vivo' && b.status !== 'Ao Vivo') return -1;
          if (a.status !== 'Ao Vivo' && b.status === 'Ao Vivo') return 1;
          return parseDateStr(a.dateStr) - parseDateStr(b.dateStr);
        });

        const liveMatches = sortedMatches.filter(m => m.status === 'Ao Vivo');
        
        return (
          <div className="flex flex-col gap-6 animate-fade-in">
            {liveMatches.length > 0 && (
              <div className="relative overflow-hidden bg-gradient-to-r from-[#e01424] to-[#ff2b3d] text-white rounded-2xl md:rounded-[24px] flex items-center shadow-md border border-[#ff4a5a]/30 -mx-2 md:mx-0 mt-2">
                <div className="flex items-center gap-2 pr-6 pl-4 py-2.5 md:py-3 z-10 bg-gradient-to-r from-[#e01424] via-[#e01424] to-transparent font-poppins font-bold uppercase text-xs md:text-sm tracking-wider">
                  <span className="w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)] animate-pulse"></span>
                  <span className="hidden md:inline">Ao Vivo</span>
                  <span className="md:hidden">Live</span>
                </div>
                <div className="flex-1 overflow-hidden relative h-10">
                  <div className="absolute whitespace-nowrap animate-marquee flex items-center gap-8 md:gap-12 h-full top-0">
                    {liveMatches.map((m, idx) => (
                      <span key={idx} className="font-sans font-semibold text-sm md:text-base flex items-center gap-2">
                        <span>{m.teamHome}</span>
                        <span className="bg-black/20 px-2 py-0.5 rounded font-bold">{m.scoreHome ?? 0} x {m.scoreAway ?? 0}</span>
                        <span>{m.teamAway}</span>
                      </span>
                    ))}
                    {/* Duplicate for smooth continuous scroll on wide screens */}
                    {liveMatches.length < 3 && liveMatches.map((m, idx) => (
                      <span key={`dup-${idx}`} className="font-sans font-semibold text-sm md:text-base flex items-center gap-2 hidden md:flex">
                        <span>{m.teamHome}</span>
                        <span className="bg-black/20 px-2 py-0.5 rounded font-bold">{m.scoreHome ?? 0} x {m.scoreAway ?? 0}</span>
                        <span>{m.teamAway}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* High Contrast Banner Welcome Section */}
            <section className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-[#006b2c] to-[#00873a] p-6 md:p-10 shadow-[0_10px_30px_rgba(15,23,42,0.08)] text-white mt-1 md:mt-2">
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
                  O bolão oficial dos amigos para torcer, palpitar e zoar a galera com muita resenha.
                </p>
                <div className="mt-6 flex gap-3 flex-wrap">
                  <button 
                    onClick={() => {
                      const firstOpen = sortedMatches.find(m => m.status === 'Aberto');
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
                {sortedMatches.map((match) => (
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

      case 'chat':
        return <ChatScreen currentUser={currentUser} />;

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
            onEditMatch={handleEditMatch}
            onUpdateMatchStatus={handleUpdateMatchStatus}
            onUpdateLiveScore={handleUpdateLiveScore}
            onLaunchResults={handleLaunchResults}
            onUpdateLiveScore={handleUpdateLiveScore}
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
  if (authChecking) {
    return <div className="min-h-screen bg-[#f7f9fb] flex items-center justify-center">Carregando...</div>;
  }

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
        isAdmin={currentUser.role === 'Admin da Resenha' || currentUser.role === 'Admin da Família'}
      />

      {/* Main Content Viewport */}
      <main className="flex-grow pt-24 md:pt-32 px-4 md:px-10 max-w-7xl mx-auto w-full transition-all">
        {renderScreen()}
      </main>

      {/* Responsive Sticky bottom menu navigation for hand-held viewports */}
      <BottomNavBar 
        currentScreen={currentScreen}
        onNavigate={(screen) => setCurrentScreen(screen)}
        isAdmin={currentUser.role === 'Admin da Resenha' || currentUser.role === 'Admin da Família'}
      />
    </div>
  );
}
