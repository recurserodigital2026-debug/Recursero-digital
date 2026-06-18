import React, { useState, useMemo } from 'react';
import '../../styles/pages/adminTeachers.css';
import ListControls from '../../components/shared/ListControls';

export default function AdminTeachers({ teachers = [], onEdit, onToggleStatus }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('activo');
  const [sortBy, setSortBy] = useState('nombre-asc');

  const filteredTeachers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const result = teachers.filter(teacher => {
      const matchesSearch = term === '' ||
        teacher.name.toLowerCase().includes(term) ||
        (teacher.email || '').toLowerCase().includes(term);
      const isActive = teacher.enable !== false;
      const matchesStatus = statusFilter === 'todos' ||
        (statusFilter === 'activo' && isActive) ||
        (statusFilter === 'inactivo' && !isActive);
      return matchesSearch && matchesStatus;
    });

    result.sort((a, b) =>
      sortBy === 'nombre-desc'
        ? b.name.localeCompare(a.name)
        : a.name.localeCompare(b.name)
    );

    return result;
  }, [teachers, searchTerm, statusFilter, sortBy]);

  if (!teachers || teachers.length === 0) {
    return (
      <div className="admin-teachers">
        <p>No hay docentes registrados</p>
      </div>
    );
  }

  return (
    <div className="admin-teachers">

      <div className="teachers-content">
        <ListControls
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Nombre o email..."
          filters={[
            {
              label: 'Estado',
              value: statusFilter,
              onChange: setStatusFilter,
              options: [
                { label: 'Todos', value: 'todos' },
                { label: 'Activos', value: 'activo' },
                { label: 'Inactivos', value: 'inactivo' },
              ],
            },
          ]}
          sort={{
            value: sortBy,
            onChange: setSortBy,
            options: [
              { label: 'Nombre (A-Z)', value: 'nombre-asc' },
              { label: 'Nombre (Z-A)', value: 'nombre-desc' },
            ],
          }}
        />

        <div className="teachers-grid">
          {filteredTeachers.length === 0 ? (
            <p className="no-results">No se encontraron docentes con los criterios de búsqueda</p>
          ) : (
            filteredTeachers.map(teacher => (
              <div key={teacher.id} className="teacher-card">
                <div className="teacher-header">
                  <h3>{teacher.name}</h3>
                </div>
                <div className="teacher-info">
                  <p><strong>Email:</strong> {teacher.email}</p>
                  <p><strong>Username:</strong> {teacher.username}</p>
                  <div className="teacher-metrics">
                    <div className="metric">
                      <span className="metric-value">{teacher.courses?.length || 0}</span>
                      <span className="metric-label">Cursos</span>
                    </div>
                    <div className="metric">
                      <span className="metric-value">{teacher.students?.length || 0}</span>
                      <span className="metric-label">Estudiantes</span>
                    </div>
                  </div>
                </div>
                <div className="teacher-actions">
                  <button 
                    className="edit-boton" 
                    onClick={() => onEdit && onEdit(teacher)}
                  >
                    Editar
                  </button>
                  <button 
                    className={teacher.enable === false ? "activate-boton" : "delete-boton"} 
                    onClick={() => onToggleStatus && onToggleStatus(teacher)}
                  >
                    {teacher.enable === false ? "Activar" : "Desactivar"}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}