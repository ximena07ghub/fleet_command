# Integracion del modelo OBJ para la practica

## Modelo elegido

Se uso `public/models/submarine.obj` porque es ligero (aprox. 1.3 MB), tiene una escala manejable para WebGL y coincide con el codigo de clase basado en `OBJLoader` y `MTLLoader`.

El archivo OBJ original referencia `submarine.mtl`, pero ese archivo no venia entre los modelos entregados. Por eso se agrego un MTL sencillo llamado `public/models/submarine.mtl` para que la practica funcione con el mismo flujo mostrado por el profesor.

## Cambios realizados

### `server.js`

Se agrego la carpeta publica de Express:

```js
app.use("/public", express.static(path.join(__dirname, "public")));
```

Con esto el navegador puede solicitar:

- `/public/models/submarine.obj`
- `/public/models/submarine.mtl`

### `js/juego/modelos.js`

Se agregaron los imports:

```js
import { OBJLoader } from "three/addons/loaders/OBJLoader.js";
import { MTLLoader } from "three/addons/loaders/MTLLoader.js";
```

Tambien se agrego un `THREE.LoadingManager` y la funcion `cargarModelo3D(...)`, siguiendo la estructura que se mostro en clase. Esta es la funcion recomendada para la captura de pantalla de la evidencia.

### `js/juego/main.js`

Al iniciar `juego.html` se carga el submarino con:

```js
modeloSubmarino = await cargarModelo3D(
    "/public/models/submarine",
    "Submarino",
    new THREE.Vector3(0.17, 0.17, 0.17)
);
```

El modelo reemplaza solamente la parte visual del primer barco local. El contenedor del barco conserva la logica que ya existia para seleccion, posicion, colisiones y red.

## Movimiento por teclado

No se duplico el control porque el proyecto ya tenia movimiento por teclado. Cuando el modelo está seleccionado, utiliza:

- `W` o flecha arriba: avanzar una celda hacia Z negativo.
- `S` o flecha abajo: mover hacia Z positivo.
- `A` o flecha izquierda: mover hacia X negativo.
- `D` o flecha derecha: mover hacia X positivo.

La funcion se encuentra en `js/juego/main.js`, dentro de `alPulsarTecla(evento)`.

## Como probar la evidencia

1. Abre una terminal en la carpeta del proyecto.
2. Ejecuta `npm install` si las dependencias aun no estan instaladas.
3. Ejecuta `npm start`.
4. Abre `http://localhost:3000`.
5. Inicia sesion en el proyecto y entra a una partida local contra IA.
6. El primer barco debe ser el submarino OBJ.
7. Presiona WASD o las flechas para grabar el video de movimiento.
8. Para la captura solicitada por el profesor, abre `js/juego/modelos.js` y muestra la funcion `cargarModelo3D(...)`, incluyendo `MTLLoader`, `OBJLoader` y `loaderOBJ.setMaterials(materials)`.

## Si el modelo no aparece

Abre las herramientas de desarrollo del navegador (`F12`) y revisa la consola. Debes ver el mensaje `Modelo Submarino cargado correctamente.`. Si aparece un 404, confirma que estas ejecutando el proyecto con `npm start` y no con Live Server.

Si el modelo carga pero se ve demasiado grande o pequeno, modifica solamente los tres valores de `new THREE.Vector3(0.17, 0.17, 0.17)` en `js/juego/main.js`.
