# Frontend Fundamentals Lab

En este repositorio documentaré mi proceso de aprendizaje y práctica para dominar los fundamentos del desarrollo frontend.  

Cada módulo y proyecto está diseñado para entender cómo funciona la web desde su base: estructura (HTML), presentación (CSS) y comportamiento (JavaScript).  

El enfoque no es acumular frameworks, sino dominar los principios que hacen posible cualquier tecnología moderna del frontend.

> La aplicación es una idea que surge de mi necesidad personal de organizar mis tareas, presupuesto y notas en un solo lugar, aplicando lo que voy aprendiendo.

---

## 🚀 Objetivo

Construir una base sólida de conocimiento aplicando los fundamentos directamente en proyectos funcionales.  
A través de cada entrega se busca:

- Aprender *cómo* y *por qué* funcionan las cosas en el navegador.  
- Escribir código claro, mantenible y semántico.  
- Practicar buenas prácticas de UX/UI con un enfoque mobile-first.  
- Reforzar conceptos de manipulación del DOM, eventos, estado, asincronía y persistencia local.
- Se irán recomendando lecturas y recursos adicionales para profundizar en cada tema.

> Solo pido paciencia y comprensión, ya que este es un proyecto personal en constante evolución.

---

## 🧩 Proyecto principal: Productivity Toolbox SPA

Aplicación web de una sola página construida con **HTML**, **Tailwind CSS 4** y **JavaScript puro**, orientada a la productividad personal.  
Incluye un gestor de presupuesto, tareas, notas en markdown y seguimiento de hábitos, con almacenamiento en `localStorage`.

**Características clave:**

- Modo oscuro por defecto.  
- Totalmente responsive y usable sin conexión.  
- Persistencia local y exportación/importación de datos en JSON.  
- Microinteracciones sutiles inspiradas en videojuegos.  
- Accesibilidad y experiencia fluida en móvil.  

El objetivo no es solo construir la app, sino **aprender profundamente los fundamentos del frontend a través de su desarrollo**.

---

## 📂 Estructura general

> El objetivo es mantener una estructura simple y modular para facilitar el aprendizaje y la navegación del código. Aplicar buenas prácticas desde el inicio.

```plaintext
frontend-fundamentals-lab/
│
├── roadmap/
│ └── (plan de aprendizaje y módulos)
├── docs/
│ └── (archivos de documentación y recursos)
├── index.html
├── styles.css
├── app.js
├── store.js
│
├── components/
│ ├── dashboard.js
│ ├── tasks.js
│ ├── budgets.js
│ ├── notes.js
│ └── habits.js
│
├── utils/
│ ├── date.js
│ ├── id.js
│ └── markdownParser.js
│
├── assets/
│ └── icons/
│
├── README.md
└── LICENSE
```

---

## 🧠 Aprendizaje y fundamentos

Cada bloque de trabajo se centra en un concepto clave del frontend:

1. **HTML semántico y accesible.**  
2. **CSS moderno, mobile first y Tailwind CSS.**  
3. **DOM y eventos.**  
4. **Gestión de estado y almacenamiento local.**  
5. **Diseño de interfaces y microinteracciones.**  
6. **Arquitectura modular con JavaScript puro.**

La meta es entender la esencia de cada tecnología antes de usar frameworks como React, Vue o Svelte.

---

## 🧪 Ejecución local

No requiere entorno de desarrollo ni servidor:

1. Clona el repositorio:  

   ```bash
   git clone https://github.com/lgzarturo/frontend-fundamentals-lab.git
    ```

2. Abre el archivo index.html en tu navegador.

3. ¡Listo! Todo funciona directamente en el navegador, incluso offline.

---

## 🔄 Persistencia y exportación

Todos los datos se guardan en localStorage bajo el namespace app_duplex_v1.
Desde la pantalla de configuración se puede:

- Exportar datos como archivo JSON.
- Importar un respaldo existente.
- Reiniciar la app con datos de ejemplo.

---

## 📄 Licencia

[Arturo López](mailto:lgzarturo@gmail.com)

Desarrollador de software especializado en desarrollo fullstack.

Apasionado por los fundamentos, la arquitectura limpia y el aprendizaje continuo en tecnología.

Los frameworks cambian, los fundamentos permanecen.

Este proyecto está bajo la licencia Creative Commons Attribution 4.0 International (CC BY 4.0).

## Futuro

Algunos de mis objetivos para seguir avanzando con este proyecto y mi aprendizaje:

- Continuar mejorando la aplicación con nuevas características y optimizaciones.
- Explorar la integración de tecnologías emergentes y mejores prácticas.
- Fomentar una comunidad de aprendizaje y colaboración en torno a este proyecto.
- Aprender Typescript y aplicar tipado estático al código existente.
- Investigar sobre pruebas unitarias y de integración para aplicaciones frontend.
- Documentar el proceso de aprendizaje y compartir recursos útiles con la comunidad.
- Explorar la internacionalización (i18n) para soportar múltiples idiomas en la aplicación.
- Optimizar el rendimiento y la accesibilidad de la aplicación.
- Investigar sobre Progressive Web Apps (PWA) y aplicar conceptos para mejorar la experiencia offline.
- Explorar la integración con APIs externas para ampliar la funcionalidad de la aplicación.
- Investigar sobre metodologías ágiles y aplicarlas en el desarrollo continuo del proyecto.
- Explorar la posibilidad de convertir la aplicación en una extensión de navegador para facilitar su acceso y uso.
- Integrar React o Vue para comparar enfoques y beneficios frente a JavaScript puro.
