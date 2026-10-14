# Fleet Command — pasos para terminar Meta / Facebook Login

El código del proyecto ya está preparado para recibir un perfil de Facebook. Lo que todavía falta es completar la configuración de la aplicación en Meta Developers.

## 1. Por ahora mantén la app en desarrollo

Mientras haces la revisión del segundo avance, no necesitas publicarla todavía.

En modo desarrollo pueden probarla las cuentas que tengan un rol permitido en la app. Cuando todo funcione y completes los campos obligatorios, entonces puedes revisar el cambio a modo Live.

## 2. Pantalla `Configuración de la app -> Básica`

En tu captura Meta marca como faltantes:

- icono 1024 x 1024;
- URL de política de privacidad;
- eliminación de datos de usuario;
- categoría.

El proyecto incluye ahora:

```text
privacidad.html
eliminacion-datos.html
terminos.html
```

Estas páginas deben estar publicadas en HTTPS para usarlas al poner la app en producción.

### Dominio de la app

En `Dominios de la app` escribe solamente el dominio público donde esté publicado Fleet Command, sin rutas internas.

Ejemplo conceptual:

```text
tudominio.com
```

Si Meta no acepta `localhost`, no es un error del proyecto: utiliza el dominio HTTPS de tu despliegue para la configuración pública.

### URL de la política de privacidad

Cuando despliegues el proyecto, usa la URL pública que termine en:

```text
/privacidad.html
```

### Eliminación de datos

En el desplegable que aparece en tu captura elige la opción para proporcionar una URL de instrucciones de eliminación y coloca la URL pública que termine en:

```text
/eliminacion-datos.html
```

### Condiciones del servicio

Puedes usar la URL pública que termine en:

```text
/terminos.html
```

### Icono de la app

Meta pide una imagen cuadrada de 1024 x 1024. Tu `logo.png` actual es horizontal, por lo que no conviene subirlo directamente sin preparar una versión cuadrada.

### Categoría

Elige la categoría de Juegos si aparece disponible. Si Meta cambia los nombres, elige la categoría que describa mejor un videojuego web académico.

Guarda los cambios.

## 3. `Casos de uso -> Inicio de sesión de Facebook`

Tu captura muestra que:

```text
email          -> Listo para la prueba
public_profile -> Listo para la prueba
```

Para Fleet Command son suficientes en esta etapa. No agregues permisos como cumpleaños, amigos o publicaciones si el juego no los necesita.

## 4. Entra a `Configurar`

Dentro del caso de uso de Inicio de sesión de Facebook, entra a `Configurar`.

Busca las opciones relacionadas con:

- URL de redireccionamiento OAuth válidas;
- dominios permitidos para el SDK de JavaScript, si Meta los muestra;
- URL del sitio web o plataforma web.

Usa el dominio HTTPS donde esté desplegado Fleet Command.

### Si no encuentras esas opciones

Prueba estas rutas, porque Meta cambia la interfaz con frecuencia:

1. `Casos de uso -> Inicio de sesión de Facebook -> Configurar`.
2. Dentro del mismo caso de uso, revisa `Inicio rápido`.
3. Revisa `Configuración de la app -> Básica` y busca la sección de plataformas al final.
4. Si aparece `Agregar plataforma`, agrega `Sitio web` y coloca la URL pública de Fleet Command.

Si ninguna coincide con tu pantalla, manda una captura completa de esa sección y se ajustan los pasos a lo que realmente te muestre Meta.

## 5. Cómo funciona el botón en el código

`index.html` contiene el componente de Facebook:

```html
<fb:login-button scope="public_profile,email" onlogin="checkLoginState();"></fb:login-button>
```

`js/facebook.js` carga el SDK y `checkLoginState()` consulta:

```text
/me?fields=id,name,email
```

Después el perfil se entrega a `FleetApp.iniciarSesionExterna()` y Fleet Command continúa al dashboard con el mismo nombre recibido desde Facebook.

El correo no es obligatorio para continuar. Si Facebook no lo entrega pero sí devuelve nombre e identificador, el usuario puede iniciar sesión.

## 6. Si el nombre no llega correctamente

El código muestra un mensaje y no crea una sesión falsa.

Como siguiente integración puede agregarse `Sign in with Google`. No se necesita acceso a Gmail; sería autenticación con Google Identity Services.

Para este segundo avance conviene terminar primero Facebook porque es la API externa solicitada en clase.

## 7. Antes de cambiar a modo Live

Comprueba:

1. que el sitio esté publicado mediante HTTPS;
2. que las páginas de privacidad y eliminación abran sin iniciar sesión;
3. que el icono sea 1024 x 1024;
4. que la categoría esté seleccionada;
5. que el dominio y las URLs sean los de producción;
6. que el login funcione con una cuenta autorizada durante desarrollo;
7. que `public_profile` y `email` sigan apareciendo correctamente configurados;
8. revisa `Acciones requeridas` y `Revisar` por si Meta pide un requisito adicional para tu cuenta o caso de uso.

No compartas la `Clave secreta de la app` ni tokens de acceso en capturas, código del frontend o repositorios.
