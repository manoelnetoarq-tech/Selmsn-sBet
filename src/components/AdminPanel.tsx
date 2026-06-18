import { useState, FormEvent, useRef, ChangeEvent } from 'react';
import { PlusCircle, ArrowRight, Edit, RefreshCw, CheckSquare, Trash2, Calendar, Lock, ShieldAlert, Upload, BellRing } from 'lucide-react';
import { Match, Prediction, MatchStatus } from '../types';
import { supabase } from '../lib/supabase';

interface AdminPanelProps {
  matches: Match[];
  predictions: Prediction[];
  onAddMatch: (match: Omit<Match, 'id'>) => void;
  onEditMatch: (matchId: string, match: Omit<Match, 'id'>) => void;
  onUpdateMatchStatus: (matchId: string, status: MatchStatus) => void;
  onLaunchResults: (matchId: string, scoreHome: number, scoreAway: number) => void;
  onDeletePrediction: (predictionId: string) => void;
}

export default function AdminPanel({
  matches,
  predictions,
  onAddMatch,
  onEditMatch,
  onUpdateMatchStatus,
  onLaunchResults,
  onDeletePrediction
}: AdminPanelProps) {
  const [showAddMatchForm, setShowAddMatchForm] = useState(false);
  const [showLaunchResultsId, setShowLaunchResultsId] = useState<string | null>(null);
  const [editingMatchId, setEditingMatchId] = useState<string | null>(null);

  // New Match Inputs State
  const [newTeamHome, setNewTeamHome] = useState('');
  const [newTeamAway, setNewTeamAway] = useState('');
  const [newFlagHome, setNewFlagHome] = useState('');
  const [newFlagAway, setNewFlagAway] = useState('');
  const [newGroup, setNewGroup] = useState('FASE DE GRUPOS');
  const [newDateStr, setNewDateStr] = useState('19/06/2026 às 19:00');
  const [newPrize, setNewPrize] = useState('');

  // Flag Upload States
  const [isUploadingHome, setIsUploadingHome] = useState(false);
  const [isUploadingAway, setIsUploadingAway] = useState(false);
  const [isUploadingPrize, setIsUploadingPrize] = useState(false);
  const fileInputHomeRef = useRef<HTMLInputElement>(null);
  const fileInputAwayRef = useRef<HTMLInputElement>(null);
  const fileInputPrizeRef = useRef<HTMLInputElement>(null);
  const [newPrizeImage, setNewPrizeImage] = useState('');

  // Launch Score Inputs State
  const [launchScoreHome, setLaunchScoreHome] = useState<number>(0);
  const [launchScoreAway, setLaunchScoreAway] = useState<number>(0);

  // Push Notification Inputs State
  const [pushTitle, setPushTitle] = useState('');
  const [pushBody, setPushBody] = useState('');
  const [isSendingPush, setIsSendingPush] = useState(false);

  const handleFlagUpload = async (event: ChangeEvent<HTMLInputElement>, isHome: boolean) => {
    try {
      if (isHome) setIsUploadingHome(true);
      else setIsUploadingAway(true);

      const file = event.target.files?.[0];
      if (!file) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `flag-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('flags')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('flags').getPublicUrl(filePath);
      
      if (isHome) setNewFlagHome(data.publicUrl);
      else setNewFlagAway(data.publicUrl);
    } catch (error) {
      console.error('Error uploading flag:', error);
      alert('Erro ao fazer upload da imagem.');
    } finally {
      if (isHome) setIsUploadingHome(false);
      else setIsUploadingAway(false);
    }
  };

  const handlePrizeUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    try {
      setIsUploadingPrize(true);
      const file = event.target.files?.[0];
      if (!file) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `prize-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('prizes')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('prizes').getPublicUrl(filePath);
      setNewPrizeImage(data.publicUrl);
    } catch (error) {
      console.error('Error uploading prize image:', error);
      alert('Erro ao fazer upload da imagem do prêmio.');
    } finally {
      setIsUploadingPrize(false);
    }
  };

  const handleCreateMatchSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!newTeamHome.trim() || !newTeamAway.trim()) return;

    if (editingMatchId) {
      onEditMatch(editingMatchId, {
        teamHome: newTeamHome.trim(),
        teamAway: newTeamAway.trim(),
        flagHome: newFlagHome,
        flagAway: newFlagAway,
        group: newGroup,
        dateStr: newDateStr,
        prize: newPrize,
        prizeImage: newPrizeImage,
        status: matches.find(m => m.id === editingMatchId)?.status || 'Aberto'
      });
    } else {
      onAddMatch({
        teamHome: newTeamHome.trim(),
        teamAway: newTeamAway.trim(),
        flagHome: newFlagHome,
        flagAway: newFlagAway,
        group: newGroup,
        dateStr: newDateStr,
        prize: newPrize,
        prizeImage: newPrizeImage,
        status: 'Aberto'
      });
    }

    // Reset Form
    setNewTeamHome('');
    setNewTeamAway('');
    setNewFlagHome('');
    setNewFlagAway('');
    setNewPrize('');
    setNewPrizeImage('');
    setEditingMatchId(null);
    setShowAddMatchForm(false);
  };

  const handleEditClick = (match: Match) => {
    setEditingMatchId(match.id);
    setNewTeamHome(match.teamHome);
    setNewTeamAway(match.teamAway);
    setNewFlagHome(match.flagHome || '');
    setNewFlagAway(match.flagAway || '');
    setNewGroup(match.group || '');
    setNewDateStr(match.dateStr || '');
    setNewPrize(match.prize || '');
    setNewPrizeImage(match.prizeImage || '');
    setShowAddMatchForm(true);
  };

  const handleLaunchSubmit = (matchId: string) => {
    onLaunchResults(matchId, launchScoreHome, launchScoreAway);
    setShowLaunchResultsId(null);
    setLaunchScoreHome(0);
    setLaunchScoreAway(0);
  };

  const handleSendPush = async (e: FormEvent) => {
    e.preventDefault();
    if (!pushTitle.trim() || !pushBody.trim()) return;

    setIsSendingPush(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-push', {
        body: {
          title: pushTitle,
          body: pushBody,
        }
      });

      if (error) throw error;
      alert('Notificações enviadas com sucesso!');
      setPushTitle('');
      setPushBody('');
    } catch (err: any) {
      console.error(err);
      alert('Erro ao enviar notificação. Verifique se a Edge Function está implantada e os secrets configurados.');
    } finally {
      setIsSendingPush(false);
    }
  };

  return (
    <section className="w-full max-w-2xl mx-auto flex flex-col gap-6 animate-fade-in pb-16 select-none">
      
      {/* Admin Disclaimer Info Box */}
      <div className="bg-[#ba1a1a]/5 border border-[#ba1a1a]/20 rounded-2xl p-4 flex gap-3 items-start">
        <ShieldAlert className="w-5 h-5 text-[#ba1a1a] shrink-0 mt-[2px]" />
        <div className="flex flex-col">
          <span className="font-poppins font-semibold text-xs text-[#191c1e]">Acesso Administrativo</span>
          <span className="font-sans text-[11px] text-[#3e4a3d] mt-0.5">
            Você está acessando as ferramentas de moderação do Selman's Bet. Aqui você pode cadastrar jogos, alterar status de apostas, lançar placares reais e remover palpites incorretos.
          </span>
        </div>
      </div>

      {/* Push Notifications Panel */}
      <section className="bg-white rounded-[24px] p-5 shadow-[0_10px_30px_rgba(15,23,42,0.06)] flex flex-col gap-4 border border-[#eceef0]">
        <div className="flex items-center gap-2 border-b border-[#f2f4f6] pb-3">
          <BellRing className="w-5 h-5 text-[#006b2c]" />
          <h3 className="font-poppins font-bold text-[#191c1e] text-base">Enviar Notificação Push</h3>
        </div>
        <form onSubmit={handleSendPush} className="flex flex-col gap-3">
          <div>
            <label className="block text-xs font-semibold text-[#3e4a3d] mb-1 font-sans">Título da Notificação</label>
            <input 
              type="text" 
              placeholder="Ex: ⚽ Gol do Brasil!"
              value={pushTitle}
              onChange={(e) => setPushTitle(e.target.value)}
              className="w-full h-11 bg-[#f2f4f6] border border-[#eceef0] rounded-xl px-4 text-xs font-sans text-[#191c1e] outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#3e4a3d] mb-1 font-sans">Mensagem</label>
            <textarea 
              placeholder="Ex: O jogo começou e a emoção está no ar! Acesse para palpitar..."
              value={pushBody}
              onChange={(e) => setPushBody(e.target.value)}
              rows={2}
              className="w-full bg-[#f2f4f6] border border-[#eceef0] rounded-xl px-4 py-3 text-xs font-sans text-[#191c1e] outline-none resize-none"
              required
            />
          </div>
          <button 
            type="submit"
            disabled={isSendingPush}
            className="w-full py-3 bg-[#006b2c] text-white font-sans text-xs font-bold rounded-xl shadow-sm hover:bg-[#005320] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
          >
            {isSendingPush ? 'Enviando...' : 'Disparar para todos os usuários'}
          </button>
        </form>
      </section>

      {/* Primary Action Panel */}
      <div className="grid grid-cols-1 gap-4">
        {!showAddMatchForm ? (
          <button 
            onClick={() => {
              setEditingMatchId(null);
              setNewTeamHome('');
              setNewTeamAway('');
              setNewFlagHome('');
              setNewFlagAway('');
              setNewGroup('FASE DE GRUPOS');
              setNewDateStr('19/06/2026 às 19:00');
              setNewPrize('');
              setNewPrizeImage('');
              setShowAddMatchForm(true);
            }}
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
            <h3 className="font-poppins font-bold text-[#191c1e] text-base">
              {editingMatchId ? 'Editar Jogo no Bolão' : 'Cadastrar Novo Jogo no Bolão'}
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="block text-xs font-semibold text-[#3e4a3d] font-sans">Time Mandante</label>
                <div className="flex items-center gap-2 bg-[#f2f4f6] border border-[#eceef0] rounded-xl px-2 h-11">
                  {newFlagHome && (
                    <img src={newFlagHome} className="w-6 h-6 rounded-full object-cover shrink-0" alt="Home Flag" />
                  )}
                  <input type="file" accept="image/*" hidden ref={fileInputHomeRef} onChange={(e) => handleFlagUpload(e, true)} />
                  <button 
                    type="button" 
                    onClick={() => fileInputHomeRef.current?.click()} 
                    disabled={isUploadingHome}
                    className="p-1.5 rounded-md hover:bg-[#eceef0] active:scale-95 text-[#6e7b6c] shrink-0 cursor-pointer"
                  >
                    {isUploadingHome ? <div className="w-4 h-4 rounded-full border-2 border-[#006b2c] border-t-transparent animate-spin" /> : <Upload className="w-4 h-4"/>}
                  </button>
                  <input 
                    type="text" 
                    placeholder="Ex: Argentina"
                    value={newTeamHome}
                    onChange={(e) => setNewTeamHome(e.target.value)}
                    className="w-full bg-transparent text-xs font-sans text-[#191c1e] outline-none"
                    required
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="block text-xs font-semibold text-[#3e4a3d] font-sans">Time Visitante</label>
                <div className="flex items-center gap-2 bg-[#f2f4f6] border border-[#eceef0] rounded-xl px-2 h-11">
                  <input 
                    type="text" 
                    placeholder="Ex: Alemanha"
                    value={newTeamAway}
                    onChange={(e) => setNewTeamAway(e.target.value)}
                    className="w-full bg-transparent text-xs font-sans text-[#191c1e] outline-none text-right"
                    required
                  />
                  <input type="file" accept="image/*" hidden ref={fileInputAwayRef} onChange={(e) => handleFlagUpload(e, false)} />
                  <button 
                    type="button" 
                    onClick={() => fileInputAwayRef.current?.click()} 
                    disabled={isUploadingAway}
                    className="p-1.5 rounded-md hover:bg-[#eceef0] active:scale-95 text-[#6e7b6c] shrink-0 cursor-pointer"
                  >
                    {isUploadingAway ? <div className="w-4 h-4 rounded-full border-2 border-[#006b2c] border-t-transparent animate-spin" /> : <Upload className="w-4 h-4"/>}
                  </button>
                  {newFlagAway && (
                    <img src={newFlagAway} className="w-6 h-6 rounded-full object-cover shrink-0" alt="Away Flag" />
                  )}
                </div>
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
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[#3e4a3d] mb-1 font-sans">Prêmios da Rodada</label>
                <input 
                  type="text" 
                  placeholder="Ex: 1º Lugar R$ 100, Último paga a cerveja"
                  value={newPrize}
                  onChange={(e) => setNewPrize(e.target.value)}
                  className="w-full h-11 bg-[#fff9e6] border border-[#fed01b]/50 rounded-xl px-4 text-xs font-sans text-[#6f5900] outline-none"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[#3e4a3d] mb-1 font-sans">Imagem do Prêmio</label>
                <div className="flex items-center gap-3">
                  {newPrizeImage && (
                    <div className="w-12 h-12 rounded-lg overflow-hidden border border-[#fed01b]/50 bg-white shrink-0">
                      <img src={newPrizeImage} alt="Prize" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => fileInputPrizeRef.current?.click()}
                    disabled={isUploadingPrize}
                    className="flex-1 h-11 bg-[#f2f4f6] text-[#3e4a3d] font-sans text-xs font-semibold rounded-xl flex items-center justify-center gap-2 hover:bg-[#eceef0] transition-colors border border-[#eceef0]"
                  >
                    <Upload className="w-4 h-4" />
                    {isUploadingPrize ? 'Enviando...' : (newPrizeImage ? 'Trocar Imagem do Prêmio' : 'Upload da Imagem do Prêmio')}
                  </button>
                  <input
                    type="file"
                    ref={fileInputPrizeRef}
                    onChange={handlePrizeUpload}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 justify-end mt-2">
              <button 
                type="button"
                onClick={() => {
                  setShowAddMatchForm(false);
                  setEditingMatchId(null);
                  setNewTeamHome('');
                  setNewTeamAway('');
                  setNewFlagHome('');
                  setNewFlagAway('');
                  setNewPrize('');
                  setNewPrizeImage('');
                }}
                className="px-4 py-2 bg-[#eceef0] text-[#3e4a3d] font-sans text-xs font-semibold rounded-full hover:bg-[#e0e3e5] cursor-pointer"
              >
                Cancelar
              </button>
              <button 
                type="submit"
                className="px-5 py-2 bg-[#006b2c] text-white font-sans text-xs font-bold rounded-full hover:bg-[#005320] shadow-sm cursor-pointer"
              >
                {editingMatchId ? 'Salvar Alterações' : 'Salvar Jogo'}
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
                <div className="flex flex-wrap gap-2 justify-end mt-2">
                  {match.status !== 'Finalizado' && (
                    <button 
                      onClick={() => handleEditClick(match)}
                      className="flex-1 bg-[#eceef0] text-[#3e4a3d] hover:bg-[#e0e3e5] font-sans text-xs font-semibold px-3 py-2 rounded-xl hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Edit className="w-4 h-4" />
                      Editar Jogo
                    </button>
                  )}

                  {match.status !== 'Finalizado' ? (
                    <button 
                      onClick={() => {
                        setShowLaunchResultsId(match.id);
                        setLaunchScoreHome(match.scoreHome || 0);
                        setLaunchScoreAway(match.scoreAway || 0);
                      }}
                      className="flex-1 bg-[#006b2c] text-white font-sans text-xs font-semibold px-3 py-2 rounded-xl hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <CheckSquare className="w-4 h-4" />
                      Lançar Resultado
                    </button>
                  ) : (
                    <button 
                      onClick={() => {
                        setShowLaunchResultsId(match.id);
                        setLaunchScoreHome(match.scoreHome || 0);
                        setLaunchScoreAway(match.scoreAway || 0);
                      }}
                      className="flex-1 bg-[#f2f4f6] text-[#3e4a3d] hover:bg-[#e0e3e5] font-sans text-xs font-semibold px-3 py-2 rounded-xl hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Edit className="w-4 h-4" />
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
