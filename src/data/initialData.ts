import { Match, Prediction, UserProfile } from '../types';

export const INITIAL_MATCHES: Match[] = [
  {
    id: 'm1',
    teamHome: 'Brasil',
    teamAway: 'Marrocos',
    flagHome: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBI7FW8W79Z0vP6kXmeaGvpfo3fOHXpOV6fKoWopsGBB0RLGFy2aLRs2FpJS7Q7fLtIjt6zqppIOhdUDUloUi_-fIrfsFZIldN4ZOaZVLgc0_BBOYBh1kEf-o3YgvulSuh3y6J-M3KwUWgEtJZzqtbuCAZFd_CeVCbz0sJq8-NSioq-zL9t9y0XrwpjHsuRZ2aW-MK1roD41fFxSM9dxqPU_2M6tAMwUNs7eYcPGuqWb9kfhteEFveBTJfroxY9liZkr6FLT5-IcUs',
    flagAway: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD83R25F0WB83hmbP9h7BgDGeX1GB6fjVVk_g_mYpLl_TZQE3I21ft1ZkwLYl-PAfnoSjrlI-YrtyVW31ROCED74gWLpqjAUV9laEBM3uTmwB3ZGQkPWaoHeLLQw_HXbjrjddeX9UKQuQ3XnA373Z3z2EihMDNMPIH0TdhjS-RwPU9I62S93JSZ3qx4UMoehwLsHpp7U-NWtsdn6bMEKU6IEVem0aGuGqeTOST6kCpkvpFe-UiFYgucycoHv1HGDDziRqQt4aXnFcI',
    group: 'FASE DE GRUPOS',
    dateStr: '13/06/2026 às 19:00',
    status: 'Aberto'
  },
  {
    id: 'm2',
    teamHome: 'França',
    teamAway: 'Espanha',
    flagHome: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD8SGbJpqtcsyelKa1MsOsYvxenSyMCfen_VWBY5zMiesX3R74WlpvVV5flezJigTLrZ56Fuz7e7AtboVynPOsLP6OZK7w_8WCI6Q8zENZRgc0hEcIDf6BcHS6YeKGBv-dhSKOtvn46R-hRB2zsyUHL_hbREYT9l0yo-JQhbsjHtfK2ExezDBl8wIREWH0cQxWAxMx81ifrPu5S9R2BUOKmuucGBllm4jCFxcDPskt2wJEI32_8lLkSP_GzgXoPSjivPJYyXsZ9dO0',
    flagAway: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCOsKUpynFleGSblZce4flDPH5B2S04uNTOMcPJm55sSYNkBmHuui7C1p1mdcw9Bl6VJwtPIieqXbAxNm_yTLRXBA6YQDAoFxz2jmR8XWeC0wl6KF6FUHL9h-FuC6jW1_558W7-Ocxs1BZLYfNo_yS3Hdbhkwx7yJMqJnii1Ck1dJ21GDFQB8i5PtcG6yIUsklcVmKoGqGY9xNs7TfqmSRm_2bUYvKUeoGKld-Q7ngjJWXCHWEr-AZe6V1yprc0h8wymMffCB8lAVk',
    group: 'FASE DE GRUPOS',
    dateStr: 'Ontem, 20:00',
    status: 'Finalizado',
    scoreHome: 1,
    scoreAway: 1
  },
  {
    id: 'm3',
    teamHome: 'Espanha',
    teamAway: 'Alemanha',
    flagHome: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCOsKUpynFleGSblZce4flDPH5B2S04uNTOMcPJm55sSYNkBmHuui7C1p1mdcw9Bl6VJwtPIieqXbAxNm_yTLRXBA6YQDAoFxz2jmR8XWeC0wl6KF6FUHL9h-FuC6jW1_558W7-Ocxs1BZLYfNo_yS3Hdbhkwx7yJMqJnii1Ck1dJ21GDFQB8i5PtcG6yIUsklcVmKoGqGY9xNs7TfqmSRm_2bUYvKUeoGKld-Q7ngjJWXCHWEr-AZe6V1yprc0h8wymMffCB8lAVk',
    flagAway: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCOsKUpynFleGSblZce4flDPH5B2S04uNTOMcPJm55sSYNkBmHuui7C1p1mdcw9Bl6VJwtPIieqXbAxNm_yTLRXBA6YQDAoFxz2jmR8XWeC0wl6KF6FUHL9h-FuC6jW1_558W7-Ocxs1BZLYfNo_yS3Hdbhkwx7yJMqJnii1Ck1dJ21GDFQB8i5PtcG6yIUsklcVmKoGqGY9xNs7TfqmSRm_2bUYvKUeoGKld-Q7ngjJWXCHWEr-AZe6V1yprc0h8wymMffCB8lAVk',
    group: 'QUARTAS DE FINAL',
    dateStr: '19/06/2026 às 16:00',
    status: 'Aberto'
  },
  {
    id: 'm4',
    teamHome: 'Brasil',
    teamAway: 'Suíça',
    flagHome: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBI7FW8W79Z0vP6kXmeaGvpfo3fOHXpOV6fKoWopsGBB0RLGFy2aLRs2FpJS7Q7fLtIjt6zqppIOhdUDUloUi_-fIrfsFZIldN4ZOaZVLgc0_BBOYBh1kEf-o3YgvulSuh3y6J-M3KwUWgEtJZzqtbuCAZFd_CeVCbz0sJq8-NSioq-zL9t9y0XrwpjHsuRZ2aW-MK1roD41fFxSM9dxqPU_2M6tAMwUNs7eYcPGuqWb9kfhteEFveBTJfroxY9liZkr6FLT5-IcUs',
    flagAway: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBI7FW8W79Z0vP6kXmeaGvpfo3fOHXpOV6fKoWopsGBB0RLGFy2aLRs2FpJS7Q7fLtIjt6zqppIOhdUDUloUi_-fIrfsFZIldN4ZOaZVLgc0_BBOYBh1kEf-o3YgvulSuh3y6J-M3KwUWgEtJZzqtbuCAZFd_CeVCbz0sJq8-NSioq-zL9t9y0XrwpjHsuRZ2aW-MK1roD41fFxSM9dxqPU_2M6tAMwUNs7eYcPGuqWb9kfhteEFveBTJfroxY9liZkr6FLT5-IcUs',
    group: 'FASE DE GRUPOS',
    dateStr: '18/06/2026 às 16:00',
    status: 'Fechado',
    scoreHome: 2,
    scoreAway: 0
  }
];

