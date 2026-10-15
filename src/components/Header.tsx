import React from 'react';
import { ShieldCheck, Volume2, Eye, PictureInPicture, Zap } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  isAntiSleepActive: boolean;
  isWakeLockActive: boolean;
  isPiPActive: boolean;
  onOpenOledMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isAntiSleepActive,
  isWakeLockActive,
  isPiPActive,
  onOpenOledMode,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-rose-700 shadow-md shadow-red-500/20">
            {/* Pokeball Icon */}
            <div className="w-6 h-6 rounded-full border-2 border-slate-900 bg-white relative overflow-hidden flex flex-col">
              <div className="h-1/2 bg-red-600 w-full" />
              <div className="h-1/2 bg-white w-full" />
              <div className="absolute inset-0 m-auto w-2 h-2 rounded-full bg-white border border-slate-900 flex items-center justify-center">
                <span className="w-1 h-1 rounded-full bg-sky-500 animate-ping" />
              </div>
            </div>
            {isAntiSleepActive && (
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-slate-950 animate-pulse" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                <span>PokeIdle</span>
                <span className="text-xs px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 font-semibold border border-red-500/30">
                  Android Runner
                </span>
              </h1>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Mantenha o jogo rodando mesmo minimizado em segundo plano
            </p>
          </div>
        </div>

        {/* Status Indicators & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick status pills (Desktop/Tablet) */}
          <div className="hidden md:flex items-center gap-2 text-xs">
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition ${
                isAntiSleepActive
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-medium'
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
              title="Anti-Sleep Audio Keep-Alive"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Anti-Sleep: {isAntiSleepActive ? 'ON' : 'OFF'}</span>
            </div>

            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition ${
                isWakeLockActive
                  ? 'bg-sky-500/10 border-sky-500/30 text-sky-400 font-medium'
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
              title="Screen WakeLock"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>WakeLock: {isWakeLockActive ? 'ON' : 'OFF'}</span>
            </div>

            {isPiPActive && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-400 font-medium animate-pulse">
                <PictureInPicture className="w-3.5 h-3.5" />
                <span>PiP Ativo</span>
              </div>
            )}
          </div>

          {/* Quick OLED Button */}
          <button
            onClick={onOpenOledMode}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-medium text-slate-300 transition active:scale-95 cursor-pointer"
            title="Tela preta com economia extrema de bateria"
          >
            <Eye className="w-3.5 h-3.5 text-amber-400" />
            <span>Modo OLED</span>
          </button>

          {/* PWA Install Button */}
          <PWAInstallButton />
        </div>
      </div>
    </header>
  );
};
