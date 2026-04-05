# Plan de Desarrollo: Productivity XP

## Visión general

Evolucionar Productivity XP de un proyecto educativo de fundamentos frontend a una herramienta completa de productividad y salud para desarrolladores. La app debe funcionar como un "developer life dashboard" donde el usuario pueda gestionar su trabajo, tiempo, finanzas, salud y bienestar desde un solo lugar, con UX mobile first.

Es importante entender que este plan de desarrollo es una estimación basada en las funcionalidades propuestas y la complejidad técnica de cada módulo. Las duraciones pueden variar según los desafíos que surjan durante la implementación, pero el objetivo es tener una guía clara para organizar el trabajo y priorizar funcionalidades.

De momento mi objetivo es tener una herramienta de uso diario, así que el enfoque está en funcionalidades que aporten valor inmediato al usuario, con una curva de aprendizaje suave y una experiencia agradable. Las fases están diseñadas para construir sobre la base de la anterior, asegurando que cada módulo nuevo se integre de forma coherente con el sistema existente.

El desarrollo se divide en **5 fases**, cada una construyendo sobre la anterior. Las primeras dos fases son de cimentación (arquitectura + infraestructura), y las tres restantes agregan funcionalidad nueva.

> **Nota importante:** Aunque el plan es ambicioso, es fundamental mantener la flexibilidad. Al inicio para iniciar el plan es necesario terminar el soporte i18n para tener la aplicación completamente en español, y luego enfocarse en la Fase 1 de refactorización. Es posible que durante la Fase 1 se identifiquen mejoras o cambios necesarios que afecten el plan original, y eso está bien. El objetivo es tener una base sólida para poder iterar rápidamente en las funcionalidades nuevas sin que el código se vuelva inmanejable.

---

## Fase 1: Refactorización y Arquitectura Modular

**Duración estimada:** 2 semanas
**Objetivo:** Desmontar el monolito `app.js` (3,400+ líneas) y establecer la base sobre la que se construirán todos los módulos nuevos.

> Esta fase ya es crucial para preparar el terreno. Aunque no agrega funcionalidades visibles al usuario, es la base técnica que permitirá desarrollar los módulos de forma aislada y mantenible. Es como construir los cimientos de una casa antes de levantar las paredes.

### 1.1 Migración a ES6 Modules

Dividir `app.js` en archivos independientes con `import/export`. La estructura de carpetas propuesta es:

```
assets/
  js/
    core/
      app.js              → Inicialización, coordinación entre módulos
      router.js            → Sistema de navegación entre pantallas
      event-bus.js          → Comunicación entre módulos vía eventos
      storage-adapter.js   → Interfaz de almacenamiento (localStorage + export/import JSON)
      config.js            → Constantes, claves de storage, valores por defecto
    modules/
      tasks/
        task-manager.js    → CRUD y lógica de negocio de tareas
        task-renderer.js   → Renderizado de la UI de tareas
      habits/
        habit-manager.js
        habit-renderer.js
      budgets/
        budget-manager.js
        budget-renderer.js
      notes/
        note-manager.js
        note-renderer.js
    ui/
      modal.js             → Lógica de modales reutilizable
      toast.js             → Sistema de notificaciones toast
      templates.js         → Gestión de HTML templates
    utils/
      date.js              → Funciones de fecha (formatDate, getRelativeTime, getLast7Days)
      html.js              → escapeHtml, parseMarkdown
      id.js                → generateId
    analytics.js           → Wrapper de GA4/GTM (dataLayer push)
    theme.js               → Toggle dark/light
    sw-register.js         → Registro del Service Worker
```

Cada módulo debe implementar una interfaz común:

```javascript
// Interfaz mínima para cada módulo
export default {
  init()    → Carga datos del storage, configura listeners
  render()  → Renderiza la pantalla principal del módulo
  destroy() → Limpia listeners al salir de la pantalla
}
```

> Después de meses sin tocar el código, se me dificulta poder agregar nueva funcionalidad sin que el código se vuelva inmanejable. Esta refactorización es necesaria para poder seguir desarrollando sin que el proyecto se convierta en un "spaghetti code". Además, al tener cada módulo aislado, puedo trabajar en paralelo en diferentes funcionalidades sin preocuparme por conflictos o dependencias ocultas.

### 1.2 Storage Adapter

