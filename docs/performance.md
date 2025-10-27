# Bitácora de instalación y evaluación de Google Tag Manager en index.html

## 1. Medición inicial de performance

Antes de instalar Google Tag Manager (GTM), el archivo `index.html` fue evaluado con Lighthouse, obteniendo un puntaje perfecto de **100/100** en performance. Esto representa el estado óptimo de carga y eficiencia del sitio sin scripts externos de gestión de etiquetas.

## 2. Instalación de Tag Manager

Se agregó el script de GTM en el `<head>` y el `<body>` de `index.html` siguiendo las recomendaciones oficiales. El objetivo es centralizar la gestión de etiquetas y facilitar la administración de eventos y métricas (como el evento de clic en enlaces para GA4).

## 3. Impacto en performance tras instalar GTM

Después de agregar GTM, Lighthouse reportó una caída en el performance a **96/100**. Se detectaron las siguientes alertas y recomendaciones:

- **Render blocking requests:** El script de GTM bloquea el renderizado inicial, lo que puede retrasar el LCP (Largest Contentful Paint). Se recomienda diferir o inyectar el script de forma asíncrona para minimizar el impacto.
- **LCP request discovery:** Se sugiere optimizar la imagen LCP para que sea descubierta inmediatamente en el HTML y evitar el lazy-loading en la imagen principal.
- **Network dependency tree:** Se observan cadenas de peticiones críticas que aumentan la latencia máxima del camino crítico (hasta 663 ms), principalmente por fuentes externas y el propio GTM.
- **Reduce unused JavaScript:** GTM y sus dependencias descargan más de 100 KiB de JavaScript que no siempre se utiliza, lo que afecta el tiempo de carga y el consumo de red.

### Detalle de recursos y ahorro estimado

| Recurso | Transfer Size | Est Savings |
|---------|---------------|-------------|
| Google Tag Manager tag-manager | 242.9 KiB | 104.1 KiB |
| /gtag/js?id=G-6YJ3WLEG9P | 142.6 KiB | 53.9 KiB |
| /gtm.js?id=GTM-N9PXJX8V | 100.3 KiB | 50.2 KiB |

## 4. Reflexión: ¿Vale la pena el costo en performance?

La instalación de GTM reduce el puntaje de performance en 4 puntos, principalmente por el bloqueo de render y la descarga de scripts adicionales. Sin embargo, GTM ofrece ventajas significativas en la gestión dinámica de etiquetas, eventos y métricas, permitiendo mayor flexibilidad y agilidad para el equipo de desarrollo y marketing.

**Conclusión:**

- Si el proyecto requiere una administración ágil y centralizada de etiquetas, GTM es una herramienta valiosa, aunque implique un pequeño sacrificio en performance.
- Para proyectos donde la velocidad de carga es crítica y no se necesita gestión avanzada de etiquetas, puede evaluarse mantener el HTML sin GTM.
- Es recomendable monitorear el impacto real en usuarios y optimizar la carga de recursos críticos para minimizar el efecto negativo.
