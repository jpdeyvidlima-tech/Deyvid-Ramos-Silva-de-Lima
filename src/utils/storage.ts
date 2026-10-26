import { Tarefa, FeedbackRecord } from '../types/task';

const STORAGE_KEY_TAREFAS = 'gemini_coach_tarefas_v1';
const STORAGE_KEY_FEEDBACKS = 'gemini_coach_feedbacks_v1';

export const TAREFAS_INICIAIS: Tarefa[] = [
  {
    id: 'task-1',
    titulo: 'Reunião de Alinhamento Semanal e Priorização',
    categoria: 'Reunião',
    prioridade: 'alta',
    status: 'concluida',
    tempoEstimadoMinutos: 45,
    tempoGastoMinutos: 95,
    gargaloIdentificado: 'Discussões fora do escopo estenderam a reunião em +50 min além do planejado.',
    dataCriacao: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
    concluidaEm: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    notas: 'Pauta ampla demais; sugerir pauta prévia com timebox de 5 min por item.',
  },
  {
    id: 'task-2',
    titulo: 'Desenvolver e Testar Endpoint de Notificações',
    categoria: 'Desenvolvimento',
    prioridade: 'urgente',
    status: 'concluida',
    tempoEstimadoMinutos: 90,
    tempoGastoMinutos: 135,
    gargaloIdentificado: 'Falhas intermitentes no ambiente de homologação causaram 45 min de retrabalho.',
    dataCriacao: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    concluidaEm: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    notas: 'Branch pronta e aprovada em code review.',
  },
  {
    id: 'task-3',
    titulo: 'Aprovação de Protótipo com Direção Comercial',
    categoria: 'Planejamento',
    prioridade: 'alta',
    status: 'bloqueada',
    tempoEstimadoMinutos: 30,
    tempoGastoMinutos: 80,
    gargaloIdentificado: 'Aguardando validação externa; dependência direta de terceiros travando o fluxo.',
    dataCriacao: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    notas: 'Mensagens enviadas pelo Slack e e-mail. Sem retorno até o momento.',
  },
  {
    id: 'task-4',
    titulo: 'Foco Profundo: Refatoração do Motor de Cache',
    categoria: 'Foco Profundo',
    prioridade: 'media',
    status: 'em_andamento',
    tempoEstimadoMinutos: 60,
    tempoGastoMinutos: 40,
    dataCriacao: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    notas: 'Progredindo bem sem distrações.',
  },
  {
    id: 'task-5',
    titulo: 'Triagem de E-mails, Chamados e Notificações',
    categoria: 'Comunicação',
    prioridade: 'baixa',
    status: 'concluida',
    tempoEstimadoMinutos: 25,
    tempoGastoMinutos: 65,
    gargaloIdentificado: 'Checagem dispersa a cada 10 minutos em vez de um bloco único concentrado.',
    dataCriacao: new Date(Date.now() - 7 * 3600 * 1000).toISOString(),
    concluidaEm: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
    notas: 'Adotar loteamento (batching) duas vezes ao dia.',
  },
];

export function carregarTarefas(): Tarefa[] {
  try {
    const item = localStorage.getItem(STORAGE_KEY_TAREFAS);
    if (!item) {
      salvarTarefas(TAREFAS_INICIAIS);
      return TAREFAS_INICIAIS;
    }
    return JSON.parse(item);
  } catch {
    return TAREFAS_INICIAIS;
  }
}

export function salvarTarefas(tarefas: Tarefa[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_TAREFAS, JSON.stringify(tarefas));
  } catch (e) {
    console.error('Erro ao salvar tarefas no localStorage:', e);
  }
}

export function resetarTarefasParaExemplo(): Tarefa[] {
  salvarTarefas(TAREFAS_INICIAIS);
  return TAREFAS_INICIAIS;
}

export function carregarHistoricoFeedbacks(): FeedbackRecord[] {
  try {
    const item = localStorage.getItem(STORAGE_KEY_FEEDBACKS);
    return item ? JSON.parse(item) : [];
  } catch {
    return [];
  }
}

export function salvarFeedback(feedback: FeedbackRecord): FeedbackRecord[] {
  try {
    const historico = carregarHistoricoFeedbacks();
    const novoHistorico = [feedback, ...historico.slice(0, 9)];
    localStorage.setItem(STORAGE_KEY_FEEDBACKS, JSON.stringify(novoHistorico));
    return novoHistorico;
  } catch {
    return [];
  }
}

/**
 * Avalia se uma tarefa possui gargalo automático de tempo ou bloqueio
 */
export function detectarGargalo(t: Tarefa): { possuiGargalo: boolean; razao?: string } {
  if (t.status === 'bloqueada') {
    return {
      possuiGargalo: true,
      razao: t.gargaloIdentificado || 'Tarefa bloqueada por impedimento ou espera externa.',
    };
  }

  if (t.tempoGastoMinutos > t.tempoEstimadoMinutos) {
    const excesso = t.tempoGastoMinutos - t.tempoEstimadoMinutos;
    const porcentagemExcesso = Math.round((excesso / t.tempoEstimadoMinutos) * 100);
    return {
      possuiGargalo: true,
      razao: t.gargaloIdentificado || `Excedeu em ${excesso} min (${porcentagemExcesso}% a mais do previsto).`,
    };
  }

  if (t.gargaloIdentificado && t.gargaloIdentificado.trim().length > 0) {
    return {
      possuiGargalo: true,
      razao: t.gargaloIdentificado,
    };
  }

  return { possuiGargalo: false };
}