Crear una capa de abstracción sobre localStorage que permita en el futuro intercambiar el backend de almacenamiento sin tocar la lógica de los módulos.

```javascript
// storage-adapter.js
class StorageAdapter {
  constructor(namespace = 'productivity-xp') { ... }
  get(key)           → Devuelve datos parseados
  set(key, data)     → Serializa y guarda
  delete(key)        → Elimina una clave
  getAll()           → Devuelve todo el estado
  exportToJSON()     → Genera un blob JSON descargable con timestamp
  importFromJSON(file) → Valida estructura y reemplaza datos
  clear()            → Limpia todo el namespace
}
```

El método `exportToJSON` debe incluir metadatos: versión del schema, fecha de exportación, y un hash simple para validar integridad al importar. Esto es fundamental para cuando necesite implementar el backend propio, porque el archivo JSON será el contrato entre cliente y servidor.

De esta forma los módulos no interactúan directamente con localStorage, sino que usan el Storage Adapter. Esto desacopla la lógica de negocio de la persistencia y hace que el código sea más limpio y fácil de mantener.

> El objetivo es preparar el sistema porque en un futuro se puede cambiar el almacenamiento de localStorage a IndexedDB o incluso a un backend remoto sin que los módulos tengan que cambiar su lógica de negocio. Solo el Storage Adapter tendría que ser reescrito para adaptarse al nuevo sistema de persistencia.

### 1.3 Event Bus

Un sistema pub/sub ligero para que los módulos se comuniquen sin acoplarse directamente.

```javascript
// event-bus.js
class EventBus {
  on(event, callback)    → Suscribirse a un evento
  off(event, callback)   → Desuscribirse
  emit(event, data)      → Emitir un evento con datos
}
```

Eventos clave que se necesitan desde el inicio:

```
task:created, task:completed, task:deleted
habit:toggled, habit:streak-updated
budget:transaction-added
note:created, note:updated
screen:changed
data:exported, data:imported
```

Más adelante se agregarán: `timer:started`, `timer:stopped`, `dosage:taken`, `dosage:missed`, `bp:reading-saved`.

El Event Bus permite que, por ejemplo, el módulo de Time Tracker escuche `task:completed` para pausar un timer vinculado, sin que el módulo de tareas tenga que saber nada sobre timers.

### 1.4 Router mejorado

El sistema actual de `navigateTo` funciona pero necesita extenderse para soportar más pantallas sin que el switch/case crezca sin control.

> Actualmente el router es un simple switch que renderiza la pantalla según el ID. Esto se vuelve difícil de mantener a medida que se agregan más pantallas. La idea es tener un router basado en registro de módulos, donde cada módulo se auto-registra con su pantalla y lógica de renderizado.

```javascript
// router.js
class Router {
  register(screenId, module)  → Registra un módulo con su pantalla
  navigateTo(screenId)        → Activa pantalla, llama module.render()
  getCurrentScreen()          → Devuelve la pantalla activa
}
```

Cada módulo se auto-registra al importarse:

```javascript
router.register("tasks", taskModule)
router.register("timetracker", timeTrackerModule) // futuro
```

### 1.5 Eventos de analytics (GTM + GA4)

Crear un wrapper que centralice todos los pushes al dataLayer. Esto es clave porque quieres medir el uso real de cada módulo.

```javascript
// analytics.js
const analytics = {
  trackEvent(eventName, params = {}) {
    window.dataLayer = window.dataLayer || []
    window.dataLayer.push({
      event: eventName,
      ...params
    })
  },
  trackScreenView(screenName) {
    this.trackEvent("screen_view", { screen_name: screenName })
  },
  trackFeatureUse(feature, action, label = "") {
    this.trackEvent("feature_use", { feature, action, label })
  }
}
```

Eventos mínimos a implementar en esta fase (se expanden en cada fase posterior):

```
screen_view          → Cada cambio de pantalla con screen_name
feature_use          → Cada acción CRUD con feature (tasks/habits/budget/notes) + action (create/update/delete/toggle)
data_export          → Cada vez que exporta datos
data_import          → Cada vez que importa datos
theme_toggle         → Cambio de tema
```

En GTM se configuran como eventos personalizados que alimentan GA4. Cada evento lleva `screen_name` como parámetro global para saber desde qué pantalla ocurrió la acción.

### Entregable de Fase 1

La app funciona exactamente igual que antes desde la perspectiva del usuario, pero internamente está modularizada. Se puede verificar que:

