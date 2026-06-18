import { useState, FormEvent } from 'react';
import { User, Send, Minus, Plus, Calendar, Lock, CheckCircle, Trophy } from 'lucide-react';
import { Match, Prediction, UserProfile } from '../types';

interface MatchDetailBettingProps {
  match: Match;
  predictions: Prediction[];
  currentUser: UserProfile;
  onAddPrediction: (prediction: Omit<Prediction, 'id' | 'createdAt'>) => void;
}

export default function MatchDetailBetting({ 
  match, 
  predictions, 
  currentUser, 
  onAddPrediction 
}: MatchDetailBettingProps) {
  const matchPredictions = predictions.filter(p => p.matchId === match.id);
  
  // Find current user's prediction if exists to initialize score controls
  const myExistingPrediction = matchPredictions.find(p => p.userEmail === currentUser.email);

  const [bettorName, setBettorName] = useState(myExistingPrediction?.userName || currentUser.name);
  const [scoreHome, setScoreHome] = useState(myExistingPrediction?.scoreHome ?? 0);
  const [scoreAway, setScoreAway] = useState(myExistingPrediction?.scoreAway ?? 0);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Check time limit (15 mins before match)
  const parseDateString = (dateStr: string) => {
    // Expected: "DD/MM/YYYY às HH:MM"
    const regex = /(\d{2})\/(\d{2})\/(\d{4}) às (\d{2}):(\d{2})/;
    const m = dateStr.match(regex);
    if (!m) return null;
    const [_, day, month, year, hours, mins] = m;
    return new Date(Number(year), Number(month) - 1, Number(day), Number(hours), Number(mins));
  };

  const isBettingOpen = () => {
    const matchDate = parseDateString(match.dateStr);
    if (!matchDate) return true; // If parsing fails, default to open
    const diffInMinutes = (matchDate.getTime() - new Date().getTime()) / (1000 * 60);
    return diffInMinutes >= 15;
  };

  const isFormOpen = match.status === 'Aberto' && isBettingOpen();

  const handleIncrementHome = () => setScoreHome(prev => prev + 1);
  const handleDecrementHome = () => setScoreHome(prev => Math.max(0, prev - 1));
  const handleIncrementAway = () => setScoreAway(prev => prev + 1);
  const handleDecrementAway = () => setScoreAway(prev => Math.max(0, prev - 1));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!bettorName.trim()) return;

    // Check if the exact score has already been predicted by someone else
    const isDuplicate = matchPredictions.some(
      p => p.scoreHome === scoreHome && 
           p.scoreAway === scoreAway && 
           p.userEmail !== currentUser.email
    );

    if (isDuplicate) {
      setErrorMessage('Outro participante já escolheu esse exato placar. Escolha um resultado diferente!');
      setTimeout(() => setErrorMessage(''), 5000);
      return;
    }

    onAddPrediction({
      matchId: match.id,
      userEmail: currentUser.email,
      userName: bettorName,
      scoreHome,
      scoreAway,
      userAvatar: currentUser.avatar
    });

    setSuccessMessage('Palpite enviado com sucesso! 🎉');
    setTimeout(() => {
      setSuccessMessage('');
    }, 4000);
  };

  // Extract initials for names without avatars
  const getInitials = (name: string) => {
    return name.trim().charAt(0).toUpperCase();
  };

  // Color generator for avatar background placeholders
  const getAvatarBg = (name: string) => {
    const code = name.charCodeAt(0) || 0;
    const colors = [
      'bg-[#6e748a] text-white',
      'bg-[#fed01b] text-[#6f5900]',
      'bg-[#00873a] text-[#f7fff2]',
      'bg-[#ba1a1a] text-white',
      'bg-[#735c00] text-white',
      'bg-[#555b70] text-white'
    ];
    return colors[code % colors.length];
  };

  return (
    <section className="w-full max-w-xl mx-auto flex flex-col gap-6 animate-fade-in select-none pb-16">
      
      {/* Match Header Card */}
      <article className="bg-white rounded-[24px] p-5 shadow-[0_10px_30px_rgba(15,23,42,0.06)] relative overflow-hidden border border-[#eceef0]/50 mt-2">
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#00873a]/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="flex flex-col items-center text-center relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-[#fed01b]/10 text-[#6f5900] font-sans text-[10px] font-bold uppercase tracking-wider">
              {match.group}
            </span>

            {match.status === 'Aberto' && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-[#f7fff2] text-[#006b2c] font-sans text-[10px] font-bold flex gap-1.5 border border-[#006b2c]/10">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00873a] animate-pulse"></span> Aberto
              </span>
            )}
            {match.status === 'Fechado' && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-[#f2f4f6] text-[#3e4a3d] font-sans text-[10px] font-medium flex gap-1.5 border border-[#e0e3e5]">
                <Lock className="w-3 h-3 text-[#3e4a3d]" /> Fechado
              </span>
            )}
            {match.status === 'Finalizado' && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-[#6e748a]/10 text-[#555b70] font-sans text-[10px] font-bold flex gap-1.5 border border-[#6e748a]/20">
                <CheckCircle className="w-3 h-3 text-[#555b70]" /> Finalizado
              </span>
            )}
          </div>

          <p className="text-[#3e4a3d] font-sans text-xs flex items-center gap-1 mb-4">
            <Calendar className="w-3.5 h-3.5 text-[#6e7b6c]" /> {match.dateStr}
          </p>

          <div className="flex items-center justify-between w-full max-w-sm mx-auto">
            {/* Team Home */}
            <div className="flex flex-col items-center gap-2 flex-1">
              <div className="w-16 h-16 rounded-full overflow-hidden border border-[#eceef0] shadow-sm flex items-center justify-center bg-[#f2f4f6]">
                {match.flagHome ? (
                  <img 
                    src={match.flagHome} 
                    alt={`Bandeira de ${match.teamHome}`} 
                    className="w-full h-full object-cover scale-[1.08]"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span className="font-poppins font-bold text-[#6e7b6c]">{match.teamHome.substring(0,3).toUpperCase()}</span>
                )}
              </div>
              <span className="font-poppins font-bold text-base text-[#191c1e]">{match.teamHome}</span>
            </div>

            {/* Score or VS in Header */}
            <div className="flex flex-col items-center justify-center px-2">
              {(match.scoreHome !== undefined && match.scoreHome !== null) || match.status === 'Finalizado' || match.status === 'Fechado' ? (
                <div className={`font-poppins font-bold text-xl md:text-2xl px-4 py-1.5 rounded-2xl flex flex-col items-center border shadow-sm ${
                  match.status !== 'Finalizado' && match.scoreHome !== null && match.scoreHome !== undefined
                    ? 'border-[#fed01b] bg-[#fff9e6] text-[#735c00]' 
                    : 'border-[#555b70]/20 bg-[#555b70]/10 text-[#191c1e]'
                }`}>
                  {match.status !== 'Finalizado' && match.scoreHome !== null && match.scoreHome !== undefined && (
                    <span className="text-[10px] uppercase tracking-wider font-bold text-[#00873a] animate-pulse mt-0.5 -mb-1">Ao Vivo</span>
                  )}
                  <div className="flex items-center gap-2">
                    <span>{match.scoreHome ?? '-'}</span>
                    <span className={`text-sm font-normal ${
                      match.status !== 'Finalizado' && match.scoreHome !== null && match.scoreHome !== undefined ? 'text-[#6f5900]' : 'text-[#bdcaba]'
                    }`}>x</span>
                    <span>{match.scoreAway ?? '-'}</span>
                  </div>
                </div>
              ) : (
                <span className="font-poppins font-bold text-xl text-[#bdcaba]">X</span>
              )}
            </div>

            {/* Team Away */}
            <div className="flex flex-col items-center gap-2 flex-1">
              <div className="w-16 h-16 rounded-full overflow-hidden border border-[#eceef0] shadow-sm flex items-center justify-center bg-[#f2f4f6]">
                {match.flagAway ? (
                  <img 
                    src={match.flagAway} 
                    alt={`Bandeira de ${match.teamAway}`} 
                    className="w-full h-full object-cover scale-[1.08]"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span className="font-poppins font-bold text-[#6e7b6c]">{match.teamAway.substring(0,3).toUpperCase()}</span>
                )}
              </div>
              <span className="font-poppins font-bold text-base text-[#191c1e]">{match.teamAway}</span>
            </div>
          </div>
        </div>
      </article>

      {/* Betting Input Form */}
      {isFormOpen ? (
        <form 
          onSubmit={handleSubmit}
          className="bg-white rounded-[24px] p-5 shadow-[0_10px_30px_rgba(15,23,42,0.06)] flex flex-col gap-5 border border-[#eceef0]/50"
        >
          <div className="text-center">
            <h2 className="font-poppins font-bold text-lg md:text-xl text-[#191c1e]">Qual vai ser o placar?</h2>
            {myExistingPrediction && (
              <p className="text-[11px] font-sans text-[#006b2c] font-semibold mt-1">
                Você já palpitou. Enviar um novo palpite atualizará seu palpite anterior!
              </p>
            )}
          </div>

          <div className="flex flex-col gap-4 max-w-sm mx-auto w-full">
            {/* Prize Display */}
            {(match.prize || match.prizeImage) && (
              <div className="relative w-full rounded-2xl overflow-hidden border border-[#fed01b] shadow-[0_4px_16px_rgba(254,208,27,0.25)] mb-2 group">
                {match.prizeImage ? (
                  <div className="w-full h-40 sm:h-48 relative bg-[#fff9e6]">
                    <img 
                      src={match.prizeImage} 
                      alt="Prize" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
                      referrerPolicy="no-referrer" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 flex flex-col z-10">
                      <span className="flex items-center gap-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#fed01b] drop-shadow-md">
                        <Trophy className="w-4 h-4 sm:w-5 sm:h-5" />
                        Prêmio em Disputa
                      </span>
                      {match.prize && (
                        <span className="text-base sm:text-lg font-bold text-white mt-1 drop-shadow-lg leading-tight">
                          {match.prize}
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#fff9e6] p-4 flex items-center gap-4">
                    <div className="bg-[#fed01b]/20 p-3 rounded-full shrink-0">
                      <Trophy className="w-6 h-6 text-[#6f5900]" />
                    </div>
                    <div className="flex flex-col flex-1 justify-center">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#6f5900]">Prêmio em Disputa</span>
                      {match.prize && <span className="text-sm font-bold text-[#3e4a3d] mt-0.5">{match.prize}</span>}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Participant Name Input */}
            <div className="flex flex-col gap-1.5">
              <label className="font-sans text-xs font-semibold text-[#3e4a3d] ml-1" htmlFor="bettor-name">
                Seu nome de palpiteiro
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#3e4a3d] flex items-center justify-center">
                  <User className="w-4 h-4 text-[#6e7b6c]" />
                </span>
                <input 
                  className="w-full h-12 bg-[#f2f4f6] border border-[#eceef0] rounded-2xl pl-11 pr-4 font-sans text-sm text-[#191c1e] placeholder:text-[#3e4a3d]/50 focus:border-[#006b2c] focus:ring-2 focus:ring-[#006b2c]/10 transition-colors duration-200 outline-none"
                  id="bettor-name"
                  type="text"
                  placeholder="Digite seu nome"
                  value={bettorName}
                  onChange={(e) => setBettorName(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Scores Incrementor Controls */}
            <div className="flex items-center justify-between bg-[#f2f4f6] p-4 rounded-[20px] border border-[#eceef0] mt-1 select-none">
              {/* Home Team Control */}
              <div className="flex flex-col items-center gap-1.5">
                <span className="font-sans text-[11px] font-bold text-[#3e4a3d] tracking-wider">
                  {match.teamHome.substring(0, 3).toUpperCase()}
                </span>
                <div className="flex items-center gap-2.5 bg-white rounded-full p-1 shadow-sm">
                  <button 
                    type="button"
                    onClick={handleDecrementHome}
                    aria-label="Diminuir gol"
                    className="w-8 h-8 rounded-full bg-[#f2f4f6] flex items-center justify-center text-[#191c1e] hover:bg-[#eceef0] active:scale-90 transition-all cursor-pointer"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="font-poppins font-bold text-lg w-5 text-center">{scoreHome}</span>
                  <button 
                    type="button"
                    onClick={handleIncrementHome}
                    aria-label="Aumentar gol"
                    className="w-8 h-8 rounded-full bg-[#006b2c]/10 text-[#006b2c] flex items-center justify-center hover:bg-[#006b2c]/20 active:scale-90 transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <span className="text-[#bdcaba] font-poppins font-bold text-base">:</span>

              {/* Away Team Control */}
              <div className="flex flex-col items-center gap-1.5">
                <span className="font-sans text-[11px] font-bold text-[#3e4a3d] tracking-wider">
                  {match.teamAway.substring(0, 3).toUpperCase()}
                </span>
                <div className="flex items-center gap-2.5 bg-white rounded-full p-1 shadow-sm">
                  <button 
                    type="button"
                    onClick={handleDecrementAway}
                    aria-label="Diminuir gol"
                    className="w-8 h-8 rounded-full bg-[#f2f4f6] flex items-center justify-center text-[#191c1e] hover:bg-[#eceef0] active:scale-90 transition-all cursor-pointer"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="font-poppins font-bold text-lg w-5 text-center">{scoreAway}</span>
                  <button 
                    type="button"
                    onClick={handleIncrementAway}
                    aria-label="Aumentar gol"
                    className="w-8 h-8 rounded-full bg-[#006b2c]/10 text-[#006b2c] flex items-center justify-center hover:bg-[#006b2c]/20 active:scale-90 transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Success feedback toast */}
            {successMessage && (
              <div className="bg-[#f7fff2] border border-[#006b2c]/20 text-[#006b2c] text-xs font-semibold px-4 py-2.5 rounded-xl text-center animate-fade-in">
                {successMessage}
              </div>
            )}

            {/* Error feedback toast */}
            {errorMessage && (
              <div className="bg-[#fff0f0] border border-[#d32f2f]/20 text-[#d32f2f] text-xs font-semibold px-4 py-2.5 rounded-xl text-center animate-fade-in">
                {errorMessage}
              </div>
            )}

            {/* Submit Action Button */}
            <button 
              type="submit"
              className="mt-3 w-full h-12 bg-[#006b2c] text-white rounded-full font-sans text-sm font-bold flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(0,107,44,0.15)] hover:bg-[#005320] active:scale-[0.98] transition-all cursor-pointer group"
            >
              <Send className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
              <span>Enviar palpite</span>
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-[#ba1a1a]/5 border border-[#ba1a1a]/20 rounded-2xl p-5 text-center select-none">
          <p className="font-poppins font-semibold text-sm text-[#ba1a1a]">
            {match.status === 'Aberto' && !isBettingOpen() 
              ? 'Tempo limite atingido. Palpites encerram 15 minutos antes do jogo! ⏰'
              : 'Palpites para este jogo já estão encerrados para novas participações. 🔒'}
          </p>
        </div>
      )}

      {/* List of Bets of Other Members */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between px-2">
          <h3 className="font-poppins font-bold text-base text-[#191c1e]">Palpites enviados</h3>
          <span className="bg-[#eceef0] text-[#3e4a3d] px-2.5 py-0.5 rounded-full font-sans text-xs font-semibold select-none">
            {matchPredictions.length} {matchPredictions.length === 1 ? 'participação' : 'participações'}
          </span>
        </div>

        <div className="bg-white rounded-[24px] shadow-[0_4px_12px_rgba(15,23,42,0.03)] overflow-hidden border border-[#eceef0]/50">
          {matchPredictions.length > 0 ? (
            <ul className="divide-y divide-[#f2f4f6]">
              {matchPredictions.map((pred) => (
                <li 
                  key={pred.id} 
                  className="flex items-center justify-between p-4 hover:bg-[#f2f4f6]/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {pred.userAvatar ? (
                      <div className="w-10 h-10 rounded-full overflow-hidden shadow-sm border border-[#eceef0]">
                        <img 
                          src={pred.userAvatar} 
                          alt={pred.userName} 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    ) : (
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-poppins font-bold text-sm ${getAvatarBg(pred.userName)}`}>
                        {getInitials(pred.userName)}
                      </div>
                    )}

                    <div className="flex flex-col">
                      <span className="font-poppins font-semibold text-sm text-[#191c1e] flex items-center gap-1.5">
                        {pred.userName}
                        {pred.userEmail === currentUser.email && (
                          <span className="text-[10px] bg-[#006b2c] text-white px-1.5 py-0.5 rounded-full font-medium font-sans">
                            Você
                          </span>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Bet Odds Rounded Badge */}
                  <div className="bg-[#555b70] text-[#ffffff] px-4 py-1.5 rounded-xl font-poppins font-bold text-sm md:text-base flex items-center gap-2 shadow-sm">
                    <span>{pred.scoreHome}</span>
                    <span className="text-[#a0a5b5] text-xs font-normal">x</span>
                    <span>{pred.scoreAway}</span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-8 text-center text-[#6e7b6c] text-xs">
              Nenhum palpite enviado ainda para este jogo. Seja o primeiro! ⚽
            </div>
          )}
        </div>
      </section>
    </section>
  );
}
