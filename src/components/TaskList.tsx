import React, { useState } from 'react';
import {
  Plus,
  Play,
  CheckCircle2,
  Circle,
  Clock,
  AlertTriangle,
  Tag,
  Edit2,
  Trash2,
  Filter,
  Check,
  AlertOctagon,
  Search,
} from 'lucide-react';
import { Tarefa, TaskCategory, TaskStatus } from '../types/task';
import { detectarGargalo } from '../utils/storage';

interface TaskListProps {
  tarefas: Tarefa[];
  onNovaTarefa: () => void;
  onEditarTarefa: (tarefa: Tarefa) => void;
  onExcluirTarefa: (id: string) => void;
  onToggleStatus: (id: string) => void;
  onIniciarTimer: (tarefa: Tarefa) => void;
  tarefaComTimerAtivoId?: string;
}

export const TaskList: React.FC<TaskListProps> = ({
  tarefas,
  onNovaTarefa,
  onEditarTarefa,
  onExcluirTarefa,
  onToggleStatus,
  onIniciarTimer,
  tarefaComTimerAtivoId,
}) => {
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');
  const [filtroCategoria, setFiltroCategoria] = useState<string>('todas');
  const [apenasGargalos, setApenasGargalos] = useState<boolean>(false);
  const [busca, setBusca] = useState<string>('');

  const categoriasUnicas: TaskCategory[] = Array.from(
    new Set(tarefas.map((t) => t.categoria))
  ) as TaskCategory[];

  const tarefasFiltradas = tarefas.filter((t) => {
    // Busca por texto
    if (busca.trim()) {
      const termo = busca.toLowerCase();
      const bateTitulo = t.titulo.toLowerCase().includes(termo);
      const bateNotas = t.notas?.toLowerCase().includes(termo);
      const bateGargalo = t.gargaloIdentificado?.toLowerCase().includes(termo);
      if (!bateTitulo && !bateNotas && !bateGargalo) return false;
    }

    // Filtro de status
    if (filtroStatus !== 'todos' && t.status !== filtroStatus) return false;

    // Filtro de categoria
    if (filtroCategoria !== 'todas' && t.categoria !== filtroCategoria) return false;

    // Apenas gargalos
    if (apenasGargalos) {
      const infoGargalo = detectarGargalo(t);
      if (!infoGargalo.possuiGargalo) return false;
    }

    return true;
  });

  const getPrioridadeBadge = (p: string) => {
    switch (p) {
      case 'urgente':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30">Urgente</span>;
      case 'alta':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">Alta</span>;
      case 'media':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/30">Média</span>;
      default:
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-800 text-slate-400">Baixa</span>;
    }
  };

  const getStatusBadge = (s: TaskStatus) => {
    switch (s) {
      case 'concluida':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">Concluída</span>;
      case 'em_andamento':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-[#64ffda]/10 text-[#64ffda] border border-[#64ffda]/30">Em Andamento</span>;
      case 'bloqueada':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-rose-500/10 text-rose-400 border border-rose-500/30">Bloqueada</span>;
      default:
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-800 text-slate-400">Pendente</span>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Action Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-bold text-white tracking-tight">
            Tarefas & Registros de Tempo
          </h3>
          <span className="px-2 py-0.5 rounded-full text-xs font-mono font-medium bg-slate-800 text-slate-300">
            {tarefasFiltradas.length} de {tarefas.length}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-60">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar tarefas..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#64ffda] transition"
            />
          </div>

          {/* New Task Button */}
          <button
            onClick={onNovaTarefa}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#64ffda] to-teal-400 text-slate-950 font-semibold text-xs flex items-center gap-1.5 hover:brightness-110 shadow-sm transition active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Nova Tarefa</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Status Pills */}
          {[
            { id: 'todos', label: 'Todas' },
            { id: 'pendente', label: 'Pendentes' },
            { id: 'em_andamento', label: 'Em Andamento' },
            { id: 'concluida', label: 'Concluídas' },
            { id: 'bloqueada', label: 'Bloqueadas' },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setFiltroStatus(st.id)}
              className={`px-2.5 py-1 rounded-lg transition font-medium ${
                filtroStatus === st.id
                  ? 'bg-slate-800 text-[#64ffda] border border-[#64ffda]/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {/* Apenas Gargalos Switch */}
          <button
            onClick={() => setApenasGargalos(!apenasGargalos)}
            className={`px-3 py-1 rounded-lg font-medium flex items-center gap-1.5 border transition ${
              apenasGargalos
                ? 'bg-rose-500/20 border-rose-500/50 text-rose-300'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            <span>Apenas Gargalos</span>
          </button>

          {/* Categoria Select */}
          {categoriasUnicas.length > 0 && (
            <select
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
              className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 focus:outline-none focus:border-[#64ffda] text-xs"
            >
              <option value="todas">Todas Categorias</option>
              {categoriasUnicas.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Task Cards Grid / List */}
      <div className="space-y-3">
        {tarefasFiltradas.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-slate-900/40 border border-slate-800/80">
            <Clock className="w-8 h-8 text-slate-500 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-400">Nenhuma tarefa encontrada com os filtros selecionados.</p>
            <p className="text-xs text-slate-500 mt-1">Crie uma nova tarefa ou altere as opções de filtro acima.</p>
          </div>
        ) : (
          tarefasFiltradas.map((tarefa) => {
            const gargalo = detectarGargalo(tarefa);
            const isAtiva = tarefaComTimerAtivoId === tarefa.id;
            const proporcao = tarefa.tempoEstimadoMinutos > 0
              ? Math.min(100, Math.round((tarefa.tempoGastoMinutos / tarefa.tempoEstimadoMinutos) * 100))
              : 100;
            const ultrapassou = tarefa.tempoGastoMinutos > tarefa.tempoEstimadoMinutos;

            return (
              <div
                key={tarefa.id}
                className={`p-4 rounded-xl border backdrop-blur-sm transition-all duration-200 ${
                  isAtiva
                    ? 'bg-slate-900/90 border-[#64ffda]/50 shadow-lg shadow-[#64ffda]/10 ring-1 ring-[#64ffda]/40'
                    : gargalo.possuiGargalo
                    ? 'bg-slate-900/60 border-slate-800 hover:border-rose-900/50'
                    : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Left: Status Toggle + Title + Badges */}
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => onToggleStatus(tarefa.id)}
                      className="mt-0.5 shrink-0 text-slate-400 hover:text-emerald-400 transition"
                      title={tarefa.status === 'concluida' ? 'Marcar como pendente' : 'Marcar como concluída'}
                    >
                      {tarefa.status === 'concluida' ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-500 hover:text-slate-400" />
                      )}
                    </button>

                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span
                          className={`text-sm font-semibold transition ${
                            tarefa.status === 'concluida'
                              ? 'line-through text-slate-400'
                              : 'text-white'
                          }`}
                        >
                          {tarefa.titulo}
                        </span>
                        {getPrioridadeBadge(tarefa.prioridade)}
                        {getStatusBadge(tarefa.status)}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                          {tarefa.categoria}
                        </span>
                        {tarefa.notas && (
                          <span className="text-slate-400 italic truncate max-w-sm">
                            • {tarefa.notas}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Time Tracker & Action Buttons */}
                  <div className="flex items-center gap-3 sm:self-center shrink-0">
                    {/* Time Stats */}
                    <div className="text-right">
                      <div className="text-xs font-mono font-medium text-slate-300">
                        <span className={ultrapassou ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                          {tarefa.tempoGastoMinutos}m
                        </span>{' '}
                        <span className="text-slate-500">/ {tarefa.tempoEstimadoMinutos}m</span>
                      </div>
                      <div className="w-24 bg-slate-800 rounded-full h-1 mt-1 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            ultrapassou
                              ? 'bg-rose-500'
                              : tarefa.status === 'concluida'
                              ? 'bg-emerald-400'
                              : 'bg-[#64ffda]'
                          }`}
                          style={{ width: `${proporcao}%` }}
                        />
                      </div>
                    </div>

                    {/* Timer trigger */}
                    {tarefa.status !== 'concluida' && (
                      <button
                        onClick={() => onIniciarTimer(tarefa)}
                        className={`p-2 rounded-lg border text-xs font-medium flex items-center gap-1 transition ${
                          isAtiva
                            ? 'bg-[#64ffda]/20 border-[#64ffda] text-[#64ffda] animate-pulse'
                            : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:border-slate-600'
                        }`}
                        title="Iniciar cronômetro de foco"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                      </button>
                    )}

                    {/* Edit */}
                    <button
                      onClick={() => onEditarTarefa(tarefa)}
                      className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                      title="Editar tarefa"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => onExcluirTarefa(tarefa.id)}
                      className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
                      title="Excluir tarefa"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Bottleneck Alert Box if detected */}
                {gargalo.possuiGargalo && (
                  <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-start gap-2 text-xs text-rose-300/90 bg-rose-950/20 px-3 py-1.5 rounded-lg border border-rose-900/40">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-rose-400">Gargalo Detectado: </span>
                      <span>{gargalo.razao}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
