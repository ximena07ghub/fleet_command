# Fleet Command — instalación y ejecución local

Estas instrucciones están pensadas para Windows con Chrome, Node.js, XAMPP/Apache y MySQL.

## 1. Requisitos

Instala o verifica:

- Google Chrome.
- Node.js **20 o superior**. Node 20/22 LTS funciona correctamente.
- npm, incluido con Node.js.
- XAMPP para Apache/PHP cuando quieras probar el Web Service.
- Un servidor MySQL. Puede ser el de XAMPP o tu instalación separada, pero usa solo uno en el mismo puerto.

Comprueba Node y npm en PowerShell o CMD:

```bash
node -v
npm -v
```

## 2. Preparar Node.js

Abre una terminal en la carpeta donde está `package.json`.

Ejemplo:

```bash
cd C:\ruta\a\graficas_web
npm install
```

`npm install` descargará:

- Express;
- Socket.IO;
- Three.js.

No copies `node_modules` entre computadoras. Si cambias de equipo, vuelve a ejecutar `npm install`.

## 3. Iniciar Fleet Command

Desde la misma carpeta:

```bash
npm start
```

Debe aparecer:

```text
Fleet Command disponible en http://localhost:3000
```

Abre exactamente:

```text
http://localhost:3000
```

Para esta versión **no uses Live Server para la partida**, porque `juego.html` necesita Socket.IO y el Three.js instalado por npm que sirve `server.js`.

Para desarrollo también existe:

```bash
npm run dev
```

Node reinicia el servidor al detectar cambios.

## 4. Prueba del multijugador

### Ventana 1

1. Abre Chrome normal.
2. Entra a `http://localhost:3000`.
3. Inicia sesión.
4. En Dashboard selecciona `Online`.
5. Pulsa `INICIAR PARTIDA`.
6. Pulsa `CREAR SALA`.
7. Anota el código.

### Ventana 2

1. Abre una ventana de incógnito.
2. Entra a `http://localhost:3000`.
3. Inicia sesión.
4. Selecciona `Online`.
5. Inicia partida.
6. Escribe el código y pulsa `UNIRSE`.

Cuando aparezca `2/2`, mueve un barco en una ventana. La otra debe actualizarlo sin recargar la página.

Controles:

```text
Clic sobre barco     seleccionar
Clic sobre casilla   mover barco seleccionado
W A S D              mover
Flechas              mover
Q / E                 girar 90 grados
ESC                   pausar/reanudar
```

Si Windows Firewall pregunta por Node.js, permite acceso en redes privadas para las pruebas locales.

## 5. Bootstrap

No necesitas instalar Bootstrap manualmente.

Los archivos necesarios ya están en:

```text
assets/vendor/bootstrap/
```

Se usa principalmente para los modales y la distribución del HUD de `juego.html`.

## 6. Three.js y modelos

Three.js se instala mediante:

```bash
npm install
```

`server.js` expone el paquete en `/vendor/three` y `juego.html` utiliza un `importmap` local. Así el juego no depende de cargar Three.js desde un CDN.

Actualmente los barcos son provisionales. Cuando recibas los modelos, coloca los archivos en:

```text
assets/models/
```

Envíame después los `.FBX`/`.OBJ` junto con todas sus texturas para ajustar `modelos.js` y sustituir los placeholders.

## 7. XAMPP + MySQL para el Web Service

Esto ya está preparado, pero no es necesario para demostrar el multijugador del segundo avance.

### Opción A: MySQL de XAMPP

En XAMPP Control Panel inicia:

```text
Apache
MySQL
```

### Opción B: Apache de XAMPP + MySQL instalado aparte

También funciona.

Inicia:

```text
Apache de XAMPP
Tu servicio MySQL externo
```

No inicies simultáneamente dos MySQL configurados con el mismo puerto `3306`.

## 8. Crear la base de datos

Abre phpMyAdmin, normalmente:

```text
http://localhost/phpmyadmin
```

Importa:

```text
database/fleet_command.sql
```

Esto crea:

```text
fleet_command
usuarios
puntajes
```

## 9. Instalar la API PHP en Apache

Copia la carpeta:

```text
backend-xampp/fleet_command_api
```

hacia:

```text
C:\xampp\htdocs\fleet_command_api
```

El resultado debe ser:

```text
C:\xampp\htdocs\fleet_command_api\health.php
C:\xampp\htdocs\fleet_command_api\obtener_puntajes.php
C:\xampp\htdocs\fleet_command_api\guardar_puntaje.php
...
```

## 10. Configurar la conexión a MySQL

Edita:

```text
C:\xampp\htdocs\fleet_command_api\config.php
```

Configuración típica de XAMPP:

```php
'host' => '127.0.0.1',
'port' => 3306,
'database' => 'fleet_command',
'user' => 'root',
'password' => ''
```

Si usas MySQL instalado aparte, coloca ahí su usuario, contraseña y puerto reales.

## 11. Probar PHP/MySQL

Con Apache y MySQL activos abre:

```text
http://localhost/fleet_command_api/health.php
```

Debe responder algo similar a:

```json
{"ok":true,"servicio":"Fleet Command API","mysql":true}
```

Luego abre Fleet Command desde Node:

```text
http://localhost:3000/puntuaciones.html
```

La pantalla debe indicar que el Web Service está conectado.

## 12. Si Apache usa otro puerto

Por ejemplo, si Apache está en `8080`, la API sería:

```text
http://localhost:8080/fleet_command_api
```

En la consola de Chrome de Fleet Command ejecuta una sola vez:

```javascript
localStorage.setItem("fleetApiBaseUrl", "http://localhost:8080/fleet_command_api");
```

Recarga la página.

Para volver al puerto normal:

```javascript
localStorage.removeItem("fleetApiBaseUrl");
```

## 13. Puertos recomendados

```text
Node / Express / Socket.IO    3000
Apache / PHP                  80
MySQL                         3306
```

No existe conflicto entre Node en 3000 y Apache en 80.

## 14. Errores comunes

### `Cannot find package 'express'`

Ejecuta:

```bash
npm install
```

### `EADDRINUSE: address already in use :::3000`

Ya hay un proceso utilizando el puerto. Cierra el servidor anterior o inicia temporalmente con otro puerto:

PowerShell:

```powershell
$env:PORT=3001; npm start
```

### Three.js no carga

Confirma que ejecutaste `npm install` y que abriste el proyecto desde `http://localhost:3000`, no con doble clic ni Live Server.

### Segunda ventana no ve los movimientos

Comprueba:

- ambas ventanas usan el mismo `localhost:3000`;
- ambas muestran `SERVIDOR // CONECTADO`;
- usan el mismo código de sala;
- la sala muestra `2/2`.

### La página de puntuaciones dice que no hay Web Service

Comprueba:

- Apache activo;
- MySQL activo;
- base `fleet_command` importada;
- carpeta API copiada a `htdocs`;
- `config.php` con credenciales correctas;
- `health.php` respondiendo `ok: true`.

## 15. Antes de presentar

Haz esta prueba completa:

```text
npm start
→ Chrome normal
→ Chrome incógnito
→ login en ambas
→ Online
→ misma sala
→ mover y girar barcos
→ comprobar réplica
→ comprobar colisiones
→ ESC y Continuar
→ verificar que la sala sigue 2/2
```

Después, si XAMPP ya está configurado:

```text
Apache + MySQL
→ health.php
→ puntuaciones.html
```
