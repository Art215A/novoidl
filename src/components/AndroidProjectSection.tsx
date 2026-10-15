import React, { useState } from 'react';
import {
  Download,
  Code2,
  FileText,
  Smartphone,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Copy,
  Terminal,
  Cpu,
  Layers,
  Settings2,
  RotateCcw,
} from 'lucide-react';
import {
  AndroidProjectConfig,
  defaultAndroidConfig,
  createAndroidProjectZip,
  generateAndroidManifest,
  generateMainActivity,
  generateForegroundService,
  generateAppBuildGradle,
  generateReadme,
} from '../services/apkProjectGenerator';

export const AndroidProjectSection: React.FC = () => {
  const [config, setConfig] = useState<AndroidProjectConfig>(defaultAndroidConfig);
  const [activeTab, setActiveTab] = useState<'main' | 'manifest' | 'service' | 'gradle' | 'readme'>('main');
  const [isDownloading, setIsDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  const getCodeForTab = () => {
    switch (activeTab) {
      case 'main':
        return generateMainActivity(config);
      case 'manifest':
        return generateAndroidManifest(config);
      case 'service':
        return generateForegroundService(config);
      case 'gradle':
        return generateAppBuildGradle(config);
      case 'readme':
        return generateReadme(config);
      default:
        return '';
    }
  };

  const handleDownloadZip = async () => {
    try {
      setIsDownloading(true);
      const blob = await createAndroidProjectZip(config);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${config.appName.replace(/\s+/g, '_')}_Android_Studio_Project.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error:', err);
      alert('Erro ao gerar arquivo zip.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(getCodeForTab());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-slate-800">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-1">
            <Smartphone className="w-3.5 h-3.5" />
            <span>Código-Fonte Completo de Aplicativo Nativo</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Gerador de Projeto APK Android (Código Nativo)
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
            Projeto Android Studio pronto com <strong>Foreground Service</strong> e <strong>WebView Persistente</strong> que não congela ao minimizar ou bloquear a tela.
          </p>
        </div>

        <button
          onClick={handleDownloadZip}
          disabled={isDownloading}
          className="flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-xl shadow-emerald-600/20 active:scale-95 transition disabled:opacity-50 cursor-pointer w-full sm:w-auto"
        >
          <Download className="w-4 h-4" />
          <span>{isDownloading ? 'Gerando .ZIP...' : 'Baixar Projeto Android (.ZIP)'}</span>
        </button>
      </div>

      {/* Highlights: Why this native APK never freezes & never reloads */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 my-6">
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-start gap-3">
          <div className="p-2 rounded-xl bg-red-500/10 text-red-400 shrink-0">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Override de onPause()
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              No Android normal, minimizar pausa o WebView. Neste código, o <code className="text-sky-300">webView.onPause()</code> não é chamado e o <code className="text-emerald-400">resumeTimers()</code> é mantido!
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-start gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Foreground Service Real
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              Cria notificação persistente com <code className="text-sky-300">PARTIAL_WAKE_LOCK</code>, impedindo o Android Doze de matar a tarefa de farm.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-start gap-3">
          <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Anti-Pause Hook Injetado
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              Injeta no WebView <code className="text-sky-300">document.hidden = false</code> para que o loop do PokeIdle ache que a janela está sempre em foco.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-start gap-3">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 shrink-0">
            <RotateCcw className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Anti Pull-to-Refresh
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              Bloqueia o gesto de deslizar para baixo que atualiza a página. Você rola para ver seus Pokémons e itens sem reiniciar o jogo!
            </p>
          </div>
        </div>
      </div>

      {/* Browser Architecture Explanation & Comparison */}
      <div className="p-5 sm:p-6 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-4 my-6">
        <div className="flex items-center gap-2 text-sky-400 font-bold text-sm sm:text-base">
          <Settings2 className="w-5 h-5 text-sky-400" />
          <span>Esse APK funciona como um navegador?</span>
        </div>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          <strong className="text-white">Sim! Tecnicamente, ele funciona como um navegador dedicado (Web Browser Especializado)</strong> baseado no componente nativo <strong>Android System WebView</strong> (o mesmo motor Chromium de renderização usado pelo Google Chrome).
        </p>

        {/* Side by side comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {/* Regular Browser */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-red-400 uppercase tracking-wider">
                Navegador Comum (Chrome / Samsung Internet)
              </span>
              <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-400 text-[10px] font-semibold">
                Pausa ao Minimizar
              </span>
            </div>
            <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside">
              <li>Possui barra de endereços e guias que ocupam espaço da tela.</li>
              <li>Ao sair para outro aplicativo ou desligar a tela, o Android <strong>congela os timers JS</strong> (reduz a quase zero).</li>
              <li>O sistema fecha a aba sem aviso se faltar memória RAM no celular.</li>
              <li>Perde a conexão WebSocket do PokeIdle frequentemente em background.</li>
            </ul>
          </div>

          {/* Our Specialized APK */}
          <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                Nosso APK Especializado (WebView + Foreground Service)
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold">
                100% Contínuo 24/7
              </span>
            </div>
            <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
              <li><strong>Interface limpa de jogo</strong>: tela cheia nativa sem barras de navegador.</li>
              <li><strong>Não congela</strong>: bloqueia o comando <code className="text-emerald-400">webView.onPause()</code> ao minimizar.</li>
              <li><strong>Foreground Service</strong>: notificação persistente que avisa o Android que o jogo tem prioridade máxima.</li>
              <li><strong>Login Completo</strong>: suporte nativo a cookies, Google Login, Discord e Cloudflare Turnstile.</li>
            </ul>
          </div>
        </div>
      </div>
      <div className="rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden">
        {/* Tab navigation */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800 overflow-x-auto">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab('main')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeTab === 'main'
                  ? 'bg-slate-800 text-sky-400 border border-slate-700'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              MainActivity.kt
            </button>
            <button
              onClick={() => setActiveTab('manifest')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeTab === 'manifest'
                  ? 'bg-slate-800 text-sky-400 border border-slate-700'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              AndroidManifest.xml
            </button>
            <button
              onClick={() => setActiveTab('service')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeTab === 'service'
                  ? 'bg-slate-800 text-sky-400 border border-slate-700'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              ForegroundService.kt
            </button>
            <button
              onClick={() => setActiveTab('gradle')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeTab === 'gradle'
                  ? 'bg-slate-800 text-sky-400 border border-slate-700'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              build.gradle
            </button>
            <button
              onClick={() => setActiveTab('readme')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeTab === 'readme'
                  ? 'bg-slate-800 text-sky-400 border border-slate-700'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              README.md
            </button>
          </div>

          <button
            onClick={handleCopyCode}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition cursor-pointer"
          >
            {copied ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copiado</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar</span>
              </>
            )}
          </button>
        </div>

        {/* Code Block */}
        <pre className="p-4 text-xs font-mono text-slate-300 overflow-x-auto max-h-96 leading-relaxed">
          <code>{getCodeForTab()}</code>
        </pre>
      </div>

      {/* Step by Step Guide: How to compile APK */}
      <div className="mt-8 pt-6 border-t border-slate-800">
        <h4 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <span>Como Compilar o APK no seu Celular em 3 Passos:</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="inline-block px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold text-xs">
              Opção 1: Mais Rápida (Nuvem)
            </span>
            <h5 className="text-sm font-semibold text-white">Gerar via PWABuilder / Web2APK</h5>
            <p className="text-xs text-slate-400 leading-relaxed">
              Você pode usar geradores online como <strong>PWABuilder</strong> ou <strong>Web2APK</strong> inserindo a URL <code className="text-red-400">https://pokeidle.io/app</code>. Eles geram o APK direto no navegador em 1 minuto.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="inline-block px-2 py-0.5 rounded bg-sky-500/20 text-sky-400 font-bold text-xs">
              Opção 2: Android Studio Oficial
            </span>
            <h5 className="text-sm font-semibold text-white">Abrir o Projeto .ZIP</h5>
            <p className="text-xs text-slate-400 leading-relaxed">
              Baixe o nosso <strong>.ZIP</strong> pelo botão acima, abra a pasta no Android Studio e clique em <em>Build &gt; Build APKs</em>. O APK sairá com suporte total a segundo plano ininterrupto.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="inline-block px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 font-bold text-xs">
              Opção 3: PWA Direto no Chrome
            </span>
            <h5 className="text-sm font-semibold text-white">Adicionar à Tela Inicial</h5>
            <p className="text-xs text-slate-400 leading-relaxed">
              Use o botão <strong>"Instalar no Celular"</strong> no topo deste painel para ter o app PWA instalado sem precisar compilar nada, ativando o motor de áudio anti-suspensão!
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
