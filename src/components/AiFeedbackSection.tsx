import React, { useState, useEffect } from 'react';
import { Sparkles, Copy, Check, Volume2, Play, Square, History, ChevronRight, Zap } from 'lucide-react';
import { Tarefa, FeedbackMode, FeedbackRecord } from '../types/task';
import { tocarSomIA } from '../utils/audio';
import { salvarFeedback, carregarHistoricoFeedbacks } from '../utils/storage';

interface AiFeedbackSectionProps {
  tarefas: Tarefa[];
}

export const AiFeedbackSection: React.FC<AiFeedbackSectionProps> = ({ tarefas }) => {
  const [carregando, setCarregando] = useState(false);
  const [modoSelecionado, setModoSelecionado] = useState<FeedbackMode>('geral');
  const [copiado, setCopiado] = useState(false);
  const [falando, setFalando] = useState(false);
  const [historico, setHistorico] = useState<FeedbackRecord[]>([]);
  const [mostrarHistorico, setMostrarHistorico] = useState(false);
  const [feedbackHtml, setFeedbackHtml] = useState<string>('');

  useEffect(() => {
    setHistorico(carregarHistoricoFeedbacks());
  }, []);

  // Para garantir compatibilidade com document.getElementById('aiFeedback')
  useEffect(() => {
    const aiFeedbackDiv = document.getElementById('aiFeedback');
    if (aiFeedbackDiv && feedbackHtml) {
      aiFeedbackDiv.innerHTML = feedbackHtml;
    }
  }, [feedbackHtml]);

  /**
   * Implementação da função gerarFeedbackIA conforme solicitado pelo usuário,
   * agora conectada de forma segura e moderna ao Gemini 3.8 Flash no backend
   */
  const gerarFeedbackIA = async () => {
    if (carregando) return;

    const aiFeedbackDiv = document.getElementById('aiFeedback');
    
    // Tocar o som polifônico inspirador de notificação
    tocarSomIA();

    // Mensagem de loading exata solicitada pelo usuário
    const loadingHtml = '<p style="color: #64ffda;"><i>O Gemini está analisando suas tarefas e calculando os gargalos... ⏳</i></p>';
    setFeedbackHtml(loadingHtml);
    if (aiFeedbackDiv) {
      aiFeedbackDiv.innerHTML = loadingHtml;
    }

    setCarregando(true);

    try {
      // Chamada à rota segura da API com o modelo Gemini 3.8 Flash
      const resposta = await fetch('/api/gemini/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tarefas,
          modo: modoSelecionado,
        }),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(dados.error || 'Erro na requisição');
      }

      const textoResposta: string = dados.feedback || '';

      // Converte quebras de linha em <br> para conformidade com a especificação original
      const htmlResposta = textoResposta.replace(/\n/g, '<br>');
      const finalHtml = `<div class="prose prose-invert max-w-none text-slate-100 leading-relaxed font-sans">${htmlResposta}</div>`;

      setFeedbackHtml(finalHtml);
      if (aiFeedbackDiv) {
        aiFeedbackDiv.innerHTML = finalHtml;
      }

      // Salvar no histórico
      const novoRegistro: FeedbackRecord = {
        id: Date.now().toString(),
        data: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        modo: modoSelecionado,
        texto: textoResposta,
      };
      const atualizado = salvarFeedback(novoRegistro);
      setHistorico(atualizado);

    } catch (erro) {
      console.error(erro);
      const erroHtml = '<p style="color: #ff5252;">Ocorreu um erro ao conectar com o Gemini. Verifique sua conexão ou a chave da API.</p>';
      setFeedbackHtml(erroHtml);
      if (aiFeedbackDiv) {
        aiFeedbackDiv.innerHTML = erroHtml;
      }
    } finally {
      setCarregando(false);
    }
  };

  const handleCopiar = () => {
    const aiFeedbackDiv = document.getElementById('aiFeedback');
    const texto = aiFeedbackDiv ? aiFeedbackDiv.innerText : '';
    if (!texto) return;

    navigator.clipboard.writeText(texto);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  const handleOuvirFeedback = () => {
    if (!('speechSynthesis' in window)) {
      alert('Seu navegador não suporta síntese de voz.');
      return;
    }

    if (falando) {
      window.speechSynthesis.cancel();
      setFalando(false);
      return;
    }

    const aiFeedbackDiv = document.getElementById('aiFeedback');
    const texto = aiFeedbackDiv ? aiFeedbackDiv.innerText : '';
    if (!texto) return;

    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(texto);
    utter.lang = 'pt-BR';
    utter.rate = 1.05;
    utter.pitch = 1.0;

    utter.onend = () => setFalando(false);
    utter.onerror = () => setFalando(false);

    setFalando(true);
    window.speechSynthesis.speak(utter);
  };

  const selecionarDoHistorico = (item: FeedbackRecord) => {
    const htmlResposta = item.texto.replace(/\n/g, '<br>');
    const finalHtml = `<div class="prose prose-invert max-w-none text-slate-100 leading-relaxed font-sans">${htmlResposta}</div>`;
    setFeedbackHtml(finalHtml);
  };

  return (
    <section className="bg-slate-900/80 rounded-2xl border border-slate-800 p-5 sm:p-6 backdrop-blur-md relative overflow-hidden shadow-2xl">
      {/* Decorative gradient glow */}
      <div className="absolute -top-24 -right-24 w-80 h-80 bg-[#64ffda]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-[#64ffda]/10 border border-[#64ffda]/30 text-[#64ffda]">
              <Sparkles className="w-4 h-4" />
            </span>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Coach de Produtividade com IA Gemini
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Análise comportamental das tarefas, identificação precisa de gargalos de tempo e direcionamento para amanhã.
          </p>
        </div>

        {/* Mode Selector */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setModoSelecionado('geral')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
              modoSelecionado === 'geral'
                ? 'bg-[#64ffda] text-slate-950 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Geral
          </button>
          <button
            onClick={() => setModoSelecionado('gargalos')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
              modoSelecionado === 'gargalos'
                ? 'bg-[#64ffda] text-slate-950 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Foco em Gargalos
          </button>
          <button
            onClick={() => setModoSelecionado('plano_amanha')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
              modoSelecionado === 'plano_amanha'
                ? 'bg-[#64ffda] text-slate-950 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Plano p/ Amanhã
          </button>
          <button
            onClick={() => setModoSelecionado('pomodoro')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
              modoSelecionado === 'pomodoro'
                ? 'bg-[#64ffda] text-slate-950 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Pomodoro
          </button>
        </div>
      </div>

      {/* Action CTA & sound notification note */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="w-2 h-2 rounded-full bg-[#64ffda] animate-ping" />
          <span>Analisa {tarefas.length} tarefas cadastradas • Notificação com som polifônico ativada</span>
        </div>

        <div className="flex items-center gap-2">
          {historico.length > 0 && (
            <button
              onClick={() => setMostrarHistorico(!mostrarHistorico)}
              className="px-3 py-2 rounded-xl text-xs font-medium bg-slate-950 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 flex items-center gap-1.5 transition"
            >
              <History className="w-3.5 h-3.5 text-[#64ffda]" />
              <span>Histórico ({historico.length})</span>
            </button>
          )}

          <button
            onClick={gerarFeedbackIA}
            disabled={carregando}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-lg ${
              carregando
                ? 'bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700'
                : 'bg-gradient-to-r from-[#64ffda] to-teal-400 text-slate-950 hover:brightness-110 shadow-[#64ffda]/20 active:scale-95'
            }`}
          >
            <Sparkles className={`w-4 h-4 ${carregando ? 'animate-spin' : ''}`} />
            <span>{carregando ? 'Calculando Gargalos...' : 'Gerar Feedback IA'}</span>
          </button>
        </div>
      </div>

      {/* History Drawer if toggled */}
      {mostrarHistorico && historico.length > 0 && (
        <div className="mb-4 p-3 rounded-xl bg-slate-950/90 border border-slate-800">
          <div className="text-xs font-semibold text-slate-300 mb-2 flex items-center justify-between">
            <span>Feedbacks Anteriores Salvos</span>
            <span className="text-[10px] text-slate-500">Clique para rever</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
            {historico.map((h) => (
              <button
                key={h.id}
                onClick={() => selecionarDoHistorico(h)}
                className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-[#64ffda]/50 text-left shrink-0 transition"
              >
                <div className="text-[10px] text-[#64ffda] font-mono font-medium">{h.data} • {h.modo}</div>
                <div className="text-xs text-slate-300 truncate max-w-[200px]">
                  {h.texto.slice(0, 45)}...
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Container Exato com id="aiFeedback" */}
      <div className="relative rounded-xl border border-slate-800/90 bg-slate-950/90 p-5 min-h-[140px] flex flex-col justify-between">
        
        {/* Exact target div as requested by the user */}
        <div
          id="aiFeedback"
          className="text-sm text-slate-300 leading-relaxed font-sans"
        >
          {/* Default initial guidance when no feedback has been generated yet */}
          <div className="py-3 text-center sm:text-left flex flex-col sm:flex-row items-center gap-3 text-slate-400">
            <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 text-[#64ffda]">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-300">
                Pronto para auditar sua rotina e otimizar seu tempo.
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Clique em <strong className="text-[#64ffda]">"Gerar Feedback IA"</strong> acima para disparar o acorde polifônico e obter uma análise clínica dos gargalos e estimativas.
              </p>
            </div>
          </div>
        </div>

        {/* Action toolbar if feedback is present */}
        {feedbackHtml && !carregando && !feedbackHtml.includes('ff5252') && (
          <div className="mt-4 pt-3 border-t border-slate-800/70 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-[11px]">Gerado pelo Gemini 3.8 Flash</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleOuvirFeedback}
                className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 flex items-center gap-1.5 transition"
                title="Ouvir o feedback narrado"
              >
                {falando ? (
                  <>
                    <Square className="w-3 h-3 text-rose-400" />
                    <span>Parar Voz</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3 h-3 text-[#64ffda]" />
                    <span>Ouvir</span>
                  </>
                )}
              </button>

              <button
                onClick={handleCopiar}
                className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 flex items-center gap-1.5 transition"
                title="Copiar feedback"
              >
                {copiado ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 text-slate-400" />
                    <span>Copiar</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
