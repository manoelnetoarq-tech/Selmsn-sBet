import { Trophy, Star, Users, Award } from 'lucide-react';
import { Match, Prediction, UserProfile } from '../types';

interface LeaderboardProps {
  rankingData: Array<{
    id: string;
    name: string;
    email: string;
    points: number;
    predictionsCount: number;
  }>;
  currentUser: UserProfile;
}

export default function Leaderboard({ rankingData, currentUser }: LeaderboardProps) {
  // Sort ranking data descending by points, then predictions count
  const sortedRanking = [...rankingData].sort((a, b) => {
    if (b.points !== a.points) {
      return b.points - a.points;
    }
    return b.predictionsCount - a.predictionsCount;
  });

  const firstPlace = sortedRanking[0];
  const secondPlace = sortedRanking[1];
  const thirdPlace = sortedRanking[2];
  const restOfPack = sortedRanking.slice(3);

  return (
    <section className="w-full max-w-xl mx-auto flex flex-col gap-6 animate-fade-in pb-12 select-none">
      {/* Dynamic Header with Trophy */}
      <div className="flex flex-col items-center text-center mt-4">
        <div className="w-20 h-20 bg-[#fed01b]/10 text-[#735c00] rounded-full flex items-center justify-center shadow-sm border border-[#fed01b]/20 mb-3 animate-bounce">
          <Trophy className="w-10 h-10 stroke-[2] fill-[#fed01b]/45" />
        </div>
        <h2 className="font-poppins font-bold text-2xl md:text-3xl text-[#191c1e]">
          Ranking da Família
        </h2>
        <p className="font-sans text-sm text-[#3e4a3d] mt-1">
          Acompanhe quem está liderando os palpites do bolão!
        </p>
      </div>

      {/* Leaderboard List Shell */}
      <div className="bg-white rounded-[24px] shadow-[0_10px_30px_rgba(15,23,42,0.06)] overflow-hidden border border-[#eceef0]/50 mt-2">
        
        {/* Podium Highlight Container */}
        <div className="p-4 bg-[#fed01b]/5 border-b border-[#eceef0] flex flex-col gap-3">
          
          {/* 1st Place Spot */}
          {firstPlace && (
            <div className="flex items-center justify-between p-3.5 bg-white rounded-2xl shadow-[0_4px_16px_rgba(15,23,42,0.08)] border-2 border-[#fed01b]/60 transform scale-[1.04] z-10 relative">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#fed01b] text-[#231b00] flex items-center justify-center font-poppins font-bold text-lg shadow-sm">
                  1
                </div>
                <div className="flex flex-col">
                  <span className="font-poppins font-bold text-base text-[#191c1e] flex items-center gap-1">
                    {firstPlace.name}
                    {firstPlace.email === currentUser.email && (
                      <span className="text-[10px] bg-[#006b2c] text-white px-1.5 py-0.5 rounded-full font-semibold font-sans">
                        Você
                      </span>
                    )}
                  </span>
                  <span className="font-sans text-[11px] text-[#3e4a3d]">
                    {firstPlace.predictionsCount} {firstPlace.predictionsCount === 1 ? 'palpite' : 'palpites'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 text-right">
                <div className="flex flex-col items-end">
                  <span className="font-poppins font-bold text-base text-[#006b2c]">{firstPlace.points} pts</span>
                  <Star className="w-3.5 h-3.5 fill-[#fed01b] stroke-[#735c00]" />
                </div>
              </div>
            </div>
          )}

          {/* 2nd Place Spot */}
          {secondPlace && (
            <div className="flex items-center justify-between p-3 bg-white rounded-xl shadow-[0_4px_12px_rgba(15,23,42,0.04)] border border-[#eceef0] ml-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#eceef0] text-[#3e4a3d] flex items-center justify-center font-poppins font-bold text-sm">
                  2
                </div>
                <div className="flex flex-col">
                  <span className="font-poppins font-semibold text-sm text-[#191c1e] flex items-center gap-1">
                    {secondPlace.name}
                    {secondPlace.email === currentUser.email && (
                      <span className="text-[10px] bg-[#006b2c] text-white px-1.5 py-0.5 rounded-full font-semibold font-sans">
                        Você
                      </span>
                    )}
                  </span>
                  <span className="font-sans text-[11px] text-[#6e7b6c]">
                    {secondPlace.predictionsCount} {secondPlace.predictionsCount === 1 ? 'palpite' : 'palpites'}
                  </span>
                </div>
              </div>
              <div className="font-poppins font-bold text-sm text-[#00873a]">
                {secondPlace.points} pts
              </div>
            </div>
          )}

          {/* 3rd Place Spot */}
          {thirdPlace && (
            <div className="flex items-center justify-between p-3 bg-white rounded-xl shadow-[0_4px_12px_rgba(15,23,42,0.04)] border border-[#eceef0] ml-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#eceef0] text-[#3e4a3d] flex items-center justify-center font-poppins font-bold text-sm">
                  3
                </div>
                <div className="flex flex-col">
                  <span className="font-poppins font-semibold text-sm text-[#191c1e] flex items-center gap-1">
                    {thirdPlace.name}
                    {thirdPlace.email === currentUser.email && (
                      <span className="text-[10px] bg-[#006b2c] text-white px-1.5 py-0.5 rounded-full font-semibold font-sans">
                        Você
                      </span>
                    )}
                  </span>
                  <span className="font-sans text-[11px] text-[#6e7b6c]">
                    {thirdPlace.predictionsCount} {thirdPlace.predictionsCount === 1 ? 'palpite' : 'palpites'}
                  </span>
                </div>
              </div>
              <div className="font-poppins font-bold text-sm text-[#00873a]">
                {thirdPlace.points} pts
              </div>
            </div>
          )}
        </div>

        {/* Rest of the Pack Rows */}
        {restOfPack.length > 0 ? (
          <div className="flex flex-col divide-y divide-[#f2f4f6]">
            {restOfPack.map((entry, index) => (
              <div 
                key={entry.id}
                className={`flex items-center justify-between p-4 hover:bg-[#f2f4f6]/40 transition-colors ${
                  entry.email === currentUser.email ? 'bg-[#006b2c]/5' : ''
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-7 h-7 flex items-center justify-center text-[#6e7b6c] font-poppins font-semibold text-sm">
                    {index + 4}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-sans text-sm font-semibold text-[#191c1e] flex items-center gap-1">
                      {entry.name}
                      {entry.email === currentUser.email && (
                        <span className="text-[10px] bg-[#006b2c] text-white px-1.5 py-0.5 rounded-full font-medium font-sans">
                          Você
                        </span>
                      )}
                    </span>
                    <span className="font-sans text-[11px] text-[#6e7b6c]">
                      {entry.predictionsCount} {entry.predictionsCount === 1 ? 'palpite' : 'palpites'}
                    </span>
                  </div>
                </div>
                <div className="font-sans text-sm font-bold text-[#3e4a3d]">
                  {entry.points} pts
                </div>
              </div>
            ))}
          </div>
        ) : sortedRanking.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <Award className="w-12 h-12 text-[#eceef0] mb-4" />
            <p className="font-poppins text-sm text-[#3e4a3d]">
              O ranking será atualizado após os resultados dos jogos.
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
