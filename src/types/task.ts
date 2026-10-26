export type TaskStatus = 'pendente' | 'em_andamento' | 'concluida' | 'bloqueada';
export type TaskPriority = 'baixa' | 'media' | 'alta' | 'urgente';
export type TaskCategory = 'Desenvolvimento' | 'Reunião' | 'Foco Profundo' | 'Comunicação' | 'Planejamento' | 'Outro';

export interface Tarefa {
  id: string;
  titulo: string;
  categoria: TaskCategory;
  prioridade: TaskPriority;
  status: TaskStatus;
  tempoEstimadoMinutos: number;
  tempoGastoMinutos: number;
  gargaloIdentificado?: string;
  dataCriacao: string;
  concluidaEm?: string;
  notas?: string;
}

export type FeedbackMode = 'geral' | 'gargalos' | 'plano_amanha' | 'pomodoro';

export interface FeedbackRecord {
  id: string;
  data: string;
  modo: FeedbackMode;
  texto: string;
}
