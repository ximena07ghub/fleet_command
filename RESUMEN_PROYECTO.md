# Resumen del proyecto Fleet Command

## Funcion general

Fleet Command es una interfaz web para un videojuego de estrategia naval. El avance actual se enfoca en pantallas, navegacion, configuracion de partida, perfil local, reglas, ajustes de audio y una pantalla de carga entre secciones.

La estructura esta hecha con HTML, CSS y JavaScript separados por ventana. Esto ayuda a explicar el proyecto por partes: cada pantalla tiene su archivo visual, su hoja de estilos y, cuando lo necesita, su archivo de comportamiento.

## Ventanas actuales

- `index.html`: muestra el menu inicial, permite iniciar sesion, abrir reglas, abrir ajustes y salir del sistema.
- `dashboard.html`: funciona como pantalla principal de configuracion de partida. Permite elegir rival, modo, mapa y dificultad.
- `loading.html`: muestra una barra de progreso simulada antes de enviar al usuario a otra pantalla.
- `juego.html`: abre una demostracion WebGL con iluminacion ambiental y luz focal.
- `ajustes.html`: permite activar o desactivar musica, efectos y modificar volumenes.
- `perfil.html`: muestra nombre, partidas, victorias, derrotas, efectividad e historial local.
- `reglas.html`: organiza reglas, modos, dificultad e items en pestanas.
- `pause.html`: presenta un menu de pausa visual con opciones de continuar, reiniciar, ajustes y salir.

## Navegacion

El flujo principal inicia en `index.html`. Si el usuario intenta entrar al dashboard sin sesion, aparece el modal de login. Al iniciar sesion correctamente, se usa `loading.html` para mostrar una transicion antes de llegar a `dashboard.html`.

Desde el dashboard se puede abrir reglas, perfil y ajustes. Tambien se puede presionar `INICIAR PARTIDA` para guardar la configuracion y abrir la demo de iluminacion usando la pantalla de carga. Las pantallas secundarias usan el parametro `from` para saber si deben volver al dashboard o al inicio.

La pantalla de carga usa `sessionStorage` para recordar a que destino debe redirigir. El perfil, los ajustes y las estadisticas usan almacenamiento del navegador para conservar informacion durante el uso local del proyecto.

## Tecnologias usadas

- HTML: estructura de cada ventana y formularios.
- CSS: estilos visuales, fondos, paneles, botones, responsive y efectos HUD.
- JavaScript: interacciones, modales, seleccion de opciones, audio, sesion y navegacion.
- WebGL: escena sencilla con objetos 3D, shader de color e iluminacion.
- LocalStorage: guarda usuarios, ajustes y configuracion local.
- SessionStorage: mantiene sesion activa y destino temporal de carga.
- Audio local y Web Audio API: reproduce musica, clicks y sonido alternativo.


## Avance para el primer parcial

Para el primer parcial, el proyecto va bien encaminado porque ya cuenta con varias pantallas visuales completas: menu inicial, ajustes, perfil, reglas, pantalla de carga, dashboard y pausa. Tambien hay estilos CSS propios, imagenes, logo, fondos, botones, modales, sonidos y una navegacion general entre secciones.

La rubrica del primer avance pide principalmente estilos, colores, imagenes y pantallas como menu inicial, configuraciones, puntuaciones, pausa y pantalla donde estara el juego. El proyecto ya cubre buena parte de eso con una identidad visual consistente, varias ventanas navegables y una demo WebGL enlazada desde iniciar partida.

Tambien existe almacenamiento local para usuarios, sesion, ajustes y estadisticas. Esto ayuda a explicar que el proyecto ya tiene una base funcional, no solo pantallas decorativas.

## Observaciones sin corregir

- `index.js` busca elementos como `estadoSesion` y `textoSesion`, pero no aparecen en `index.html`. Esto puede generar error si se ejecuta esa funcion sin validar esos elementos.
- En `index.html` hay un cierre extra de `</button>` dentro del menu principal. No se corrigio en esta pasada porque se pidio solo reportar fallas.
- La pantalla `juego.html` es una demo temporal de iluminacion, no la partida final.
- `pause.html` funciona visualmente, pero sus botones solo muestran la accion en consola.
- Algunas estructuras HTML pueden acomodarse mejor para que el codigo sea mas facil de mantener.

## Mejoras recomendadas

- Reemplazar la demo `juego.html` por la partida real cuando avance el proyecto.
- Agregar una seccion visible de puntuaciones si el profesor la revisa como pantalla separada.
- Hacer que el menu de pausa ejecute acciones reales cuando exista la partida.
- Revisar el inicio para que todos los elementos usados por JavaScript existan en HTML.
- Unificar nombres visibles y rutas para que la navegacion sea mas facil de explicar.
- Probar cada pantalla en Chrome antes de entregar para detectar errores de consola.

## Como explicar el avance

Una forma sencilla de presentarlo es decir que el proyecto ya tiene la interfaz principal del videojuego y el flujo de navegacion entre pantallas. El usuario puede iniciar sesion, configurar audio, revisar reglas, ver su perfil, elegir modo, mapa y dificultad, y abrir una demostracion de iluminacion desde iniciar partida.

Tambien puedes explicar que el codigo esta dividido por responsabilidades: HTML para estructura, CSS para el estilo visual y JavaScript para interactividad, almacenamiento local y navegacion. Esa separacion permite seguir construyendo el juego sin mezclar todo en un solo archivo.
