import React, { useState } from 'react';
import { Sparkles, Volume2, VolumeX, RotateCcw, Music, Zap } from 'lucide-react';
import { tocarSomIA, alternarSom, isSomHabilitado } from '../utils/audio';

interface NavbarProps {
  onResetData: () => void;
  tarefasCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({ onResetData, tarefasCount }) => {
  const [audioAtivo, setAudioAtivo] = useState(isSomHabilitado());
  const [somTocando, setSomTocando] = useState(false);

  const handleToggleAudio = () => {
    const novo = alternarSom();
    setAudioAtivo(novo);
  };

  const handleTestarSom = () => {
    setSomTocando(true);
    tocarSomIA();
    setTimeout(() => setSomTocando(false), 2200);
  };

  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Logo & Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#64ffda] via-teal-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-[#64ffda]/20 ring-1 ring-[#64ffda]/40">
            <Sparkles className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base sm:text-lg tracking-tight text-white">
                Gemini Coach
              </span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-[#64ffda]/10 text-[#64ffda] border border-[#64ffda]/30 font-semibold">
                3.8 Flash
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Gestão de Produtividade & Análise de Gargalos
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Test Chime Button */}
          <button
            onClick={handleTestarSom}
            title="Tocar som polifônico inspirador de notificação"
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all ${
              somTocando
                ? 'bg-[#64ffda]/20 border-[#64ffda] text-[#64ffda] ring-2 ring-[#64ffda]/30 scale-105'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
            }`}
          >
            <Music className={`w-3.5 h-3.5 text-[#64ffda] ${somTocando ? 'animate-bounce' : ''}`} />
            <span className="hidden md:inline">Testar Som Inspirador</span>
            <span className="md:hidden">Som</span>
          </button>

          {/* Audio Mute/Unmute */}
          <button
            onClick={handleToggleAudio}
            title={audioAtivo ? 'Silenciar som da IA' : 'Ativar som da IA'}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition"
          >
            {audioAtivo ? (
              <Volume2 className="w-4 h-4 text-[#64ffda]" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-500" />
            )}
          </button>

          {/* Reset to initial data */}
          <button
            onClick={onResetData}
            title="Recarregar tarefas de exemplo"
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 text-xs font-medium flex items-center gap-1.5 transition"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Exemplo ({tarefasCount})</span>
          </button>
        </div>

      </div>
    </header>
  );
};
