import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

const STORAGE_KEY = 'redakids_sound_enabled';

const SoundContext = createContext(null);

/**
 * Provider único de sonido. Mantiene una sola fuente de verdad para
 * `soundEnabled` (persistida en localStorage) y expone los disparadores de
 * sonido. Al montarse una sola vez en App.jsx, el toggle queda sincronizado
 * en toda la app (Header y juegos) y el "silenciar" funciona de verdad.
 */
export const SoundProvider = ({ children }) => {
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved !== null ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(soundEnabled));
  }, [soundEnabled]);

  const toggleSound = useCallback(() => setSoundEnabled(prev => !prev), []);

  const playSound = useCallback((filename) => {
    if (!soundEnabled) return;
    const audio = new Audio(`/sounds/${filename}?v=${Date.now()}`);
    audio.play().catch(err => console.log('Error al reproducir sonido:', err));
  }, [soundEnabled]);

  const playSuccess = useCallback(() => playSound('acierto.mp3'), [playSound]);
  const playError = useCallback(() => playSound('error.mp3'), [playSound]);
  const playVictory = useCallback(() => playSound('victoria.mp3'), [playSound]);

  const value = useMemo(() => ({
    soundEnabled,
    toggleSound,
    playSuccess,
    playError,
    playVictory,
  }), [soundEnabled, toggleSound, playSuccess, playError, playVictory]);

  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useSound = () => {
  const ctx = useContext(SoundContext);
  if (ctx === null) {
    throw new Error('useSound debe usarse dentro de <SoundProvider>');
  }
  return ctx;
};
