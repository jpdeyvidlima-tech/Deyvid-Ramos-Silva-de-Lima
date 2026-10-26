import express, { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '5mb' }));

const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey && apiKey !== 'MY_GEMINI_API_KEY' && apiKey.trim().length > 0) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

/**
 * Análise de produtividade caso a chave ainda não tenha sido configurada no Secrets
 */
function gerarAnaliseHeuristica(tarefas: any[], modo: string): string {
  const total = tarefas.length;
  const concluidas = tarefas.filter((t) => t.status === 'concluida').length;
  const bloqueadas = tarefas.filter((t) => t.status === 'bloqueada');
  const atrasadas = tarefas.filter((t) => (t.tempoGastoMinutos || 0) > (t.tempoEstimadoMinutos || 0));

  const tempoEstimadoTotal = tarefas.reduce((acc, t) => acc + (t.tempoEstimadoMinutos || 0), 0);
  const tempoGastoTotal = tarefas.reduce((acc, t) => acc + (t.tempoGastoMinutos || 0), 0);
  const excessoMin = Math.max(0, tempoGastoTotal - tempoEstimadoTotal);

  let titulo = 'Coach de Produtividade';
  let gargaloDestaque = atrasadas.length > 0 
    ? `A tarefa "${atrasadas[0].titulo}" consumiu ${atrasadas[0].tempoGastoMinutos}m contra ${atrasadas[0].tempoEstimadoMinutos}m estimados.`
    : 'Suas tarefas estão com execução aderente ao estimado.';

  if (bloqueadas.length > 0) {
    gargaloDestaque += ` Além disso, temos ${bloqueadas.length} tarefa(s) bloqueada(s) aguardando respostas externas.`;
  }

  const p1 = `Excelente esforço no dia de hoje! Você avançou em ${concluidas} de ${total} tarefas, investindo um total de ${Math.round(tempoGastoTotal / 60)}h ${tempoGastoTotal % 60}m de foco. O compromisso com a entrega é evidente, mas seus dados indicam que ${excessoMin > 0 ? `o tempo real excedeu em ${excessoMin} minutos o que você havia planejado` : 'seu planejamento temporal está muito equilibrado'}.`;

  const p2 = `Seu principal gargalo identificado: ${gargaloDestaque} Reuniões estendidas e interrupções frequentes costumam ser os maiores ladrões invisíveis de produtividade. Quando uma reunião ultrapassa o horário ou uma validação depende de terceiros sem prazo de resposta estipulado, todo o resto do seu cronograma sofre um efeito dominó.`;

  const p3 = `Para amanhã: aplique a regra do Timeboxing rigoroso — limite reuniões a blocos máximos de 25 ou 45 minutos com pauta travada. Reserve seus primeiros 90 minutos da manhã exclusivamente para a tarefa de maior valor (Foco Profundo) antes de abrir caixas de e-mail ou mensagens. Pequenos ajustes de blindagem de agenda vão dobrar o seu rendimento!`;

  return `${p1}\n\n${p2}\n\n${p3}`;
}

app.post('/api/gemini/feedback', async (req: Request, res: Response) => {
  try {
    const { tarefas, modo = 'geral' } = req.body;
    const historicoParaAnalise = JSON.stringify(tarefas ?? [], null, 2);

    // Se temos a chave do Gemini configurada, usamos o modelo Gemini 3.8 Flash
    if (ai) {
      let instrucaoModo = '';
      switch (modo) {
        case 'gargalos':
          instrucaoModo = 'Foque estritamente em diagnosticar os gargalos de tempo, discrepâncias entre tempo estimado e tempo gasto, e tarefas bloqueadas ou com interrupções.';
          break;
        case 'plano_amanha':
          instrucaoModo = 'Crie um plano de ação tático priorizado para amanhã com base nos aprendizados das tarefas de hoje, usando a regra 1-3-5 ou matriz de esforço.';
          break;
        case 'pomodoro':
          instrucaoModo = 'Sugira uma divisão otimizada de blocos Pomodoro (25/5 min ou 50/10 min) e estratégias para evitar fadiga mental.';
          break;
        default:
          instrucaoModo = 'Dê um feedback curto, encorajador e direto (máximo de 3 parágrafos) apontando possíveis gargalos de tempo e como posso melhorar amanhã.';
      }

      const prompt = `Atue como um coach sênior de produtividade e gestão de tempo.
Analise este histórico de tarefas:
${historicoParaAnalise}

Diretriz: ${instrucaoModo}
Responda em português do Brasil de forma estruturada, motivadora, com insights práticos e diretos ao ponto. Se houver discrepância de tempo estimado vs real, mencione com números concretos.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: 'Você é um coach de produtividade empático, perspicaz e objetivo. Utilize português brasileiro impecável, formatação agradável com destaques e conselhos imediatamente acionáveis.',
        },
      });

      const textoResposta = response.text || 'Não foi possível gerar a resposta.';
      return res.json({ feedback: textoResposta, poweredBy: 'gemini-3.8-flash' });
    }

    // Se a chave ainda não está configurada no ambiente, retorna análise heurística contextual
    const analise = gerarAnaliseHeuristica(tarefas || [], modo);
    return res.json({
      feedback: analise,
      poweredBy: 'heuristic-coach',
      notice: 'Configure GEMINI_API_KEY em Settings > Secrets para personalizar com o modelo Gemini 3.8 Flash em tempo real.',
    });

  } catch (error: any) {
    console.error('Erro na chamada da API Gemini:', error);
    return res.status(500).json({
      error: error?.message || 'Ocorreu um erro ao conectar com o Gemini. Verifique sua conexão ou a chave da API.',
    });
  }
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
