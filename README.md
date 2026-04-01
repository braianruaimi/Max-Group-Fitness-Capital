# Max Group Fitness Capital


## Ingreso al sitio (producción)

[Ir a la landing en producción](https://braianruaimi.github.io/Max-Group-Fitness-Capital/)

> Si experimentas problemas de visualización en móviles, forzar recarga sin caché (Ctrl+F5 o limpiar caché del navegador).

## Resumen

Max Group Fitness Capital es una landing premium de captacion inversora para un ecosistema fitness en expansion. La app esta construida como un sitio estatico en HTML, CSS y JavaScript vanilla, publicado en GitHub Pages desde la rama main.

La experiencia combina:

- identidad visual dark fintech con glassmorphism y neon verde/cyan
- narrativa institucional y comercial para presentar la oportunidad
- calculadora de inversion con retornos proyectados
- modal de contacto unificado para captacion por WhatsApp
- graficas interactivas con Chart.js
- animaciones cinematicas, parallax, reveal y tarjetas con tilt

## Objetivo del sitio

El sitio esta pensado para convertir trafico en consultas calificadas de inversion. Toda la estructura empuja hacia una accion principal: abrir el formulario flotante, completar datos del potencial inversor y continuar la conversacion por WhatsApp con el equipo de Max Group Fitness Capital.

## Stack

- HTML5
- CSS3
- JavaScript vanilla
- Chart.js por CDN
- GitHub Pages para publicacion

## Soporte PWA e iOS

- manifest configurado para modo standalone
- service worker local en sw.js para cache del shell y actualizaciones
- iconos PNG para manifest y apple-touch-icon de 180x180
- flujo de instalacion especifico para Safari en iPhone y iPad mediante "Agregar a pantalla de inicio"
- ajustes visuales para safe areas de iOS con notch y barra inferior

No requiere build, bundler ni dependencias de npm.

## Funcionalidades principales

### 1. Hero institucional

- mensaje central orientado a inversion en ecosistema fitness
- metricas de traccion y expansion
- paneles visuales con animacion cinematica
- CTA principal para simular inversion o abrir el formulario

### 2. Ecosistema de marcas

Se presentan cuatro unidades de negocio:

- Ateneo Gym
- Mujeres Gym
- Nueva sede
- Suplementos

Cada tarjeta tiene preview interactiva con:

- modal flotante contextual
- mini grafica de crecimiento tipo trading
- highlights de base, estado actual y target
- glow persistente en la tarjeta activa

### 3. Dashboard financiero

Incluye visualizaciones con Chart.js para representar:

- crecimiento proyectado a 12 meses
- distribucion del mix de negocios
- feed visual estilo terminal con estados en vivo
- contadores sincronizados de ocupacion, crecimiento anual y holding minimo

### 4. Valuacion consolidada

Se agrego una seccion dedicada a la valuacion total del ecosistema:

- valor consolidado estimado: USD 350.000
- grafica con subidas y bajadas, pero tendencia general alcista
- indicadores de base anual, peak operativo y traccion actual

### 5. Calculadora de inversion

La calculadora muestra en tiempo real:

- capital ingresado
- ganancia mensual proyectada
- ganancia estimada a 90 dias
- capital total estimado a 3 meses
- capital total y ganancia neta a 6 meses
- capital total y ganancia neta a 12 meses

#### Reglas actuales de la calculadora

- monto minimo validado: ARS 2.500.000
- rango disponible: ARS 2.5M a ARS 10M
- incremento por opcion: ARS 500.000
- retorno proyectado usado en la simulacion: 4% mensual

El monto ya no se escribe libremente. Se selecciona desde un desplegable para asegurar consistencia entre calculadora, modal de contacto y mensaje enviado por WhatsApp.

### 6. Modal de contacto unificado

Todas las acciones de contacto e inversion abren un unico modal flotante.

Campos del formulario:

- nombre y apellido
- domicilio
- numero de telefono
- email
- monto a invertir
- plazo de 3, 6 o 12 meses

Dentro del modal se calcula automaticamente:

- ganancia estimada segun monto y plazo
- capital total estimado

Al enviar:

- se genera el mensaje completo con todos los datos
- se abre WhatsApp con la consulta armada
- se muestra un modal de operacion exitosa

## Identidad visual y UX

La interfaz busca un tono premium, oscuro y tecnologico. Entre los recursos visuales que usa:

- auroras de fondo
- orb glow
- grilla neon en perspectiva
- scanlines sutiles
- glassmorphism en paneles y tarjetas
- reveal por seccion
- parallax por scroll y puntero
- tilt 3D en cards destacadas
- cursor glow en desktop

## Estructura del proyecto

- [index.html](index.html): estructura completa de la landing, secciones, modales y CTAs
- [styles.css](styles.css): sistema visual, layout, responsive, animaciones y estilos del modal
- [script.js](script.js): interacciones, charts, calculadora, previews, live feed y flujo de contacto por WhatsApp
- [README.md](README.md): documentacion del proyecto

## Secciones actuales de la landing

La pagina incluye estas secciones principales:

- topbar con navegacion y CTA de inversion
- hero principal
- trust bar
- investment thesis
- business ecosystem
- dashboard financiero
- valuacion consolidada
- investment terms
- calculadora de inversion
- bloque institucional
- capital structure
- FAQ y contacto
- CTA final
- boton flotante de WhatsApp

## Supuestos comerciales hoy cargados en la app

- base de clientes activos: 550+
- unidades de negocio visibles: 4
- retorno mensual proyectado: 4%
- holding minimo: 90 dias
- ticket minimo de entrada: ARS 2.500.000
- valuacion consolidada informada: USD 350.000

## Flujo principal de conversion

1. El usuario llega a la landing.
2. Explora propuesta, marcas, terminos y simulador.
3. Hace click en invertir, WhatsApp o cualquier CTA de contacto.
4. Se abre el modal de inversion.
5. Completa datos, elige monto y plazo.
6. Ve retorno estimado en tiempo real.
7. Envia la consulta a WhatsApp.
8. Recibe confirmacion visual de operacion exitosa.

## Publicacion

El proyecto esta pensado para publicarse directo desde GitHub Pages usando la rama main.

Configuracion recomendada en GitHub:

1. Abrir el repositorio.
2. Ir a Settings.
3. Entrar en Pages.
4. En Build and deployment seleccionar Deploy from a branch.
5. Elegir la rama main.
6. Elegir la carpeta root.

## Desarrollo local

Como es un sitio estatico, alcanza con abrir index.html en el navegador. Si se quiere una vista mas estable para pruebas locales, se puede usar cualquier servidor simple.

Ejemplo con PowerShell y Python:

1. Ir a la carpeta del proyecto.
2. Ejecutar python -m http.server 8080.
3. Abrir http://localhost:8080.

## Personalizaciones frecuentes

Los puntos mas habituales para modificar son:

- textos comerciales e institucionales en [index.html](index.html)
- paleta, glow, fondos y responsive en [styles.css](styles.css)
- montos validos, retorno mensual y logica de proyeccion en [script.js](script.js)
- numero de WhatsApp de destino en [script.js](script.js)
- datasets de las graficas en [script.js](script.js)

## Consideraciones

- La rentabilidad mostrada es proyectada, no garantizada.
- El sitio no guarda datos en backend.
- Toda la captura de leads se resuelve via WhatsApp.
- No hay panel administrativo ni persistencia de consultas.

## Estado actual

La version actual ya incluye:

- modal de inversion unificado
- dropdown cerrado de montos validos
- calculadora sincronizada con el minimo de ARS 2.500.000
- valuacion consolidada con grafica propia
- experiencia visual premium orientada a conversion