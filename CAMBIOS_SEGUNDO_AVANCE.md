# Fleet Command — cambios para el segundo avance

## Objetivo de esta versión

Esta versión transforma el primer avance, que estaba centrado en pantallas y una práctica de iluminación, en una base real de videojuego 3D con **Three.js + WebGL**, **Node.js + Express**, **Socket.IO**, HUD con **Bootstrap**, colisiones básicas y una estructura preparada para integrar los modelos finales `.OBJ`/`.FBX` cuando estén disponibles.

La lógica completa de ganar/perder, power-ups y combate final todavía no se fuerza en esta versión. El objetivo principal es que el motor 3D, la sincronización de dos navegadores y la arquitectura ya estén funcionando para continuar sobre la misma base.

## Lo más importante que se implementó

- `INICIAR PARTIDA` ahora abre `juego.html`; ya no dirige al ejercicio de cubo/esfera/cono.
- Servidor local con Express en `http://localhost:3000`.
- Socket.IO para salas de máximo dos jugadores.
- Prueba real con Chrome normal + Chrome incógnito.
- Replicación en tiempo real de posición y rotación de barcos.
- Escena Three.js con `WebGLRenderer`, cámara y `setAnimationLoop`.
- Luz ambiental, direccional y puntual.
- Materiales `MeshPhongMaterial` sensibles a iluminación.
- Barcos provisionales 3D mientras llegan los modelos definitivos.
- Balanceo animado de los barcos sobre el agua.
- Selección por `Raycaster`.
- Movimiento con clic, WASD/flechas y rotación con Q/E.
- Colisiones entre barcos de la misma flota y límites del tablero.
- Tres configuraciones visuales iniciales: Playa, Tormenta y Ártico.
- Dos tamaños de tablero según la dificultad seleccionada.
- Modo Online y una IA provisional de movimiento simple para probar la arquitectura.
- HUD y pausa usando Bootstrap local.
- Pausa sin perder la conexión de Socket.IO.
- Pantalla de puntuaciones preparada para consultar un Web Service/MySQL.
- Backend PHP/MySQL de preparación para el tercer avance.
- Los puntajes oficiales ya no se registran con `localStorage`.

## Archivos nuevos

### Servidor y dependencias

- `server.js`: servidor Express y servidor Socket.IO. Sirve el proyecto, crea salas, asigna Jugador 1/Jugador 2 y replica estados de barcos.
- `package.json`: declara Express, Socket.IO y Three.js e incluye los comandos `npm start` y `npm run dev`.

### Juego 3D

- `juego.html`: pantalla principal de la partida. Contiene el canvas generado por Three.js, HUD, modal de sala y modal de pausa.
- `css/juego.css`: apariencia del HUD, lobby y pausa sobre la escena 3D.
- `js/juego/main.js`: integra escena, barcos, controles, Raycaster, colisiones, red, sala, pausa y modo IA provisional.
- `js/juego/escena.js`: crea cámara, renderer, mar, tablero, luces y decoración según el escenario seleccionado.
- `js/juego/barcos.js`: crea los barcos provisionales, animación de balanceo, selección, colisiones, movimiento y serialización para red.
- `js/juego/red.js`: encapsula los eventos de Socket.IO utilizados por la partida.
- `js/juego/configuracion.js`: lee mapa, modo, dificultad y rival seleccionados en el dashboard.
- `js/juego/modelos.js`: punto preparado para cargar `.OBJ` y `.FBX`; también prepara materiales iluminados y `AnimationMixer` si el FBX incluye animaciones.
- `assets/models/README_MODELOS.md`: indica dónde colocar los modelos y texturas cuando estén disponibles.

### Bootstrap

- `assets/vendor/bootstrap/bootstrap.min.css`
- `assets/vendor/bootstrap/bootstrap.bundle.min.js`

Bootstrap queda incluido dentro del proyecto para que el HUD y los modales no dependan de un CDN durante la demostración.

### Puntuaciones y preparación de MySQL