- Cada módulo vive en su propio archivo
- El storage adapter maneja toda la persistencia
- Los eventos se emiten correctamente (verificar en consola)
- El dataLayer recibe los eventos (verificar en GTM preview mode)
- El export/import JSON funciona con el nuevo formato versionado

---

## Fase 2: Push Notifications + Service Worker

**Duración estimada:** 1 semana
**Objetivo:** Habilitar push notifications del navegador como infraestructura que usarán tanto Dosage como Time Tracker.

### 2.1 Registro y permisos del Service Worker

Ya existe un archivo `sw.js` en el proyecto. Hay que extenderlo para manejar push notifications y precaching de assets.

```javascript
// sw.js
self.addEventListener('push', event => { ... })
self.addEventListener('notificationclick', event => { ... })
```

El flujo de permisos es:

1. Al entrar a la app por primera vez, NO pedir permisos inmediatamente. Esto tiene una tasa de rechazo altísima en mobile.
2. Esperar a que el usuario active una función que requiera notificaciones (por ejemplo, crear su primer medicamento en Dosage o activar recordatorios en Time Tracker).
3. Mostrar un modal propio explicando POR QUÉ necesitas notificaciones antes de disparar el prompt nativo del navegador.
4. Si acepta, registrar el Service Worker y guardar la suscripción.
5. Si rechaza, guardar esa preferencia y no volver a preguntar (ofrecer un toggle en Settings para reactivar).

### 2.2 Sistema de notificaciones programadas

Sin un backend, las push notifications tradicionales (server-side push) no son posibles. Pero se puede usar la API de Notifications del navegador combinada con `setTimeout`/`setInterval` y el Service Worker para notificaciones locales mientras la app esté abierta o en segundo plano (con limitaciones según el navegador).

```javascript
// notification-scheduler.js
class NotificationScheduler {
  schedule(id, title, body, scheduledTime, options = {})
  cancel(id)
  getScheduled()
  checkAndFire()  → Se ejecuta periódicamente para verificar notificaciones pendientes
}
```

Las notificaciones programadas se guardan en localStorage y el Service Worker las revisa periódicamente. En mobile, el navegador puede matar el SW cuando está en segundo plano, así que hay que ser transparente con el usuario: "Las notificaciones funcionan mejor cuando la app está abierta o en una pestaña activa."

### 2.3 Eventos de analytics para notificaciones

```
notification_permission_requested  → Cuando se muestra el prompt
notification_permission_granted    → Cuando acepta
notification_permission_denied     → Cuando rechaza
notification_scheduled             → Cuando se programa una notificación (con tipo: dosage/timer/etc)
notification_clicked               → Cuando hace tap en la notificación
notification_dismissed             → Cuando la descarta
```

### Entregable de Fase 2

El sistema de notificaciones está listo como infraestructura. Desde Settings se puede ver el estado del permiso y activar/desactivar notificaciones. Un botón de "Test notification" permite verificar que funciona. El evento `notification_permission_granted` se registra en GA4.

---

## Fase 3: Time Tracker

**Duración estimada:** 3 semanas
**Objetivo:** Módulo completo de seguimiento de tiempo integrado con tareas y proyectos existentes.

### 3.1 Modelo de datos

```javascript
// Proyecto de time tracking
{
  id: string,
  name: string,
  color: string,          // Color para identificar visualmente
  icon: string,           // Emoji o icono
  isArchived: boolean,
  createdAt: timestamp
}

// Entrada de tiempo
{
  id: string,
  projectId: string,
  taskId: string | null,  // Vinculación opcional con una tarea existente
  description: string,    // Nota sobre qué se trabajó
  startTime: timestamp,
  endTime: timestamp | null,  // null = timer activo
  duration: number,       // Duración en segundos (calculada al detener)
  tags: string[],
  date: string            // YYYY-MM-DD para agrupar por día
}

// Estado del timer activo (persiste en localStorage para sobrevivir recargas)
{
  isRunning: boolean,
  currentEntryId: string | null,
  startedAt: timestamp | null
}
```

### 3.2 Funcionalidades del módulo

**Timer principal (sticky bar):** Un componente persistente en la parte superior de la app que muestra el timer activo sin importar en qué pantalla estés. Incluye: proyecto actual (color + nombre), tiempo transcurrido en vivo (HH:MM:SS), botón de play/pause/stop, y un campo rápido de descripción.

