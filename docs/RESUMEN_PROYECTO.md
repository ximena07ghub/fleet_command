# Resumen actual de Fleet Command

Fleet Command es un videojuego web 3D de estrategia naval desarrollado con HTML, CSS, JavaScript, Three.js, Node.js, Express, Socket.IO, PHP y MySQL.

## Flujo

```text
Inicio / Facebook
-> Dashboard
-> Configuración de partida
-> Juego 3D
-> Resultado
-> Web Service PHP
-> MySQL
-> Puntuaciones / Perfil
```

## Juego 3D

- Yamato FBX como barco estándar.
- Segundo FBX para la IA en dificultad difícil.
- Carga con `FBXLoader` y `LoadingManager`.
- OBJ + MTL conservado como referencia de clase.
- Selección con `Raycaster`.
- Movimiento por mouse, WASD y flechas.
- Movimiento inmediato entre celdas.
- Cada jugador permanece dentro de su mitad del tablero.
- Selección y deselección individual por clic.
- Cámara orbital con arrastre del mouse y zoom con rueda.
- Límites y colisiones con `Box3`.
- Iluminación y escenarios Playa, Tormenta y Ártico.

## Red

Socket.IO maneja salas para dos jugadores y sincroniza posiciones, flota, casilla seleccionada y pausa. La sala conserva temporalmente el lugar de una pestaña si ocurre una desconexión breve.

## Puntuación

El código de final de partida ya está preparado. Cuando el futuro combate detecte victoria o derrota, `finalizarPartida()` calcula el puntaje, muestra el resultado y llama al Web Service.

El backend utiliza `gcw.score` y ofrece endpoints para guardar, consultar clasificación y consultar perfil.

## Facebook

Facebook Login utiliza `public_profile` y `email`. El perfil recibido crea una sesión real de Fleet Command y continúa al dashboard sin el `alert` de prueba anterior.

## Próximo paso

Implementar disparos, impactos, hundimientos y la condición real que invoque `finalizarPartida()`.
