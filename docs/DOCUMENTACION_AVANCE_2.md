# Fleet Command — documentación del avance actual

Este documento explica lo que ya hace el proyecto y, sobre todo, las funciones nuevas o modificadas en esta integración. La intención es que el código siga siendo entendible y defendible en clase.

## 1. Flujo general del proyecto

```text
index.html
  -> inicio de sesión manual o Facebook
  -> dashboard.html
  -> selección de rival / modo / mapa / dificultad
  -> loading.html
  -> juego.html
  -> final de partida
  -> Web Service PHP
  -> MySQL gcw.score
  -> puntuaciones.html y perfil.html
```

El proyecto usa dos servidores locales al mismo tiempo:

- Node.js en `http://localhost:3000`: sirve Fleet Command, Three.js y Socket.IO.
- Apache/XAMPP: sirve el Web Service PHP en `http://localhost/WebServices`.

MySQL guarda los resultados en la base `gcw`.

---

## 2. Modelos 3D integrados

Los modelos reales están en:

```text
public/models/fleet/yamato.fbx
public/models/fleet/enemigo_dificil.fbx
```

`yamato.fbx` es el barco estándar. `enemigo_dificil.fbx` se usa para la flota controlada por IA cuando la dificultad seleccionada es Difícil.

El OBJ/MTL del submarino se conserva en `public/models/` como referencia del ejercicio visto en clase; ya no representa la flota principal del juego.

### `js/juego/modelos.js`

#### `manager`
Es un `THREE.LoadingManager`. Sirve para saber cuándo empiezan, avanzan, terminan o fallan las cargas de recursos 3D.

- `manager.onStart`: avisa en consola que inició una carga.
- `manager.onProgress`: muestra el progreso.
- `manager.onLoad`: avisa que los recursos terminaron de cargar.
- `manager.onError`: avisa si una textura u otro recurso no pudo cargarse.

#### `materialIluminado(material)`
Si un modelo trae `MeshBasicMaterial`, lo convierte a `MeshPhongMaterial`. Esto permite que el modelo responda a las luces de la escena.

#### `prepararModelo(modelo)`
Recorre todas las mallas del modelo con `traverse()` y:

- activa sombras;
- permite recibir sombras;
- aplica materiales compatibles con iluminación.

#### `ajustarTamanoYCentro(modelo, longitudObjetivo)`
Evita tener que adivinar manualmente una escala enorme o diminuta para cada FBX.

Hace cuatro cosas sencillas:

1. calcula la caja del modelo con `THREE.Box3`;
2. comprueba cuál es su eje más largo;
3. lo gira si viene orientado sobre X en vez de Z;
4. calcula una escala para que mida aproximadamente lo mismo que un barco del tablero y lo centra.

#### `cargarModelo3D(path, nombre, escala)`
Se conserva porque es la función OBJ + MTL basada en el ejemplo de clase.

Primero carga el `.mtl`, luego lo asigna al `OBJLoader` y por último carga el `.obj`.

No es la función usada actualmente por la flota FBX, pero permanece como evidencia del flujo enseñado por el profesor.

#### `cargarModeloFBX(ruta, nombre, longitudObjetivo)`
Carga un archivo `.fbx` mediante `FBXLoader`.

Cuando termina:

- asigna un nombre;
- prepara sus materiales y sombras;
- lo adapta al tamaño del tablero;
- devuelve el modelo listo para usar.

El FBX no necesita `.mtl`.

#### `clonarModeloBarco(plantilla)`
El Yamato se descarga una sola vez. Esta función crea copias para cada barco de la flota.

También clona sus materiales para que seleccionar un barco no cambie el brillo de todos los demás.

---

## 3. Barcos, límites y movimiento suave

### `js/juego/barcos.js`

#### `materialesBarco(color)`
Crea los materiales del barco provisional. Solo se ven si el FBX falla al cargar.

#### `crearBarcoProvisional(...)`
Crea el contenedor lógico de un barco. Aunque visualmente se sustituya por el FBX, este grupo sigue siendo útil porque guarda:

- `barcoId`;
- propietario;
- altura base;
- posición destino;
- materiales seleccionables.

Así la lógica del juego no depende directamente de la geometría del FBX.

#### `crearFlotaProvisional(...)`
Crea la cantidad de barcos correspondiente y los coloca en posiciones iniciales dentro del tablero.

Después `main.js` reemplaza su parte visual por copias del FBX.

#### `encontrarBarcoDesdeObjeto(objeto)`
Cuando el `Raycaster` toca una pieza interna del FBX, esta función sube por sus padres hasta encontrar el grupo que tiene `barcoId`.

Gracias a eso puedes hacer clic en cualquier parte del modelo y seguir seleccionando el barco completo.

#### `marcarSeleccion(barco, seleccionado)`
Cambia temporalmente la emisión del material para indicar qué barco está seleccionado.

#### `obtenerDestinoBarco(barco)`
Devuelve la posición a la que el barco está viajando. Es importante porque el movimiento ahora es suave: la posición actual y la posición destino pueden ser diferentes durante unas décimas de segundo.

#### `animarFlota(flota, tiempo, delta)`
Hace dos animaciones:

- mueve poco a poco X/Z hacia la posición destino usando `lerp`;
- mantiene un balanceo muy pequeño sobre el agua.

`delta` representa el tiempo transcurrido entre cuadros y hace que el movimiento se sienta parecido aunque cambie la velocidad de renderizado.

#### `cajaEnEstado(barco, x, z, rotY)`
Calcula cómo ocuparía espacio el barco en una posición y rotación determinadas sin dejarlo permanentemente ahí.

Se usa para validar movimientos antes de ejecutarlos.

#### `dentroDelTablero(...)`
Comprueba que la caja completa del barco se mantenga dentro de los límites del tablero.

No solo valida el centro del barco; también toma en cuenta su tamaño.

#### `colisionaConFlota(...)`
Compara la caja del barco que se quiere mover con las cajas de los otros barcos.

También revisa el destino reservado de los otros barcos para evitar que dos barcos terminen intentando ocupar el mismo espacio mientras aún se están moviendo.

#### `moverBarcoSeguro(...)`
Comprueba límite + colisión. Si el movimiento es válido, no teletransporta el barco: guarda la nueva posición como destino.

`animarFlota()` se encarga del desplazamiento visual.

#### `rotarBarcoSeguro(...)`
Prueba una rotación de 90 grados. Si al girar el barco saldría del tablero o chocaría con otro, cancela el giro.

#### `aplicarEstadoBarco(...)`
Recibe la posición enviada por Socket.IO para un barco remoto y actualiza su destino.

La primera posición se aplica inmediatamente para que el barco no aparezca viajando desde el centro del mapa.

#### `serializarBarco(barco)` y `serializarFlota(flota)`
Convierten objetos Three.js en datos simples para Socket.IO:

```text
barcoId
x
y
z
rotY
```

No se manda el archivo FBX por Internet. Cada navegador ya tiene el modelo y únicamente recibe posiciones.

---

## 4. Cómo se usan los modelos dentro de la partida

### `js/juego/main.js`

Al cargar la partida se ejecutan dos cargas:

```text
Yamato -> modelo estándar
Enemigo difícil -> modelo alterno
```

Si un FBX falla, Fleet Command mantiene el barco provisional para que el juego no se detenga.

#### `colocarModeloEnBarco(barco, plantilla)`
Hace una copia del FBX, borra la figura provisional visible y coloca la copia dentro del mismo contenedor lógico del barco.

También reúne sus materiales para permitir el efecto de selección.

#### `colocarModeloEnFlota(flota, plantilla)`
Repite la función anterior para todos los barcos de una flota.

#### `prepararFlotaLocal(slot)`
Crea la flota del jugador local y aplica Yamato a todos sus barcos.

#### `asegurarBarcoRemoto(estado)`
Si llega por Socket.IO un barco que todavía no existe en esta ventana, lo crea, le asigna Yamato y lo agrega a la escena.

#### `intentarMoverSeleccionado(x, z)`
Pide a `moverBarcoSeguro()` validar el nuevo destino. Si es válido, también notifica el cambio a Socket.IO.

