tailwind.config = {
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                xp: {
                    primary: '#0acc71ff',
                    secondary: '#0099ff',
                    danger: '#ff0055',
                    warning: '#ffaa00',
                    dark: '#0a0e1a',
                    darker: '#05070f',
                    card: '#131829',
                }
            }
        }
    }
};

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function formatDate(date) {
    if (typeof date === 'string') return date;
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

const today = new Date();
const todayStr = formatDate(today);
let currentScreen = 'home';

function render() {
    // Aquí iría la lógica para renderizar la interfaz según el estado actual
    console.log('Renderizando la pantalla:', currentScreen);
    switch (currentScreen) {
        case 'home':
            console.log('Tareas actuales:', app.tasks);
            break;
        // Otros casos para diferentes pantallas
    }
}

const app = {
    navigateTo: function(screen) {
        console.log('Navegando a la pantalla:', screen);      
        currentScreen = screen;
        
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        
        const screenEl = document.getElementById(`${screen}-screen`);
        if (screenEl) screenEl.classList.add('active');
        
        document.querySelectorAll('.nav-btn').forEach(btn => {
            if (btn.dataset.screen === screen) {
                btn.classList.add('bg-xp-primary', 'text-xp-darker', 'dark:bg-xp-primary', 'dark:text-xp-darker');
                btn.classList.remove('bg-gray-200', 'dark:bg-xp-card', 'text-gray-700', 'dark:text-gray-300');
            } else {
                btn.classList.remove('bg-xp-primary', 'text-xp-darker', 'dark:bg-xp-primary', 'dark:text-xp-darker');
                btn.classList.add('bg-gray-200', 'dark:bg-xp-card', 'text-gray-700', 'dark:text-gray-300');
            }
        });
        
        render();          
    },
    // Estado inicial de la aplicación con tareas de ejemplo
    tasks: [
        {
            id: generateId(),
            title: 'Define 3 MITs for today',
            description: 'Plan the most important tasks during breakfast',
            dueDate: todayStr,
            priority: 'high',
            tags: ['planning', 'morning'],
            subtasks: [],
            done: false,
            order: 1
        },
        {
            id: generateId(),
            title: 'Complete first deep work block',
            description: '60-minute focused coding session',
            dueDate: todayStr,
            priority: 'high',
            tags: ['deepwork', 'coding'],
            subtasks: [
                { id: generateId(), text: 'Review yesterday\'s progress', done: false },
                { id: generateId(), text: 'Work on main feature', done: false },
                { id: generateId(), text: 'Commit and push changes', done: false }
            ],
            done: false,
            order: 2
        },
        {
            id: generateId(),
            title: 'Learning block: New JavaScript patterns',
            description: '30-45 minutes of focused learning',
            dueDate: todayStr,
            priority: 'medium',
            tags: ['learning', 'javascript'],
            subtasks: [],
            done: false,
            order: 3
        },
        {
            id: generateId(),
            title: 'End of day review',
            description: 'Review accomplishments and plan tomorrow',
            dueDate: todayStr,
            priority: 'medium',
            tags: ['planning', 'review'],
            subtasks: [],
            done: false,
            order: 4
        },
        {
            id: generateId(),
            title: 'Refactor authentication module',
            description: 'Improve code quality and add tests',
            dueDate: formatDate(new Date(today.getTime() + 86400000)),
            priority: 'high',
            tags: ['coding', 'refactor'],
            subtasks: [],
            done: false,
            order: 5
        }
    ]
};

window.addEventListener('load', () => {
    // Modo oscuro basado en la preferencia del usuario o del sistema
    document.documentElement.classList.toggle("dark",
        localStorage.theme === "dark" ||
            (!("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches),
    );
    // Whenever the user explicitly chooses light mode
    localStorage.theme = "light";
    // Whenever the user explicitly chooses dark mode
    localStorage.theme = "dark";
    // Whenever the user explicitly chooses to respect the OS preference
    localStorage.removeItem("theme");

    console.log('Página cargada. Iniciando seguimiento de analíticas...');
    // Evento personalizado para Google Analytics 4 vía Tag Manager
    document.addEventListener('DOMContentLoaded', function() {
        /*
        Para medir los clics en enlaces con Google Analytics 4:
        1. Este script envía un evento 'click_link' al dataLayer cada vez que se hace clic en un enlace.
        2. En Google Tag Manager, crea una nueva etiqueta de GA4 tipo "Evento" y configúrala para escuchar el evento 'click_link'.
        3. Mapea las variables 'link_url' y 'link_content' como parámetros personalizados en el evento de GA4.
        4. Así podrás ver en Analytics el número de clics y detalles de cada enlace.
        */
        document.querySelectorAll('a').forEach(function(link) {
            link.addEventListener('click', function(e) {
                if (window.dataLayer) {
                    window.dataLayer.push({
                        event: 'click_link',
                        link_url: link.href,
                        link_content: link.textContent.trim()
                    });
                }
            });
        });
    });
});