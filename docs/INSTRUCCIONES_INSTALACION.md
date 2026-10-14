# Fleet Command — instalación y prueba del avance actual

Estas instrucciones están pensadas para Windows usando Node.js, Chrome, XAMPP/Apache y MySQL Workbench.

## 1. Archivos principales que debes conservar

La carpeta del proyecto debe contener, entre otros:

```text
server.js
package.json
index.html
juego.html
js/
css/
public/models/fleet/
backend-xampp/WebServices/
database/
```

Los modelos incluidos son:

```text
public/models/fleet/yamato.fbx
public/models/fleet/enemigo_dificil.fbx
```

## 2. Node.js

Abre PowerShell o CMD dentro de la carpeta donde está `package.json`.

Comprueba:

```bash
node -v
npm -v
```

Si Node no existe, instala Node.js LTS y vuelve a abrir la terminal.

Después ejecuta una sola vez:

```bash
npm install
```

### Si `npm install` da error

1. verifica que estás en la carpeta correcta con `dir`;
2. comprueba que ahí exista `package.json`;
3. vuelve a ejecutar `npm install`;
4. si Windows bloquea permisos, abre una terminal normal nueva antes de intentar como administrador.

## 3. Iniciar Fleet Command

Ejecuta:

```bash
npm start
```

Debe aparecer algo parecido a:

```text
Fleet Command disponible en http://localhost:3000
```

Abre:

```text
http://localhost:3000
```

Para la partida no uses Live Server. `juego.html` necesita el servidor Node para Three.js y Socket.IO.

## 4. Probar los modelos FBX

1. inicia sesión;
2. abre Dashboard;
3. selecciona `Contra IA`;
4. elige dificultad Normal;
5. inicia partida.

La flota debe utilizar Yamato.

Después vuelve al dashboard, selecciona dificultad Difícil y vuelve a entrar. La flota enemiga debe utilizar el segundo FBX.

### Si aparece el barco provisional

Abre las herramientas de desarrollador con `F12` y revisa Console.

Comprueba que existan exactamente:

```text
public/models/fleet/yamato.fbx
public/models/fleet/enemigo_dificil.fbx
```

También comprueba que entraste desde `http://localhost:3000`.

### Si Yamato aparece sin sus texturas originales

El FBX hace referencia a dos imágenes que no venían con el archivo:

```text
uv cannon.png
uv boat full - Copy.png
```

El juego puede continuar funcionando, pero la apariencia puede ser más simple. Si consigues esas imágenes, guárdalas para integrarlas después.

### Si el modelo especial muestra alguna cara faltante

El archivo `MO1_LP.fbx` puede producir avisos de Three.js sobre polígonos de más de cuatro lados. El modelo sí es leído por `FBXLoader`, pero si visualmente notas huecos, la solución es abrir el modelo en Blender y exportarlo nuevamente como FBX activando triangulación. No necesitas hacer esto si se ve correctamente en tu navegador.

## 5. Controles

```text
Clic en un barco       seleccionar
Clic en una casilla    mover al destino
W / Flecha arriba      mover arriba
S / Flecha abajo       mover abajo
A / Flecha izquierda   mover izquierda
D / Flecha derecha     mover derecha
ESC                    pausa
```

El barco cambia de casilla inmediatamente. Si el destino sale del tablero, invade la mitad del rival o colisiona con otro barco, el movimiento se rechaza. Arrastra el mouse para observar el entorno 3D y usa la rueda para acercar o alejar.

## 6. Probar multijugador

> **Importante después de copiar este parche:** si `node server.js` o `npm start` ya estaba abierto, detenlo con `Ctrl + C` y vuelve a ejecutar `npm start`. Los cambios de `server.js` no se aplican a un proceso de Node que ya estaba ejecutándose.


### Ventana 1

1. abre Chrome normal;
2. entra a `http://localhost:3000`;
3. inicia sesión;
4. selecciona Online;
5. inicia partida;
6. crea una sala;
7. copia el código.

### Ventana 2

1. abre Chrome incógnito;
2. entra también a `http://localhost:3000`;
3. inicia sesión con otro nombre;
4. selecciona Online;
5. inicia partida;
6. escribe el mismo código;
7. pulsa Unirse.

Al mover un barco en una ventana, la otra debe recibir su posición.

### Si no sincroniza

Comprueba:

- detuviste y reiniciaste `npm start` después de reemplazar `server.js`;
- ambas ventanas usan exactamente `http://localhost:3000`;
- ambas muestran `SERVIDOR // CONECTADO`;
- la segunda ventana es incógnito para que tenga una sesión independiente;
- usan el mismo código;
- al entrar el segundo jugador la sala cambia a `2/2`;
- Windows Firewall no bloqueó Node en red privada.

Si aparece `La sala no existe`, cierra ambas partidas, reinicia Node y crea un código nuevo. Una sala vive en la memoria del proceso de Node; si reinicias el servidor, los códigos anteriores dejan de existir.

## 7. Preparar MySQL en Workbench

Tú ya tienes:

```sql
CREATE DATABASE IF NOT EXISTS gcw;
USE gcw;
CREATE TABLE IF NOT EXISTS score (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    score INT NOT NULL
);
```

Por eso NO necesitas crear otra base diferente.

### Si tu tabla actual solo tiene `id`, `nombre` y `score`

En MySQL Workbench abre y ejecuta UNA VEZ:

```text
database/gcw_actualizacion_segundo_avance.sql
```

Esto agrega:

```text
resultado
modo
mapa
dificultad
fecha
```

Los registros viejos quedan como `practica` y no se cuentan como victorias o derrotas.

### Si todavía no tienes la base

