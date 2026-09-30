# Dependencias y referencias técnicas

Esta versión usa dependencias de terceros únicamente como herramientas de desarrollo permitidas para el proyecto.

- **Three.js 0.155.0**: motor/librería utilizada sobre WebGL. Se instala mediante npm y se sirve localmente desde `node_modules/three` por `server.js`.
- **Socket.IO 4.x**: comunicación en tiempo real entre los dos navegadores.
- **Express 4.x**: servidor HTTP local de Node.js.
- **Bootstrap 5.3.6**: apoyo visual para HUD y modales. Los archivos minificados se incluyen en `assets/vendor/bootstrap/` y conservan su encabezado de licencia MIT.

No se añadieron modelos 3D de terceros en esta entrega. Los barcos actuales son geometrías provisionales creadas directamente con Three.js.

Cuando se integren modelos OBJ/FBX externos, conviene anotar aquí su autor, licencia y fuente si el profesor lo solicita.
