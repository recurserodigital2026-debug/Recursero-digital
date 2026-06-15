import { useState, useEffect } from 'react';

export const useSoundEffects = () => {
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem('redakids_sound_enabled');
    return saved !== null ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    localStorage.setItem('redakids_sound_enabled', JSON.stringify(soundEnabled));
  }, [soundEnabled]);

  const toggleSound = () => setSoundEnabled(!soundEnabled);

  const playSound = (filename) => {
    if (!soundEnabled) return; 
    
    const audio = new Audio(`/sounds/${filename}?v=${new Date().getTime()}`);
    audio.play().catch(err => console.log("Error al reproducir sonido:", err));
  };

  const playSuccess = () => playSound('acierto.mp3');
  const playError = () => playSound('error.mp3');
  const playVictory = () => playSound('victoria.mp3');

  return {
    soundEnabled,
    toggleSound,
    playSuccess,
    playError,
    playVictory
  };
};