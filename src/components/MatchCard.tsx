import { Calendar, Users, ChevronRight, Lock, CheckCircle, Flame } from 'lucide-react';
import { Match, Prediction } from '../types';
import CountdownTimer from './CountdownTimer';

interface MatchCardProps {
  key?: string;
  match: Match;
  predictions: Prediction[];
  currentUserEmail: string;
  onSelect: (matchId: string) => void;
}

export default function MatchCard({ match, predictions, currentUserEmail, onSelect }: MatchCardProps) {
  const matchPredictions = predictions.filter(p => p.matchId === match.id);
  const userPrediction = matchPredictions.find(p => p.userEmail === currentUserEmail);

  // Parse team initials
  const getInitials = (team: string) => {
    if (team === 'Brasil') return 'BRA';
    if (team === 'Marrocos') return 'MAR';
    if (team === 'França') return 'FRA';
    if (team === 'Espanha') return 'ESP';
    if (team === 'Alemanha') return 'GER';
    if (team === 'Suíça') return 'SUI';
    return team.substring(0, 3).toUpperCase();
  };

  return (
    <article 
      onClick={() => onSelect(match.id)}
      className="min-w-[82vw] sm:min-w-0 bg-white rounded-3xl p-5 shadow-[0_10px_30px_rgba(15,23,42,0.06)] flex flex-col relative border border-transparent hover:border-[#006b2c]/10 hover:shadow-[0_12px_36px_rgba(15,23,42,0.09)] transition-all duration-300 cursor-pointer snap-center shrink-0"
    >
      {/* Top Info Bar */}
      <div className="flex justify-between items-center mb-4">
        {match.status === 'Aberto' && (
          <span className="bg-[#f7fff2] text-[#006b2c] font-sans text-xs font-bold px-2.5 py-1 rounded-md flex items-center gap-1.5 border border-[#006b2c]/10">
            <span className="w-2 h-2 rounded-full bg-[#00873a] animate-pulse"></span>
            Aberto
          </span>
        )}
        {match.status === 'Fechado' && (
          <span className="bg-[#f2f4f6] text-[#3e4a3d] font-sans text-xs font-medium px-2.5 py-1 rounded-md flex items-center gap-1.5 border border-[#e0e3e5]">
            <Lock className="w-3.5 h-3.5 text-[#3e4a3d]" />
            Fechado
          </span>
        )}
        {match.status === 'Finalizado' && (
          <span className="bg-[#6e748a]/10 text-[#555b70] font-sans text-xs font-bold px-2.5 py-1 rounded-md flex items-center gap-1.5 border border-[#6e748a]/20">
            <CheckCircle className="w-3.5 h-3.5 text-[#555b70]" />
            Finalizado
          </span>
        )}

        <span className="text-[#3e4a3d] font-sans text-xs font-medium flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5 text-[#6e7b6c]" />
          {match.dateStr}
        </span>
      </div>

      {/* Teams Matchup Row */}
      <div className="flex items-center justify-between my-4 grow">
        {/* Team 1 */}
        <div className="flex flex-col items-center gap-2 flex-1 text-center select-none">
          <div className="w-14 h-14 md:w-16 md:h-16 rounded-full overflow-hidden border border-[#eceef0] shadow-sm flex items-center justify-center bg-[#f2f4f6]">
            {match.flagHome ? (
              <img 
                src={match.flagHome} 
                alt={`Bandeira de ${match.teamHome}`} 
                className="w-full h-full object-cover scale-[1.08]"
                referrerPolicy="no-referrer"
              />
            ) : (
              <span className="font-poppins font-bold text-[#6e7b6c]">{getInitials(match.teamHome)}</span>
            )}
          </div>
          <span className="font-poppins font-semibold text-sm md:text-base text-[#191c1e] truncate max-w-[100px]">
            {match.teamHome}
          </span>
        </div>

        {/* VS / Score Divider */}
        <div className="flex flex-col items-center justify-center px-3 z-10">
          {match.status === 'Finalizado' || match.status === 'Fechado' ? (
            <div className="bg-[#555b70]/10 text-[#191c1e] font-poppins font-bold text-lg md:text-xl px-3 py-1 rounded-xl flex items-center gap-2 border border-[#555b70]/20 shadow-sm">
              <span>{match.scoreHome ?? '-'}</span>
              <span className="text-[#6e7b6c] text-xs font-normal">x</span>
              <span>{match.scoreAway ?? '-'}</span>
            </div>
          ) : (
            <>
              <span className="text-[#bdcaba] font-poppins font-semibold text-xs tracking-wider">VS</span>
              <div className="h-6 w-[1.5px] bg-[#bdcaba]/30 mt-1"></div>
            </>
          )}
        </div>

        {/* Team 2 */}
        <div className="flex flex-col items-center gap-2 flex-1 text-center select-none">
          <div className="w-14 h-14 md:w-16 md:h-16 rounded-full overflow-hidden border border-[#eceef0] shadow-sm flex items-center justify-center bg-[#f2f4f6]">
            {match.flagAway ? (
              <img 
                src={match.flagAway} 
                alt={`Bandeira de ${match.teamAway}`} 
                className="w-full h-full object-cover scale-[1.08]"
                referrerPolicy="no-referrer"
              />
            ) : (
              <span className="font-poppins font-bold text-[#6e7b6c]">{getInitials(match.teamAway)}</span>
            )}
          </div>
          <span className="font-poppins font-semibold text-sm md:text-base text-[#191c1e] truncate max-w-[100px]">
            {match.teamAway}
          </span>
        </div>
      </div>

      {/* Footer Details Card */}
      <div className="mt-auto pt-4 border-t border-[#f2f4f6] flex flex-col gap-2">
        <div className="flex items-center justify-between">
          {userPrediction ? (
            <div className="flex flex-col">
              <span className="text-[11px] font-sans text-[#3e4a3d]">Seu palpite:</span>
              <span className="font-poppins font-bold text-sm text-[#006b2c] flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 fill-[#fed01b] stroke-[#735c00]" />
                {getInitials(match.teamHome)} {userPrediction.scoreHome} x {userPrediction.scoreAway} {getInitials(match.teamAway)}
              </span>
            </div>
          ) : (
            <span className="text-[#3e4a3d] font-sans text-xs flex items-center gap-1 select-none">
              <Users className="w-4 h-4 text-[#6e7b6c]" />
              {matchPredictions.length} {matchPredictions.length === 1 ? 'palpite enviado' : 'palpites enviados'}
            </span>
          )}

          <button 
            className={`font-sans text-xs font-semibold py-2 px-4 rounded-full transition-all active:scale-95 flex items-center gap-1 cursor-pointer ${
              match.status === 'Aberto' 
                ? 'bg-[#006b2c] text-white hover:bg-[#005320] shadow-sm'
                : 'bg-[#eceef0] text-[#3e4a3d] hover:bg-[#e0e3e5]'
            }`}
          >
            {match.status === 'Aberto' ? 'Dar palpite' : 'Ver detalhes'}
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Countdown Timer Wrapper */}
        <CountdownTimer dateStr={match.dateStr} status={match.status} />
      </div>
    </article>
  );
}
