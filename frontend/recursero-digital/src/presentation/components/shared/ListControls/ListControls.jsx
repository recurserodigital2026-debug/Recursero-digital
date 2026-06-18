import React from "react";
import "./ListControls.css";

/**
 * Barra reusable de controles para listas de administración:
 * búsqueda de texto + filtros (selects) + orden (select).
 *
 * Props:
 * - searchValue, onSearchChange, searchPlaceholder: caja de búsqueda.
 * - filters: array de { label, value, onChange, options: [{ label, value }] }.
 * - sort: { label?, value, onChange, options: [{ label, value }] }.
 *
 * Sólo UI; la lógica de filtrado/orden vive en cada página (useMemo).
 */
export default function ListControls({
  searchValue = "",
  onSearchChange,
  searchPlaceholder = "Buscar...",
  filters = [],
  sort = null,
}) {
  return (
    <div className="list-controls">
      {onSearchChange && (
        <div className="list-control-group list-control-search">
          <label>Buscar</label>
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      )}

      {filters.map((filter) => (
        <div className="list-control-group" key={filter.label}>
          <label>{filter.label}</label>
          <select
            value={filter.value}
            onChange={(e) => filter.onChange(e.target.value)}
          >
            {filter.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      ))}

      {sort && (
        <div className="list-control-group">
          <label>{sort.label || "Ordenar por"}</label>
          <select value={sort.value} onChange={(e) => sort.onChange(e.target.value)}>
            {sort.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
