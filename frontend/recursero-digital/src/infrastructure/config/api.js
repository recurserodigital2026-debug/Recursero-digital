import toast from 'react-hot-toast';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://recurserodigital-gzad.onrender.com/api';

export const AUTH_ENDPOINTS = {
  LOGIN_STUDENT: '/login/student',
  LOGIN_TEACHER: '/login/teacher',
  LOGIN_ADMIN: '/login/admin',
  LOGOUT: '/logout'
};

export const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;

  // `silent: true` permite al caller manejar el error él mismo (sin toast global).
  const { silent = false, ...fetchOptions } = options;

  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const token = localStorage.getItem('token');
  if (token) {
    defaultOptions.headers.Authorization = `Bearer ${token}`;
  }

  const config = {
    ...defaultOptions,
    ...fetchOptions,
    headers: {
      ...defaultOptions.headers,
      ...fetchOptions.headers,
    },
    credentials: 'include',
  };

  try {
    const response = await fetch(url, config);
    
    let data;
    const contentType = response.headers.get('content-type');
    
    const responseClone = response.clone();
    
    if (contentType && contentType.includes('application/json')) {
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error('Error al parsear JSON:', jsonError);
        const text = await responseClone.text();
        console.error('Respuesta del servidor (texto):', text);
        data = { error: 'Error al parsear la respuesta del servidor' };
      }
    } else {
      const text = await response.text();
      console.error('Respuesta no es JSON:', text);
      data = { error: 'La respuesta del servidor no es JSON válido' };
    }
    
    // Errores de servidor (5xx) se notifican de forma centralizada. Los 4xx
    // (validación / credenciales) los maneja cada caller en su propio flujo.
    if (!response.ok && response.status >= 500 && !silent) {
      toast.error(data?.error || 'Ocurrió un error en el servidor. Intentá de nuevo.');
    }

    return {
      ok: response.ok,
      status: response.status,
      data
    };
  } catch (error) {
    console.error('Error en la petición API:', error);
    if (!silent) {
      toast.error('No se pudo conectar con el servidor. Revisá tu conexión.');
    }
    throw error;
  }
};
