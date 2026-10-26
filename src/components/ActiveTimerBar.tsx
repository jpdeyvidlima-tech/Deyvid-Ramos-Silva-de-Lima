import React, { useEffect } from 'react';
import { Play, Pause, Square, Plus, Sparkles, CheckCircle2 } from 'lucide-react';
import { Tarefa } from '../types/task';
import { tocarSomIA } from '../utils/audio';

interface ActiveTimerBarProps {
  tarefaAtiva: Tarefa | null;
  segundosDecorridos: number;
  estaRodando: boolean;
  onPausarRetomar: () => void;
  onAdicionarTempo: (minutos: number) => void;
  onConcluirTarefa: () => void;
  onCancelarTimer: () => void;
}

export const ActiveTimerBar: React.FC<ActiveTimerBarProps> = ({
  tarefaAtiva,
  segundosDecorridos,
  estaRodando,
  onPausarRetomar,
  onAdicionarTempo,
  onConcluirTarefa,
  onCancelarTimer,
}) => {
  if (!tarefaAtiva) return null;

  const minutos = Math.floor(segundosDecorridos / 60);
  const segundos = segundosDecorridos % 60;
  const tempoFormatado = `${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;

  const tempoTotalAtual = tarefaAtiva.tempoGastoMinutos + Math.floor(segundosDecorridos / 60);
  const ultrapassou = tempoTotalAtual > tarefaAtiva.tempoEstimadoMinutos;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-40 bg-slate-900/95 border border-[#64ffda]/40 backdrop-blur-xl rounded-2xl p-4 shadow-2xl shadow-cyan-950/50 animate-in slide-in-from-bottom-5 duration-300 ring-1 ring-[#64ffda]/30">
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="w-2.5 h-2.5 rounded-full bg-[#64ffda] animate-ping" />
          <span className="text-xs font-semibold text-white truncate max-w-[200px]">
            {tarefaAtiva.titulo}
          </span>
        </div>
        <span className="font-mono text-base font-bold text-[#64ffda] tracking-wider">
          {tempoFormatado}
        </span>
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-400 mb-3">
        <span>Est: {tarefaAtiva.tempoEstimadoMinutos}m</span>
        <span className={ultrapassou ? 'text-rose-400 font-semibold' : 'text-emerald-400'}>
          Total: {tempoTotalAtual}m {ultrapassou && '(Gargalo em formação!)'}
        </span>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-1.5 justify-between">
        <button
          onClick={onPausarRetomar}
          className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
            estaRodando
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
              : 'bg-[#64ffda]/20 text-[#64ffda] border border-[#64ffda]/40 hover:bg-[#64ffda]/30'
          }`}
        >
          {estaRodando ? (
            <>
              <Pause className="w-3.5 h-3.5" />
              <span>Pausar</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Retomar</span>
            </>
          )}
        </button>

        <button
          onClick={() => onAdicionarTempo(5)}
          className="py-1.5 px-2.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-xs font-mono font-medium border border-slate-700 transition"
          title="Adicionar 5 minutos"
        >
          +5m
        </button>

        <button
          onClick={() => {
            tocarSomIA();
            onConcluirTarefa();
          }}
          className="py-1.5 px-3 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 text-xs font-bold flex items-center gap-1 hover:brightness-110 shadow-sm transition"
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Concluir</span>
        </button>

        <button
          onClick={onCancelarTimer}
          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
          title="Fechar timer"
        >
          <Square className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