export const INITIAL_PREDICTIONS: Prediction[] = [
  {
    id: 'p1',
    matchId: 'm1',
    userEmail: 'manoel.neto.arq@gmail.com',
    userName: 'Neto',
    scoreHome: 2,
    scoreAway: 1,
    betValue: 50,
    createdAt: '2026-06-16T15:30:00'
  },
  {
    id: 'p2',
    matchId: 'm1',
    userEmail: 'mariana.silva@exemplo.com',
    userName: 'Mariana',
    scoreHome: 1,
    scoreAway: 1,
    betValue: 20,
    createdAt: '2026-06-16T16:00:00'
  },
  {
    id: 'p3',
    matchId: 'm1',
    userEmail: 'carlos.silva@exemplo.com',
    userName: 'Carlos',
    scoreHome: 0,
    scoreAway: 2,
    betValue: 10,
    createdAt: '2026-06-16T16:15:00'
  },
  {
    id: 'p4',
    matchId: 'm1',
    userEmail: 'ana.julia@exemplo.com',
    userName: 'Ana',
    scoreHome: 3,
    scoreAway: 0,
    betValue: 15,
    createdAt: '2026-06-16T17:00:00'
  }
];

export const INITIAL_USER_PROFILE: UserProfile = {
  name: 'João Silva',
  email: 'manoel.neto.arq@gmail.com',
  avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDbV5tOY30U-u-YyaMBbsUeF_vN4p331pN0XTrZpSsuFjYpkBMrNuM7HRSPFMm6eRc009OhBwpnbQNVO1k31OukKQkTSGTKPvMGWIxRNBG1kldZztOkpyjupFpAwGTuQTTBFa1MGAA4W6U8oRFQWbXs_nqVZDT01JFqHZwBMSc44HfJ_WgoVM_qABvKF4GBxiSb3BkQwEH6HaMYjhDqu208k-zMOUeiCOcJ5Q-UgT-ETvDJIDquG-aEW_FyD15Zt32WH56l_KonuG8',
  role: 'Membro da Família',
  totalBets: 42,
  totalPoints: 185
};

export const MOCK_RANKING = [
  { id: 'r1', name: 'Tio João', email: 'tio.joao@exemplo.com', points: 15, predictionsCount: 3, isTop1: true },
  { id: 'r2', name: 'Prima Ana', email: 'prima.ana@exemplo.com', points: 12, predictionsCount: 4 },
  { id: 'r3', name: 'Vovô Carlos', email: 'vovo.carlos@exemplo.com', points: 8, predictionsCount: 2 },
  { id: 'r4', name: 'Mãe', email: 'mae@exemplo.com', points: 5, predictionsCount: 3 },
  { id: 'r5', name: 'Eu', email: 'manoel.neto.arq@gmail.com', points: 2, predictionsCount: 5 }
];
