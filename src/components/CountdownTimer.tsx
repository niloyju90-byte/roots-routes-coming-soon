import React, { useState, useEffect } from 'react';

interface CountdownTimerProps {
  targetDate: string;
  lang?: 'bn' | 'en';
  theme?: 'dark' | 'light';
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  targetDate,
  lang = 'bn',
  theme = 'dark',
}) => {
  const calculateTime = (): TimeRemaining => {
    const target = new Date(targetDate).getTime();
    const now = Date.now();
    const diff = Math.max(0, target - now);

    if (diff <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
    }

    const seconds = Math.floor((diff / 1000) % 60);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    return { days, hours, minutes, seconds, isExpired: false };
  };

  const [time, setTime] = useState<TimeRemaining>(calculateTime);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(calculateTime());
    }, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  // Bengali number converter helper
  const formatNumber = (num: number): string => {
    const padded = String(num).padStart(2, '0');
    if (lang === 'bn') {
      const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
      return padded
        .split('')
        .map((d) => bnDigits[parseInt(d, 10)] ?? d)
        .join('');
    }
    return padded;
  };

  const labels = {
    launchingIn: lang === 'bn' ? 'কার্যক্রম উদ্বোধন হতে বাকি' : 'Launching In',
    days: lang === 'bn' ? 'দিন' : 'Days',
    hours: lang === 'bn' ? 'ঘণ্টা' : 'Hours',
    minutes: lang === 'bn' ? 'মিনিট' : 'Minutes',
    seconds: lang === 'bn' ? 'সেকেন্ড' : 'Seconds',
  };

  const units = [
    { value: time.days, label: labels.days },
    { value: time.hours, label: labels.hours },
    { value: time.minutes, label: labels.minutes },
    { value: time.seconds, label: labels.seconds },
  ];

  const cardBgClass =
    theme === 'dark'
      ? 'bg-stone-900/70 border-white/10 text-white shadow-2xl backdrop-blur-md'
      : 'bg-white/85 border-stone-200/90 text-stone-900 shadow-xl backdrop-blur-md';

  const labelColorClass =
    theme === 'dark' ? 'text-stone-400' : 'text-stone-600 font-medium';

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span className="inline-block w-2 h-2 rounded-full bg-rose-500 animate-ping" />
        <span
          className={`text-xs font-semibold tracking-wider uppercase ${
            theme === 'dark' ? 'text-stone-300' : 'text-stone-700'
          }`}
        >
          {labels.launchingIn}
        </span>
      </div>

      <div className="grid grid-cols-4 gap-2 sm:gap-3">
        {units.map((unit, idx) => (
          <div
            key={idx}
            className={`flex flex-col items-center justify-center p-2.5 sm:p-3.5 rounded-xl border transition-all duration-300 min-w-[62px] sm:min-w-[78px] ${cardBgClass}`}
          >
            <span className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#c93d51] tabular-nums">
              {formatNumber(unit.value)}
            </span>
            <span
              className={`text-[10px] sm:text-xs tracking-wider uppercase mt-1 ${labelColorClass}`}
            >
              {unit.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
