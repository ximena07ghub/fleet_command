# Ajuste de controles y multijugador

Esta revisión corrige cuatro puntos de la partida 3D sin volver el código innecesariamente complejo.

## 1. Selección y deselección

La función principal sigue siendo `seleccionarBarco(barco)` en `js/juego/main.js`.

Ahora funciona así:

```text
clic en un barco sin seleccionar -> lo selecciona
clic en otro barco               -> cambia la selección
clic otra vez en el mismo barco  -> lo deselecciona
```

No se selecciona ningún barco automáticamente al comenzar la partida. Esto evita mover uno por accidente.

## 2. Movimiento

Se quitaron los controles Q/E porque en este avance no hacen falta.

Los controles de movimiento son solamente:

```text
W / Flecha arriba
S / Flecha abajo
A / Flecha izquierda
D / Flecha derecha
```

`alPulsarTecla(evento)` calcula la siguiente casilla y llama a `intentarMoverSeleccionado(x, z)`.

Después `moverBarcoSeguro()` comprueba:

1. que el barco no salga del tablero;
2. que no pase a la mitad del rival;
3. que no atraviese otro barco.

Si todo es correcto, cambia directamente `position.x` y `position.z`.

## 3. Cada jugador conserva su mitad

La validación está en `js/juego/barcos.js`, dentro de `dentroDelLadoAsignado()`.

- Jugador 1 permanece en la mitad positiva del eje Z.
- Jugador 2 permanece en la mitad negativa del eje Z.

La función revisa la caja completa del modelo, no solo su punto central. Por eso el Yamato tampoco puede quedar a medias sobre la línea central.

## 4. Cámara 3D

`js/juego/escena.js` usa `OrbitControls`, que ya forma parte de los complementos de Three.js.

Controles:

```text
arrastrar con clic izquierdo -> observar el tablero desde otro ángulo
rueda del mouse             -> acercar / alejar
```

El paneo está desactivado para que el centro del tablero no se pierda. También existen límites de distancia y ángulo.

Para evitar que arrastrar la cámara seleccione un barco por accidente, `main.js` distingue entre:

- clic corto;
- arrastre de más de unos cuantos píxeles.

Un clic corto se procesa como selección. Un arrastre se deja exclusivamente para la cámara.

## 5. Qué pasó con las salas

El mensaje de la captura `La sala no existe.` corresponde al comportamiento del servidor anterior: la sala dependía únicamente del socket conectado y podía desaparecer después de una desconexión o si seguía ejecutándose una versión vieja de `server.js`.

Además, modificar `server.js` no cambia el proceso de Node que ya está abierto. Después de copiar este parche debes detenerlo y volverlo a iniciar.

El flujo corregido usa un identificador temporal por pestaña:

```text
pestaña -> clienteId temporal -> sala -> slot 1 o 2
```

Si Socket.IO pierde la conexión brevemente, el servidor conserva ese slot durante 30 segundos. Cuando la pestaña vuelve a conectarse con el mismo identificador, recupera su slot en lugar de crear otro jugador.

La sala continúa guardándose solamente en memoria. Si cierras o reinicias `npm start`, los códigos anteriores dejan de existir y debes crear una sala nueva.

## 6. Cómo probar correctamente el multijugador

Después de copiar los archivos:

```text
Ctrl + C en la terminal donde corre Node
npm start
```

Luego:

### Ventana normal

1. entra a `http://localhost:3000`;
2. inicia sesión;
3. selecciona partida Online;
4. crea una sala;
5. copia el código.

### Ventana incógnito

1. entra a `http://localhost:3000`;
2. inicia sesión;
3. selecciona partida Online;
4. escribe exactamente el código anterior;
5. pulsa `UNIRSE`.

Debe verse:

```text
SALA ABCDE / 2/2
```

Al mover un barco del Jugador 1, la otra ventana debe recibir esa posición, y viceversa.

## 7. Funciones importantes que debes saber explicar

### `seleccionarBarco(barco)`
Guarda cuál barco está activo y permite deseleccionarlo haciendo clic nuevamente sobre él.

### `moverBarcoSeguro(...)`
Comprueba límites, mitad del jugador y colisiones antes de mover el barco.

### `alPulsarTecla(evento)`
Detecta WASD y flechas y calcula la siguiente casilla.

### `alPulsarCanvas(evento)`
Usa `Raycaster` para saber si hiciste clic sobre un barco o una casilla.

### `registrarInicioPuntero()` y `procesarFinPuntero()`
Distinguen un clic para seleccionar de un arrastre para mover la cámara.

### `OrbitControls`
Permite rotar la cámara alrededor del tablero y hacer zoom con la rueda.

### `crearClienteRed()`
Abre la conexión de Socket.IO y guarda qué sala y slot corresponden a esa pestaña.

### `unirJugador()` en `server.js`
Comprueba que exista la sala, asigna J1/J2 y recupera el mismo slot si una pestaña se reconecta.