#### `alPulsarCanvas(evento)`
Es el control por mouse:

1. lanza un `Raycaster` desde el cursor;
2. si toca un barco local, lo selecciona;
3. si toca un barco rival, avisa que no puede controlarse;
4. si toca una casilla, intenta mover el barco seleccionado a esa casilla.

#### `alPulsarTecla(evento)`
Da los mismos movimientos con dos grupos de controles:

```text
W / Flecha arriba       avanzar una casilla
S / Flecha abajo        retroceder una casilla
A / Flecha izquierda    mover izquierda
D / Flecha derecha      mover derecha
Q / E                   girar 90 grados
```

Ahora parte del destino actual, no de la posición intermedia de la animación. Por eso puedes presionar varias veces sin romper el desplazamiento suave.

#### `renderLoop(tiempoMs)`
Es el ciclo de dibujo de la partida. Calcula `delta`, anima ambas flotas, ajusta la luz ambiental del escenario y renderiza la escena.

#### `iniciarModoIA()`
Crea la flota rival local.

- Normal: usa Yamato.
- Difícil: usa `enemigo_dificil.fbx`.

La IA todavía tiene movimiento sencillo; el cambio de modelo ya queda ligado a la dificultad real del proyecto.

---

## 5. Código preparado para victoria, derrota y puntuación

Todavía no existe el sistema completo de disparos/hundimientos, así que el proyecto NO inventa una victoria automática.

En su lugar se dejó preparado el punto exacto al que se conectará esa lógica.

### `calcularPuntuacionFinal(resultado, detalles)`
La fórmula actual es intencionalmente sencilla y fácil de cambiar:

- cada barco hundido: +100;
- victoria: +500;
- dificultad difícil: +150;
- modo ráfaga: +50;
- `puntosExtra`: permite agregar más reglas después.

### `finalizarPartida(resultado, detalles)`
Cuando el futuro sistema de combate detecte el final, esta función:

1. detiene controles y movimiento de IA;
2. calcula la puntuación;
3. abre el modal de resultado;
4. muestra Victoria/Derrota y los puntos;
5. llama al Web Service para guardar la partida.

La futura condición podrá ser tan simple como:

```javascript
if (barcosEnemigosVivos === 0) {
    finalizarPartida("victoria", { barcosHundidos: 5 });
}
```

Para poder probar HOY la conexión sin agregar un botón falso a la interfaz, abre la consola del navegador dentro de `juego.html` y ejecuta:

```javascript
FleetGame.finalizarPartida("victoria", { barcosHundidos: 5 });
```

Esto es solo una prueba de desarrollo. Cuando exista combate, la lógica real llamará esa misma función.

### `guardarUltimoResultado()`
Envía a PHP:

```text
nombre
score
resultado
modo
mapa
dificultad
```

Si Apache/MySQL no están activos, el modal conserva los puntos en pantalla y muestra un botón para reintentar el guardado.

---

## 6. Web Service centralizado en JavaScript

### `js/webservice.js`

Antes había URLs distintas repartidas por el proyecto. Ahora todas las pantallas usan una sola base:

```text
http://localhost/WebServices
```

Si Apache usa otro puerto, se puede cambiar sin editar archivos mediante `fleetApiBaseUrl` en `localStorage`.

#### `leerJSON(respuesta)`
Convierte la respuesta HTTP en JSON y lanza un error si PHP respondió que algo falló.

#### `guardarPuntuacion(datos)`
Envía el resultado de una partida por `POST` a `guardar_puntaje.php`.

#### `obtenerPuntuaciones()`
Consulta la clasificación acumulada.

#### `obtenerPerfil(nombre)`
Consulta estadísticas e historial del jugador actual.

#### `comprobarConexion()`
Consulta `health.php` para saber si Apache, PHP, MySQL y la estructura de `score` están listos.

Todas quedan disponibles dentro de `window.FleetAPI`.

---

## 7. Backend PHP creado

Copia esta carpeta completa a XAMPP:

```text
backend-xampp/WebServices/
```

