# Corrección del Calendario Semanal de Hábitos

## Bug Report

- Prioridad: High
- Módulo: Hábitos
- Impacto: La vista semanal muestra una ventana móvil de últimos 7 días y puede
  marcar visualmente el día anterior al completar el hábito de hoy.
- Política: Bug High con esfuerzo estimado menor a 3 horas, ejecución inmediata.

## Pasos de Reproducción

1. Abrir `index.html` en un día miércoles.
2. Entrar a la pantalla Habits.
3. Revisar la grilla semanal de un hábito.
4. Marcar el hábito como completado hoy.
5. Observar que la columna activa no corresponde claramente al miércoles.

## Causa Raíz

- `habits()` usaba `getLast7Days()`, que genera una ventana móvil y no una
  semana calendario lunes-domingo.
- Los labels de la grilla se calculaban con `new Date("YYYY-MM-DD")`, que
  interpreta la fecha como UTC y puede desplazar el día en zona local.
- `assets/js/utils/date.js` formateaba con getters UTC, lo que podía propagar el
  desfase al continuar la migración modular.

## Alcance Técnico

- Usar fechas locales como fuente de verdad para `YYYY-MM-DD`.
- Agregar `parseDateStringLocal("YYYY-MM-DD")` para renderizar labels sin UTC.
- Agregar `getCurrentWeekDates(referenceDate = new Date(), firstDayOfWeek = 1)`.
- En `habits()`, reemplazar la ventana móvil por la semana calendario actual.
- Mantener `habit.dailyRecords[todayStr]` como fuente de verdad del estado
  diario.
- Mantener `getLastNDays()` por compatibilidad con otros módulos.

## Criterios de Aceptación

- En miércoles 6 de mayo de 2026, la grilla muestra del lunes 4 al domingo 10.
- El botón "Completed Today" y la columna resaltada usan el mismo `todayStr`.
- Al completar un hábito, se marca la columna de hoy, no la del día anterior.
- En domingo, la semana inicia el lunes previo y termina en ese mismo domingo.
- Home sigue reflejando el hábito completado hoy.

## Plan de Pruebas

- Unitarias:
  - `formatDate(new Date(2026, 4, 6))` devuelve `2026-05-06`.
  - `parseDateStringLocal("2026-05-06")` representa miércoles local.
  - `getCurrentWeekDates(new Date(2026, 4, 6))` devuelve `2026-05-04` a
    `2026-05-10`.
  - `getCurrentWeekDates(new Date(2026, 4, 10))` conserva el domingo como final
    de semana.
- Manual:
  - Abrir la app en miércoles.
  - Ir a Habits.
  - Verificar grilla lunes-domingo.
  - Marcar un hábito como completado.
  - Confirmar columna de miércoles y estado reflejado en Home.

## Riesgos y Validaciones Anti-Regresión

- Riesgo: cambiar formato UTC a local puede afectar fixtures que asumían UTC.
  Mitigación: cubrir `formatDate()` con constructor local.
- Riesgo: otros módulos todavía usan `getLastNDays()`.
  Mitigación: mantener la función sin cambiar su contrato público.
- Riesgo: futuros labels vuelvan a usar `new Date("YYYY-MM-DD")`.
  Mitigación: centralizar el parse local en `parseDateStringLocal()`.