En mobile, la sticky bar debe ser compacta (una línea) y expandirse con tap para mostrar detalles y opciones. Cuando no hay timer activo, la bar se colapsa completamente para no estorbar.

**Pantalla principal del Time Tracker:**

La vista por defecto es "Hoy", mostrando las entradas del día agrupadas por proyecto, con un resumen del tiempo total del día en la parte superior. Las entradas se muestran como una lista cronológica con: color del proyecto, nombre del proyecto, descripción, hora de inicio/fin, y duración. Cada entrada es editable (tap para expandir y modificar tiempos, descripción, proyecto o tarea asociada).

**Vinculación con tareas:** Al iniciar un timer, el usuario puede seleccionar opcionalmente una tarea existente de su lista. Cuando una tarea se marca como completada, si tiene un timer activo asociado, se pregunta si quiere detener el timer. En la vista de tareas, se muestra el tiempo total trackeado por tarea.

**Inicio rápido desde tareas:** Agregar un botón de "play" al lado de cada tarea en la lista de tareas. Un tap inicia el timer vinculado a esa tarea y su proyecto. Si ya hay un timer corriendo, se detiene el actual y se inicia el nuevo (con confirmación).

**Vista semanal:** Un resumen de la semana con horas por día (barra horizontal por día), desglose por proyecto (porcentaje de tiempo), y total de horas de la semana.

**Vista mensual:** Calendario con heat map de horas por día (similar a la contribution graph de GitHub), totales por proyecto, y promedio de horas diarias.

**Export CSV:** Generar un archivo CSV con columnas: Fecha, Proyecto, Tarea, Descripción, Hora Inicio, Hora Fin, Duración (horas), Tags. Filtrar por rango de fechas antes de exportar. El CSV debe ser compatible con Excel y Google Sheets sin problemas de codificación (UTF-8 BOM).

**Detección de inactividad (opcional pero valioso):** Si el timer lleva más de X minutos sin interacción (configurable, default 15 min), mostrar una notificación preguntando si sigue trabajando. Si no responde, pausar el timer y registrar hasta el momento de la última interacción. Esto evita el clásico "dejé el timer corriendo toda la noche".

### 3.3 Integración con Event Bus

El Time Tracker escucha estos eventos:

```
task:completed → Si la tarea tiene timer activo, preguntar si detener
screen:changed → Actualizar la sticky bar
```

El Time Tracker emite:

```
timer:started   → { entryId, projectId, taskId }
timer:stopped   → { entryId, duration }
timer:paused    → { entryId }
```

### 3.4 Notificaciones

Usar el sistema de notificaciones de Fase 2 para:

- Recordatorio de inactividad (configurable)
- Recordatorio de que el timer sigue corriendo después de X horas
- Resumen del día al final de la jornada (si se configura)

### 3.5 Eventos de analytics

```
timer_started           → { project_name, has_task: boolean }
timer_stopped           → { project_name, duration_minutes }
timer_entry_edited      → { field_changed: description/time/project }
timetracker_view        → { view_type: today/weekly/monthly }
timetracker_csv_export  → { date_range, entry_count }
project_created         → { project_name }
project_archived        → { project_name }
quick_start_from_task   → { task_id }
```

### 3.6 UX Mobile First

El timer se opera con una mano. Los controles principales (start/stop) son botones grandes (mínimo 48x48px) en la zona inferior de la pantalla, al alcance del pulgar. La lista de entradas del día se hace scroll vertical. Swipe left en una entrada muestra opciones de editar/eliminar. La selección de proyecto al iniciar un timer es un bottom sheet con los proyectos recientes primero.

### Entregable de Fase 3

El Time Tracker funciona completo con timer persistente, vinculación con tareas, vistas de hoy/semana/mes, export CSV, y detección de inactividad. El dashboard de Home muestra las horas del día y el proyecto activo. Los eventos de GA4 permiten ver qué funcionalidades se usan más.

---

## Fase 4: Dosage (Gestión de Tratamientos)

**Duración estimada:** 2 semanas
**Objetivo:** Módulo para gestionar medicamentos y tratamientos con recordatorios, historial y monitoreo de inventario.

### 4.1 Modelo de datos