Destino:

```text
C:\xampp\htdocs\WebServices\
```

### `config.php`
Contiene host, puerto, base, usuario y contraseña de MySQL. Se dejó preparado con los datos de conexión que ya utilizabas.

No publiques este archivo en un repositorio público si contiene una contraseña real.

### `conexion.php`
Tiene una sola función: `conexion()`.

Lee `config.php`, crea un objeto `mysqli`, activa UTF-8 y devuelve la conexión.

### `cors.php`
Agrega los encabezados necesarios para que el sitio servido por Node en el puerto 3000 pueda consultar PHP servido por Apache.

### `guardar_puntaje.php`
Recibe los datos del resultado, valida que exista un nombre y que el resultado sea `victoria` o `derrota`, y usa una consulta preparada para insertar el registro.

La consulta preparada evita armar SQL pegando directamente texto escrito por un usuario.

### `obtener_puntajes.php`
Agrupa las partidas por nombre y devuelve:

- puntos acumulados;
- partidas;
- victorias.

Solo cuenta resultados oficiales `victoria` y `derrota`.

### `obtener_perfil.php`
Busca un jugador concreto y devuelve:

- partidas;
- victorias;
- derrotas;
- puntos;
- efectividad;
- últimas 10 partidas.

### `health.php`
Comprueba que MySQL responda y que la tabla `score` ya tenga la columna `resultado`.

Si todavía existe la tabla vieja con solo `id`, `nombre` y `score`, indica que falta ejecutar el script de actualización.

### `WebServices.php`
Se conserva como compatibilidad con la URL usada en la práctica original. Internamente utiliza el nuevo guardado.

---

## 8. Base de datos

La base oficial de esta integración es la que ya tenías:

```text
gcw
```

La tabla continúa llamándose:

```text
score
```

Ahora necesita:

```text
id
nombre
score
resultado
modo
mapa
dificultad
fecha
```

### Si empiezas desde cero
Ejecuta:

```text
database/gcw.sql
```

### Si ya tienes `gcw.score` con id/nombre/score
Ejecuta UNA VEZ:

```text
database/gcw_actualizacion_segundo_avance.sql
```

Los registros viejos quedan marcados como `practica` para que no cuenten como derrotas reales.

---

## 9. Puntuaciones y perfil

### `puntuaciones.html` + `js/puntuaciones.js`
La clasificación ya no usa la caja de prueba del `index` ni `localStorage`.

Llama a `FleetAPI.obtenerPuntuaciones()` y llena la tabla con datos reales de MySQL.

### `perfil.html` + `js/perfil.js`
Usa el nombre de la sesión actual y llama a `FleetAPI.obtenerPerfil(nombre)`.

Muestra partidas, victorias, derrotas, efectividad y hasta las últimas diez partidas registradas.

---

## 10. Inicio de sesión con Facebook

La lógica ya no está escrita dentro de `index.html`. Está separada en:

```text
js/facebook.js
```

### `window.fbAsyncInit()`
Inicializa el SDK de Meta con el App ID de Fleet Command.

### `cargarSDK()`
Agrega al documento el SDK oficial de Facebook de forma asíncrona.

### `window.checkLoginState()`
Es llamada por el botón de Facebook.

1. comprueba si el usuario quedó conectado;
2. consulta `/me` con `id,name,email`;
3. entrega ese perfil a Fleet Command.

### `completarSesionFacebook(perfilFacebook)`
Toma el nombre devuelto por Facebook y llama a `FleetApp.iniciarSesionExterna()`.

Después emite el evento `fleet:sesion-iniciada`, que `index.js` escucha para cerrar el modal y continuar al dashboard.

Ya no existe el `alert(JSON.stringify(...))` de prueba.

---

## 11. Sesión de Fleet Command

### Cambios en `js/common.js`

#### `guardarSesion(perfil)`
Guarda en `sessionStorage` un objeto pequeño con datos de sesión.

#### `obtenerPerfil()`
Devuelve la sesión actual. También entiende el formato antiguo que solo guardaba un nombre.

