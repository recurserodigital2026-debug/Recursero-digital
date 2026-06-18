import React from "react";
import "./ConfirmModal.css";

/**
 * Modal de confirmación reusable para acciones destructivas o importantes.
 *
 * Props:
 * - title: título del modal.
 * - message: texto principal (puede ser string o nodo).
 * - confirmLabel: texto del botón de confirmación (def. "Eliminar").
 * - cancelLabel: texto del botón de cancelar (def. "Cancelar").
 * - onConfirm, onClose: callbacks.
 * - danger: si es true, el botón de confirmar se muestra en rojo.
 * - loading: deshabilita los botones mientras se procesa.
 */
export default function ConfirmModal({
  title,
  message,
  confirmLabel = "Eliminar",
  cancelLabel = "Cancelar",
  onConfirm,
  onClose,
  danger = false,
  loading = false,
}) {
  return (
    <div className="confirm-overlay" onClick={onClose}>
      <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-header">
          <h2>{title}</h2>
          <button className="confirm-close-btn" onClick={onClose} disabled={loading}>
            ×
          </button>
        </div>

        <div className="confirm-body">
          <p className="confirm-message">{message}</p>

          <div className="confirm-buttons">
            <button
              type="button"
              className="confirm-cancel-btn"
              onClick={onClose}
              disabled={loading}
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              className={`confirm-accept-btn${danger ? " danger" : ""}`}
              onClick={onConfirm}
              disabled={loading}
            >
              {loading ? "Procesando..." : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
