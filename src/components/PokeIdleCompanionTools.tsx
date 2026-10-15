import React, { useState, useEffect } from 'react';
import {
  Bell,
  Timer,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Trophy,
  CheckCircle2,
  Volume2,
  Vibrate,
  Flame,
  Award,
} from 'lucide-react';

export const PokeIdleCompanionTools: React.FC = () => {
  // Egg Hatch Timer state
  const [timerSeconds, setTimerSeconds] = useState(300); // 5 mins default
  const [timerRemaining, setTimerRemaining] = useState(300);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [alarmTriggered, setAlarmTriggered] = useState(false);

  // Daily Farm Checklist
  const [checklist, setChecklist] = useState<{ id: string; text: string; done: boolean }[]>([
    { id: '1', text: 'Resgatar bônus diário de Login no PokeIdle', done: true },
    { id: '2', text: 'Colocar ovos para chocar na incubadora', done: false },
    { id: '3', text: 'Ativar Pokebolas automáticas para novos Pokémons', done: false },
    { id: '4', text: 'Derrotar o Líder de Ginásio do seu nível atual', done: false },
    { id: '5', text: 'Deixar farmando em segundo plano por pelo menos 2 horas', done: false },
  ]);

  // Handle countdown
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning && timerRemaining > 0) {
      interval = setInterval(() => {
        setTimerRemaining((prev) => prev - 1);
      }, 1000);
    } else if (timerRemaining === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      setAlarmTriggered(true);

      // Trigger Android vibration
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([300, 100, 300, 100, 500]);
      }

      // Play beep
      try {
        const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 1.2);
      } catch (e) {
        console.warn('Audio alert error', e);
      }
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timerRemaining]);

  const toggleCheck = (id: string) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, done: !item.done } : item))
    );
  };

  const handleStartTimer = (seconds: number) => {
    setTimerSeconds(seconds);
    setTimerRemaining(seconds);
    setIsTimerRunning(true);
    setAlarmTriggered(false);
  };

  const formatTimer = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Egg & Raid Timer */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                <Timer className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white">
                  Alarme de Chocadeira e Raids
                </h4>
                <p className="text-xs text-slate-400">
                  Avisa com som e vibração no celular quando o ovo chocar
                </p>
              </div>
            </div>
          </div>

          {/* Preset Buttons */}
          <div className="flex flex-wrap gap-2 mt-4">
            <button
              onClick={() => handleStartTimer(120)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 border border-slate-700 transition cursor-pointer"
            >
              🥚 2 Minutos
            </button>
            <button
              onClick={() => handleStartTimer(300)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 border border-slate-700 transition cursor-pointer"
            >
              🥚 5 Minutos
            </button>
            <button
              onClick={() => handleStartTimer(600)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 border border-slate-700 transition cursor-pointer"
            >
              🥚 10 Minutos
            </button>
            <button
              onClick={() => handleStartTimer(1800)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 border border-slate-700 transition cursor-pointer"
            >
              ⚔️ 30 Min (Raid)
            </button>
          </div>

          {/* Timer Display */}
          <div className="my-6 text-center">
            <div className="text-5xl sm:text-6xl font-mono font-bold tracking-tight text-white">
              {formatTimer(timerRemaining)}
            </div>
            {alarmTriggered && (
              <div className="mt-3 p-3 rounded-xl bg-red-500/20 border border-red-500 text-red-300 text-xs font-bold animate-bounce flex items-center justify-center gap-2">
                <Bell className="w-4 h-4 text-red-400" />
                <span>O TEMPO ACABOU! Verifique o PokeIdle agora!</span>
              </div>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 pt-4 border-t border-slate-800">
          <button
            onClick={() => setIsTimerRunning(!isTimerRunning)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              isTimerRunning
                ? 'bg-amber-600 hover:bg-amber-500 text-white'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            {isTimerRunning ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>Pausar</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Iniciar Cronômetro</span>
              </>
            )}
          </button>
          <button
            onClick={() => {
              setIsTimerRunning(false);
              setTimerRemaining(timerSeconds);
              setAlarmTriggered(false);
            }}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
            title="Reiniciar"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Daily Farm Checklist & Dicas */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-red-500/10 text-red-400">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white">Checklist Diário PokeIdle</h4>
                <p className="text-xs text-slate-400">Tarefas essenciais para maximizar EXP e ouro</p>
              </div>
            </div>
            <span className="text-xs font-bold text-slate-400">
              {checklist.filter((i) => i.done).length}/{checklist.length}
            </span>
          </div>

          <div className="space-y-2.5 mt-4">
            {checklist.map((item) => (
              <div
                key={item.id}
                onClick={() => toggleCheck(item.id)}
                className={`p-3 rounded-xl border transition flex items-center justify-between cursor-pointer ${
                  item.done
                    ? 'bg-slate-950/40 border-slate-800/80 text-slate-500 line-through'
                    : 'bg-slate-950 border-slate-800 text-slate-200 hover:border-slate-700'
                }`}
              >
                <span className="text-xs font-medium">{item.text}</span>
                <div
                  className={`w-5 h-5 rounded-lg border flex items-center justify-center transition ${
                    item.done
                      ? 'bg-emerald-500 border-emerald-500 text-white'
                      : 'border-slate-700 bg-slate-900'
                  }`}
                >
                  {item.done && <CheckCircle2 className="w-3.5 h-3.5" />}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tip Box */}
        <div className="mt-4 p-3 rounded-2xl bg-slate-950 border border-slate-800/80 text-xs text-slate-400 flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <span>
            <strong>Dica de Mestre:</strong> Mantenha a rota selecionada no Pokémon que você consegue derrotar com 1 único golpe (One-Hit KO). Isso maximiza o ganho de EXP por segundo em modo idle!
          </span>
        </div>
      </div>
    </div>
  );
};
