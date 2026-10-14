# Evidencia: modelo 3D y movimiento con teclado

Este documento explica exactamente qué parte del proyecto cubre lo solicitado por el profesor y qué conviene mostrar en la evidencia.

## 1. Carpeta pública para el modelo

En `server.js` está la línea:

```js
app.use("/public", express.static(path.join(__dirname, "public")));
```

Su función es permitir que el navegador pueda solicitar archivos que están dentro de la carpeta `public`.

Los modelos principales están en:

```text
public/models/fleet/yamato.fbx
public/models/fleet/enemigo_dificil.fbx
```

El Yamato es el modelo principal de la flota. El segundo modelo se reserva para la IA en dificultad difícil.

## 2. Función que carga el modelo

La carga se encuentra en:

```text
js/juego/modelos.js
```

La función principal para el FBX es:

```js
cargarModeloFBX(ruta, nombre, longitudObjetivo)
```

Qué hace, en orden:

1. crea un `FBXLoader`;
2. recibe la ruta del archivo `.fbx`;
3. carga el modelo;
4. prepara sus materiales;
5. ajusta tamaño y centro;
6. devuelve el objeto para agregarlo a los barcos de la escena.

El archivo también conserva `cargarModelo3D()`, basado en `OBJLoader` y `MTLLoader`, porque ese es el ejemplo que se trabajó en clase.

## 3. Dónde se agrega el modelo a la escena

En `js/juego/main.js` primero se carga la plantilla Yamato:

```js
modeloEstandar = await cargarModeloFBX(
    "/public/models/fleet/yamato.fbx",
    "Yamato",
    2.35
);
```

Después `colocarModeloEnFlota()` coloca una copia de esa plantilla en cada barco.

La idea es sencilla: el archivo pesado se carga una sola vez y después se crean copias para cada barco.

## 4. Movimiento con teclado

El movimiento está en la función:

```js
alPulsarTecla(evento)
```

Controles:

```text
W o Flecha arriba     mueve una casilla hacia arriba
S o Flecha abajo      mueve una casilla hacia abajo
A o Flecha izquierda  mueve una casilla a la izquierda
D o Flecha derecha    mueve una casilla a la derecha
Q / E                  gira el barco
```

Después de calcular la siguiente casilla se llama a:

```js
intentarMoverSeleccionado(x, z)
```

Y esa función utiliza:

```js
moverBarcoSeguro(...)
```

`moverBarcoSeguro()` comprueba que la posición esté dentro del tablero y que no choque con otro barco. Si la posición es válida, cambia `barco.position.x` y `barco.position.z` directamente. Ya no existe el deslizamiento lento entre casillas.

## 5. Movimiento con mouse

El movimiento con mouse se mantiene así:

```text
clic en un barco
-> clic en otra casilla
-> se valida la casilla
-> el barco cambia inmediatamente de posición
```

La función que detecta los clics es:

```js
alPulsarCanvas(evento)
```

## 6. Acercamiento de cámara

En `js/juego/escena.js` está:

```js
acercarCamara(evento)
```

La rueda del mouse acerca o aleja la cámara. Tiene una distancia mínima y máxima para evitar entrar demasiado al tablero o alejarse hasta perderlo de vista.

## 7. Qué grabar para el video

1. Ejecuta el proyecto con `npm start`.
2. Entra a una partida contra IA.
3. Selecciona un barco con clic.
4. Presiona varias veces `W`, `A`, `S` y `D` o las flechas.
5. Muestra que el modelo cambia de casilla.
6. Puedes mostrar también un clic sobre otra casilla.
7. Usa la rueda del mouse una vez para enseñar el acercamiento si quieres mostrar la mejora extra.

Para cumplir literalmente la evidencia, procura que el video muestre claramente al modelo moviéndose por teclado.

## 8. Qué capturar para la captura de pantalla

La mejor captura es `js/juego/modelos.js` mostrando:

```text
LoadingManager
FBXLoader
cargarModeloFBX()
loaderFBX.load(...)
```

Si el profesor quiere ver exactamente la forma OBJ + MTL que enseñó en clase, en el mismo archivo también está `cargarModelo3D()` con `OBJLoader` y `MTLLoader`.

También puedes tomar una segunda captura de `server.js` donde aparece la carpeta `/public`.

## 9. Si el modelo no aparece

Revisa en este orden:

1. que el proyecto se haya abierto con `http://localhost:3000` y no con Live Server;
2. que `npm start` siga abierto en la terminal;
3. que exista `public/models/fleet/yamato.fbx`;
4. abre `http://localhost:3000/public/models/fleet/yamato.fbx` para comprobar que Express puede encontrar el archivo;
5. abre F12 -> Console y revisa si `FBXLoader` muestra un error.

Si el FBX falla, el proyecto conserva un barco provisional para que la escena no se quede vacía.
