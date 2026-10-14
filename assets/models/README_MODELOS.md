# Modelos 3D de Fleet Command

Los modelos que usa actualmente la partida estan en `public/models/fleet/`, porque `server.js` publica la carpeta `/public` para los cargadores de Three.js.

- `yamato.fbx`: modelo estandar de la flota.
- `enemigo_dificil.fbx`: modelo especial usado por la IA en dificultad dificil.
- `public/models/submarine.obj` + `.mtl`: se conservan como referencia del ejercicio OBJ/MTL visto en clase.

La carga se controla desde `js/juego/modelos.js`.