#### `usuarioActual()`
Devuelve solamente el nombre para las partes antiguas del proyecto que todavía lo necesitan.

#### `iniciarSesion(usuario, password)`
Mantiene el login manual que ya existía y guarda el proveedor como `local`.

#### `iniciarSesionExterna(...)`
Permite que Facebook, y en el futuro Google, creen una sesión utilizando el mismo formato.

Actualmente se guardan en la sesión del navegador:

```text
nombre
proveedor
idExterno
email
```

La contraseña manual nunca se guarda.

---

## 12. Archivos eliminados o limpiados

Se eliminó del `index.html`:

- el panel flotante `PRUEBA WEB SERVICE`;
- la llamada directa a `http://localhost/WebServices/WebServices.php` desde ese panel;
- los `alert()` de Facebook;
- la segunda carga duplicada de `common.js`;
- la segunda carga duplicada de `index.js`.

También se sustituyó el SQL anterior de `fleet_command` por archivos coherentes con la base real `gcw` que ya utilizabas.

---

## 13. Mejora futura recomendada

El siguiente paso natural es el sistema de combate:

```text
seleccionar objetivo
-> disparar
-> detectar impacto
-> restar vida / marcar hundimiento
-> efecto visual
-> comprobar barcos vivos
-> finalizarPartida(...)
-> guardar score
```

No será necesario volver a modificar la base de datos ni la pantalla de puntuaciones para conectar la victoria; esa parte ya queda preparada.

Después del combate, las mejoras visuales más útiles serían estela sobre el agua, explosiones sencillas, partículas de lluvia/nieve, cámara de seguimiento y sonidos de cañón.

---

## 14. Ajuste de fluidez, movimiento y salas

En esta revisión se simplificó el movimiento para que sea más fácil de explicar y consuma menos recursos.

### Movimiento inmediato por casillas

Se eliminó la interpolación que desplazaba lentamente los barcos. Ahora `moverBarcoSeguro()` valida la nueva posición y, si es correcta, cambia directamente `position.x` y `position.z`.

El flujo quedó así:

```text
seleccionar barco
-> elegir casilla o presionar WASD/flecha
-> validar límite y colisión
-> mover el barco directamente
```

Por eso ya no son necesarias `animarFlota()` ni variables de destino para cada barco.

### Rendimiento del FBX

El Yamato es un modelo considerablemente más pesado que las figuras básicas de Three.js. Para reducir trabajo gráfico sin cambiar el modelo se hicieron tres ajustes sencillos:

- se desactivaron sombras dinámicas en los FBX;
- el `pixelRatio` del renderer se limita a `1.25`;
- la escena se dibuja como máximo a 30 FPS, suficiente mientras el movimiento sea por casillas.

El modelo sigue siendo el mismo FBX y sigue siendo seleccionable y movible.

### Zoom

`acercarCamara()` en `escena.js` permite acercar o alejar la cámara usando la rueda del mouse. La distancia está limitada para no atravesar ni perder el tablero.

### Sala multijugador

El indicador ahora usa un formato más limpio:

```text
SALA ABCDE / 1/2
SALA ABCDE / 2/2
```

El botón SALA se oculta completamente en modo IA.

El modal multijugador se simplificó y ya no incluye el texto instructivo largo. Solo contiene crear sala, ingresar código y estado.

El servidor mantiene una sala vacía durante dos minutos antes de eliminarla. Esto ayuda a tolerar una recarga o desconexión breve. `red.js` también intenta volver a unirse automáticamente si Socket.IO se reconecta.

Importante: las salas siguen guardándose en memoria. Si se cierra o reinicia `node server.js`, los códigos existentes dejan de existir. Persistir salas después de reiniciar el servidor requeriría guardarlas en base de datos, lo cual no es necesario para este avance.

### Evidencia del profesor

Se agregó `EVIDENCIA_MODELO_Y_MOVIMIENTO.md` con una explicación específica de:

- carpeta pública del servidor;
- función de carga del FBX;
- función OBJ/MTL vista en clase;
- movimiento por teclado;
- qué grabar en el video;
- qué función conviene capturar para la evidencia.