- `puntuaciones.html`: tabla visual de clasificación.
- `css/puntuaciones.css`: estilos de la tabla.
- `js/puntuaciones.js`: consulta el Web Service mediante `fetch` y muestra un estado claro si XAMPP aún no está configurado.
- `database/fleet_command.sql`: crea la base `fleet_command` y las tablas `usuarios` y `puntajes`.
- `backend-xampp/fleet_command_api/config.php`: datos de conexión a MySQL.
- `backend-xampp/fleet_command_api/conexion.php`: conexión PDO.
- `backend-xampp/fleet_command_api/cors.php`: permite las peticiones desde Node en el puerto 3000.
- `backend-xampp/fleet_command_api/health.php`: prueba de conexión PHP/MySQL.
- `backend-xampp/fleet_command_api/obtener_puntajes.php`: devuelve la clasificación en JSON.
- `backend-xampp/fleet_command_api/guardar_puntaje.php`: endpoint POST preparado para registrar resultados cuando se implemente ganar/perder.

## Archivos modificados

- `dashboard.html`: añade acceso a puntuaciones y conserva la configuración del primer avance.
- `js/dashboard.js`: guarda configuración permitida en `localStorage` y abre `juego.html` mediante la pantalla de carga.
- `index.html`: corrige el cierre extra de botón, agrega Puntuaciones y añade el estado de sesión/audio que `index.js` esperaba.
- `js/index.js`: maneja Puntuaciones y valida elementos del estado de sesión.
- `js/common.js`: conserva preferencias, audio y sesión provisional; elimina el registro local de victorias/derrotas/puntajes.
- `perfil.html`: cambia el perfil para indicar que los datos de rendimiento pertenecen al backend.
- `js/perfil.js`: intenta consultar estadísticas desde MySQL y nunca usa resultados locales como marcador oficial.
- `css/index.css`: añade el estado de sesión/audio al panel principal.
- `.gitignore`: añade `node_modules`, `.env` y logs de npm.
- `RESUMEN_PROYECTO.md`: actualizado al estado del segundo avance.

## Archivos conservados

- Las pantallas del primer avance se mantienen: inicio, dashboard, reglas, ajustes, loading y perfil.
- `ejercicio/ejercicio.html` se conserva como ejercicio de clase; ya no funciona como partida final.
- `pause.html` se conserva como antecedente del primer avance, aunque la pausa real del juego ahora está dentro de `juego.html` como Modal de Bootstrap.

## Archivos eliminados

No se eliminó ningún archivo funcional del proyecto.

## Cómo probar el multijugador

1. Ejecutar `npm install` una sola vez.
2. Ejecutar `npm start`.
3. Abrir `http://localhost:3000` en Chrome normal.
4. Iniciar sesión y elegir `Online`.
5. Entrar a la partida y pulsar `CREAR SALA`.
6. Copiar el código mostrado.
7. Abrir Chrome incógnito y entrar también a `http://localhost:3000`.
8. Iniciar sesión, seleccionar `Online`, abrir la partida y usar `UNIRSE` con el código.
9. Seleccionar un barco con clic y moverlo. El otro navegador debe recibir posición y rotación en tiempo real.

## Qué falta cuando lleguen los modelos

No hace falta rehacer la red ni las colisiones. Se necesitará recibir:

- archivos `.FBX` y/o `.OBJ`;
- todas las texturas;
- `.MTL` si un OBJ depende de ese archivo;
- indicación de cuál modelo representa cada tipo de barco, si hay varios;
- si son FBX animados, conservar sus clips de animación.

Entonces se sustituirán los barcos provisionales dentro de la capa visual y se ajustarán escala, orientación y animaciones.

## Pendientes intencionales para continuar hacia el tercer avance

- combate completo y condiciones finales de victoria/derrota;
- disparos y detección de impacto;
- Sonar, Escudo y Doble disparo;
- comportamiento de IA final;
- partículas de lluvia/nieve/explosiones;
- reglas diferenciadas completas entre Clásico y Ráfaga;
- registro de puntaje desde el final de partida hacia `guardar_puntaje.php`;
- autenticación mediante API externa;
- integrar los modelos finales.

La arquitectura ya contempla estos puntos para evitar rehacer el segundo avance.
