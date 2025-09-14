# SafeTrade Admin Portal

Portal de administración web para la plataforma SafeTrade de reportes de ciberseguridad.

## Características

- **Next.js 13.4.0** con App Router
- **TypeScript** con tipos estrictos
- **Tailwind CSS** para estilos
- **Interfaz en Español** - Todos los textos en español
- **Responsive Design** - Compatible con dispositivos móviles y desktop

## Configuración

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Configurar variables de entorno:**
   ```bash
   cp .env.local.example .env.local
   # Editar .env.local con las configuraciones correctas
   ```

3. **Iniciar servidor de desarrollo:**
   ```bash
   npm run dev
   ```

   La aplicación estará disponible en http://localhost:3001

## Scripts Disponibles

- `npm run dev` - Servidor de desarrollo (puerto 3001)
- `npm run build` - Construir para producción
- `npm run start` - Iniciar en modo producción
- `npm run lint` - Ejecutar ESLint
- `npm run type-check` - Verificar tipos TypeScript

## Variables de Entorno

```bash
# API Backend
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1

# Aplicación  
NEXT_PUBLIC_APP_NAME=SafeTrade Admin Portal
NODE_ENV=development

# Autenticación
JWT_SECRET=[mismo_secreto_que_backend]
```

## Estructura del Proyecto

```
src/
├── app/                    # Next.js 13 App Router
│   ├── login/             # Página de login
│   ├── dashboard/         # Panel principal
│   ├── reports/           # Gestión de reportes
│   ├── analytics/         # Analíticas
│   ├── layout.tsx         # Layout principal
│   └── page.tsx           # Página de inicio
├── components/            # Componentes React
│   ├── auth/             # Componentes de autenticación
│   ├── dashboard/        # Componentes del dashboard
│   ├── reports/          # Componentes de reportes
│   ├── analytics/        # Componentes de analíticas
│   └── shared/           # Componentes compartidos
├── lib/                  # Utilidades y configuraciones
├── types/               # Definiciones de tipos TypeScript
└── styles/              # Estilos CSS/Tailwind
```

## Funcionalidades Implementadas

✅ **Configuración Inicial**
- Estructura de proyecto Next.js 13
- Configuración TypeScript estricta
- Configuración Tailwind CSS
- Variables de entorno configuradas

🔄 **Próximas Implementaciones** (Próximas historias)
- Sistema de autenticación de administradores
- Dashboard con métricas de reportes
- Gestión y moderación de reportes
- Paneles de analíticas y tendencias
- Interfaz para cambio de estado de reportes

## Consideraciones de Seguridad

- **Autenticación Requerida:** Todas las rutas protegidas requieren autenticación admin
- **Validación de Sesiones:** Verificación JWT en cada solicitud
- **Datos Sensibles:** No se muestran datos personales de reportes anónimos
- **HTTPS en Producción:** Uso obligatorio de HTTPS en ambiente de producción

## Desarrollo

Para agregar nuevas funcionalidades:

1. Crear componentes en la carpeta correspondiente
2. Definir tipos en `src/types/`
3. Usar rutas en español para consistencia
4. Seguir las convenciones de Next.js 13
5. Mantener compatibilidad con TypeScript estricto

## Testing

Los tests se implementarán en próximas historias. Framework recomendado:
- **Jest** para pruebas unitarias
- **React Testing Library** para pruebas de componentes
- **Cypress** para pruebas e2e