# Resumen actual de Fleet Command

Fleet Command es un videojuego web 3D de estrategia naval construido con HTML, CSS, JavaScript, WebGL y Three.js. El proyecto ya conserva las pantallas del primer avance y ahora agrega la infraestructura del segundo avance: servidor Node.js, Express, Socket.IO, escena 3D real, barcos provisionales animados, colisiones, HUD y salas para dos jugadores.

## Flujo principal

```text
index.html
→ dashboard.html
→ loading.html
→ juego.html
```

El dashboard guarda solamente configuración temporal permitida: rival, modo, mapa y dificultad. `juego.html` interpreta esos valores y construye la escena.

## Juego 3D

La partida utiliza Three.js instalado con npm y servido por `server.js`. La escena contiene:

- `WebGLRenderer`;
- cámara perspectiva;
- `setAnimationLoop`;
- mar y tablero 3D;
- `AmbientLight`;
- `DirectionalLight`;
- `PointLight`;
- materiales `MeshPhongMaterial`;
- animación de balanceo;
- `Raycaster` para selección;
- colisiones por cajas `Box3`;
- límites del tablero.

Los barcos actuales son placeholders y se reemplazarán por OBJ/FBX cuando se reciban los modelos finales.

## Multijugador

`server.js` ejecuta Express y Socket.IO en el puerto 3000. Cada sala admite dos jugadores y replica:

- posición del barco;
- rotación;
- flota inicial;
- selección de casilla;
- estado de pausa del rival.

La demostración está preparada para Chrome normal + Chrome incógnito.

## Interfaz

Bootstrap se utiliza como apoyo para el HUD y los modales dentro de la partida. Los estilos originales de Fleet Command continúan en CSS propio.

El menú de pausa real ya no navega a otra página: se abre encima del canvas y mantiene viva la conexión de Socket.IO.

## Sonido

Se conserva la música y el sistema de efectos por JavaScript del primer avance. La música también puede reproducirse dentro de la partida respetando los ajustes locales.

## Persistencia

`localStorage` se usa únicamente para preferencias y configuración temporal. El código ya no registra victorias, derrotas ni puntajes oficiales en almacenamiento local.

Se incluye una preparación de PHP + MySQL para el tercer avance:

```text
backend-xampp/fleet_command_api/
database/fleet_command.sql
puntuaciones.html
```

La tabla de puntuaciones consulta datos por `fetch` cuando la API de XAMPP está activa.

## Escenarios, dificultad y modos

La arquitectura ya lee:

- Playa, Tormenta y Ártico;
- Normal y Difícil;
- Clásico y Ráfaga;
- Online y Contra IA.

En esta versión los escenarios ya modifican el ambiente visual y las dificultades cambian tamaño de tablero/cantidad de barcos. Las reglas completas de Clásico/Ráfaga se desarrollarán sobre esta misma estructura.

## Próximo paso principal

Cuando estén disponibles los modelos finales, integrar los OBJ/FBX y texturas mediante `js/juego/modelos.js`, ajustar escala/orientación y conectar sus clips FBX al `AnimationMixer`.

Después se puede continuar con disparos, impactos, condiciones de victoria/derrota, power-ups, partículas, IA final y registro de puntajes en MySQL.
