import { useState, FormEvent } from 'react';
import { Mail, Lock, User, ArrowRight, Eye, EyeOff, Send, ArrowLeft, ShieldAlert } from 'lucide-react';

interface AuthScreensProps {
  currentView: 'login' | 'register' | 'recovery';
  onChangeView: (view: 'login' | 'register' | 'recovery') => void;
  onLoginSuccess: (name: string, email: string) => void;
}

export default function AuthScreens({ currentView, onChangeView, onLoginSuccess }: AuthScreensProps) {
  // Common states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Notifications
  const [errorStatus, setErrorStatus] = useState('');
  const [successStatus, setSuccessStatus] = useState('');

  const handleLoginSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorStatus('Por favor, preencha todos os campos!');
      return;
    }
    setErrorStatus('');
    // Simulate successful login
    onLoginSuccess(fullName || 'João Silva', email);
  };

  const handleRegisterSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      setErrorStatus('Por favor, preencha todos os campos!');
      return;
    }
    if (password !== confirmPassword) {
      setErrorStatus('As senhas não coincidem!');
      return;
    }
    setErrorStatus('');
    setSuccessStatus('Conta cadastrada com sucesso! Redirecionando...');
    setTimeout(() => {
      setSuccessStatus('');
      onLoginSuccess(fullName, email);
    }, 1500);
  };

  const handleRecoverySubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorStatus('Por favor, digite seu e-mail!');
      return;
    }
    setErrorStatus('');
    setSuccessStatus('Instruções enviadas! Verifique sua caixa de entrada.');
    setTimeout(() => {
      setSuccessStatus('');
      onChangeView('login');
    }, 2500);
  };

  return (
    <main className="w-full max-w-[440px] px-4 py-8 flex flex-col items-center justify-center min-h-[85vh] mx-auto select-none animate-fade-in">
      
      {/* Brand Logo Header Block */}
      <div className="text-center mb-6 flex flex-col items-center">
        <img 
          src="https://qdqsjhrxeuvxdaguyykj.supabase.co/storage/v1/object/public/SelmansBet/Selmansbet%20-%20Transparente.png" 
          alt="Selman'sBet Logo" 
          className="h-28 md:h-36 w-auto object-contain mb-4"
          referrerPolicy="no-referrer"
        />
        
        {/* State conditional greetings */}
        {currentView === 'login' && (
          <p className="font-sans text-xs text-[#3e4a3d] mt-1.5 font-medium">
            O bolão oficial da família. A diversão começa aqui!
          </p>
        )}
        {currentView === 'register' && (
          <p className="font-sans text-xs text-[#3e4a3d] mt-1.5 font-medium">
            Crie sua conta para participar da resenha e dar palpites!
          </p>
        )}
      </div>

      {/* -------------------- VIEW: LOGIN -------------------- */}
      {currentView === 'login' && (
        <div className="w-full bg-white rounded-[24px] p-6 shadow-[0_10px_30px_rgba(15,23,42,0.06)] flex flex-col gap-5 border border-[#eceef0]/60">
          <h2 className="font-poppins font-semibold text-lg text-[#191c1e] text-center">Bom te ver de novo!</h2>
          
          <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4">
            {/* Input E-mail */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#191c1e] font-sans ml-1" htmlFor="email">E-mail</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#bdcaba]">
                  <Mail className="w-4 h-4 text-[#6e7b6c]" />
                </span>
                <input 
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  className="w-full pl-11 pr-4 py-3 bg-[#f2f4f6] border border-[#eceef0] rounded-2xl font-sans text-xs text-[#191c1e] placeholder:text-[#3e4a3d]/40 focus:ring-2 focus:ring-[#006b2c]/10 focus:border-[#006b2c] transition-all outline-none"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Input Senha */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center px-1">
                <label className="text-xs font-semibold text-[#191c1e] font-sans" htmlFor="password">Senha</label>
                <button 
                  type="button"
                  onClick={() => onChangeView('recovery')}
                  className="text-xs text-[#006b2c] hover:underline font-medium font-sans cursor-pointer"
                >
                  Esqueceu a senha?
                </button>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#bdcaba]">
                  <Lock className="w-4 h-4 text-[#6e7b6c]" />
                </span>
                <input 
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-11 py-3 bg-[#f2f4f6] border border-[#eceef0] rounded-2xl font-sans text-xs text-[#191c1e] placeholder:text-[#3e4a3d]/40 focus:ring-2 focus:ring-[#006b2c]/10 focus:border-[#006b2c] transition-all outline-none"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => !prev)}
                  className="absolute inset-y-0 right-0 pr-3 flex.items-center text-[#6e7b6c] hover:text-[#006b2c] transition-all flex items-center justify-center cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {errorStatus && (
              <p className="text-xs font-sans text-[#ba1a1a] font-semibold text-center mt-1">{errorStatus}</p>
            )}

            {/* Submit */}
            <button 
              type="submit"
              className="w-full mt-2 py-3.5 bg-[#006b2c] hover:bg-[#005320] text-white font-sans text-xs font-bold rounded-full shadow-[0_4px_12px_rgba(0,107,44,0.15)] hover:shadow-[0_8px_24px_rgba(0,107,44,0.25)] transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer group"
            >
              <span>Entrar</span>
              <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-0.5 transition-transform" />
            </button>
          </form>

          {/* Create count link */}
          <div className="text-center mt-2">
            <p className="font-sans text-xs text-[#3e4a3d] font-medium">
              Ainda não tem uma conta?{' '}
              <button 
                onClick={() => onChangeView('register')}
                className="text-[#006b2c] hover:underline font-bold ml-0.5 cursor-pointer"
              >
                Criar uma conta
              </button>
            </p>
          </div>
        </div>
      )}

      {/* -------------------- VIEW: REGISTER -------------------- */}
      {currentView === 'register' && (
        <div className="w-full bg-white rounded-[24px] p-6 shadow-[0_10px_30px_rgba(15,23,42,0.06)] flex flex-col gap-5 border border-[#eceef0]/60">
          <h2 className="font-poppins font-semibold text-lg text-[#191c1e] text-center">Crie sua conta</h2>
          
          <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-4">
            {/* Input Nome Completo */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#191c1e] font-sans ml-1" htmlFor="reg-name">Nome Completo</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <User className="w-4 h-4 text-[#6e7b6c]" />
                </span>
                <input 
                  id="reg-name"
                  type="text"
                  placeholder="Digite seu nome completo"
                  className="w-full pl-11 pr-4 py-3 bg-[#f2f4f6] border border-[#eceef0] rounded-2xl font-sans text-xs text-[#191c1e] placeholder:text-[#3e4a3d]/40 focus:ring-2 focus:ring-[#006b2c]/10 focus:border-[#006b2c] transition-all outline-none"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Input E-mail */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#191c1e] font-sans ml-1" htmlFor="reg-email">E-mail</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="w-4 h-4 text-[#6e7b6c]" />
                </span>
                <input 
                  id="reg-email"
                  type="email"
                  placeholder="seu@email.com"
                  className="w-full pl-11 pr-4 py-3 bg-[#f2f4f6] border border-[#eceef0] rounded-2xl font-sans text-xs text-[#191c1e] placeholder:text-[#3e4a3d]/40 focus:ring-2 focus:ring-[#006b2c]/10 focus:border-[#006b2c] transition-all outline-none"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Input Senha */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#191c1e] font-sans ml-1" htmlFor="reg-pass">Senha</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="w-4 h-4 text-[#6e7b6c]" />
                </span>
                <input 
                  id="reg-pass"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Crie uma senha forte"
                  className="w-full pl-11 pr-11 py-3 bg-[#f2f4f6] border border-[#eceef0] rounded-2xl font-sans text-xs text-[#191c1e] placeholder:text-[#3e4a3d]/40 focus:ring-2 focus:ring-[#006b2c]/10 focus:border-[#006b2c] transition-all outline-none"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => !prev)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#6e7b6c] hover:text-[#006b2c] cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirmar Senha */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#191c1e] font-sans ml-1" htmlFor="reg-pass-conf">Confirmar Senha</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="w-4 h-4 text-[#6e7b6c]" />
                </span>
                <input 
                  id="reg-pass-conf"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Repita sua senha"
                  className="w-full pl-11 pr-11 py-3 bg-[#f2f4f6] border border-[#eceef0] rounded-2xl font-sans text-xs text-[#191c1e] placeholder:text-[#3e4a3d]/40 focus:ring-2 focus:ring-[#006b2c]/10 focus:border-[#006b2c] transition-all outline-none"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(prev => !prev)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#6e7b6c] hover:text-[#006b2c] cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {errorStatus && (
              <p className="text-xs font-sans text-[#ba1a1a] font-semibold text-center mt-1">{errorStatus}</p>
            )}

            {successStatus && (
              <p className="text-xs font-sans text-[#006b2c] font-semibold text-center mt-1 animate-pulse">{successStatus}</p>
            )}

            {/* Submit button */}
            <button 
              type="submit"
              className="w-full mt-2 py-3.5 bg-[#006b2c] hover:bg-[#005320] text-white font-sans text-xs font-bold rounded-full shadow-[0_4px_12px_rgba(0,107,44,0.15)] hover:shadow-[0_8px_24px_rgba(0,107,44,0.25)] transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer group"
            >
              <span>Cadastrar</span>
              <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-0.5 transition-transform" />
            </button>
          </form>

          {/* Login Link */}
          <div className="text-center mt-2">
            <button 
              onClick={() => onChangeView('login')}
              className="font-sans text-xs text-[#3e4a3d] hover:text-[#006b2c] hover:underline font-semibold cursor-pointer"
            >
              Já tenho uma conta. Entrar
            </button>
          </div>
        </div>
      )}

      {/* -------------------- VIEW: RECOVERY -------------------- */}
      {currentView === 'recovery' && (
        <div className="w-full bg-white rounded-[24px] p-6 shadow-[0_10px_30px_rgba(15,23,42,0.06)] flex flex-col gap-5 border border-[#eceef0]/60">
          <div className="text-center">
            <h2 className="font-poppins font-semibold text-lg text-[#191c1e] mb-1">Recuperar Senha</h2>
            <p className="font-sans text-xs text-[#3e4a3d] leading-relaxed">
              Não se preocupe! Informe o e-mail associado à sua conta e enviaremos as instruções para você voltar ao jogo.
            </p>
          </div>

          <form onSubmit={handleRecoverySubmit} className="flex flex-col gap-4">
            {/* Input E-mail */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#191c1e] font-sans ml-1" htmlFor="rec-email">Endereço de E-mail</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="w-4 h-4 text-[#6e7b6c]" />
                </span>
                <input 
                  id="rec-email"
                  type="email"
                  placeholder="exemplo@familia.com"
                  className="w-full pl-11 pr-4 py-3 bg-[#f2f4f6] border border-[#eceef0] rounded-2xl font-sans text-xs text-[#191c1e] placeholder:text-[#3e4a3d]/40 focus:ring-2 focus:ring-[#006b2c]/10 focus:border-[#006b2c] transition-all outline-none"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {errorStatus && (
              <p className="text-xs font-sans text-[#ba1a1a] font-semibold text-center mt-1">{errorStatus}</p>
            )}

            {successStatus && (
              <p className="text-xs font-sans text-[#006b2c] font-semibold text-center mt-1">{successStatus}</p>
            )}

            {/* Enviar Button */}
            <button 
              type="submit"
              className="w-full mt-2 py-3.5 bg-[#006b2c] hover:bg-[#005320] text-white font-sans text-xs font-bold rounded-full shadow-[0_4px_12px_rgba(0,107,44,0.15)] hover:shadow-[0_8px_24px_rgba(0,107,44,0.25)] transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer group"
            >
              <span>Enviar link de recuperação</span>
              <Send className="w-4 h-4 text-white group-hover:translate-x-0.5 transition-transform" />
            </button>
          </form>

          {/* Footer Action Back to login */}
          <div className="text-center pt-3 border-t border-[#f2f4f6] mt-1">
            <button 
              onClick={() => onChangeView('login')}
              className="font-sans text-xs text-[#006b2c] hover:text-[#005320] font-semibold inline-flex items-center gap-1 cursor-pointer group"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
              <span>Voltar para o login</span>
            </button>
          </div>
        </div>
      )}

    </main>
  );
}
