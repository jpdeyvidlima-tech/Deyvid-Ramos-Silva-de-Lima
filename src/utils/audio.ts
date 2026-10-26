/**
 * Sistema de Áudio Polifônico Inspirador com Web Audio API
 * Toca um acorde etéreo, brilhante e motivador para notificações de IA
 */

let audioCtx: AudioContext | null = null;
let somHabilitado = true;

function obterAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function alternarSom(habilitado?: boolean): boolean {
  if (typeof habilitado === 'boolean') {
    somHabilitado = habilitado;
  } else {
    somHabilitado = !somHabilitado;
  }
  return somHabilitado;
}

export function isSomHabilitado(): boolean {
  return somHabilitado;
}

/**
 * Toca o som polifônico inspirador de notificação da IA
 */
export function tocarSomIA(): void {
  if (!somHabilitado) return;

  try {
    const ctx = obterAudioContext();
    const agora = ctx.currentTime;

    // Frequências do acorde polifônico inspirador: Cmaj9 com brilho (C5, G5, B5, D6, E6)
    const frequencias = [523.25, 783.99, 987.77, 1174.66, 1318.51, 1567.98];

    // Master bus com filtro suave para aquecimento
    const masterGain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(3800, agora);
    filter.frequency.exponentialRampToValueAtTime(1200, agora + 2.2);

    masterGain.gain.setValueAtTime(0.35, agora);
    masterGain.connect(filter);
    filter.connect(ctx.destination);

    // Tocar cada nota com leve arpejo e decay orgânico
    frequencias.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const oscHarmonic = ctx.createOscillator();
      const noteGain = ctx.createGain();

      const delayNota = agora + index * 0.045; // Arpejo de 45ms
      const duracao = 1.8 + index * 0.15; // Notas mais altas ressoam com brilho

      // Forma de onda: Senoidal pura para harmonia rica + Senoidal na oitava superior suave
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, delayNota);

      oscHarmonic.type = 'triangle';
      oscHarmonic.frequency.setValueAtTime(freq * 2, delayNota);

      // Envelope de amplitude: ataque suave de 12ms e decay exponencial inspirador
      noteGain.gain.setValueAtTime(0.0001, delayNota);
      noteGain.gain.linearRampToValueAtTime(0.18 / (1 + index * 0.15), delayNota + 0.02);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, delayNota + duracao);

      osc.connect(noteGain);
      oscHarmonic.connect(noteGain);
      noteGain.connect(masterGain);

      osc.start(delayNota);
      oscHarmonic.start(delayNota);

      osc.stop(delayNota + duracao);
      oscHarmonic.stop(delayNota + duracao);
    });

    // Adiciona um chime brilhante de campainha de cristal (2093 Hz - C7)
    const chimeOsc = ctx.createOscillator();
    const chimeGain = ctx.createGain();
    const chimeTime = agora + 0.22;

    chimeOsc.type = 'sine';
    chimeOsc.frequency.setValueAtTime(2093, chimeTime);
    chimeGain.gain.setValueAtTime(0.0001, chimeTime);
    chimeGain.gain.linearRampToValueAtTime(0.08, chimeTime + 0.01);
    chimeGain.gain.exponentialRampToValueAtTime(0.0001, chimeTime + 1.2);

    chimeOsc.connect(chimeGain);
    chimeGain.connect(masterGain);

    chimeOsc.start(chimeTime);
    chimeOsc.stop(chimeTime + 1.2);

  } catch (error) {
    console.warn('Não foi possível reproduzir som polifônico:', error);
  }
}
