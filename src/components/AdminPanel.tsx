import { useState, FormEvent } from 'react';
import { PlusCircle, ArrowRight, Edit, RefreshCw, CheckSquare, Trash2, Calendar, Lock, ShieldAlert } from 'lucide-react';
import { Match, Prediction, MatchStatus } from '../types';

interface AdminPanelProps {
  matches: Match[];
  predictions: Prediction[];
  onAddMatch: (match: Omit<Match, 'id'>) => void;
  onUpdateMatchStatus: (matchId: string, status: MatchStatus) => void;
  onLaunchResults: (matchId: string, scoreHome: number, scoreAway: number) => void;
  onDeletePrediction: (predictionId: string) => void;
}

export default function AdminPanel({
  matches,
  predictions,
  onAddMatch,
  onUpdateMatchStatus,
  onLaunchResults,
  onDeletePrediction
}: AdminPanelProps) {
  const [showAddMatchForm, setShowAddMatchForm] = useState(false);
  const [showLaunchResultsId, setShowLaunchResultsId] = useState<string | null>(null);

  // New Match Inputs State
  const [newTeamHome, setNewTeamHome] = useState('');
  const [newTeamAway, setNewTeamAway] = useState('');
  const [newGroup, setNewGroup] = useState('FASE DE GRUPOS');
  const [newDateStr, setNewDateStr] = useState('19/06/2026 às 19:00');

  // Launch Score Inputs State
  const [launchScoreHome, setLaunchScoreHome] = useState<number>(0);
  const [launchScoreAway, setLaunchScoreAway] = useState<number>(0);

  const handleCreateMatchSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!newTeamHome.trim() || !newTeamAway.trim()) return;

    onAddMatch({
      teamHome: newTeamHome.trim(),
      teamAway: newTeamAway.trim(),
      flagHome: '', // Defaults to initials
      flagAway: '',
      group: newGroup,
      dateStr: newDateStr,
      status: 'Aberto'
    });

    // Reset Form
    setNewTeamHome('');
    setNewTeamAway('');
    setShowAddMatchForm(false);
  };

  const handleLaunchSubmit = (matchId: string) => {
    onLaunchResults(matchId, launchScoreHome, launchScoreAway);
    setShowLaunchResultsId(null);
    setLaunchScoreHome(0);
    setLaunchScoreAway(0);
  };

  return (
    <section className="w-full max-w-2xl mx-auto flex flex-col gap-6 animate-fade-in pb-16 select-none">
      
      {/* Admin Disclaimer Info Box */}
      <div className="bg-[#ba1a1a]/5 border border-[#ba1a1a]/20 rounded-2xl p-4 flex gap-3 items-start">
        <ShieldAlert className="w-5 h-5 text-[#ba1a1a] shrink-0 mt-[2px]" />
        <div className="flex flex-col">
          <span className="font-poppins font-semibold text-xs text-[#191c1e]">Acesso Administrativo</span>
          <span className="font-sans text-[11px] text-[#3e4a3d] mt-0.5">
            Você está acessando as ferramentas de moderação do Selman'sBet. Aqui você pode cadastrar jogos, alterar status de apostas, lançar placares reais e remover palpites incorretos.
          </span>
        </div>
      </div>

      {/* Primary Action Panel */}
      <div className="grid grid-cols-1 gap-4">
        {!showAddMatchForm ? (
          <button 
            onClick={() => setShowAddMatchForm(true)}
            className="bg-[#006b2c] text-white rounded-2xl p-4 flex items-center justify-between shadow-[0_4px_12px_rgba(0,107,44,0.15)] hover:bg-[#005320] active:scale-[0.98] transition-all cursor-pointer font-sans text-sm font-semibold group"
          >
            <div className="flex items-center gap-2.5">
              <PlusCircle className="w-5 h-5 text-white" />
              <span>Cadastrar novo jogo</span>
            </div>
            <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
          </button>
        ) : (
          <form 
            onSubmit={handleCreateMatchSubmit}
            className="bg-white rounded-[24px] p-5 shadow-[0_10px_30px_rgba(15,23,42,0.06)] flex flex-col gap-4 border border-[#eceef0]"
          >
            <h3 className="font-poppins font-bold text-[#191c1e] text-base">Cadastrar Novo Jogo no Bolão</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#3e4a3d] mb-1 font-sans">Time Mandante</label>
                <input 
                  type="text" 
                  placeholder="Ex: Argentina"
                  value={newTeamHome}
                  onChange={(e) => setNewTeamHome(e.target.value)}
                  className="w-full h-11 bg-[#f2f4f6] border border-[#eceef0] rounded-xl px-4 text-xs font-sans text-[#191c1e] outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#3e4a3d] mb-1 font-sans">Time Visitante</label>
                <input 
                  type="text" 
                  placeholder="Ex: Alemanha"
                  value={newTeamAway}
                  onChange={(e) => setNewTeamAway(e.target.value)}
                  className="w-full h-11 bg-[#f2f4f6] border border-[#eceef0] rounded-xl px-4 text-xs font-sans text-[#191c1e] outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#3e4a3d] mb-1 font-sans">Categoria / Fase</label>
                <input 
                  type="text" 
                  placeholder="Ex: FASE DE GRUPOS"
                  value={newGroup}
                  onChange={(e) => setNewGroup(e.target.value)}
                  className="w-full h-11 bg-[#f2f4f6] border border-[#eceef0] rounded-xl px-4 text-xs font-sans text-[#191c1e] outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#3e4a3d] mb-1 font-sans">Data e Hora</label>
                <input 
                  type="text" 
                  placeholder="Ex: 19/06/2026 às 19:00"
                  value={newDateStr}
                  onChange={(e) => setNewDateStr(e.target.value)}
                  className="w-full h-11 bg-[#f2f4f6] border border-[#eceef0] rounded-xl px-4 text-xs font-sans text-[#191c1e] outline-none"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end mt-2">
              <button 
                type="button"
                onClick={() => setShowAddMatchForm(false)}
                className="px-4 py-2 bg-[#eceef0] text-[#3e4a3d] font-sans text-xs font-semibold rounded-full hover:bg-[#e0e3e5] cursor-pointer"
              >
                Cancelar
              </button>
              <button 
                type="submit"
                className="px-5 py-2 bg-[#006b2c] text-white font-sans text-xs font-bold rounded-full hover:bg-[#005320] shadow-sm cursor-pointer"
              >
                Salvar Jogo
              </button>
            </div>
          </form>
        )}
      </div>

      {/* List of Manageable Match Cards */}
      <section className="flex flex-col gap-3">
        <h3 className="font-poppins font-bold text-base text-[#191c1e] border-b border-[#eceef0] pb-2">
          Gerenciar Jogos Cadastrados
        </h3>

        <div className="flex flex-col gap-4">
          {matches.map((match) => (
            <div 
              key={match.id}
              className="bg-white rounded-2xl p-4 shadow-[0_5px_15px_rgba(15,23,42,0.04)] flex flex-col gap-4 border border-[#eceef0]/60"
            >
              <div className="flex justify-between items-center border-b border-[#f2f4f6] pb-3">
                <div className="flex flex-col">
                  <span className="font-poppins font-bold text-sm text-[#191c1e]">
                    {match.teamHome} x {match.teamAway}
                  </span>
                  <span className="text-[10px] text-[#6e7b6c] font-sans mt-0.5">{match.dateStr} | {match.group}</span>
                </div>

                {match.status === 'Aberto' && (
                  <span className="bg-[#f7fff2] text-[#006b2c] px-2.5 py-0.5 rounded-full font-sans text-[10px] font-bold">
                    Aberto
                  </span>
                )}
                {match.status === 'Fechado' && (
                  <span className="bg-[#f2f4f6] text-[#3e4a3d] px-2.5 py-0.5 rounded-full font-sans text-[10px] font-bold">
                    Encerrado
                  </span>
                )}
                {match.status === 'Finalizado' && (
                  <span className="bg-[#6e748a]/10 text-[#555b70] px-2.5 py-0.5 rounded-full font-sans text-[10px] font-bold">
                    Placar Definido ({match.scoreHome}x{match.scoreAway})
                  </span>
                )}
              </div>

              {/* Launcher Form if and when active */}
              {showLaunchResultsId === match.id ? (
                <div className="bg-[#f2f4f6] p-3 rounded-xl border border-[#eceef0] flex flex-col gap-3 animate-fade-in">
                  <span className="text-xs font-semibold text-[#191c1e] font-sans">Lançar Placar Real</span>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 flex-1">
                      <span className="text-xs font-sans font-medium text-[#3e4a3d]">{match.teamHome}:</span>
                      <input 
                        type="number" 
                        min="0"
                        value={launchScoreHome}
                        onChange={(e) => setLaunchScoreHome(Number(e.target.value))}
                        className="w-14 h-9 bg-white border border-[#eceef0] rounded-md text-center text-sm font-poppins text-[#191c1e]"
                        required
                      />
                    </div>
                    <span className="text-[#6e7b6c] text-xs font-normal">x</span>
                    <div className="flex items-center gap-2 flex-1">
                      <span className="text-xs font-sans font-medium text-[#3e4a3d]">{match.teamAway}:</span>
                      <input 
                        type="number" 
                        min="0"
                        value={launchScoreAway}
                        onChange={(e) => setLaunchScoreAway(Number(e.target.value))}
                        className="w-14 h-9 bg-white border border-[#eceef0] rounded-md text-center text-sm font-poppins text-[#191c1e]"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button 
                      type="button"
                      onClick={() => setShowLaunchResultsId(null)}
                      className="px-3.5 py-1.5 bg-[#eceef0] text-[#3e4a3d] font-sans text-[11px] font-semibold rounded-md cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button 
                      type="button"
                      onClick={() => handleLaunchSubmit(match.id)}
                      className="px-4 py-1.5 bg-[#006b2c] text-white font-sans text-[11px] font-bold rounded-md shadow-sm cursor-pointer"
                    >
                      Processar Gols e Pontos
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2 justify-end">
                  {match.status === 'Aberto' && (
                    <button 
                      onClick={() => onUpdateMatchStatus(match.id, 'Fechado')}
                      className="bg-[#555b70] text-white font-sans text-xs font-semibold px-3 py-1.5 rounded-full hover:opacity-90 active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      Encerrar Apostas
                    </button>
                  )}

                  {match.status === 'Fechado' && (
                    <button 
                      onClick={() => onUpdateMatchStatus(match.id, 'Aberto')}
                      className="bg-[#eceef0] text-[#006b2c] hover:bg-[#006b2c]/10 font-sans text-xs font-semibold px-3 py-1.5 rounded-full hover:opacity-90 active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Abrir Apostas
                    </button>
                  )}

                  {match.status !== 'Finalizado' ? (
                    <button 
                      onClick={() => {
                        setShowLaunchResultsId(match.id);
                        setLaunchScoreHome(match.scoreHome || 0);
                        setLaunchScoreAway(match.scoreAway || 0);
                      }}
                      className="bg-[#006b2c] text-white font-sans text-xs font-semibold px-3.5 py-1.5 rounded-full hover:opacity-90 active:scale-95 transition-all flex items-center gap-1 cursor-pointer shadow-sm"
                    >
                      <CheckSquare className="w-3.5 h-3.5" />
                      Lançar Resultado
                    </button>
                  ) : (
                    <button 
                      onClick={() => {
                        setShowLaunchResultsId(match.id);
                        setLaunchScoreHome(match.scoreHome || 0);
                        setLaunchScoreAway(match.scoreAway || 0);
                      }}
                      className="bg-[#eceef0] text-[#3e4a3d] hover:bg-[#e0e3e5] font-sans text-xs font-semibold px-3 py-1.5 rounded-full hover:opacity-90 active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      Retificar Placar
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Moderation List of Active Bets */}
      <section className="flex flex-col gap-3">
        <h3 className="font-poppins font-bold text-base text-[#191c1e] border-b border-[#eceef0] pb-2">
          Moderador de Últimos Palpites Registrados
        </h3>

        <div className="bg-white rounded-2xl shadow-[0_5px_15px_rgba(15,23,42,0.04)] overflow-hidden border border-[#eceef0]/50">
          {predictions.length > 0 ? (
            <div className="flex flex-col divide-y divide-[#f2f4f6]">
              {predictions.map((pred) => {
                const associatedMatch = matches.find(m => m.id === pred.matchId);
                return (
                  <div 
                    key={pred.id}
                    className="flex justify-between items-center p-3.5 hover:bg-[#f2f4f6]/30 transition-colors"
                  >
                    <div className="flex flex-col">
                      <span className="font-poppins font-semibold text-sm text-[#191c1e]">{pred.userName}</span>
                      <span className="text-[10px] text-[#6e7b6c] font-sans mt-0.5">
                        Guerrilha: {associatedMatch?.teamHome || 'Mandante'} vs {associatedMatch?.teamAway || 'Visitante'}{' '}
                        <strong className="text-[#006b2c]">({pred.scoreHome} x {pred.scoreAway})</strong>
                        {pred.betValue && ` | Valor: R$ ${pred.betValue}`}
                      </span>
                    </div>

                    <button 
                      onClick={() => onDeletePrediction(pred.id)}
                      aria-label="Excluir palpite"
                      className="text-[#ba1a1a] bg-[#ba1a1a]/10 hover:bg-[#ba1a1a] hover:text-white p-2 rounded-full transition-all duration-200 active:scale-90 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-[#6e7b6c] font-sans">
              Nenhum palpite foi cadastrado ainda para moderar.
            </div>
          )}
        </div>
      </section>

    </section>
  );
}
