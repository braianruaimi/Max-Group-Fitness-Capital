# Max Group Fitness Capital


## Ingreso al sitio (producción)

[Ir a la landing en producción](https://maxgroupfitness.site/)

> Si experimentas problemas de visualización en móviles, forzar recarga sin caché (Ctrl+F5 o limpiar caché del navegador).

## Resumen

Max Group Fitness Capital es una landing premium de captación inversora para un ecosistema fitness en expansión. La app está construida como un sitio estático en HTML, CSS y JavaScript vanilla, publicado en GitHub Pages desde la rama main.

La experiencia combina:

- identidad visual dark fintech con glassmorphism y neon verde/cyan
- narrativa institucional y comercial para presentar la oportunidad
- calculadora de inversión con retornos proyectados
- modal de contacto unificado para captación por WhatsApp
- gráficas interactivas con Chart.js
- animaciones cinemáticas, parallax, reveal y tarjetas con tilt

## Objetivo del sitio

El sitio está pensado para convertir tráfico en consultas calificadas de inversión. Toda la estructura empuja hacia una acción principal: abrir el formulario flotante, completar datos del potencial inversor y continuar la conversación por WhatsApp con el equipo de Max Group Fitness Capital.

## Stack

- HTML5
- CSS3
- JavaScript vanilla
- Chart.js por CDN
- GitHub Pages para publicación

## Soporte PWA e iOS

- manifest configurado para modo standalone
- service worker local en sw.js para caché del shell y actualizaciones
- iconos PNG para manifest y apple-touch-icon de 180x180
- flujo de instalación específico para Safari en iPhone y iPad mediante "Agregar a pantalla de inicio"
- ajustes visuales para safe areas de iOS con notch y barra inferior

No requiere build, bundler ni dependencias de npm.

## Funcionalidades principales

### 1. Hero institucional

- mensaje central orientado a inversión en ecosistema fitness
- métricas de tracción y expansión
- paneles visuales con animación cinemática
- CTA principal para simular inversión o abrir el formulario

### 2. Ecosistema de marcas

Se presentan cuatro unidades de negocio:

- Ateneo Gym
- Mujeres Gym
- Nueva sede
- Suplementos

Cada tarjeta tiene preview interactiva con:

- modal flotante contextual
- mini gráfica de crecimiento tipo trading
- highlights de base, estado actual y target
- glow persistente en la tarjeta activa

### 3. Dashboard financiero

Incluye visualizaciones con Chart.js para representar:

- crecimiento proyectado a 12 meses
- distribución del mix de negocios
- feed visual estilo terminal con estados en vivo
- contadores sincronizados de ocupación, crecimiento anual y holding mínimo

### 4. Valuación consolidada

Se agregó una sección dedicada a la valuación total del ecosistema:

- valor consolidado estimado: USD 350.000
- gráfica con subidas y bajadas, pero tendencia general alcista
- indicadores de base anual, peak operativo y tracción actual

### 5. Calculadora de inversión

La calculadora muestra en tiempo real:

- capital ingresado
- ganancia mensual proyectada
- ganancia estimada a 90 días
- capital total estimado a 3 meses
- capital total y ganancia neta a 6 meses
- capital total y ganancia neta a 12 meses

#### Reglas actuales de la calculadora

- monto mínimo validado: ARS 2.500.000
- rango disponible: ARS 2.5M a ARS 10M
- incremento por opción: ARS 500.000
- retorno proyectado usado en la simulación: 4% mensual

El monto ya no se escribe libremente. Se selecciona desde un desplegable para asegurar consistencia entre calculadora, modal de contacto y mensaje enviado por WhatsApp.

### 6. Modal de contacto unificado

Todas las acciones de contacto e inversión abren un único modal flotante.

Campos del formulario:

- nombre y apellido
- domicilio
- número de teléfono
- email
- monto a invertir
- plazo de 3, 6 o 12 meses

Dentro del modal se calcula automáticamente:

- ganancia estimada según monto y plazo
- capital total estimado

Al enviar:

- se genera el mensaje completo con todos los datos
- se abre WhatsApp con la consulta armada
- se muestra un modal de operación exitosa

## Identidad visual y UX

La interfaz busca un tono premium, oscuro y tecnológico. Entre los recursos visuales que usa:

- auroras de fondo
- orb glow
- grilla neón en perspectiva
- scanlines sutiles
- glassmorphism en paneles y tarjetas
- reveal por sección
- parallax por scroll y puntero
- tilt 3D en cards destacadas
- cursor glow en desktop

## Estructura del proyecto

- [index.html](index.html): estructura completa de la landing, secciones, modales y CTAs
- [styles.css](styles.css): sistema visual, layout, responsive, animaciones y estilos del modal
- [script.js](script.js): interacciones, charts, calculadora, previews, live feed y flujo de contacto por WhatsApp
- [README.md](README.md): documentación del proyecto

## Secciones actuales de la landing

La página incluye estas secciones principales:

- topbar con navegación y CTA de inversión
- hero principal
- trust bar
- investment thesis
- business ecosystem
- dashboard financiero
- valuación consolidada
- investment terms
- calculadora de inversión
- bloque institucional
- capital structure
- FAQ y contacto
- CTA final
- botón flotante de WhatsApp

## Supuestos comerciales hoy cargados en la app

- base de clientes activos: 550+
- unidades de negocio visibles: 4
- retorno mensual proyectado: 4%
- holding mínimo: 90 días
- ticket mínimo de entrada: ARS 2.500.000
- valuación consolidada informada: USD 350.000

## Flujo principal de conversión

1. El usuario llega a la landing.
2. Explora propuesta, marcas, términos y simulador.
3. Hace click en invertir, WhatsApp o cualquier CTA de contacto.
4. Se abre el modal de inversión.
5. Completa datos, elige monto y plazo.
6. Ve retorno estimado en tiempo real.
7. Envía la consulta a WhatsApp.
8. Recibe confirmación visual de operación exitosa.

## Publicación

El proyecto está pensado para publicarse directo desde GitHub Pages usando la rama main.

Configuración recomendada en GitHub:

1. Abrir el repositorio.
2. Ir a Settings.
3. Entrar en Pages.
4. En Build and deployment seleccionar Deploy from a branch.
5. Elegir la rama main.
6. Elegir la carpeta root.

## Desarrollo local

Como es un sitio estático, alcanza con abrir index.html en el navegador. Si se quiere una vista más estable para pruebas locales, se puede usar cualquier servidor simple.

Ejemplo con PowerShell y Python:

1. Ir a la carpeta del proyecto.
2. Ejecutar python -m http.server 8080.
3. Abrir http://localhost:8080.

## Personalizaciones frecuentes

Los puntos más habituales para modificar son:

- textos comerciales e institucionales en [index.html](index.html)
- paleta, glow, fondos y responsive en [styles.css](styles.css)
- montos válidos, retorno mensual y lógica de proyección en [script.js](script.js)

## Fotos reales y rendimiento

Cuando se reemplacen placeholders por fotos reales de clientes, sedes o activos, mantener estas reglas para no degradar la carga del sitio:

- usar imágenes comprimidas en formato .jpg o .webp
- evitar PNG para fotos
- exportar cada imagen al tamaño real aproximado en que se va a mostrar
- priorizar WebP cuando no afecte compatibilidad del flujo de publicación
- revisar peso final antes de subir: idealmente liviano para mobile y 4G
- si se actualizan assets visibles en producción, recordar versionar el service worker

Objetivo: mantener una experiencia rápida en desktop, Android e iPhone aun cuando la landing empiece a usar fotos reales.
- número de WhatsApp de destino en [script.js](script.js)
- datasets de las gráficas en [script.js](script.js)

## Consideraciones

- La rentabilidad mostrada es proyectada, no garantizada.
- El sitio no guarda datos en backend.
- Toda la captura de leads se resuelve vía WhatsApp.
- No hay panel administrativo ni persistencia de consultas.

## Estado actual

La versión actual ya incluye:

- modal de inversión unificado
- dropdown cerrado de montos válidos
- calculadora sincronizada con el mínimo de ARS 2.500.000
- valuación consolidada con gráfica propia
- experiencia visual premium orientada a conversión