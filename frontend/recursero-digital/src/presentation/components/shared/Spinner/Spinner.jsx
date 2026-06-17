import './Spinner.css';

/**
 * Spinner de carga reusable. Reemplaza los textos "Cargando..." sueltos.
 * CSS autocontenido (no depende de Tailwind ni de CSS de otros componentes).
 *
 * @param {string} [label]    Texto opcional debajo del spinner (ej. "Cargando juegos...").
 * @param {number} [size]     Diámetro en px del círculo (default 40).
 * @param {string} [className] Clases extra para el contenedor.
 */
const Spinner = ({ label, size = 40, className = '' }) => {
  return (
    <div
      className={`spinner-loader ${className}`.trim()}
      role="status"
      aria-live="polite"
      aria-label={label || 'Cargando'}
    >
      <span
        className="spinner-loader__circle"
        style={{ width: size, height: size }}
        aria-hidden="true"
      />
      {label && <p className="spinner-loader__label">{label}</p>}
    </div>
  );
};

export default Spinner;
