# Spanish Localization Strategy

## iOS Localization Implementation

### String Resources Management
```swift
// Localizable.strings (Spanish - es.lproj)
/* Authentication */
"auth.login.title" = "Iniciar Sesión";
"auth.login.email.placeholder" = "Correo electrónico";
"auth.login.password.placeholder" = "Contraseña";
"auth.login.button" = "Iniciar Sesión";
"auth.register.title" = "Crear Cuenta";
"auth.anonymous.title" = "Reportar de Forma Anónima";
"auth.anonymous.description" = "Puedes reportar incidentes sin crear una cuenta";
"auth.choose.title" = "¿Cómo deseas continuar?";

/* Report Form */
"report.form.title" = "Reportar Incidente";
"report.attack_type.label" = "Tipo de Ataque";
"report.attack_type.email" = "Correo Electrónico";
"report.attack_type.sms" = "SMS";
"report.attack_type.whatsapp" = "WhatsApp";
"report.attack_type.call" = "Llamada Telefónica";
"report.attack_type.social" = "Redes Sociales";
"report.attack_type.other" = "Otro";

"report.origin.label" = "Origen del Ataque";
"report.origin.placeholder" = "Número de teléfono o email del atacante";
"report.date.label" = "Fecha del Incidente";
"report.time.label" = "Hora del Incidente";
"report.url.label" = "URL Sospechosa";
"report.url.placeholder" = "https://sitio-sospechoso.com";
"report.message.label" = "Mensaje del Atacante";
"report.message.placeholder" = "Contenido del mensaje recibido";

"report.impact.label" = "Nivel de Impacto";
"report.impact.none" = "Sin Impacto";
"report.impact.data_theft" = "Robo de Datos";
"report.impact.money_theft" = "Robo de Dinero";
"report.impact.account_compromise" = "Cuenta Comprometida";

"report.description.label" = "Descripción Detallada";
"report.description.placeholder" = "Describe qué sucedió y cómo te afectó";
"report.attachments.label" = "Archivos Adjuntos";
"report.submit.button" = "Enviar Reporte";

/* Community */
"community.trends.title" = "Tendencias de Amenazas";
"community.trends.period.7days" = "Últimos 7 días";
"community.trends.period.30days" = "Últimos 30 días";
"community.trends.period.90days" = "Últimos 90 días";
"community.recommendations.title" = "Recomendaciones de Seguridad";
"community.support.title" = "Recursos de Apoyo";

/* Error Messages */
"error.network" = "Error de conexión a internet";
"error.auth_required" = "Debes iniciar sesión para continuar";
"error.invalid_credentials" = "Email o contraseña incorrectos";
"error.invalid_email" = "Formato de email inválido";
"error.invalid_phone" = "Formato de teléfono inválido";
"error.invalid_url" = "URL inválida";
"error.file_size_exceeded" = "El archivo es demasiado grande (máximo 10MB)";
"error.upload_failed" = "Error al subir el archivo";
"error.report_submission_failed" = "Error al enviar el reporte";
"error.required_field" = "Este campo es obligatorio";

/* Success Messages */
"success.report_submitted" = "Reporte enviado exitosamente";
"success.login" = "Sesión iniciada correctamente";
"success.registration" = "Cuenta creada exitosamente";
```

### Localization Helper Class
```swift
// LocalizationManager.swift
import Foundation

class LocalizationManager {
    static let shared = LocalizationManager()
    
    private init() {}
    
    func localizedString(_ key: String, comment: String = "") -> String {
        return NSLocalizedString(key, comment: comment)
    }
    
    // Convenience methods for common localizations
    func errorMessage(_ key: String) -> String {
        return localizedString("error.\(key)")
    }
    
    func successMessage(_ key: String) -> String {
        return localizedString("success.\(key)")
    }
    
    func authString(_ key: String) -> String {
        return localizedString("auth.\(key)")
    }
    
    func reportString(_ key: String) -> String {
        return localizedString("report.\(key)")
    }
    
    func communityString(_ key: String) -> String {
        return localizedString("community.\(key)")
    }
}

// Extension for easy access
extension String {
    var localized: String {
        return LocalizationManager.shared.localizedString(self)
    }
    
    func localized(comment: String) -> String {
        return NSLocalizedString(self, comment: comment)
    }
}

// Usage in SwiftUI Views
struct ReportFormView: View {
    var body: some View {
        Form {
            Section(header: Text("report.form.title".localized)) {
                TextField("report.origin.placeholder".localized, text: $reportForm.attackOrigin)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                
                Picker("report.attack_type.label".localized, selection: $reportForm.attackType) {
                    ForEach(AttackType.allCases, id: \.self) { type in
                        Text(type.localizedName).tag(type)
                    }
                }
            }
        }
        .navigationTitle("report.form.title".localized)
    }
}
```

## Next.js Internationalization

