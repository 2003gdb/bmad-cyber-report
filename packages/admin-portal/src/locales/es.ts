// Spanish Localization for Admin Portal

export const es = {
  // Authentication
  login: {
    title: 'Acceso Administrativo',
    subtitle: 'Panel de Control SafeTrade',
    email: 'Correo Electrónico',
    password: 'Contraseña',
    loginButton: 'Iniciar Sesión',
    invalidCredentials: 'Credenciales inválidas',
    errorLogin: 'Error al iniciar sesión',
    emailRequired: 'El correo electrónico es requerido',
    passwordRequired: 'La contraseña es requerida',
    emailInvalid: 'Formato de correo electrónico inválido',
    goToRegister: '¿No tienes cuenta? Regístrate aquí',
    goToLogin: '¿Ya tienes cuenta? Inicia sesión aquí'
  },

  // Registration
  register: {
    title: 'Registro de Administrador',
    subtitle: 'Crear nueva cuenta administrativa',
    email: 'Correo Electrónico',
    password: 'Contraseña',
    passwordConfirm: 'Confirmar Contraseña',
    registerButton: 'Registrar Administrador',
    errorRegister: 'Error al registrar administrador',
    successRegister: 'Administrador registrado exitosamente',
    emailRequired: 'El correo electrónico es requerido',
    passwordRequired: 'La contraseña es requerida',
    passwordConfirmRequired: 'La confirmación de contraseña es requerida',
    emailInvalid: 'Formato de correo electrónico inválido',
    passwordMinLength: 'La contraseña debe tener al menos 8 caracteres',
    passwordMismatch: 'Las contraseñas no coinciden',
    adminExists: 'Ya existe un administrador con este correo'
  },

  // Dashboard
  dashboard: {
    title: 'Panel de Control',
    welcome: 'Bienvenido al Panel Administrativo',
    metrics: {
      totalReports: 'Total de Reportes',
      reportsToday: 'Reportes Hoy',
      criticalReports: 'Reportes Críticos',
      recentTrends: 'Tendencias Recientes'
    },
    noData: 'No hay datos disponibles',
    loadingData: 'Cargando datos...'
  },

  // Reports
  reports: {
    title: 'Gestión de Reportes',
    listTitle: 'Lista de Reportes',
    detailTitle: 'Detalle del Reporte',
    noReports: 'No se encontraron reportes',
    searchPlaceholder: 'Buscar reportes...',
    filterByStatus: 'Filtrar por estado',
    filterByAttackType: 'Filtrar por tipo de ataque',
    pagination: {
      previous: 'Anterior',
      next: 'Siguiente',
      of: 'de',
      results: 'resultados'
    },
    columns: {
      id: 'ID',
      attackType: 'Tipo de Ataque',
      incidentDate: 'Fecha del Incidente',
      impactLevel: 'Nivel de Impacto',
      status: 'Estado',
      isAnonymous: 'Anónimo',
      location: 'Ubicación',
      createdAt: 'Fecha de Creación',
      actions: 'Acciones'
    },
    status: {
      pendiente: 'Pendiente',
      en_revision: 'En Revisión',
      resuelto: 'Resuelto',
      cerrado: 'Cerrado'
    },
    attackTypes: {
      phishing: 'Phishing',
      malware: 'Malware',
      fraude: 'Fraude',
      robo_identidad: 'Robo de Identidad',
      otro: 'Otro'
    },
    impactLevels: {
      bajo: 'Bajo',
      medio: 'Medio',
      alto: 'Alto',
      critico: 'Crítico'
    },
    actions: {
      view: 'Ver',
      edit: 'Editar',
      updateStatus: 'Actualizar Estado',
      addNotes: 'Agregar Notas'
    }
  },

  // Common
  common: {
    loading: 'Cargando...',
    error: 'Error',
    success: 'Éxito',
    cancel: 'Cancelar',
    save: 'Guardar',
    delete: 'Eliminar',
    edit: 'Editar',
    view: 'Ver',
    search: 'Buscar',
    filter: 'Filtrar',
    clear: 'Limpiar',
    yes: 'Sí',
    no: 'No',
    logout: 'Cerrar Sesión',
    back: 'Regresar',
    home: 'Inicio',
    dashboard: 'Panel de Control',
    reports: 'Reportes',
    settings: 'Configuración'
  },

  // Errors
  errors: {
    networkError: 'Error de conexión de red',
    unauthorized: 'No autorizado. Por favor, inicie sesión nuevamente',
    forbidden: 'No tiene permisos para realizar esta acción',
    notFound: 'Recurso no encontrado',
    serverError: 'Error interno del servidor',
    unknown: 'Error desconocido'
  }
};