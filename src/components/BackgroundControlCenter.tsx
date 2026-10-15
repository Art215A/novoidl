import React, { useState } from 'react';
import {
  Volume2,
  VolumeX,
  Zap,
  ZapOff,
  PictureInPicture,
  Eye,
  Info,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Play,
  Pause,
  ExternalLink,
  Smartphone,
  Shield,
  Flame,
} from 'lucide-react';
import { audioKeepAlive } from '../services/audioKeepAlive';
import { wakeLockService } from '../services/wakeLockService';
import { pipEngine } from '../services/pipEngine';

interface BackgroundControlCenterProps {
  isAntiSleepActive: boolean;
  isWakeLockActive: boolean;
  isPiPActive: boolean;
  elapsedSeconds: number;
  onToggleAntiSleep: () => void;
  onToggleWakeLock: () => void;
  onTogglePiP: () => void;
  onOpenOledMode: () => void;
}

export const BackgroundControlCenter: React.FC<BackgroundControlCenterProps> = ({
  isAntiSleepActive,
  isWakeLockActive,
  isPiPActive,
  elapsedSeconds,
  onToggleAntiSleep,
  onToggleWakeLock,
  onTogglePiP,
  onOpenOledMode,
}) => {
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  // Format elapsed time (hh:mm:ss)
  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <section className="rounded-3xl bg-slate-900/90 border border-slate-800 p-5 sm:p-7 shadow-xl">
      {/* Top Banner with Background Status */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold mb-2">
            <Flame className="w-3.5 h-3.5 text-red-400" />
            <span>Motor de Execução Contínua em 2º Plano</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Painel Anti-Suspensão Android
          </h2>
          <p className="text-sm text-slate-400 mt-1 max-w-xl">
            Configure as defesas que impedem o Android de congelar o PokeIdle quando você trocar de aplicativo ou desligar a tela.
          </p>
        </div>

        {/* Live Timer Counter */}
        <div className="flex items-center gap-4 bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 sm:px-5">
          <div className="relative flex items-center justify-center">
            <span
              className={`w-3.5 h-3.5 rounded-full ${
                isAntiSleepActive ? 'bg-emerald-400 animate-ping' : 'bg-amber-500'
              }`}
            />
            <span
              className={`absolute w-3.5 h-3.5 rounded-full ${
                isAntiSleepActive ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
            />
          </div>
          <div>
            <div className="text-[10px] font-semibold tracking-wider uppercase text-slate-400">
              Tempo em Execução
            </div>
            <div className="text-xl sm:text-2xl font-mono font-bold text-white tracking-wider">
              {formatTime(elapsedSeconds)}
            </div>
          </div>
        </div>
      </div>

      {/* Control Toggles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {/* 1. Audio Keep-Alive */}
        <div
          className={`relative rounded-2xl border p-4 transition-all duration-200 ${
            isAntiSleepActive
              ? 'bg-emerald-950/20 border-emerald-500/40 shadow-lg shadow-emerald-950/20'
              : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div
              className={`p-2.5 rounded-xl ${
                isAntiSleepActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {isAntiSleepActive ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </div>
            <button
              onClick={onToggleAntiSleep}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                isAntiSleepActive ? 'bg-emerald-500' : 'bg-slate-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isAntiSleepActive ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
            <span>Áudio Anti-Suspensão</span>
            {isAntiSleepActive && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Loop inaudível com MediaSession. O Android trata como player de música ativo para não congelar o processamento.
          </p>
          <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between">
            <button
              onClick={() => audioKeepAlive.playTestSound()}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold transition cursor-pointer"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Testar Som (Bip)</span>
            </button>
            <span className="text-[10px] text-slate-500">
              {isAntiSleepActive ? '✓ Ativo no Android' : 'Desligado'}
            </span>
          </div>
        </div>

        {/* 2. WakeLock */}
        <div
          className={`relative rounded-2xl border p-4 transition-all duration-200 ${
            isWakeLockActive
              ? 'bg-sky-950/20 border-sky-500/40 shadow-lg shadow-sky-950/20'
              : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div
              className={`p-2.5 rounded-xl ${
                isWakeLockActive ? 'bg-sky-500/20 text-sky-400' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {isWakeLockActive ? <Zap className="w-5 h-5" /> : <ZapOff className="w-5 h-5" />}
            </div>
            <button
              onClick={onToggleWakeLock}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                isWakeLockActive ? 'bg-sky-500' : 'bg-slate-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isWakeLockActive ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
            <span>Bloqueio de Tela (WakeLock)</span>
            {isWakeLockActive && <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Impede a tela de apagar ou diminuir brilho enquanto o jogo estiver farmando ativamente.
          </p>
        </div>

        {/* 3. PiP Floating Window */}
        <div
          className={`relative rounded-2xl border p-4 transition-all duration-200 ${
            isPiPActive
              ? 'bg-purple-950/20 border-purple-500/40 shadow-lg shadow-purple-950/20'
              : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div
              className={`p-2.5 rounded-xl ${
                isPiPActive ? 'bg-purple-500/20 text-purple-400' : 'bg-slate-800 text-slate-400'
              }`}
            >
              <PictureInPicture className="w-5 h-5" />
            </div>
            <button
              onClick={onTogglePiP}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                isPiPActive ? 'bg-purple-500' : 'bg-slate-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isPiPActive ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
            <span>Janela Flutuante (PiP)</span>
            {isPiPActive && <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Cria uma miniatura flutuante sobre outros apps (WhatsApp, YouTube) impedindo o encerramento do processo.
          </p>
        </div>

        {/* 4. OLED Battery Saver Mode */}
        <div className="relative rounded-2xl border border-slate-800 bg-slate-950/60 p-4 hover:border-slate-700 transition">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400">
              <Eye className="w-5 h-5" />
            </div>
            <button
              onClick={onOpenOledMode}
              className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-semibold border border-amber-500/30 transition cursor-pointer"
            >
              Ativar
            </button>
          </div>
          <h3 className="text-sm font-bold text-white">Modo Tela Preta OLED</h3>
          <p className="text-xs text-slate-400 mt-1">
            Tela 100% preta com bloqueio de toque de bolso. Desliga os pixels OLED economizando quase 90% de bateria.
          </p>
        </div>
      </div>

      {/* Anti-AFK Server Heartbeat Explainer Banner */}
      <div className="mt-6 p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-3">
        <div className="flex items-center gap-2 text-amber-400 font-bold text-xs sm:text-sm">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
          <span>Por que o jogo parou de farmar depois de alguns minutos minimizado?</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          O servidor oficial do Pokéidle possui um <strong>vigia de inatividade (Heartbeat)</strong>: se o seu celular ficar <strong>~60 segundos</strong> sem enviar dados de batalha ou ping pela rede, o servidor assume que você desconectou e <strong>pausa o farm</strong>.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
            <span className="font-bold text-emerald-400 block">Opção 1: Modo Tela Apagada (OLED)</span>
            <p className="text-slate-400">
              Toque em <strong>"Ativar Modo OLED"</strong> no topo. A tela fica preta com gasto quase zero de bateria, mas o jogo roda em 1º plano a 60 FPS sem parar de farmar!
            </p>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
            <span className="font-bold text-purple-400 block">Opção 2: Janela Suspensa / Dividida</span>
            <p className="text-slate-400">
              No Android, deixe o jogo em <strong>Janela Flutuante</strong> ou <strong>Tela Dividida</strong>. Como continua visível na tela, o Android nunca corta a rede.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
            <span className="font-bold text-sky-400 block">Opção 3: Nosso APK com Pulso de 15s</span>
            <p className="text-slate-400">
              O projeto do APK possui um <strong>temporizador nativo de 15 segundos</strong> que envia o pulso de rede e simula presença para o servidor não desconectar.
            </p>
          </div>
        </div>
      </div>

      {/* Why Android closes background games explainer */}
      <div className="mt-4 pt-4 border-t border-slate-800/80">
        <button
          onClick={() => setShowHowItWorks(!showHowItWorks)}
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition cursor-pointer"
        >
          <Info className="w-4 h-4 text-red-400" />
          <span>Detalhes técnicos: Doze Mode e cortes de conexão do Android</span>
          <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
            {showHowItWorks ? 'Ocultar' : 'Entender'}
          </span>
        </button>

        {showHowItWorks && (
          <div className="mt-3 p-4 rounded-2xl bg-slate-950/90 border border-slate-800 text-xs text-slate-300 space-y-2 animate-in fade-in duration-200">
            <p>
              O sistema operacional <strong>Android</strong> possui mecanismos rígidos de economia de bateria (como <em>Doze Mode</em> e <em>Low Memory Killer</em>). Quando uma aba do navegador ou aplicativo é minimizado, o Android desacelera os timers de JavaScript (<code>setInterval</code>) para no máximo 1 execução por minuto ou congela a página totalmente.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-slate-400">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-white font-semibold block mb-1">1. Áudio Inaudível</span>
                O Android prioriza apps de áudio (Spotify, etc.). Ao manter uma faixa inaudível com MediaSession, a CPU não dorme.
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-white font-semibold block mb-1">2. Janela Flutuante PiP</span>
                Vídeo flutuante mantém o contexto em primeiro plano visual enquanto você conversa no WhatsApp.
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-white font-semibold block mb-1">3. Aplicativo Nativo (APK)</span>
                Nosso projeto de APK substitui o WebView padrão e impede o <code>webView.onPause()</code> através de Foreground Service.
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