```javascript
// Tratamiento/Medicamento
{
  id: string,
  name: string,             // Nombre del medicamento
  dosage: string,           // Ej: "500mg", "2 tabletas", "10ml"
  icon: string,             // Emoji representativo
  color: string,            // Color para identificar visualmente
  frequency: {
    type: string,           // 'daily' | 'specific_days' | 'cycle' | 'as_needed'
    days: number[],         // Para specific_days: [1,3,5] (lun, mié, vie)
    cycleDays: number,      // Para cycle: cada N días
    cycleStartDate: string  // Para cycle: fecha de inicio del ciclo
  },
  times: [                  // Múltiples tomas al día
    {
      id: string,
      time: string,         // "08:00", "14:00", "22:00"
      label: string         // "Mañana", "Tarde", "Noche"
    }
  ],
  startDate: string,        // Fecha de inicio del tratamiento
  endDate: string | null,   // null = tratamiento indefinido
  inventory: {
    currentStock: number,   // Cantidad actual
    dosesPerTake: number,   // Cuántas unidades por toma
    lowStockThreshold: number, // Alerta cuando queden menos de N
    unit: string            // "tabletas", "ml", "cápsulas", etc.
  },
  notes: string,            // Instrucciones especiales (con/sin comida, etc.)
  isActive: boolean,
  createdAt: timestamp
}

// Registro de toma
{
  id: string,
  medicationId: string,
  scheduledTime: string,    // Hora programada
  scheduledDate: string,    // Fecha programada
  status: string,           // 'taken' | 'skipped' | 'missed' | 'pending'
  actualTime: timestamp | null, // Hora real en que se tomó
  notes: string             // Nota opcional
}
```

### 4.2 Funcionalidades del módulo

**Vista "Hoy" (pantalla principal de Dosage):** Timeline vertical del día mostrando todas las tomas programadas, ordenadas por hora. Cada toma muestra: hora programada, nombre del medicamento (con color e icono), dosis, y un botón grande de "Tomar" o "Saltar". Las tomas pasadas no registradas se marcan automáticamente como "missed" después de una ventana configurable (default: 2 horas después de la hora programada).

**Integración en Home Dashboard:** Un widget de "Próxima toma" en el panel principal mostrando el siguiente medicamento pendiente con cuenta regresiva. Si hay tomas pendientes atrasadas, mostrar una alerta visual. Al lado de los hábitos del día, un resumen: "3/4 medicamentos tomados hoy".

**Historial:** Vista de calendario mensual con indicadores de color por día (verde = todas tomadas, amarillo = alguna saltada, rojo = alguna perdida). Tap en un día muestra el detalle de cada toma. Filtro por medicamento para ver el historial individual.

**Gestión de medicamentos:** CRUD completo para medicamentos. Al crear uno nuevo, un wizard paso a paso (mobile friendly): Nombre y dosis → Frecuencia → Horarios → Inventario (opcional) → Duración del tratamiento (opcional). El wizard se navega con swipe o botones de siguiente/anterior.

**Frecuencias flexibles:** "Diario" programa la toma todos los días en los horarios configurados. "Días específicos" permite seleccionar días de la semana (ej: lunes, miércoles, viernes). "Ciclo" programa cada N días desde una fecha de inicio (útil para tratamientos que se toman cada 3 días, por ejemplo). "Según necesidad" no programa notificaciones, solo permite registrar tomas manualmente cuando el usuario decide.

**Monitoreo de inventario:** Al registrar una toma, se descuenta automáticamente del stock. Cuando el stock baja del umbral configurado, se muestra una alerta en la app y opcionalmente una notificación push. Se calcula y muestra: "Te quedan aproximadamente X días de tratamiento". Si hay fecha de fin del tratamiento, se verifica que el stock alcance hasta esa fecha.

**Duración del tratamiento:** Si se configura fecha de fin, la app muestra una barra de progreso del tratamiento (ej: "Día 15 de 30") y avisa 3 días antes de que termine. Al terminar, el medicamento se puede archivar automáticamente o preguntar si se renueva.

### 4.3 Notificaciones

Las notificaciones son la pieza central de Dosage. Es importante usar el sistema de Fase 2 para programar recordatorios a la hora exacta de cada toma. Si el usuario no marca la toma en 30 minutos, enviar un segundo recordatorio. Al interactuar con la notificación, abrir la app directamente en la pantalla de Dosage.

Notificaciones de inventario bajo: enviar una vez cuando se cruza el umbral, no repetir hasta que el usuario recargue stock.