Ejecuta:

```text
database/gcw.sql
```

## 8. Preparar el Web Service en XAMPP

Dentro del ZIP del proyecto encontrarás:

```text
backend-xampp/WebServices
```

Copia la carpeta `WebServices` completa a:

```text
C:\xampp\htdocs\
```

Debe quedar:

```text
C:\xampp\htdocs\WebServices\config.php
C:\xampp\htdocs\WebServices\conexion.php
C:\xampp\htdocs\WebServices\health.php
C:\xampp\htdocs\WebServices\guardar_puntaje.php
C:\xampp\htdocs\WebServices\obtener_puntajes.php
C:\xampp\htdocs\WebServices\obtener_perfil.php
```

En XAMPP Control Panel inicia Apache.

Para MySQL, inicia solamente el servidor que realmente utilices. Si MySQL Workbench se conecta a un servicio MySQL instalado aparte, no necesitas encender el MySQL de XAMPP.

### Si Apache no inicia

El puerto 80 probablemente está ocupado.

Puedes:

- cerrar el programa que ocupa el puerto;
- o configurar Apache para otro puerto, por ejemplo 8080.

Si Apache queda en 8080, después cambia la URL del frontend como se explica en el paso 11.

## 9. Conexión PHP -> MySQL

El archivo es:

```text
C:\xampp\htdocs\WebServices\config.php
```

Se dejó preparado con los datos de conexión que enviaste.

Si MySQL muestra `Access denied`, abre ese archivo y comprueba:

- usuario;
- contraseña;
- puerto;
- nombre de base `gcw`.

Si Workbench se conecta correctamente, usa en `config.php` los mismos datos de conexión.

## 10. Probar el Web Service antes del juego

Con Apache y MySQL activos abre en Chrome:

```text
http://localhost/WebServices/health.php
```

Respuesta esperada:

```json
{
  "ok": true,
  "servicio": "Fleet Command Web Service",
  "mysql": true,
  "base": "gcw"
}
```

### Si dice que falta actualizar `score`

Ejecuta:

```text
database/gcw_actualizacion_segundo_avance.sql
```

### Si aparece `Not Found`

Comprueba que la carpeta sea exactamente:

```text
C:\xampp\htdocs\WebServices
```

y que Apache esté encendido.

### Si aparece error de conexión a MySQL

Comprueba primero que Workbench pueda conectarse. Luego copia esos mismos datos a `config.php`.

## 11. Si Apache utiliza otro puerto

Por defecto el proyecto consulta:

```text
http://localhost/WebServices
```

Si Apache funciona en `8080`, abre la consola del navegador en Fleet Command y ejecuta una sola vez:

```javascript
localStorage.setItem("fleetApiBaseUrl", "http://localhost:8080/WebServices");
```

Recarga la página.

Para regresar al puerto 80:

```javascript
localStorage.removeItem("fleetApiBaseUrl");
```

## 12. Probar puntuaciones sin tener todavía disparos

El recuadro de prueba del inicio fue eliminado.

Para verificar temporalmente el flujo correcto sin agregar botones falsos a la interfaz:

1. abre una partida;
2. presiona `F12`;
3. abre Console;
4. ejecuta:

```javascript
FleetGame.finalizarPartida("victoria", { barcosHundidos: 5 });
```

Debe ocurrir:

```text
Modal de VICTORIA
-> muestra puntos
-> guardar_puntaje.php
-> gcw.score
```

Después entra a:

```text
PUNTUACIONES
```

El jugador debe aparecer en la clasificación.

También abre Perfil para comprobar partidas, victorias e historial.

Para probar derrota:

```javascript
FleetGame.finalizarPartida("derrota", { barcosHundidos: 2 });
```

Recarga la partida antes de hacer una segunda prueba porque una partida solo puede finalizar una vez.

## 13. Facebook Login

La integración del código ya está separada en:

```text
js/facebook.js
```

Necesitas Internet para que el navegador descargue el SDK de Facebook.

Sigue los pasos de:

```text
CONFIGURACION_META.md
```

Durante la revisión puedes mantener Meta en modo Desarrollo.

### Si el botón no aparece

1. abre `F12 -> Console`;
2. comprueba que no haya bloqueo de `connect.facebook.net`;
3. desactiva temporalmente extensiones de privacidad si bloquean el SDK;
4. confirma que tienes Internet;
5. revisa la configuración del dominio dentro de Meta.

### Si Facebook abre pero no deja entrar

En modo Desarrollo, utiliza una cuenta agregada como administrador, desarrollador o tester de la app.

## 14. Google como alternativa futura

Si más adelante quieres un segundo botón, la opción correcta es Google Identity Services / Sign in with Google.

No hace falta conectar Gmail ni leer correos. Se usaría solamente la identidad del usuario y llamaría a la misma función:

```text
FleetApp.iniciarSesionExterna(...)
```

No se agregó todavía para mantener este avance enfocado en la API de Facebook solicitada por el profesor.

## 15. Antes de la revisión del segundo avance

Prueba en este orden:

```text
1. npm start
2. inicio de sesión manual
3. Contra IA Normal -> Yamato
4. Contra IA Difícil -> modelo especial enemigo
5. WASD
6. flechas
7. mouse
8. límites del tablero
9. colisión entre barcos
10. Online con Chrome + incógnito
11. Apache + MySQL
12. health.php
13. prueba temporal de finalizarPartida desde consola
14. Puntuaciones
15. Perfil
16. Facebook con una cuenta autorizada en Meta
```

Si alguno de esos pasos no coincide con lo que ves, toma una captura de esa pantalla y revisa primero el apartado de solución correspondiente antes de cambiar código.
