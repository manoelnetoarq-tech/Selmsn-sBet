import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface CountdownTimerProps {
  dateStr: string;
  status: string;
}

export default function CountdownTimer({ dateStr, status }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number; isExpired: boolean } | null>(null);

  useEffect(() => {
    if (status !== 'Aberto') return;

    const parseDateStr = (dateStr: string) => {
      try {
        const [datePart, timePart] = dateStr.split(' às ');
        const [day, month, year] = datePart.split('/');
        const [hour, minute] = timePart.split(':');
        // Subtract 15 minutes for the betting deadline
        const matchTime = new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute)).getTime();
        return matchTime - (15 * 60 * 1000); 
      } catch (e) {
        return 0;
      }
    };

    const deadline = parseDateStr(dateStr);
    if (!deadline) return;

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const difference = deadline - now;

      if (difference <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0, isExpired: true });
      } else {
        const hours = Math.floor((difference / (1000 * 60 * 60)));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        setTimeLeft({ hours, minutes, seconds, isExpired: false });
      }
    };

    calculateTimeLeft(); // initial call
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [dateStr, status]);

  if (status !== 'Aberto' || !timeLeft) return null;

  if (timeLeft.isExpired) {
    return (
      <div className="w-full bg-[#ffebee] text-[#c62828] font-sans text-xs font-bold py-1.5 px-3 rounded-md flex items-center justify-center gap-1.5 border border-[#c62828]/20 mt-1">
        <Clock className="w-3.5 h-3.5" />
        Palpites Encerrados
      </div>
    );
  }

  // Show "Xh Ym Zs" or "Ym Zs"
  return (
    <div className="w-full bg-[#f2f4f6] text-[#3e4a3d] font-sans text-[11px] font-bold py-1.5 px-3 rounded-md flex items-center justify-between border border-[#eceef0] mt-1 shadow-inner">
      <div className="flex items-center gap-1.5 text-[#006b2c]">
        <Clock className="w-3.5 h-3.5" />
        <span>Encerra em:</span>
      </div>
      <div className="flex items-center gap-1">
        {timeLeft.hours > 0 && <span className="bg-white px-1.5 py-0.5 rounded shadow-sm border border-[#e0e3e5]">{String(timeLeft.hours).padStart(2, '0')}h</span>}
        <span className="bg-white px-1.5 py-0.5 rounded shadow-sm border border-[#e0e3e5]">{String(timeLeft.minutes).padStart(2, '0')}m</span>
        <span className="bg-white px-1.5 py-0.5 rounded shadow-sm border border-[#e0e3e5] text-[#006b2c]">{String(timeLeft.seconds).padStart(2, '0')}s</span>
      </div>
    </div>
  );
}