### i18n Configuration
```typescript
// i18n/config.ts
export const locales = ['es'] as const
export const defaultLocale = 'es' as const
export type Locale = (typeof locales)[number]

// messages/es.json
{
  "auth": {
    "login": {
      "title": "Iniciar Sesión",
      "email": "Correo electrónico",
      "password": "Contraseña",
      "button": "Iniciar Sesión",
      "forgot_password": "¿Olvidaste tu contraseña?"
    },
    "errors": {
      "invalid_credentials": "Email o contraseña incorrectos",
      "session_expired": "Sesión expirada. Por favor, inicia sesión nuevamente",
      "access_denied": "No tienes permisos para acceder a esta sección"
    }
  },
  "dashboard": {
    "title": "Panel de Control",
    "metrics": {
      "total_reports": "Total de Reportes",
      "reports_today": "Reportes Hoy",
      "critical_reports": "Reportes Críticos",
      "pending_review": "Pendientes de Revisión"
    },
    "recent_activity": "Actividad Reciente",
    "view_all": "Ver Todos"
  },
  "reports": {
    "title": "Gestión de Reportes",
    "search_placeholder": "Buscar reportes...",
    "filters": {
      "status": "Estado",
      "attack_type": "Tipo de Ataque",
      "impact_level": "Nivel de Impacto",
      "date_range": "Rango de Fechas",
      "apply": "Aplicar Filtros",
      "clear": "Limpiar Filtros"
    },
    "status": {
      "nuevo": "Nuevo",
      "revisado": "Revisado",
      "en_investigacion": "En Investigación",
      "cerrado": "Cerrado"
    },
    "actions": {
      "view_details": "Ver Detalles",
      "update_status": "Actualizar Estado",
      "add_notes": "Agregar Notas",
      "download_attachments": "Descargar Adjuntos"
    },
    "details": {
      "report_id": "ID del Reporte",
      "submission_date": "Fecha de Envío",
      "attack_origin": "Origen del Ataque",
      "impact_assessment": "Evaluación de Impacto",
      "description": "Descripción",
      "attachments": "Archivos Adjuntos",
      "investigation_notes": "Notas de Investigación"
    }
  },
  "analytics": {
    "title": "Análisis y Estadísticas",
    "trends": {
      "attack_types": "Tipos de Ataque más Comunes",
      "timeline": "Línea de Tiempo de Incidentes",
      "impact_distribution": "Distribución por Nivel de Impacto",
      "geographic_distribution": "Distribución Geográfica"
    },
    "periods": {
      "7days": "Últimos 7 días",
      "30days": "Últimos 30 días",
      "90days": "Últimos 90 días",
      "1year": "Último año"
    }
  },
  "common": {
    "loading": "Cargando...",
    "error": "Ha ocurrido un error",
    "retry": "Reintentar",
    "cancel": "Cancelar",
    "save": "Guardar",
    "edit": "Editar",
    "delete": "Eliminar",
    "confirm": "Confirmar",
    "back": "Volver",
    "next": "Siguiente",
    "previous": "Anterior",
    "close": "Cerrar",
    "search": "Buscar",
    "filter": "Filtrar",
    "export": "Exportar",
    "download": "Descargar",
    "upload": "Subir",
    "success": "Operación exitosa",
    "warning": "Advertencia",
    "info": "Información"
  },
  "validation": {
    "required": "Este campo es obligatorio",
    "invalid_email": "Formato de email inválido",
    "min_length": "Debe tener al menos {min} caracteres",
    "max_length": "No puede exceder {max} caracteres",
    "invalid_url": "URL inválida",
    "file_size_exceeded": "El archivo excede el tamaño máximo permitido",
    "invalid_file_type": "Tipo de archivo no permitido"
  }
}
```

### Translation Hook Implementation
```typescript
// hooks/useTranslation.ts
import { useRouter } from 'next/router'
import es from '@/messages/es.json'

type Messages = typeof es
type NestedKeyOf<ObjectType extends object> = {
  [Key in keyof ObjectType & (string | number)]: ObjectType[Key] extends object
    ? `${Key}` | `${Key}.${NestedKeyOf<ObjectType[Key]>}`
    : `${Key}`
}[keyof ObjectType & (string | number)]

type MessageKeys = NestedKeyOf<Messages>

export function useTranslation() {
  const { locale } = useRouter()
  const messages = es // Only Spanish for this project
  
  const t = (key: MessageKeys, params?: Record<string, string | number>): string => {
    const keys = key.split('.')
    let value: any = messages
    
    for (const k of keys) {
      value = value?.[k]
      if (value === undefined) {
        console.warn(`Translation key not found: ${key}`)
        return key
      }
    }
    
    if (typeof value !== 'string') {
      console.warn(`Translation value is not a string: ${key}`)
      return key
    }
    
    // Replace parameters in the string
    if (params) {
      return Object.entries(params).reduce(
        (str, [paramKey, paramValue]) => 
          str.replace(`{${paramKey}}`, String(paramValue)),
        value
      )
    }
    
    return value
  }
  
  return { t, locale: locale || 'es' }
}

// Usage in components
export function LoginForm() {
  const { t } = useTranslation()
  
  return (
    <form>
      <h1>{t('auth.login.title')}</h1>
      <input
        type="email"
        placeholder={t('auth.login.email')}
        required
      />
      <input
        type="password"
        placeholder={t('auth.login.password')}
        required
      />
      <button type="submit">
        {t('auth.login.button')}
      </button>
    </form>
  )
}
```
