import React, { useState, useEffect } from 'react';
import {
  Volume2,
  VolumeX,
  Zap,
  ZapOff,
  PictureInPicture,
  Eye,
  Smartphone,
  Download,
  Flame,
  Settings2,
  HelpCircle,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Play,
  RotateCcw,
  Sparkles,
  Info,
} from 'lucide-react';
import { Header } from './components/Header';
import { BackgroundControlCenter } from './components/BackgroundControlCenter';
import { GameLauncher } from './components/GameLauncher';
import { AndroidProjectSection } from './components/AndroidProjectSection';
import { AndroidOptimizationGuide } from './components/AndroidOptimizationGuide';
import { PokeIdleCompanionTools } from './components/PokeIdleCompanionTools';
import { OledSaver } from './components/OledSaver';
import { audioKeepAlive } from './services/audioKeepAlive';
import { wakeLockService } from './services/wakeLockService';
import { pipEngine } from './services/pipEngine';
import { workerTimer } from './services/workerTimer';

export default function App() {
  const [activeTab, setActiveTab] = useState<'launcher' | 'apk' | 'guide' | 'tools'>('launcher');
  const [isAntiSleepActive, setIsAntiSleepActive] = useState(false);
  const [isWakeLockActive, setIsWakeLockActive] = useState(false);
  const [isPiPActive, setIsPiPActive] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isOledOpen, setIsOledOpen] = useState(false);

  // Subscribe to background services
  useEffect(() => {
    const unsubAudio = audioKeepAlive.subscribe((active) => {
      setIsAntiSleepActive(active);
    });

    const unsubWake = wakeLockService.subscribe((active) => {
      setIsWakeLockActive(active);
    });

    const unsubPip = pipEngine.subscribe((inPip) => {
      setIsPiPActive(inPip);
    });

    // Start worker timer for live background tick tracking
    workerTimer.start();
    const unsubWorker = workerTimer.onTick((ticks) => {
      setElapsedSeconds(ticks);
      pipEngine.updateStats({
        elapsedSeconds: ticks,
        antiSleepActive: audioKeepAlive.getStatus(),
        wakeLockActive: wakeLockService.isActive(),
      });
    });

    return () => {
      unsubAudio();
      unsubWake();
      unsubPip();
      unsubWorker();
    };
  }, []);

  const handleToggleAntiSleep = async () => {
    if (isAntiSleepActive) {
      audioKeepAlive.stop();
    } else {
      await audioKeepAlive.start();
    }
  };

  const handleToggleWakeLock = async () => {
    if (isWakeLockActive) {
      await wakeLockService.release();
    } else {
      await wakeLockService.acquire();
    }
  };

  const handleTogglePiP = async () => {
    if (isPiPActive) {
      await pipEngine.stopPiP();
    } else {
      await pipEngine.startPiP();
    }
  };

  const handleActivateAllKeepAlive = async () => {
    if (!isAntiSleepActive) {
      await audioKeepAlive.start();
    }
    if (!isWakeLockActive) {
      await wakeLockService.acquire();
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-red-500 selection:text-white">
      {/* Header */}
      <Header
        isAntiSleepActive={isAntiSleepActive}
        isWakeLockActive={isWakeLockActive}
        isPiPActive={isPiPActive}
        onOpenOledMode={() => setIsOledOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-slate-800">
          <button
            onClick={() => setActiveTab('launcher')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'launcher'
                ? 'bg-red-600 text-white shadow-lg shadow-red-600/20'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Flame className="w-4 h-4" />
            <span>Anti-Pausa & Iniciar Jogo</span>
          </button>

          <button
            onClick={() => setActiveTab('apk')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'apk'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>Gerador de APK Android (.ZIP)</span>
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'guide'
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/20'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Configurar Celular (Xiaomi / Samsung)</span>
          </button>

          <button
            onClick={() => setActiveTab('tools')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'tools'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Alarmes & Ovos</span>
          </button>
        </div>

        {/* Tab 1: Launcher & Anti-Sleep Center */}
        {activeTab === 'launcher' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Background Control Center */}
            <BackgroundControlCenter
              isAntiSleepActive={isAntiSleepActive}
              isWakeLockActive={isWakeLockActive}
              isPiPActive={isPiPActive}
              elapsedSeconds={elapsedSeconds}
              onToggleAntiSleep={handleToggleAntiSleep}
              onToggleWakeLock={handleToggleWakeLock}
              onTogglePiP={handleTogglePiP}
              onOpenOledMode={() => setIsOledOpen(true)}
            />

            {/* Direct Official Link & Background Test Bench */}
            <GameLauncher
              isAntiSleepActive={isAntiSleepActive}
              onActivateKeepAlive={handleActivateAllKeepAlive}
            />
          </div>
        )}

        {/* Tab 2: Android Project & APK Source */}
        {activeTab === 'apk' && (
          <div className="animate-in fade-in duration-150">
            <AndroidProjectSection />
          </div>
        )}

        {/* Tab 3: Phone Optimization Guide */}
        {activeTab === 'guide' && (
          <div className="animate-in fade-in duration-150">
            <AndroidOptimizationGuide />
          </div>
        )}

        {/* Tab 4: Companion Tools */}
        {activeTab === 'tools' && (
          <div className="animate-in fade-in duration-150">
            <PokeIdleCompanionTools />
          </div>
        )}
      </main>

      {/* OLED Battery Saver Overlay Modal */}
      <OledSaver
        isOpen={isOledOpen}
        onClose={() => setIsOledOpen(false)}
        elapsedSeconds={elapsedSeconds}
        isAntiSleepActive={isAntiSleepActive}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>
            PokeIdle Android Background Runner — Desenvolvido para manter{' '}
            <a
              href="https://pokeidle.io/app"
              target="_blank"
              rel="noreferrer"
              className="text-red-400 hover:underline"
            >
              pokeidle.io
            </a>{' '}
            ativo 24/7 sem pausar.
          </p>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              PWA & APK Suportados
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