### 4.4 Eventos de analytics

```
medication_created       → { frequency_type, has_inventory: boolean, has_end_date: boolean }
medication_updated       → { fields_changed }
medication_archived      → { medication_name, treatment_duration_days }
dose_taken               → { medication_name, on_time: boolean, delay_minutes }
dose_skipped             → { medication_name, reason: string | null }
dose_missed              → { medication_name }
inventory_updated        → { medication_name, new_stock, days_remaining }
inventory_low_alert      → { medication_name, remaining_stock }
dosage_view              → { view_type: today/history/medications }
dosage_notification_tap  → { medication_name }
```

### 4.5 UX Mobile First

El flujo de "tomar medicamento" debe ser de un solo tap desde la pantalla de Dosage y de máximo dos taps desde Home (tap en widget → tap en "Tomar"). Los botones de acción son grandes y accesibles con el pulgar. El wizard de creación usa bottom sheets para selectores de frecuencia y horarios. Los selectores de hora usan el input nativo del navegador en mobile (`<input type="time">`).

### Entregable de Fase 4

El módulo Dosage funciona completo con gestión de medicamentos, recordatorios push, historial con calendario, monitoreo de inventario, y frecuencias flexibles. El Home dashboard integra el widget de próxima toma. Los eventos de GA4 permiten analizar la adherencia a tratamientos (tomas a tiempo vs atrasadas vs perdidas).

---

## Fase 5: Monitor de Presión Arterial con OCR

**Duración estimada:** 3 semanas
**Objetivo:** Módulo para registrar lecturas de presión arterial, con la capacidad de leer datos directamente del display del OMRON HEM-6230 usando la cámara.

### 5.1 Modelo de datos

```javascript
// Lectura de presión arterial
{
  id: string,
  systolic: number,         // Presión sistólica (ej: 120)
  diastolic: number,        // Presión diastólica (ej: 80)
  pulse: number,            // Pulso (ej: 72)
  irregularHeartbeat: boolean, // Indicador de latido irregular (el OMRON lo muestra)
  measuredAt: timestamp,    // Fecha y hora de la medición
  arm: string,              // 'left' | 'right'
  position: string,         // 'sitting' | 'standing' | 'lying'
  notes: string,            // Notas adicionales (ej: "después de ejercicio")
  source: string,           // 'manual' | 'camera_ocr'
  ocrConfidence: number | null, // Nivel de confianza del OCR (0-1)
  imageData: string | null  // Base64 de la imagen capturada (opcional, para referencia)
}

// Configuración del usuario para BP
{
  targetSystolic: { min: number, max: number },  // Rango objetivo (ej: 90-120)
  targetDiastolic: { min: number, max: number }, // Rango objetivo (ej: 60-80)
  reminderEnabled: boolean,
  reminderTimes: string[],   // Horarios de recordatorio de medición
  defaultArm: string,
  retainImages: boolean      // Si guarda las fotos del display
}
```

### 5.2 Funcionalidades del módulo

**Registro manual:** Formulario rápido con 3 campos numéricos (sistólica, diastólica, pulso) más opciones de brazo, posición y notas. Los campos numéricos usan `<input type="number" inputmode="numeric">` para que en mobile aparezca el teclado numérico directamente.

**Captura por cámara (OCR):** Esta es la funcionalidad diferenciadora. El flujo es:

1. El usuario presiona "Capturar lectura" y se abre la cámara.
2. Se muestra una guía visual (overlay) indicando cómo alinear el display del OMRON dentro del marco.
3. El usuario toma la foto o usa una foto existente de la galería.
4. La imagen se envía a un servicio de OCR para extraer los números.
5. Los valores detectados se muestran al usuario para confirmar o corregir ANTES de guardar. Nunca se guarda automáticamente sin confirmación.

**Implementación del OCR:** Para el reconocimiento de los números del display hay dos caminos viables:

Opción A (recomendada para empezar): Usar Tesseract.js, que corre 100% en el navegador sin necesidad de backend. Es bueno para texto limpio sobre fondo uniforme, que es exactamente lo que muestra un display LCD. Requiere preprocesamiento de la imagen: convertir a escala de grises, aumentar contraste, binarizar, y recortar la zona del display.

Opción B (para mejor precisión, requiere backend): Usar la API de Google Cloud Vision o AWS Textract. Mejor precisión pero necesita un endpoint propio que proxee la llamada. Esto se puede implementar cuando construyas el backend.

