export type MatchStatus = 'Aberto' | 'Finalizado' | 'Fechado';

export interface Match {
  id: string;
  teamHome: string;
  teamAway: string;
  flagHome: string;
  flagAway: string;
  group: string;
  dateStr: string;
  status: MatchStatus;
  scoreHome?: number;
  scoreAway?: number;
}

export interface Prediction {
  id: string;
  matchId: string;
  userEmail: string;
  userName: string;
  userAvatar?: string;
  scoreHome: number;
  scoreAway: number;
  betValue?: number; // valor em R$ ou fictício
  pointsCalculated?: number;
  createdAt: string;
}

export interface UserProfile {
  name: string;
  email: string;
  avatar: string;
  role: string;
  totalBets: number;
  totalPoints: number;
}

export type Screen = 
  | 'login'
  | 'register'
  | 'recovery'
  | 'home'
  | 'match-details'
  | 'ranking'
  | 'profile'
  | 'edit-profile'
  | 'change-password'
  | 'admin';
