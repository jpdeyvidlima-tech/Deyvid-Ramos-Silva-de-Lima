import React, { useState, useEffect } from 'react';
import { X, Clock, AlertTriangle, Tag, Flag, CheckCircle2 } from 'lucide-react';
import { Tarefa, TaskCategory, TaskPriority, TaskStatus } from '../types/task';

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tarefa: Partial<Tarefa>) => void;
  tarefaEmEdicao?: Tarefa | null;
}

const CATEGORIAS: TaskCategory[] = [
  'Desenvolvimento',
  'Reunião',
  'Foco Profundo',
  'Comunicação',
  'Planejamento',
  'Outro',
];

const PRIORIDADES: { label: string; value: TaskPriority; color: string }[] = [
  { label: 'Baixa', value: 'baixa', color: 'text-slate-400' },
  { label: 'Média', value: 'media', color: 'text-blue-400' },
  { label: 'Alta', value: 'alta', color: 'text-amber-400' },
  { label: 'Urgente', value: 'urgente', color: 'text-rose-400' },
];

export const TaskFormModal: React.FC<TaskFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  tarefaEmEdicao,
}) => {
  const [titulo, setTitulo] = useState('');
  const [categoria, setCategoria] = useState<TaskCategory>('Desenvolvimento');
  const [prioridade, setPrioridade] = useState<TaskPriority>('media');
  const [status, setStatus] = useState<TaskStatus>('pendente');
  const [tempoEstimado, setTempoEstimado] = useState<number>(30);
  const [tempoGasto, setTempoGasto] = useState<number>(0);
  const [gargalo, setGargalo] = useState('');
  const [notas, setNotas] = useState('');

  useEffect(() => {
    if (tarefaEmEdicao) {
      setTitulo(tarefaEmEdicao.titulo);
      setCategoria(tarefaEmEdicao.categoria);
      setPrioridade(tarefaEmEdicao.prioridade);
      setStatus(tarefaEmEdicao.status);
      setTempoEstimado(tarefaEmEdicao.tempoEstimadoMinutos);
      setTempoGasto(tarefaEmEdicao.tempoGastoMinutos);
      setGargalo(tarefaEmEdicao.gargaloIdentificado || '');
      setNotas(tarefaEmEdicao.notas || '');
    } else {
      setTitulo('');
      setCategoria('Desenvolvimento');
      setPrioridade('media');
      setStatus('pendente');
      setTempoEstimado(30);
      setTempoGasto(0);
      setGargalo('');
      setNotas('');
    }
  }, [tarefaEmEdicao, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim()) return;

    onSave({
      ...(tarefaEmEdicao ? { id: tarefaEmEdicao.id } : {}),
      titulo: titulo.trim(),
      categoria,
      prioridade,
      status,
      tempoEstimadoMinutos: Number(tempoEstimado) || 0,
      tempoGastoMinutos: Number(tempoGasto) || 0,
      gargaloIdentificado: gargalo.trim() || undefined,
      notas: notas.trim() || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#64ffda]/10 text-[#64ffda] flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-white">
              {tarefaEmEdicao ? 'Editar Tarefa' : 'Adicionar Nova Tarefa'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Título */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Título da Tarefa *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Refatorar fluxo de checkout..."
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#64ffda] transition"
            />
          </div>

          {/* Categoria e Prioridade */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                Categoria
              </label>
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value as TaskCategory)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-[#64ffda] transition"
              >
                {CATEGORIAS.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1">
                <Flag className="w-3.5 h-3.5 text-slate-400" />
                Prioridade
              </label>
              <select
                value={prioridade}
                onChange={(e) => setPrioridade(e.target.value as TaskPriority)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-[#64ffda] transition"
              >
                {PRIORIDADES.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Status Atual
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { label: 'Pendente', val: 'pendente' },
                { label: 'Em Andamento', val: 'em_andamento' },
                { label: 'Concluída', val: 'concluida' },
                { label: 'Bloqueada', val: 'bloqueada' },
              ].map((s) => (
                <button
                  type="button"
                  key={s.val}
                  onClick={() => setStatus(s.val as TaskStatus)}
                  className={`py-1.5 px-2 rounded-lg text-xs font-medium border transition ${
                    status === s.val
                      ? 'bg-[#64ffda]/20 border-[#64ffda] text-[#64ffda] font-semibold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tempo Estimado vs Tempo Gasto */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                Tempo Estimado (min)
              </label>
              <input
                type="number"
                min="1"
                step="5"
                value={tempoEstimado}
                onChange={(e) => setTempoEstimado(Math.max(1, parseInt(e.target.value) || 0))}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-[#64ffda] transition font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                Tempo Gasto (min)
              </label>
              <input
                type="number"
                min="0"
                step="5"
                value={tempoGasto}
                onChange={(e) => setTempoGasto(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-[#64ffda] transition font-mono"
              />
            </div>
          </div>

          {/* Gargalo Detectado ou Anotado */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              Gargalo ou Fator de Atraso (Opcional)
            </label>
            <input
              type="text"
              placeholder="Ex: Interrupções, lentidão em aprovação, complexidade imprevista..."
              value={gargalo}
              onChange={(e) => setGargalo(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-400 transition"
            />
          </div>

          {/* Notas Adicionais */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Anotações / Contexto
            </label>
            <textarea
              rows={2}
              placeholder="Detalhes relevantes que o Gemini pode usar na análise..."
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#64ffda] transition resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-medium transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#64ffda] to-teal-400 text-slate-950 font-semibold text-xs transition hover:brightness-110 shadow-lg shadow-[#64ffda]/20"
            >
              {tarefaEmEdicao ? 'Salvar Alterações' : 'Criar Tarefa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
