import React from 'react';
import { CheckCircle2, Clock, AlertTriangle, TrendingUp } from 'lucide-react';
import { Tarefa } from '../types/task';
import { detectarGargalo } from '../utils/storage';

interface MetricsCardsProps {
  tarefas: Tarefa[];
}

export const MetricsCards: React.FC<MetricsCardsProps> = ({ tarefas }) => {
  const totalTarefas = tarefas.length;
  const concluidas = tarefas.filter((t) => t.status === 'concluida').length;
  const taxaConclusao = totalTarefas > 0 ? Math.round((concluidas / totalTarefas) * 100) : 0;

  const tempoEstimadoTotal = tarefas.reduce((acc, t) => acc + (t.tempoEstimadoMinutos || 0), 0);
  const tempoGastoTotal = tarefas.reduce((acc, t) => acc + (t.tempoGastoMinutos || 0), 0);
  const diferencaTempo = tempoGastoTotal - tempoEstimadoTotal;

  const gargalos = tarefas.filter((t) => detectarGargalo(t).possuiGargalo);
  const totalGargalos = gargalos.length;

  // Categoria com mais tempo gasto
  const categoriaTempo: Record<string, number> = {};
  tarefas.forEach((t) => {
    categoriaTempo[t.categoria] = (categoriaTempo[t.categoria] || 0) + (t.tempoGastoMinutos || 0);
  });
  let maiorCategoria = 'Nenhuma';
  let maiorTempoCat = 0;
  Object.entries(categoriaTempo).forEach(([cat, min]) => {
    if (min > maiorTempoCat) {
      maiorTempoCat = min;
      maiorCategoria = cat;
    }
  });

  const formatarHorasMinutos = (min: number) => {
    const horas = Math.floor(min / 60);
    const minutosRestantes = min % 60;
    if (horas > 0) {
      return `${horas}h ${minutosRestantes}m`;
    }
    return `${minutosRestantes}m`;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Taxa de Conclusão */}
      <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-sm relative overflow-hidden group hover:border-slate-700 transition">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-slate-400">Progresso do Dia</span>
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-white font-mono">{taxaConclusao}%</span>
          <span className="text-xs text-slate-400">
            ({concluidas}/{totalTarefas} tarefas)
          </span>
        </div>
        <div className="mt-3 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-emerald-500 to-[#64ffda] h-full rounded-full transition-all duration-500"
            style={{ width: `${taxaConclusao}%` }}
          />
        </div>
      </div>

      {/* 2. Tempo Investido vs Estimado */}
      <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-sm relative overflow-hidden group hover:border-slate-700 transition">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-slate-400">Tempo Real vs Estimado</span>
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-white font-mono">{formatarHorasMinutos(tempoGastoTotal)}</span>
          <span className="text-xs text-slate-400">
            est. {formatarHorasMinutos(tempoEstimadoTotal)}
          </span>
        </div>
        <div className="mt-2 text-xs flex items-center gap-1.5">
          {diferencaTempo > 0 ? (
            <span className="text-rose-400 font-medium">
              +{formatarHorasMinutos(diferencaTempo)} além do previsto
            </span>
          ) : (
            <span className="text-emerald-400 font-medium">Dentro do prazo estimado</span>
          )}
        </div>
      </div>

      {/* 3. Gargalos Detectados */}
      <div className={`p-4 rounded-2xl border backdrop-blur-sm relative overflow-hidden transition ${
        totalGargalos > 0 
          ? 'bg-rose-950/20 border-rose-900/50 hover:border-rose-700/60' 
          : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
      }`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-slate-400">Gargalos de Tempo</span>
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            totalGargalos > 0 ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-800 text-slate-400'
          }`}>
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className={`text-2xl font-bold font-mono ${totalGargalos > 0 ? 'text-rose-400' : 'text-white'}`}>
            {totalGargalos}
          </span>
          <span className="text-xs text-slate-400">
            {totalGargalos === 1 ? 'item crítico' : 'itens críticos'}
          </span>
        </div>
        <div className="mt-2 text-xs text-slate-400 truncate">
          {totalGargalos > 0 ? 'Excesso de tempo ou bloqueio externo' : 'Nenhum gargalo identificado'}
        </div>
      </div>

      {/* 4. Maior Dreno de Tempo */}
      <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-sm relative overflow-hidden group hover:border-slate-700 transition">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-slate-400">Maior Consumo de Tempo</span>
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-bold text-white truncate">{maiorCategoria}</span>
        </div>
        <div className="mt-2 text-xs text-slate-400 font-mono">
          {formatarHorasMinutos(maiorTempoCat)} dedicados hoje
        </div>
      </div>
    </div>
  );
};
