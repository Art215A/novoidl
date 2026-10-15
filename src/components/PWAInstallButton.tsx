import React, { useState } from 'react';
import { Download, Smartphone, X, CheckCircle2 } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, isAndroid, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);

  // If already running as an installed PWA in standalone mode
  if (isInstalled) {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
        <span>PWA Instalado</span>
      </div>
    );
  }

  return (
    <>
      {isInstallable ? (
        <button
          onClick={install}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 px-4 py-2 text-xs md:text-sm font-semibold text-white shadow-lg shadow-red-500/25 hover:from-red-500 hover:to-rose-500 transition active:scale-95 cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Instalar no Celular</span>
        </button>
      ) : (
        <button
          onClick={() => setShowGuide(true)}
          className="flex items-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3.5 py-1.5 text-xs font-medium text-slate-200 transition active:scale-95 cursor-pointer"
        >
          <Smartphone className="w-3.5 h-3.5 text-red-400" />
          <span>Instalar no Android</span>
        </button>
      )}

      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-red-500/20 text-red-400">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Instalar App no Celular</h3>
                  <p className="text-xs text-slate-400">Acesso rápido e tela cheia sem barra de navegador</p>
                </div>
              </div>
              <button
                onClick={() => setShowGuide(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3.5 text-sm text-slate-300">
              {isAndroid || !isIOS ? (
                <>
                  <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 flex items-start gap-3">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-red-600 text-white font-bold text-xs shrink-0">1</span>
                    <p>No navegador Google Chrome no Android, toque no menu de <strong>três pontinhos (⋮)</strong> no canto superior direito.</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 flex items-start gap-3">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-red-600 text-white font-bold text-xs shrink-0">2</span>
                    <p>Toque em <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à tela inicial"</strong>.</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 flex items-start gap-3">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-red-600 text-white font-bold text-xs shrink-0">3</span>
                    <p>O ícone do PokeIdle Runner aparecerá na tela do seu celular como um app nativo!</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 flex items-start gap-3">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-red-600 text-white font-bold text-xs shrink-0">1</span>
                    <p>No Safari, toque no botão <strong>Compartilhar (quadrado com seta)</strong> na barra inferior.</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 flex items-start gap-3">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-red-600 text-white font-bold text-xs shrink-0">2</span>
                    <p>Role para baixo e selecione <strong>"Adicionar à Tela de Início"</strong>.</p>
                  </div>
                </>
              )}
            </div>

            <button
              onClick={() => setShowGuide(false)}
              className="mt-5 w-full rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 py-2.5 text-sm font-semibold text-white transition cursor-pointer"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
};
