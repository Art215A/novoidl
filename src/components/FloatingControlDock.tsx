import React, { useState } from 'react';
import {
  Volume2,
  VolumeX,
  Zap,
  ZapOff,
  PictureInPicture,
  Eye,
  ChevronUp,
  ChevronDown,
  Flame,
  CheckCircle2,
  Play,
  RotateCcw,
} from 'lucide-react';
import { audioKeepAlive } from '../services/audioKeepAlive';
import { wakeLockService } from '../services/wakeLockService';
import { pipEngine } from '../services/pipEngine';

interface FloatingControlDockProps {
  isAntiSleepActive: boolean;
  isWakeLockActive: boolean;
  isPiPActive: boolean;
  elapsedSeconds: number;
  onToggleAntiSleep: () => void;
  onToggleWakeLock: () => void;
  onTogglePiP: () => void;
  onOpenOledMode: () => void;
}

export const FloatingControlDock: React.FC<FloatingControlDockProps> = ({
  isAntiSleepActive,
  isWakeLockActive,
  isPiPActive,
  elapsedSeconds,
  onToggleAntiSleep,
  onToggleWakeLock,
  onTogglePiP,
  onOpenOledMode,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatTime = (secs: number) => {
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <aside
      aria-label="Controles Flutuantes PokeIdle"
      className="fixed top-2 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-lg transition-all duration-300"
    >
      <div className="rounded-2xl bg-slate-900/95 backdrop-blur-md border border-red-500/30 shadow-2xl shadow-black/80 overflow-hidden">
        {/* Compact Header Bar (Always Visible) */}
        <div className="px-3 py-2 flex items-center justify-between gap-2">
          {/* Brand & Status Pill */}
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-red-600 border border-white/40 flex items-center justify-center shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-white tracking-tight">PokeIdle</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-sky-400 font-semibold">
                {formatTime(elapsedSeconds)}
              </span>
            </div>
          </div>

          {/* Quick inline status badges */}
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={onToggleAntiSleep}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                isAntiSleepActive
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}
              title="Áudio Anti-Suspensão"
            >
              {isAntiSleepActive ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3" />}
              <span>{isAntiSleepActive ? 'ÁUDIO ON' : 'ÁUDIO OFF'}</span>
            </button>

            <button
              onClick={onToggleWakeLock}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                isWakeLockActive
                  ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40'
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}
              title="Bloqueio de Tela"
            >
              {isWakeLockActive ? <Zap className="w-3 h-3" /> : <ZapOff className="w-3 h-3" />}
              <span className="hidden sm:inline">{isWakeLockActive ? 'WAKELOCK' : 'SLEEP'}</span>
            </button>

            <button
              onClick={onOpenOledMode}
              className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 transition cursor-pointer"
              title="Modo Tela Preta OLED"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>

            {/* Expand / Collapse Button */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer ml-1"
              title={isExpanded ? 'Recolher Barra' : 'Expandir Opções'}
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Expanded Drawer (Shows the exact 4 cards when user opens) */}
        {isExpanded && (
          <div className="px-3.5 pb-3.5 pt-2 border-t border-slate-800/80 space-y-2.5 animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="grid grid-cols-2 gap-2 text-xs">
              {/* Audio Card */}
              <div
                className={`p-2.5 rounded-xl border flex flex-col justify-between ${
                  isAntiSleepActive
                    ? 'bg-emerald-950/40 border-emerald-500/40'
                    : 'bg-slate-950/70 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-[11px] flex items-center gap-1">
                    <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                    Áudio Anti-Sono
                  </span>
                  <button
                    onClick={onToggleAntiSleep}
                    className={`h-4 w-8 rounded-full transition-colors relative cursor-pointer ${
                      isAntiSleepActive ? 'bg-emerald-500' : 'bg-slate-700'
                    }`}
                  >
                    <span
                      className={`block w-3 h-3 rounded-full bg-white transition-transform ${
                        isAntiSleepActive ? 'translate-x-4' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>
                <button
                  onClick={() => audioKeepAlive.playTestSound()}
                  className="mt-2 text-[10px] text-emerald-300 hover:text-emerald-200 bg-emerald-500/10 py-0.5 px-1.5 rounded text-center cursor-pointer"
                >
                  🔊 Testar Som (Bip)
                </button>
              </div>

              {/* WakeLock Card */}
              <div
                className={`p-2.5 rounded-xl border flex flex-col justify-between ${
                  isWakeLockActive
                    ? 'bg-sky-950/40 border-sky-500/40'
                    : 'bg-slate-950/70 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-[11px] flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-sky-400" />
                    WakeLock Tela
                  </span>
                  <button
                    onClick={onToggleWakeLock}
                    className={`h-4 w-8 rounded-full transition-colors relative cursor-pointer ${
                      isWakeLockActive ? 'bg-sky-500' : 'bg-slate-700'
                    }`}
                  >
                    <span
                      className={`block w-3 h-3 rounded-full bg-white transition-transform ${
                        isWakeLockActive ? 'translate-x-4' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>
                <span className="text-[10px] text-slate-400 mt-2">
                  {isWakeLockActive ? '✓ Tela não apaga' : 'Normal'}
                </span>
              </div>

              {/* PiP Card */}
              <div
                className={`p-2.5 rounded-xl border flex flex-col justify-between ${
                  isPiPActive
                    ? 'bg-purple-950/40 border-purple-500/40'
                    : 'bg-slate-950/70 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-[11px] flex items-center gap-1">
                    <PictureInPicture className="w-3.5 h-3.5 text-purple-400" />
                    Janela PiP
                  </span>
                  <button
                    onClick={onTogglePiP}
                    className={`h-4 w-8 rounded-full transition-colors relative cursor-pointer ${
                      isPiPActive ? 'bg-purple-500' : 'bg-slate-700'
                    }`}
                  >
                    <span
                      className={`block w-3 h-3 rounded-full bg-white transition-transform ${
                        isPiPActive ? 'translate-x-4' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>
                <span className="text-[10px] text-slate-400 mt-2">
                  {isPiPActive ? '✓ Miniatura Ativa' : 'Sobre outros apps'}
                </span>
              </div>

              {/* OLED Card */}
              <div className="p-2.5 rounded-xl border border-slate-800 bg-slate-950/70 flex flex-col justify-between">
                <span className="font-bold text-white text-[11px] flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5 text-amber-400" />
                  Modo OLED
                </span>
                <button
                  onClick={onOpenOledMode}
                  className="mt-2 text-[10px] font-bold text-amber-300 bg-amber-500/20 hover:bg-amber-500/30 py-1 rounded text-center cursor-pointer border border-amber-500/30"
                >
                  Ativar Tela Preta
                </button>
              </div>
            </div>

            <div className="text-[10px] text-slate-400 text-center pt-1 border-t border-slate-800/60">
              Esta barra fica fixa no topo para você não perder o controle enquanto joga.
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
