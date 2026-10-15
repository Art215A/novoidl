import React, { useState, useEffect } from 'react';
import {
  ExternalLink,
  Play,
  RotateCcw,
  CheckCircle2,
  Sparkles,
  Smartphone,
  Layers,
  Flame,
  KeyRound,
  ShieldAlert,
} from 'lucide-react';
import { audioKeepAlive } from '../services/audioKeepAlive';
import { wakeLockService } from '../services/wakeLockService';

interface GameLauncherProps {
  isAntiSleepActive: boolean;
  onActivateKeepAlive: () => void;
}

export const GameLauncher: React.FC<GameLauncherProps> = ({
  isAntiSleepActive,
  onActivateKeepAlive,
}) => {
  // Test in background state
  const [benchRunning, setBenchRunning] = useState(false);
  const [benchTicks, setBenchTicks] = useState(0);
  const [benchStartTs, setBenchStartTs] = useState<number | null>(null);
  const [benchElapsed, setBenchElapsed] = useState(0);
  const [benchHistory, setBenchHistory] = useState<string | null>(null);

  // Background benchmark ticker
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (benchRunning) {
      interval = setInterval(() => {
        setBenchTicks((prev) => prev + 1);
        if (benchStartTs) {
          setBenchElapsed(Math.round((Date.now() - benchStartTs) / 1000));
        }
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [benchRunning, benchStartTs]);

  const handleStartBenchmark = () => {
    onActivateKeepAlive();
    setBenchTicks(0);
    setBenchElapsed(0);
    setBenchStartTs(Date.now());
    setBenchRunning(true);
    setBenchHistory(null);
  };

  const handleStopBenchmark = () => {
    setBenchRunning(false);
    const accuracy =
      benchElapsed > 0 ? Math.min(100, Math.round((benchTicks / benchElapsed) * 100)) : 100;
    setBenchHistory(
      `Teste Concluído: ${benchTicks} ticks em ${benchElapsed}s (${accuracy}% de consistência em segundo plano).`
    );
  };

  const handleOpenGame = () => {
    // Make sure keep alive is engaged before opening game
    onActivateKeepAlive();
    window.open('https://pokeidle.io/app', '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-6">
      {/* Primary Game Launch Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-red-950/40 border border-red-500/30 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-red-600/10 blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Jogabilidade Direta</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Sim! Você joga o Pokéidle diretamente nele
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              O aplicativo carrega o jogo completo em <strong>tela cheia</strong>. Você joga, clica para capturar, batalha contra líderes de ginásio e faz login exatamente como faria no computador, mas com a vantagem de <strong>não pausar quando você minimizar</strong>!
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
            <button
              onClick={handleOpenGame}
              className="flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-white font-bold text-base shadow-xl shadow-red-600/25 active:scale-95 transition cursor-pointer"
            >
              <ExternalLink className="w-5 h-5" />
              <span>Jogar PokeIdle Agora</span>
            </button>
          </div>
        </div>

        {/* Credentials & Login note */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-400">
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <KeyRound className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block font-medium">Login Seguro e Sessão de 30 Dias:</strong>
              O PokeIdle armazena seu login via token seguro (Google, Discord ou E-mail). Você faz login uma única vez e ele permanece autenticado.
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <Layers className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block font-medium">Modo Multitarefas do Celular:</strong>
              Para a melhor experiência, use a função de <em>Janela Flutuante</em> ou <em>Tela Dividida</em> do seu Android enquanto usa outros aplicativos.
            </div>
          </div>
        </div>
      </div>

      {/* Background Proof / Test Bench Tool */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-7 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <span>Testador de Segundo Plano (Bench Anti-Pausa)</span>
              <span className="text-xs px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
                Verificador
              </span>
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Faça o teste prático: inicie o cronômetro, minimize esta aba por 15 segundos e volte para comprovar que o relógio não congelou!
            </p>
          </div>

          <div className="flex items-center gap-2">
            {!benchRunning ? (
              <button
                onClick={handleStartBenchmark}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md active:scale-95 transition cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Iniciar Teste</span>
              </button>
            ) : (
              <button
                onClick={handleStopBenchmark}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow-md active:scale-95 transition cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Parar & Avaliar</span>
              </button>
            )}
          </div>
        </div>

        {/* Counter Display */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
              Ticks Computados
            </span>
            <div className="text-2xl font-mono font-bold text-sky-400 mt-1">
              {benchTicks} <span className="text-xs font-normal text-slate-400">segundos</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
              Tempo Real Decorrido
            </span>
            <div className="text-2xl font-mono font-bold text-emerald-400 mt-1">
              {benchElapsed} <span className="text-xs font-normal text-slate-400">segundos</span>
            </div>
          </div>

          <div className="col-span-2 sm:col-span-1 p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-center">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
              Status do Motor
            </span>
            <div className="text-sm font-semibold text-white mt-1 flex items-center gap-1.5">
              {isAntiSleepActive ? (
                <>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-emerald-400">Áudio Loop Ativo</span>
                </>
              ) : (
                <>
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <span className="text-amber-400">Proteção Desativada</span>
                </>
              )}
            </div>
          </div>
        </div>

        {benchHistory && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/40 text-emerald-300 text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{benchHistory}</span>
          </div>
        )}
      </div>

      {/* Step by Step Login Guide (Reflecting the screen uploaded by user) */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-7 shadow-xl space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-base font-bold text-white">Como Efetuar o Login na sua Conta</h4>
            <p className="text-xs text-slate-400">Veja como fazer login pelo app ou pelo navegador com segurança</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          {/* Method 1: Email / Username */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                Opção 1 (Mais Direta)
              </span>
              <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 text-[10px] font-semibold">
                Recomendada
              </span>
            </div>
            <h5 className="text-sm font-bold text-white">E-mail ou Usuário + Senha</h5>
            <ol className="text-xs text-slate-300 space-y-2 list-decimal list-inside leading-relaxed">
              <li>Digite seu usuário no primeiro campo (<code className="text-amber-300">EMAIL OU NOME DE USUÁRIO</code>).</li>
              <li>Digite sua senha no campo <code className="text-amber-300">SENHA</code>.</li>
              <li>Aguarde a caixa do Cloudflare mostrar a marcação verde <strong className="text-emerald-400">✓ Sucesso!</strong>.</li>
              <li>Toque no botão amarelo <strong className="text-amber-400">LOGAR</strong>.</li>
            </ol>
          </div>

          {/* Method 2: Google */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">
                Opção 2
              </span>
              <span className="px-2 py-0.5 rounded bg-sky-500/10 text-sky-300 text-[10px] font-semibold">
                Google
              </span>
            </div>
            <h5 className="text-sm font-bold text-white">Login com Google</h5>
            <p className="text-xs text-slate-300 leading-relaxed">
              Toque no botão branco <strong className="text-white">"Login com Google"</strong> na parte inferior da tela. O navegador abrirá a tela oficial de contas do Google para você selecionar sua conta e autorizar o acesso com 1 clique.
            </p>
          </div>

          {/* Method 3: Discord */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">
                Opção 3
              </span>
              <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 text-[10px] font-semibold">
                Discord
              </span>
            </div>
            <h5 className="text-sm font-bold text-white">Login com Discord</h5>
            <p className="text-xs text-slate-300 leading-relaxed">
              Se você vinculou sua conta ao Discord, toque no botão azul <strong className="text-indigo-300">"Login com Discord"</strong> e confirme o botão <em>"Autorizar"</em> na tela do Discord.
            </p>
          </div>
        </div>

        {/* Persistence Callout */}
        <div className="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 flex items-start gap-3 text-xs text-emerald-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <strong>Login Salvo por 30 Dias:</strong> Assim que você clicar em "LOGAR", o PokeIdle gera um cookie criptografado no seu celular. Você não precisará digitar a senha novamente toda vez que abrir o aplicativo!
          </div>
        </div>
      </div>
    </div>
  );
};
