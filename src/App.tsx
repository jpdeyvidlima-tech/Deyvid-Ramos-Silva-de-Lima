import React, { useState, useEffect, useRef } from 'react';
import { Tarefa } from './types/task';
import { carregarTarefas, salvarTarefas, resetarTarefasParaExemplo } from './utils/storage';
import { Navbar } from './components/Navbar';
import { MetricsCards } from './components/MetricsCards';
import { AiFeedbackSection } from './components/AiFeedbackSection';
import { TaskList } from './components/TaskList';
import { TaskFormModal } from './components/TaskFormModal';
import { ActiveTimerBar } from './components/ActiveTimerBar';

export default function App() {
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [tarefaEmEdicao, setTarefaEmEdicao] = useState<Tarefa | null>(null);

  // Estados do Timer de Foco
  const [tarefaAtiva, setTarefaAtiva] = useState<Tarefa | null>(null);
  const [segundosDecorridos, setSegundosDecorridos] = useState(0);
  const [timerRodando, setTimerRodando] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Inicializar dados do localStorage
  useEffect(() => {
    const carregadas = carregarTarefas();
    setTarefas(carregadas);
  }, []);

  // Controlar o timer
  useEffect(() => {
    if (timerRodando) {
      intervalRef.current = setInterval(() => {
        setSegundosDecorridos((prev) => prev + 1);
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [timerRodando]);

  // Salvar alterações sempre que a lista de tarefas mudar
  const atualizarTarefas = (novasTarefas: Tarefa[]) => {
    setTarefas(novasTarefas);
    salvarTarefas(novasTarefas);
  };

  const handleNovaTarefa = () => {
    setTarefaEmEdicao(null);
    setModalAberto(true);
  };

  const handleEditarTarefa = (tarefa: Tarefa) => {
    setTarefaEmEdicao(tarefa);
    setModalAberto(true);
  };

  const handleSalvarTarefa = (tarefaData: Partial<Tarefa>) => {
    if (tarefaEmEdicao) {
      // Atualização
      const atualizadas = tarefas.map((t) =>
        t.id === tarefaEmEdicao.id
          ? { ...t, ...tarefaData } as Tarefa
          : t
      );
      atualizarTarefas(atualizadas);
      if (tarefaAtiva?.id === tarefaEmEdicao.id) {
        setTarefaAtiva((prev) => (prev ? { ...prev, ...tarefaData } as Tarefa : null));
      }
    } else {
      // Criação
      const nova: Tarefa = {
        id: `task-${Date.now()}`,
        titulo: tarefaData.titulo || 'Nova Tarefa',
        categoria: tarefaData.categoria || 'Desenvolvimento',
        prioridade: tarefaData.prioridade || 'media',
        status: tarefaData.status || 'pendente',
        tempoEstimadoMinutos: tarefaData.tempoEstimadoMinutos || 30,
        tempoGastoMinutos: tarefaData.tempoGastoMinutos || 0,
        gargaloIdentificado: tarefaData.gargaloIdentificado,
        dataCriacao: new Date().toISOString(),
        notas: tarefaData.notas,
      };
      atualizarTarefas([nova, ...tarefas]);
    }
  };

  const handleExcluirTarefa = (id: string) => {
    if (tarefaAtiva?.id === id) {
      handleCancelarTimer();
    }
    atualizarTarefas(tarefas.filter((t) => t.id !== id));
  };

  const handleToggleStatus = (id: string) => {
    const atualizadas = tarefas.map((t) => {
      if (t.id === id) {
        const novoStatus = t.status === 'concluida' ? 'pendente' : 'concluida';
        return {
          ...t,
          status: novoStatus,
          concluidaEm: novoStatus === 'concluida' ? new Date().toISOString() : undefined,
        } as Tarefa;
      }
      return t;
    });
    atualizarTarefas(atualizadas);
  };

  // Timer controls
  const handleIniciarTimer = (tarefa: Tarefa) => {
    if (tarefaAtiva?.id === tarefa.id) {
      setTimerRodando(true);
      return;
    }
    // Salva tempo da tarefa anterior se houver
    if (tarefaAtiva && segundosDecorridos > 0) {
      const minutosAcumulados = Math.floor(segundosDecorridos / 60);
      if (minutosAcumulados > 0) {
        atualizarTarefas(
          tarefas.map((t) =>
            t.id === tarefaAtiva.id
              ? { ...t, tempoGastoMinutos: t.tempoGastoMinutos + minutosAcumulados }
              : t
          )
        );
      }
    }

    setTarefaAtiva(tarefa);
    setSegundosDecorridos(0);
    setTimerRodando(true);
  };

  const handlePausarRetomarTimer = () => {
    setTimerRodando(!timerRodando);
  };

  const handleAdicionarTempoTimer = (minutos: number) => {
    setSegundosDecorridos((prev) => prev + minutos * 60);
  };

  const handleConcluirTarefaTimer = () => {
    if (!tarefaAtiva) return;
    const minutosExtras = Math.max(1, Math.floor(segundosDecorridos / 60));
    atualizarTarefas(
      tarefas.map((t) =>
        t.id === tarefaAtiva.id
          ? {
              ...t,
              status: 'concluida',
              tempoGastoMinutos: t.tempoGastoMinutos + minutosExtras,
              concluidaEm: new Date().toISOString(),
            }
          : t
      )
    );
    handleCancelarTimer();
  };

  const handleCancelarTimer = () => {
    if (tarefaAtiva && segundosDecorridos >= 60) {
      const minutosExtras = Math.floor(segundosDecorridos / 60);
      atualizarTarefas(
        tarefas.map((t) =>
          t.id === tarefaAtiva.id
            ? { ...t, tempoGastoMinutos: t.tempoGastoMinutos + minutosExtras }
            : t
        )
      );
    }
    setTarefaAtiva(null);
    setSegundosDecorridos(0);
    setTimerRodando(false);
  };

  const handleResetarExemplo = () => {
    const defaultTarefas = resetarTarefasParaExemplo();
    setTarefas(defaultTarefas);
    handleCancelarTimer();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-[#64ffda]/30 selection:text-[#64ffda]">
      {/* Top Navigation */}
      <Navbar onResetData={handleResetarExemplo} tarefasCount={tarefas.length} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
        
        {/* Productivity Metrics Overview */}
        <MetricsCards tarefas={tarefas} />

        {/* AI Productivity Coach Section (Featuring gerarFeedbackIA and #aiFeedback div) */}
        <AiFeedbackSection tarefas={tarefas} />

        {/* Task Management & Time Logs */}
        <TaskList
          tarefas={tarefas}
          onNovaTarefa={handleNovaTarefa}
          onEditarTarefa={handleEditarTarefa}
          onExcluirTarefa={handleExcluirTarefa}
          onToggleStatus={handleToggleStatus}
          onIniciarTimer={handleIniciarTimer}
          tarefaComTimerAtivoId={tarefaAtiva?.id}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            Coach de Produtividade com IA Gemini • Análise inteligente de gargalos de tempo
          </p>
          <p className="font-mono text-slate-400">
            Powered by Google Gemini 3.8 Flash
          </p>
        </div>
      </footer>

      {/* Task Creation / Edition Modal */}
      <TaskFormModal
        isOpen={modalAberto}
        onClose={() => setModalAberto(false)}
        onSave={handleSalvarTarefa}
        tarefaEmEdicao={tarefaEmEdicao}
      />

      {/* Floating Active Focus Timer Bar */}
      <ActiveTimerBar
        tarefaAtiva={tarefaAtiva}
        segundosDecorridos={segundosDecorridos}
        estaRodando={timerRodando}
        onPausarRetomar={handlePausarRetomarTimer}
        onAdicionarTempo={handleAdicionarTempoTimer}
        onConcluirTarefa={handleConcluirTarefaTimer}
        onCancelarTimer={handleCancelarTimer}
      />
    </div>
  );
}
