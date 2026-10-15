import React, { useState } from 'react';
import {
  Smartphone,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Maximize2,
  Lock,
  BatteryCharging,
  Sliders,
  Sparkles,
} from 'lucide-react';

export const AndroidOptimizationGuide: React.FC = () => {
  const [activeBrand, setActiveBrand] = useState<'xiaomi' | 'samsung' | 'motorola' | 'split'>('xiaomi');

  return (
    <section className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold mb-1">
            <BatteryCharging className="w-3.5 h-3.5" />
            <span>Guia Vital de Configuração do Android</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Como Impedir o Android de Fechar o Jogo
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Marcas como Xiaomi e Samsung fecham aplicativos em 2º plano para poupar bateria. Siga os passos da sua marca para garantir 100% de estabilidade:
          </p>
        </div>

        {/* Brand tabs */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
          <button
            onClick={() => setActiveBrand('xiaomi')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeBrand === 'xiaomi'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Xiaomi / HyperOS
          </button>
          <button
            onClick={() => setActiveBrand('samsung')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeBrand === 'samsung'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Samsung (One UI)
          </button>
          <button
            onClick={() => setActiveBrand('motorola')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeBrand === 'motorola'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Motorola / Pixel
          </button>
          <button
            onClick={() => setActiveBrand('split')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeBrand === 'split'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Tela Dividida / Pop-up
          </button>
        </div>
      </div>

      {/* Guide Content */}
      <div className="mt-6">
        {activeBrand === 'xiaomi' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <h4 className="text-sm font-bold text-red-400 flex items-center gap-2">
                <Sliders className="w-4 h-4" />
                <span>Passo a Passo para Xiaomi, POCO e Redmi (MIUI / HyperOS):</span>
              </h4>
              <ol className="space-y-2.5 text-xs text-slate-300 list-decimal list-inside leading-relaxed">
                <li>
                  Vá em <strong>Configurações &gt; Apps &gt; Gerenciar Apps</strong> e localize o <strong>Chrome</strong> (ou seu app instalado).
                </li>
                <li>
                  Toque em <strong>Economia de Bateria</strong> e selecione expressamente a opção: <strong className="text-white bg-slate-800 px-2 py-0.5 rounded">Nenhuma Restrição</strong>.
                </li>
                <li>
                  Volte uma tela e ative a chave <strong className="text-white">Início Automático (Autostart)</strong>.
                </li>
                <li>
                  Abra o menu de aplicativos recentes (multitarefa), pressione e segure o card do PokeIdle e toque no <strong className="text-amber-400">ícone de Cadeado 🔒</strong>. Isso impede que a limpeza de memória RAM mate o jogo!
                </li>
              </ol>
            </div>
          </div>
        )}

        {activeBrand === 'samsung' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <h4 className="text-sm font-bold text-blue-400 flex items-center gap-2">
                <Sliders className="w-4 h-4" />
                <span>Passo a Passo para Samsung Galaxy (One UI):</span>
              </h4>
              <ol className="space-y-2.5 text-xs text-slate-300 list-decimal list-inside leading-relaxed">
                <li>
                  Vá em <strong>Configurações &gt; Assistência do aparelho (ou Bateria) &gt; Bateria</strong>.
                </li>
                <li>
                  Toque em <strong>Limites de uso em segundo plano</strong>.
                </li>
                <li>
                  Toque em <strong className="text-white">"Aplicativos que nunca entram em suspensão"</strong>.
                </li>
                <li>
                  Toque no botão <strong>(+)</strong> no canto superior e adicione o <strong>PokeIdle Runner</strong> e o <strong>Chrome</strong>.
                </li>
                <li>
                  Em <em>Configurações do App &gt; Bateria</em>, selecione a opção <strong className="text-white bg-slate-800 px-2 py-0.5 rounded">Irrestrita</strong>.
                </li>
              </ol>
            </div>
          </div>
        )}

        {activeBrand === 'motorola' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <h4 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                <Sliders className="w-4 h-4" />
                <span>Passo a Passo para Motorola, Google Pixel e Android Puro:</span>
              </h4>
              <ol className="space-y-2.5 text-xs text-slate-300 list-decimal list-inside leading-relaxed">
                <li>
                  Pressione e segure o ícone do aplicativo na tela inicial e toque no botão <strong>( i ) Informações do app</strong>.
                </li>
                <li>
                  Role para baixo até encontrar <strong>Bateria</strong> ou <strong>Uso de bateria pelo app</strong>.
                </li>
                <li>
                  Mude a configuração de <em>Otimizado</em> para <strong className="text-white bg-slate-800 px-2 py-0.5 rounded">Irrestrito</strong>.
                </li>
                <li>
                  Com essa permissão, o Android autoriza o aplicativo a manter os sockets de rede e timers de farm ativos ininterruptamente.
                </li>
              </ol>
            </div>
          </div>
        )}

        {activeBrand === 'split' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <h4 className="text-sm font-bold text-purple-400 flex items-center gap-2">
                <Maximize2 className="w-4 h-4" />
                <span>O Truque de Ouro: Tela Dividida ou Janela Suspensa (Floating Window)</span>
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Todo celular Android moderno possui a capacidade de dividir a tela ou abrir apps em janelas suspensas estilo computador:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-purple-400" />
                    1. Tela Dividida (Split Screen)
                  </span>
                  <p className="text-slate-400">
                    Abra o multitarefas, toque no ícone do PokeIdle e escolha <strong>"Dividir tela"</strong>. Abra o WhatsApp ou YouTube na outra metade. O jogo continuará farmando a 60 FPS enquanto você conversa ou assiste vídeos!
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-purple-400" />
                    2. Janela Flutuante / Pop-up
                  </span>
                  <p className="text-slate-400">
                    No multitarefa, toque em <strong>"Abrir em exibição pop-up"</strong> (Samsung) ou <strong>"Janela Suspensa"</strong> (Xiaomi). O PokeIdle vira uma janelinha móvel que fica por cima de qualquer tela!
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
