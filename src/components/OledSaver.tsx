import React, { useState, useEffect } from 'react';
import { EyeOff, Lock, Unlock, Moon, Zap, ShieldCheck } from 'lucide-react';

interface OledSaverProps {
  isOpen: boolean;
  onClose: () => void;
  elapsedSeconds: number;
  isAntiSleepActive: boolean;
}

export const OledSaver: React.FC<OledSaverProps> = ({
  isOpen,
  onClose,
  elapsedSeconds,
  isAntiSleepActive,
}) => {
  const [unlockProgress, setUnlockProgress] = useState(0);
  const [time, setTime] = useState('');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!isOpen) return null;

  // Format elapsed seconds
  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    setUnlockProgress(val);
    if (val >= 90) {
      onClose();
      setUnlockProgress(0);
    }
  };

  const handleSliderRelease = () => {
    if (unlockProgress < 90) {
      setUnlockProgress(0);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-between bg-black text-slate-400 p-6 select-none touch-none">
      {/* Subtle top indicator */}
      <div className="flex items-center justify-between opacity-30 hover:opacity-100 transition-opacity">
        <div className="flex items-center gap-2 text-xs">
          <Moon className="w-4 h-4 text-slate-500" />
          <span>Modo OLED (Pixels desligados)</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-emerald-500 font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>PokeIdle Ativo</span>
        </div>
      </div>

      {/* Center Subtle Clock & Runtime */}
      <div className="flex flex-col items-center justify-center space-y-4 my-auto opacity-40 hover:opacity-100 transition-opacity">
        <div className="text-5xl sm:text-7xl font-mono font-bold tracking-widest text-slate-200">
          {time}
        </div>
        <div className="text-center space-y-1">
          <p className="text-xs uppercase tracking-widest text-slate-500">
            Tempo de Farm Contínuo
          </p>
          <p className="text-xl font-mono font-semibold text-red-500">
            {formatTime(elapsedSeconds)}
          </p>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-900 text-[11px] text-slate-500 text-center max-w-xs">
          A tela está preta para economizar 90%+ de bateria. Toques acidentais estão bloqueados.
        </div>
      </div>

      {/* Bottom Slider to Unlock (Pocket Lock) */}
      <div className="max-w-md w-full mx-auto space-y-3 opacity-60 hover:opacity-100 transition-opacity">
        <div className="relative flex items-center justify-center p-2 rounded-2xl bg-zinc-950 border border-zinc-800">
          <input
            type="range"
            min="0"
            max="100"
            value={unlockProgress}
            onChange={handleSliderChange}
            onTouchEnd={handleSliderRelease}
            onMouseUp={handleSliderRelease}
            className="w-full h-10 opacity-0 absolute z-20 cursor-pointer"
          />
          <div
            className="absolute left-2 top-2 bottom-2 bg-red-600/30 rounded-xl transition-all"
            style={{ width: `${Math.max(10, unlockProgress)}%` }}
          />
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 z-10 pointer-events-none">
            {unlockProgress > 60 ? (
              <Unlock className="w-4 h-4 text-emerald-400" />
            ) : (
              <Lock className="w-4 h-4 text-red-400" />
            )}
            <span>Deslize para desbloquear tela ({unlockProgress}%)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