El OMRON HEM-6230 muestra los valores en formato grande y claro en el display: sistólica arriba, diastólica en medio, pulso abajo, y un icono de latido irregular si aplica. El preprocesamiento de imagen debe considerar que el display es LCD con segmentos, no texto normal.

```javascript
// Flujo de OCR simplificado
async function processBloodPressureImage(imageData) {
  // 1. Preprocesar: grayscale, contrast, threshold
  const processed = preprocessImage(imageData)

  // 2. OCR con Tesseract.js configurado para números
  const result = await Tesseract.recognize(processed, "eng", {
    tessedit_char_whitelist: "0123456789" // Solo reconocer dígitos
  })

  // 3. Extraer los 3 valores del resultado
  // El display del OMRON los muestra en orden: SYS, DIA, PUL
  const numbers = extractBloodPressureValues(result.data.text)

  // 4. Validar rangos (SYS: 60-260, DIA: 40-199, PUL: 40-180)
  return validateAndReturn(numbers)
}
```

> Es necesario investigar si hay documentación o ejemplos específicos de OCR para displays LCD de dispositivos médicos, ya que tienen características particulares (números formados por segmentos, posible reflejo, etc.). El preprocesamiento de la imagen es clave para mejorar la precisión del OCR.

**Dashboard de presión arterial:** Gráfica de línea temporal mostrando la evolución de sistólica y diastólica en los últimos 30 días. Zonas de color en la gráfica indicando rangos (normal: verde, elevada: amarillo, hipertensión etapa 1: naranja, hipertensión etapa 2: rojo). Estadísticas: promedio de los últimos 7/30/90 días, tendencia (subiendo/bajando/estable), mejor y peor lectura del período.

**Clasificación automática:** Según las guías de la American Heart Association:

```
Normal:          SYS < 120 y DIA < 80
Elevada:         SYS 120-129 y DIA < 80
Hipertensión 1:  SYS 130-139 o DIA 80-89
Hipertensión 2:  SYS ≥ 140 o DIA ≥ 90
Crisis:          SYS > 180 o DIA > 120
```

Cada lectura se clasifica automáticamente y el color del registro refleja la categoría. En caso de crisis hipertensiva, mostrar una alerta clara sugiriendo buscar atención médica.

**Integración con Dosage:** Si el usuario toma medicamentos para la presión, se puede vincular la lectura con la toma del medicamento. Esto permite correlacionar: "¿Mi presión baja cuando tomo el medicamento consistentemente?" Esta correlación se muestra en la gráfica con marcadores en los días que tomó el medicamento vs los que no.

**Recordatorios de medición:** Usando el sistema de notificaciones de Fase 2, recordar al usuario que se tome la presión en los horarios configurados (ej: mañana y noche).

**Export de datos:** Generar un PDF o CSV con el historial de lecturas para compartir con el médico. Incluir la gráfica de tendencia, promedios, y clasificación. Esto es especialmente útil en consultas médicas.

### 5.3 Eventos de analytics

```
bp_reading_saved          → { source: manual/camera_ocr, classification }
bp_camera_opened          → {}
bp_ocr_success            → { confidence_level }
bp_ocr_failed             → { error_type }
bp_ocr_corrected          → { fields_corrected: [] }
bp_chart_viewed           → { period: 7d/30d/90d }
bp_data_exported          → { format: csv/pdf, readings_count }
bp_reminder_set           → { times_per_day }
bp_reading_classification → { classification: normal/elevated/hypertension1/hypertension2/crisis }
```

### 5.4 UX Mobile First

La captura por cámara es la funcionalidad estrella del módulo, así que debe ser impecable en mobile. El botón de "Capturar" debe ser prominente (CTA principal de la pantalla). La guía visual en la cámara debe ser clara: un rectángulo del tamaño aproximado del display del OMRON con texto "Alinea el display aquí". Después de la captura, la pantalla de confirmación muestra los valores detectados en campos editables grandes (tamaño de fuente mínimo 24px) para corregir fácilmente con el pulgar. El registro manual es la alternativa cuando el OCR no funciona, accesible con un link "Ingresar manualmente" debajo del botón de captura.

### Entregable de Fase 5

