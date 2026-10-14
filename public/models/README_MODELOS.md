# Modelos cargados por Three.js

## `fleet/yamato.fbx`
Modelo principal de los barcos de Fleet Command. El FBX hace referencia a texturas externas llamadas `uv cannon.png` y `uv boat full - Copy.png`. Si esas imagenes no estan disponibles, el FBX puede mostrarse con los materiales que pueda resolver Three.js, pero la textura original puede faltar.

## `fleet/enemigo_dificil.fbx`
Modelo alterno utilizado por la IA cuando la dificultad es `dificil`.

## `submarine.obj` y `submarine.mtl`
Se conservan para mostrar el flujo OBJ + MTL usado en clase. La funcion `cargarModelo3D()` sigue disponible en `js/juego/modelos.js`.
