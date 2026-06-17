import { useSound } from '../../../context/SoundContext';
import './SoundToggle.css';

/**
 * Botón reusable de silenciar/activar sonidos. Consume el estado compartido
 * de `useSound`, por lo que funciona igual desde el Header global o desde
 * dentro de un juego. Reemplaza los estilos inline duplicados que había en
 * cada juego.
 */
const SoundToggle = ({ className = '' }) => {
  const { soundEnabled, toggleSound } = useSound();
  const label = soundEnabled ? 'Silenciar sonidos' : 'Activar sonidos';

  return (
    <button
      type="button"
      onClick={toggleSound}
      className={`sound-toggle ${soundEnabled ? '' : 'sound-toggle--muted'} ${className}`.trim()}
      title={label}
      aria-label={label}
      aria-pressed={!soundEnabled}
    >
      <span aria-hidden="true">{soundEnabled ? '🔊' : '🔇'}</span>
    </button>
  );
};

export default SoundToggle;