El módulo de presión arterial funciona con registro manual y por cámara (OCR via Tesseract.js). El dashboard muestra la evolución temporal con clasificación AHA. La integración con Dosage permite correlacionar medicación con lecturas. El export genera un reporte para el médico. Los eventos de GA4 permiten medir la adopción del OCR vs registro manual.

---

## Consideraciones transversales (aplican a todas las fases)

### UX Mobile First: principios de diseño

Todas las acciones primarias deben estar al alcance del pulgar (zona inferior de la pantalla). Los botones de acción miden mínimo 48x48px (recomendación de Google para touch targets). La navegación principal es el bottom nav bar que ya existe, y se extiende con los nuevos módulos. El bottom nav no debe tener más de 5 items visibles, así que los módulos adicionales se agrupan bajo un menú "More" o se organizan en categorías (Productividad: tasks, timer, habits / Salud: dosage, BP / Personal: budget, notes).

Los formularios usan el tipo de input correcto para que el teclado del móvil sea el apropiado: `type="number" inputmode="numeric"` para cantidades, `type="time"` para horas, `type="date"` para fechas. Los selectores multi-opción usan bottom sheets en vez de dropdowns nativos (que en mobile son poco usables). El scroll es siempre vertical, sin scroll horizontal excepto en tablas de datos.

### Estructura de eventos GA4 via GTM

La convención de nomenclatura para eventos es `modulo_accion`. El contenedor GTM maneja un tag de GA4 con un trigger por cada evento personalizado del dataLayer. Variables personalizadas en GTM extraen los parámetros del dataLayer (screen*name, feature, action, etc.). Configurar un trigger de tipo "Custom Event" con regex para capturar grupos de eventos: `timer*._`, `dosage\_._`, `bp\_.\*`.

Métricas clave a monitorear en GA4:

- Usuarios activos diarios/semanales por módulo (via screen_view)
- Tasa de retención por módulo (¿los usuarios vuelven a usar Time Tracker después de la primera semana?)
- Funnel de OCR: cámara abierta → foto tomada → OCR exitoso → lectura guardada
- Adherencia de medicación: porcentaje de tomas a tiempo vs tardías vs perdidas
- Tiempo promedio por sesión de uso

### Plan de datos para el futuro backend

Aunque el backend no es parte de este plan, todo el diseño de datos está pensado para ser fácilmente para migrarlo a una base de datos. Los IDs son strings generados en el cliente (lo cual facilita offline-first). Las fechas se almacenan en ISO format. El export JSON incluye toda la información necesaria para una migración completa. Cuando construyas el backend, el flujo será: export JSON desde la app → endpoint de importación en el backend → la app cambia su StorageAdapter de localStorage a API REST.

### Testing

En cada fase, antes de dar por cerrada:

- Probar en Chrome mobile (Android) y Safari mobile (iOS) como mínimo
- Verificar que el export/import JSON funciona entre sesiones y entre navegadores
- Verificar que los eventos llegan al dataLayer (GTM preview mode)
- Probar el flujo completo de cada funcionalidad con datos reales
- Verificar que el localStorage no excede el límite del navegador (generalmente 5-10MB, monitorear el tamaño total)

### Límites de localStorage

Con todos los módulos activos, el uso de storage puede crecer significativamente, especialmente con las imágenes base64 del OCR. Para mitigar esto: comprimir las imágenes antes de guardarlas (max 800px de ancho, calidad JPEG 60%), ofrecer una opción de "no guardar imágenes" (solo los valores numéricos), implementar un mecanismo de archivado automático: datos de más de 90 días se comprimen o se mueven a un "archivo" que se puede exportar y eliminar.

---

## Resumen de fases y dependencias

```
Fase 1 (Arquitectura)      ← Base para todo. Sin esto nada escala.
  ↓
Fase 2 (Notificaciones)    ← Infraestructura para Dosage y Timer.
  ↓
Fase 3 (Time Tracker)      ← Se integra con Tasks existentes.
  ↓
Fase 4 (Dosage)            ← Usa notificaciones de Fase 2.
  ↓
Fase 5 (Blood Pressure)    ← Se integra con Dosage (correlación medicación/presión).
```

Tiempo total estimado: **11 semanas** de desarrollo enfocado.

El objetivo es que cada fase es independiente en el sentido de que produce un entregable funcional, aumentando la versión de la aplicación. La modularización de la Fase 1 es clave para que las siguientes fases se puedan desarrollar de forma aislada sin que el código se vuelva inmanejable.
