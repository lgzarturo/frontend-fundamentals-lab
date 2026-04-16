# Guía de Buenas Prácticas SEO

Esta guía detalla las optimizaciones implementadas en el archivo principal
[`index.html`](../index.html) del proyecto, con un enfoque particular en
metadatos, microformatos y otros elementos clave para el posicionamiento
orgánico en motores de búsqueda, así como mejorar las métricas de distribución
en redes (SEO off-page).

## 1. Metadatos Fundamentales y Técnicos

Los metadatos proporcionan a los rastreadores (crawlers) información vital sobre
el contenido, y dictan pautas esenciales para la renderización.

- **Codificación y Viewport**: `<meta charset="UTF-8" />` y
  `<meta name="viewport" ...>` son la base fundamental para el renderizado móvil
  y de caracteres. Esto es vital para el indexado moderno de Google, que sigue
  el modelo _Mobile-First Indexing_.
- **Meta Description**: Una descripción precisa, clara y que incluya palabras
  clave estratégicas (ej. "Aprende desarrollo web frontend con JavaScript
  puro..."). Fomenta el Click-Through Rate (CTR) cuando el enlace aparece en la
  página de resultados (SERP).
- **Etiquetas de rastreo (Robots y Googlebot)**: Configurado con `index, follow`
  para permitir la indexación del sitio completo y que los rastreadores fluyan a
  través de los enlaces. Adicionalmente, se agregan directivas de rastreo
  específicas para visualizar de mejor forma fragmentos, previsualización
  completa de imágenes y control de video (`max-snippet:-1`,
  `max-image-preview:large`, `max-video-preview:-1`).
- **Atributos de Idioma Base**: `<html lang="es">` es clave para un SEO
  semántico, orientando la página hacia la audiencia de la región e impactando
  positivamente en la accesibilidad.
- **Keywords**: Aunque han perdido peso histórico, una selección controlada de
  términos sigue ayudando tangencialmente a consolidar la materia y estructura
  que trata el sitio web.

## 2. Internacionalización y Reducción de Contenido Duplicado

Cualquier arquitectura SEO sólida previene sanciones por duplicidad y sabe
dirigir a audiencias de distintos territorios a su respectivo contenido.

- **Etiqueta Canonical**: `<link rel="canonical" href="..." />` le indica al
  buscador cuál es la versión original (o prioritaria y canónica) del documento.
  Esto consolida toda la "fuerza" de enlaces en una sola URL cuando el acceso a
  la misma puede darse de manera parametrizada.
- **Hreflang (Alternate Languages)**: La estrategia multilingüe se garantiza
  usando `<link rel="alternate" hreflang="es" ...>`, `hreflang="en"` y un
  fallback general `hreflang="x-default"`. Asegura de que a los motores de
  búsqueda como Google sirvan la versión de la página que coincida con el idioma
  y región de quien busca.

## 3. SEO Off-Page y Social (Previsualizaciones y Enriquecimiento Visual)

Cuando un usuario o plataforma comparte el enlace, la presentación visual y
estructural de la información influye radicalmente en que un tercero dé "click"
en sitios externos o redes sociales.

- **Open Graph (OG)**: Utilizado por plataformas como Facebook, LinkedIn o
  WhatsApp. Se configuran marcadores clave como `og:title`, `og:description`,
  `og:image`, `og:url` y `og:type="website"` para desplegar tarjetas
  enriquecidas. Las imágenes se definen con sus dimensiones exactas
  (`og:image:width`, `height`) y atributos alt (`og:image:alt`) por
  accesibilidad e indexación contextual. También se asigna el _locale_ primario
  y alternativo.
- **Twitter Cards**: Estándar propietario (ahora para la red X) definido a
  través de marcadores `twitter:*`. Implementar formatos visuales amplios
  (`twitter:card="summary_large_image"`) asegura la atención del lector, junto
  con la integración de la cuenta del autor principal (`twitter:site` y
  `twitter:creator`).

## 4. Microformatos y Datos Estructurados (JSON-LD)

El uso del vocabulario Schema.org inyectado a través de scripts JSON-LD es la
forma más avanzada y recomendada por Google para lograr ser elegible a los
**Rich Snippets** (Fragmentos Enriquecidos).

En esta aplicación implementamos tres esquemas muy importantes:

1.  **WebSite & Author/Organization (Persona y Organización)**: Se declara el
    nombre principal de la web, URL, idioma y vincula fuertemente la autoría
    individual (Arturo López). El atributo `sameAs` permite entrelazar las redes
    o repositorios principales del autor (ej. GitHub, Twitter), inyectando
    autoridad de dominio cruzada a este proyecto.
2.  **Course (Curso)**: Al ser este un laboratorio y proyecto educativo, este
    esquema permite indicar especificaciones de tipo `educationalLevel` y
    conocimientos ofertados en el arreglo `teaches` (JS Vanilla, HTML5
    Semántico, CSS, etc.), con la intención de poder aparecer en carruseles
    educativos orgánicos dentro de Google.
3.  **BreadcrumbList**: Ayuda a entender la jerarquía del sitio en cascada.
    Fomenta que el enlace en el buscador trace un orden de "migas de pan" más
    amistoso en lugar de desplegar una URL en texto plano largo.

## 5. Mejora de Core Web Vitals (Rendimiento técnico)

El algoritmo de Google toma rigurosamente en cuenta los tiempos de carga y
respuesta de la web.

- **Preconnect y DNS-Prefetch**: Se establecen "puentes" (`rel="preconnect"`) a
  terceras partes esenciales tempranamente (ej: servidores de Google Fonts)
  anulando los retrasos de tiempo de latencia para las peticiones de estilo de
  tipografía, agilizando el First Contentful Paint (FCP).
- **Preload de recursos críticos**: La carga con `rel="preload" as="style"`
  garantiza que archivos críticos como las fuentes no demoren en procesarse,
  evitando a toda costa la pobre experiencia que trae el renderizado "Flash of
  Unstyled Text" (FOUT) entre el momento en el que el sitio carga, la tipografía
  base aparece, y la fuente original impacta finalmente en pantalla.
