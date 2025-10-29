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

const app = {
    navigateTo: function(screen) {
        console.log('Navegando a la pantalla:', screen);                
    }
};

// If load web site load the analytics events

window.addEventListener('load', () => {
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