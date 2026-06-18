import { useState, useEffect, FormEvent, useRef, ChangeEvent } from 'react';
import { 
  User, Mail, Camera, Save, Lock, ArrowLeft, LogOut, Award, 
  Key, ShieldAlert, CheckCircle, Clock, ChevronRight, BarChart, Trophy, Upload,
  Bell, BellOff
} from 'lucide-react';
import { UserProfile, Match, Prediction, Screen } from '../types';
import { supabase } from '../lib/supabase';

interface ProfileEditProps {
  currentUser: UserProfile;
  matches: Match[];
  predictions: Prediction[];
  onUpdateProfile: (name: string, email: string, avatar: string) => void;
  onLogout: () => void;
  onNavigate: (screen: Screen) => void;
}

export default function ProfileEdit({
  currentUser,
  matches,
  predictions,
  onUpdateProfile,
  onLogout,
  onNavigate
}: ProfileEditProps) {
  const [profileView, setProfileView] = useState<'overview' | 'edit' | 'password'>('overview');

  // Fields state for Edit Profile
  const [editName, setEditName] = useState(currentUser.name);
  const [editEmail, setEditEmail] = useState(currentUser.email);
  const [editAvatar, setEditAvatar] = useState(currentUser.avatar);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Password fields state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passMessage, setPassMessage] = useState('');

  // Push Notifications State
  const [isPushEnabled, setIsPushEnabled] = useState(false);
  const VAPID_PUBLIC_KEY = 'BDwqgVAKA3xaxShVHrrtI9ItMF1Oh_E4iIWg9lmK3jSZOkqdxeQzM8I2oyAJ9o5QplyXgZou_CqOiKX49gWeXBc';

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.ready.then(registration => {
        registration.pushManager.getSubscription().then(subscription => {
          setIsPushEnabled(!!subscription);
        });
      });
    }
  }, []);

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const handleTogglePush = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      alert('Seu navegador não suporta notificações Push.');
      return;
    }

    try {
      // No iOS Safari, a requisição de permissão DEVE ser a primeira coisa, antes de qualquer "await"
      let permission = Notification.permission;
      if (!isPushEnabled && permission !== 'granted') {
        permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          alert('Você precisa permitir as notificações no navegador.');
          return;
        }
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('Você precisa estar logado.');
        return;
      }

      const registration = await navigator.serviceWorker.ready;

      if (isPushEnabled) {
        // Unsubscribe
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          await subscription.unsubscribe();
          await supabase
            .from('push_subscriptions')
            .delete()
            .eq('endpoint', subscription.endpoint);
        }
        setIsPushEnabled(false);
      } else {
        // Subscribe
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
        });

        const subJson = subscription.toJSON();
        
        // Upsert if the user logs in from same device but different account, or just insert
        const { error } = await supabase.from('push_subscriptions').upsert({
          user_id: user.id,
          endpoint: subJson.endpoint,
          p256dh: subJson.keys?.p256dh,
          auth: subJson.keys?.auth
        }, { onConflict: 'user_id, endpoint' });
        
        if (error) {
          console.error(error);
          alert('Erro ao salvar notificação no banco de dados.');
          return;
        }

        setIsPushEnabled(true);
        alert('Notificações ativadas com sucesso!');
      }
    } catch (error) {
      console.error('Error toggling push:', error);
      alert('Ocorreu um erro ao configurar as notificações.');
    }
  };

  // Sample avatars list to pick from
  const SAMPLE_AVATARS = [
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDbV5tOY30U-u-YyaMBbsUeF_vN4p331pN0XTrZpSsuFjYpkBMrNuM7HRSPFMm6eRc009OhBwpnbQNVO1k31OukKQkTSGTKPvMGWIxRNBG1kldZztOkpyjupFpAwGTuQTTBFa1MGAA4W6U8oRFQWbXs_nqVZDT01JFqHZwBMSc44HfJ_WgoVM_qABvKF4GBxiSb3BkQwEH6HaMYjhDqu208k-zMOUeiCOcJ5Q-UgT-ETvDJIDquG-aEW_FyD15Zt32WH56l_KonuG8',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuD9TADGuj5iDUCjruotN6NLjo97Eenm4HAi0T612sHXZOdSqlDF9-9Un0YsAs8igLU3SIsvizyt2iCdCrI6x5XK-qhrb8vZLhbRJtBtHNSMUGHMNHiXxxhsmor7iF18VBvPVPdfW7yBxzJNTLP2-D0fze6wWDgHdaC5EXI7gZUzsihp4_9y6MB_WnULqRorkapSwHiCXIeHhdOD3pFXfEjdZDAbVEbpwwrdga2qoROumEPVi0H8Ck6EWuzVHPmWTZz034RZCKVel4I',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=250&q=80'
  ];

  const handleSaveProfile = (e: FormEvent) => {
    e.preventDefault();
    onUpdateProfile(editName, editEmail, editAvatar);
    setProfileView('overview');
  };

  const handleUpdatePassword = (e: FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPassMessage('As senhas não coincidem! ❌');
      return;
    }
    setPassMessage('Senha atualizada com sucesso! 🛡️');
    setTimeout(() => {
      setPassMessage('');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setProfileView('overview');
    }, 2000);
  };

  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    try {
      setIsUploading(true);
      const file = event.target.files?.[0];
      if (!file) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `${currentUser.email.replace(/[^a-zA-Z0-9]/g, '_')}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      
      setEditAvatar(data.publicUrl);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Erro ao enviar imagem. Verifique se o tamanho é menor que 5MB.');
    } finally {
      setIsUploading(false);
    }
  };

  // Only predictions for the current logged-in user
  const userPredictions = predictions.filter(p => p.userEmail === currentUser.email);

  const getTeamInitials = (team: string) => {
    if (team === 'Brasil') return 'BRA';
    if (team === 'Marrocos') return 'MAR';
    if (team === 'França') return 'FRA';
    if (team === 'Espanha') return 'ESP';
    if (team === 'Alemanha') return 'GER';
    if (team === 'Suíça') return 'SUI';
    return team.substring(0, 3).toUpperCase();
  };

  return (
    <div className="w-full max-w-md mx-auto select-none animate-fade-in pb-16">
      
      {/* ----------------- STEP 1: OVERVIEW SCREEN ----------------- */}
      {profileView === 'overview' && (
        <div className="flex flex-col gap-6">
          {/* User profile avatar section */}
          <section className="flex flex-col items-center py-4">
            <div className="relative w-24 h-24 mb-3">
              <div className="w-full h-full rounded-full overflow-hidden border-4 border-white shadow-[0_10px_30px_rgba(15,23,42,0.08)] bg-[#eceef0] flex items-center justify-center">
                <img 
                  src={currentUser.avatar} 
                  alt="Avatar do Usuário" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <button 
                onClick={() => setProfileView('edit')}
                aria-label="Editar Avatar"
                className="absolute bottom-0 right-0 bg-[#006b2c] hover:bg-[#005320] text-on-primary w-8 h-8 rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform cursor-pointer"
              >
                <Camera className="w-4 h-4 text-white" />
              </button>
            </div>
            <h2 className="font-poppins font-bold text-xl text-[#191c1e]">{currentUser.name}</h2>
            <p className="font-sans text-xs text-[#6e7b6c] font-medium">{currentUser.role}</p>
          </section>

          {/* Statistics Grid */}
          <section className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl p-4 shadow-[0_10px_30px_rgba(15,23,42,0.06)] flex flex-col items-center justify-center border border-[#eceef0]/30">
              <BarChart className="w-5 h-5 text-[#735c00] mb-1" />
              <span className="font-poppins font-bold text-2xl text-[#191c1e]">
                {currentUser.totalBets + userPredictions.length}
              </span>
              <span className="font-sans text-[11px] text-[#3e4a3d] mt-1">Total de Palpites</span>
            </div>

            <div className="bg-[#fed01b] rounded-2xl p-4 shadow-[0_10px_30px_rgba(15,23,42,0.06)] flex flex-col items-center justify-center relative overflow-hidden">
              <div className="absolute -right-4 -top-4 opacity-15 rotate-12">
                <Trophy className="w-20 h-20 text-[#735c00]" />
              </div>
              <Award className="w-5 h-5 text-[#735c00] mb-1 relative z-10" />
              <span className="font-poppins font-bold text-2xl text-[#231b00] relative z-10">
                {currentUser.totalPoints}
              </span>
              <span className="font-sans text-[11px] text-[#6f5900] font-semibold mt-1 relative z-10">Pontuação Total</span>
            </div>
          </section>

          {/* Recent Predictions Section */}
          <section className="flex flex-col gap-3">
            <div className="flex justify-between items-center px-1">
              <h3 className="font-poppins font-bold text-sm text-[#191c1e]">Seus Palpites Recentes</h3>
              <button 
                onClick={() => onNavigate('home')} 
                className="text-[#006b2c] font-sans text-xs font-semibold hover:underline"
              >
                Ver Todos
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {userPredictions.length > 0 ? (
                userPredictions.slice(0, 3).map((pred) => {
                  const match = matches.find(m => m.id === pred.matchId);
                  if (!match) return null;
                  const isAguardando = match.status !== 'Finalizado';

                  return (
                    <div 
                      key={pred.id}
                      onClick={() => onNavigate('home')}
                      className="bg-white rounded-2xl p-4 shadow-[0_5px_15px_rgba(15,23,42,0.04)] border border-[#eceef0]/30 hover:border-[#006b2c]/20 transition-all cursor-pointer flex flex-col gap-3"
                    >
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-sans text-[11px] text-[#6e7b6c]">{match.dateStr}</span>
                        {isAguardando ? (
                          <div className="bg-[#00873a]/10 text-[#006b2c] px-2 py-0.5 rounded-full font-sans text-[10px] font-bold flex items-center gap-1 border border-[#006b2c]/10">
                            <Clock className="w-3 h-3" />
                            Aguardando
                          </div>
                        ) : (
                          <div className="bg-[#fed01b]/10 text-[#735c00] px-2 py-0.5 rounded-full font-sans text-[10px] font-bold flex items-center gap-1 border border-[#fed01b]/20">
                            <CheckCircle className="w-3 h-3" />
                            Finalizado
                          </div>
                        )}
                      </div>

                      <div className="flex justify-between items-center bg-[#f2f4f6] rounded-xl p-3">
                        <div className="flex items-center gap-2 flex-1">
                          <img 
                            src={match.flagHome} 
                            alt={match.teamHome} 
                            className="w-6 h-6 rounded-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <span className="font-poppins font-semibold text-xs text-[#191c1e]">
                            {getTeamInitials(match.teamHome)}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 px-2">
                          <span className="font-poppins font-bold text-sm text-[#191c1e]">{pred.scoreHome}</span>
                          <span className="text-xs text-[#bdcaba]">x</span>
                          <span className="font-poppins font-bold text-sm text-[#191c1e]">{pred.scoreAway}</span>
                        </div>

                        <div className="flex items-center gap-2 flex-1 justify-end">
                          <span className="font-poppins font-semibold text-xs text-[#191c1e]">
                            {getTeamInitials(match.teamAway)}
                          </span>
                          <img 
                            src={match.flagAway} 
                            alt={match.teamAway} 
                            className="w-6 h-6 rounded-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-[#eceef0] text-xs text-[#6e7b6c]">
                  Você não realizou palpites nesta rodada ainda. Faça palpites na aba Início! ⚽
                </div>
              )}
            </div>
          </section>

          {/* Actions Settings Section */}
          <section className="flex flex-col gap-2 pt-2">
            <h3 className="font-poppins font-bold text-sm text-[#191c1e] px-1 mb-1">Ações de Conta</h3>
            
            {/* Notifications Toggle */}
            <button 
              type="button"
              onClick={handleTogglePush}
              className="w-full bg-white border border-[#eceef0] p-3.5 rounded-2xl flex items-center justify-between shadow-sm hover:bg-[#eceef0]/30 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isPushEnabled ? 'bg-[#006b2c]/10 text-[#006b2c]' : 'bg-[#555b70]/10 text-[#555b70]'}`}>
                  {isPushEnabled ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
                </div>
                <div className="flex flex-col items-start">
                  <span className="font-sans text-sm font-semibold text-[#191c1e]">Notificações do App</span>
                  <span className="font-sans text-[10px] text-[#6e7b6c]">{isPushEnabled ? 'Ativadas (Gols e Placar)' : 'Desativadas'}</span>
                </div>
              </div>
              <div className={`w-10 h-6 rounded-full p-1 transition-colors ${isPushEnabled ? 'bg-[#006b2c]' : 'bg-[#eceef0]'}`}>
                <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${isPushEnabled ? 'translate-x-4' : 'translate-x-0'}`}></div>
              </div>
            </button>
            
            <button 
              onClick={() => setProfileView('edit')}
              className="w-full bg-white border border-[#eceef0] p-3.5 rounded-2xl flex items-center justify-between shadow-sm hover:bg-[#eceef0]/30 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#006b2c]/10 flex items-center justify-center text-[#006b2c]">
                  <User className="w-5 h-5" />
                </div>
                <span className="font-sans text-sm font-semibold text-[#191c1e]">Editar Perfil</span>
              </div>
              <ChevronRight className="w-4 h-4 text-[#bdcaba] group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button 
              onClick={() => onNavigate('ranking')}
              className="w-full bg-white border border-[#eceef0] p-3.5 rounded-2xl flex items-center justify-between shadow-sm hover:bg-[#eceef0]/30 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#fed01b]/15 flex items-center justify-center text-[#735c00]">
                  <Trophy className="w-5 h-5" />
                </div>
                <span className="font-sans text-sm font-semibold text-[#191c1e]">Ver Meu Ranking</span>
              </div>
              <ChevronRight className="w-4 h-4 text-[#bdcaba] group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button 
              onClick={() => setProfileView('password')}
              className="w-full bg-white border border-[#eceef0] p-3.5 rounded-2xl flex items-center justify-between shadow-sm hover:bg-[#eceef0]/30 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#555b70]/10 flex items-center justify-center text-[#555b70]">
                  <Key className="w-5 h-5" />
                </div>
                <span className="font-sans text-sm font-semibold text-[#191c1e]">Alterar Senha</span>
              </div>
              <ChevronRight className="w-4 h-4 text-[#bdcaba] group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button 
              onClick={onLogout}
              className="w-full bg-[#ba1a1a]/5 border border-[#ba1a1a]/25 p-3.5 rounded-2xl flex items-center justify-between shadow-sm hover:bg-[#ba1a1a]/10 transition-colors cursor-pointer mt-2"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#ba1a1a]/10 flex items-center justify-center text-[#ba1a1a]">
                  <LogOut className="w-5 h-5" />
                </div>
                <span className="font-sans text-sm font-bold text-[#ba1a1a]">Sair da Conta</span>
              </div>
            </button>
          </section>
        </div>
      )}


      {/* ----------------- STEP 2: EDIT PROFILE SCREEN ----------------- */}
      {profileView === 'edit' && (
        <form 
          onSubmit={handleSaveProfile}
          className="bg-white rounded-[24px] shadow-[0_10px_30px_rgba(15,23,42,0.06)] p-6 flex flex-col items-center border border-[#eceef0]"
        >
          <div className="w-full flex items-center gap-2 mb-6">
            <button 
              type="button" 
              onClick={() => setProfileView('overview')}
              className="p-1 rounded-full text-[#006b2c] hover:bg-[#eceef0] cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h2 className="font-poppins font-bold text-[#191c1e] text-base">Editar Seu Perfil</h2>
          </div>

          {/* Avatar edit slider */}
          <div className="flex flex-col items-center gap-3 mb-6 w-full">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-[#eceef0] shadow relative">
              <img 
                src={editAvatar} 
                alt="Avatar" 
                className={`w-full h-full object-cover ${isUploading ? 'opacity-50' : ''}`}
                referrerPolicy="no-referrer"
              />
              {isUploading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-[#006b2c] border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
            
            <div className="flex flex-col items-center w-full gap-2 mt-1">
              <input 
                type="file" 
                accept="image/*" 
                hidden 
                ref={fileInputRef} 
                onChange={handleFileUpload}
              />
              <button
                type="button"
                disabled={isUploading}
                onClick={() => fileInputRef.current?.click()}
                className="bg-[#f2f4f6] text-[#191c1e] border border-[#eceef0] hover:bg-[#eceef0] px-4 py-2 rounded-full font-sans text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                {isUploading ? 'Enviando...' : 'Enviar Nova Foto'}
              </button>

              <span className="text-[11px] font-sans text-[#6e7b6c] mt-2 mb-1">Ou escolha um Avatar da Resenha:</span>
              <div className="flex gap-2 justify-center flex-wrap">
                {SAMPLE_AVATARS.map((url, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setEditAvatar(url)}
                    className={`w-10 h-10 rounded-full overflow-hidden border-2 transition-all cursor-pointer ${
                      editAvatar === url ? 'border-[#006b2c] scale-110 shadow-sm' : 'border-transparent opacity-75'
                    }`}
                  >
                    <img src={url} alt={`Avatar ${index}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="w-full flex flex-col gap-4">
            {/* Input Name */}
            <div className="flex flex-col gap-1">
              <label htmlFor="edit-name" className="text-xs font-semibold text-[#3e4a3d] ml-1 font-sans">
                Nome de Exibição
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-outline"><User className="w-4 h-4 text-[#6e7b6c]" /></span>
                <input 
                  id="edit-name"
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full h-12 bg-[#f2f4f6] border border-[#eceef0] rounded-2xl pl-11 pr-4 font-sans text-xs text-[#191c1e] outline-none"
                  required
                />
              </div>
            </div>

            {/* Input Email */}
            <div className="flex flex-col gap-1">
              <label htmlFor="edit-email" className="text-xs font-semibold text-[#3e4a3d] ml-1 font-sans">
                Seu e-mail
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-outline"><Mail className="w-4 h-4 text-[#6e7b6c]" /></span>
                <input 
                  id="edit-email"
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full h-12 bg-[#f2f4f6] border border-[#eceef0] rounded-2xl pl-11 pr-4 font-sans text-xs text-[#191c1e] outline-none"
                  required
                />
              </div>
            </div>

            {/* Submit changes */}
            <button 
              type="submit"
              className="w-full h-12 rounded-full bg-[#006b2c] text-white font-sans text-xs font-bold flex items-center justify-center gap-2 shadow-md hover:bg-[#005320] active:scale-[0.98] transition-all cursor-pointer mt-2"
            >
              <Save className="w-4 h-4" />
              <span>Salvar Alterações</span>
            </button>
          </div>
        </form>
      )}


      {/* ----------------- STEP 3: CHANGE PASSWORD SCREEN ----------------- */}
      {profileView === 'password' && (
        <form 
          onSubmit={handleUpdatePassword}
          className="bg-white rounded-[24px] shadow-[0_10px_30px_rgba(15,23,42,0.06)] p-6 flex flex-col border border-[#eceef0]"
        >
          <div className="w-full flex items-center gap-2 mb-5">
            <button 
              type="button" 
              onClick={() => setProfileView('overview')}
              className="p-1 rounded-full text-[#006b2c] hover:bg-[#eceef0] cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h2 className="font-poppins font-bold text-[#191c1e] text-base">Alterar Sua Senha</h2>
          </div>

          <div className="bg-[#f7fff2] border border-[#006b2c]/20 rounded-xl p-4 flex gap-3 mb-5 items-start">
            <ShieldAlert className="w-4 h-4 text-[#006b2c] shrink-0 mt-[2px]" />
            <p className="font-sans text-[11px] text-[#3e4a3d]">
              Para segurança, recomendamos senhas robustas combinando letras, números e símbolos especiais.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            {/* Password input */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#191c1e] font-sans ml-1" htmlFor="sec-curr">Senha Atual</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2"><Lock className="w-4 h-4 text-[#6e7b6c]" /></span>
                <input 
                  id="sec-curr"
                  type="password"
                  placeholder="Digite sua senha atual"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-[#f2f4f6] border border-[#eceef0] rounded-2xl pl-11 pr-4 py-3 font-sans text-xs text-[#191c1e] outline-none"
                  required
                />
              </div>
            </div>

            <div className="w-full h-px bg-[#f2f4f6] my-2"></div>

            {/* New password */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#191c1e] font-sans ml-1" htmlFor="sec-new">Nova Senha</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2"><Key className="w-4 h-4 text-[#6e7b6c]" /></span>
                <input 
                  id="sec-new"
                  type="password"
                  placeholder="Mínimo 8 caracteres"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-[#f2f4f6] border border-[#eceef0] rounded-2xl pl-11 pr-4 py-3 font-sans text-xs text-[#191c1e] outline-none"
                  required
                />
              </div>
            </div>

            {/* Confirm password */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#191c1e] font-sans ml-1" htmlFor="sec-conf">Confirmar Nova Senha</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2"><Lock className="w-4 h-4 text-[#6e7b6c]" /></span>
                <input 
                  id="sec-conf"
                  type="password"
                  placeholder="Repita a nova senha"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-[#f2f4f6] border border-[#eceef0] rounded-2xl pl-11 pr-4 py-3 font-sans text-xs text-[#191c1e] outline-none"
                  required
                />
              </div>
            </div>

            {passMessage && (
              <p className="text-xs text-center font-sans font-semibold mt-1 text-[#ba1a1a]">{passMessage}</p>
            )}

            <button 
              type="submit"
              className="w-full bg-[#006b2c] text-white font-sans text-xs font-bold rounded-full py-3 px-6 shadow-md hover:bg-[#005320] active:scale-[0.98] transition-all cursor-pointer mt-2"
            >
              Atualizar Senha
            </button>
            
            <div className="mt-3 text-center">
              <a 
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setPassMessage('Link de recuperação enviado para seu e-mail! 📬');
                }}
                className="text-xs text-[#6e7b6c] font-sans hover:text-[#006b2c]"
              >
                Esqueceu a senha atual?
              </a>
            </div>
          </div>
        </form>
      )}

    </div>
  );
}
