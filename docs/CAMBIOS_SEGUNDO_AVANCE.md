# Cambios del segundo avance — Fleet Command

## Integrado en esta versión

- Yamato FBX como modelo estándar de todos los barcos.
- Modelo `MO1_LP` renombrado dentro del proyecto como `enemigo_dificil.fbx` y usado por la IA en dificultad difícil.
- Fallback con geometría simple si un FBX no carga.
- WASD y flechas comparten exactamente la misma lógica de movimiento.
- Mouse: clic en barco para seleccionar y clic en casilla para mover.
- Movimiento visual suave entre casillas.
- Límites del tablero y colisiones calculados con el tamaño real del modelo.
- Socket.IO continúa enviando solo posición/rotación, no el archivo 3D.
- Código preparado para `finalizarPartida()` y registrar Victoria/Derrota.
- Modal de resultado con puntos y estado del guardado.
- Web Service centralizado en `js/webservice.js`.
- Backend PHP/MySQL completo dentro de `backend-xampp/WebServices/`.
- Base oficial unificada con la existente: `gcw.score`.
- Clasificación real en `puntuaciones.html`.
- Estadísticas e historial real en `perfil.html`.
- Panel temporal `PRUEBA WEB SERVICE` eliminado del inicio.
- Integración de Facebook separada en `js/facebook.js`.
- Sesión externa conectada al flujo normal de Fleet Command.
- Páginas de privacidad, eliminación de datos y términos agregadas para preparar Meta.

## Pendiente intencional

El sistema de disparos/hundimientos todavía no se ha inventado. Cuando se implemente, solo tendrá que llamar `finalizarPartida("victoria"...)` o `finalizarPartida("derrota"...)`.

## Nota sobre Yamato

El FBX contiene referencias a texturas externas llamadas `uv cannon.png` y `uv boat full - Copy.png`. No fueron proporcionadas. El modelo está integrado y puede cargar sin su apariencia original completa; si luego consigues esas texturas, se podrán colocar junto al modelo y ajustar la ruta correspondiente.
