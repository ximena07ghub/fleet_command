// Selección de partida.
const perfilActual = FleetApp.obtenerPerfil();

// Bloquea acceso sin sesión.
if (!perfilActual) {
    sessionStorage.setItem("fleetAviso", "Inicia sesión para entrar a NAVE.");
    window.location.href = "index.html";
}

// Muestra resumen del jugador.
if (perfilActual) {
    document.getElementById("nombreUsuarioDashboard").textContent = perfilActual.nombre;
    document.getElementById("nivelUsuarioDashboard").textContent =
        `${perfilActual.victorias || 0} V · ${perfilActual.derrotas || 0} D`;
}

// Configuración inicial del combate.
const configuracion = {
    rival: "online",
    modo: "rafaga",
    mapa: "playa",
    dificultad: "normal"
};

const opciones = document.querySelectorAll("[data-grupo]");
const btnIniciar = document.getElementById("btnIniciar");
const textoEstado = document.getElementById("textoEstado");

// Cambia opciones seleccionadas.
opciones.forEach((boton) => {
    boton.addEventListener("click", () => {
        const grupo = boton.dataset.grupo;
        const valor = boton.dataset.valor;
        const grupoBotones = document.querySelectorAll(`[data-grupo="${grupo}"]`);

        grupoBotones.forEach((elemento) => elemento.classList.remove("seleccionada"));
        boton.classList.add("seleccionada");
        configuracion[grupo] = valor;
        actualizarEstado();
    });
});

// Resume configuración elegida.
function actualizarEstado() {
    const mapaNombre = {
        playa: "Playa",
        tormenta: "Tormenta",
        artico: "Mar Ártico"
    };

    const modoNombre = {
        clasico: "Clásico",
        rafaga: "Ráfaga"
    };

    const rivalNombre = {
        online: "Online",
        ia: "Contra IA"
    };

    const dificultadNombre = {
        normal: "Normal",
        dificil: "Difícil"
    };

    textoEstado.textContent =
        `${rivalNombre[configuracion.rival]} · ${modoNombre[configuracion.modo]} · ${mapaNombre[configuracion.mapa]} · ${dificultadNombre[configuracion.dificultad]}`;
}

// Guarda partida elegida.
btnIniciar.addEventListener("click", () => {
    localStorage.setItem("fleetCommandConfig", JSON.stringify(configuracion));

    const textoOriginal = btnIniciar.innerHTML;
    btnIniciar.innerHTML = "✓ CONFIGURACIÓN GUARDADA";

    FleetApp.mostrarToast("Configuración lista. Aquí conectaremos el tablero de juego.");

    setTimeout(() => {
        btnIniciar.innerHTML = textoOriginal;
    }, 1300);

    /*
        MÁS ADELANTE:
        FleetApp.irConLoading("juego.html", "Desplegando flota...");
    */
});




// Ajustes dentro del dashboard.

const modalAjustes = document.getElementById("modalAjustesDashboard");
const btnAjustes = document.getElementById("btnAjustesDashboard");
const btnCerrarAjustes = document.getElementById("btnCerrarAjustesDashboard");
const btnSalirDesdeAjustes = document.getElementById("btnSalirDesdeAjustes");

const dashMusicaActiva = document.getElementById("dashMusicaActiva");
const dashEfectosActivos = document.getElementById("dashEfectosActivos");
const dashVolumenMusica = document.getElementById("dashVolumenMusica");
const dashVolumenEfectos = document.getElementById("dashVolumenEfectos");
const dashValorMusica = document.getElementById("dashValorMusica");
const dashValorEfectos = document.getElementById("dashValorEfectos");


// Carga controles de audio.
function cargarAjustesDashboard() {

    const ajustes = FleetApp.obtenerAjustes();

    dashMusicaActiva.checked = ajustes.musica;
    dashEfectosActivos.checked = ajustes.efectos;

    dashVolumenMusica.value =
        Math.round(ajustes.volumenMusica * 100);

    dashVolumenEfectos.value =
        Math.round(ajustes.volumenEfectos * 100);

    dashValorMusica.textContent =
        `${dashVolumenMusica.value}%`;

    dashValorEfectos.textContent =
        `${dashVolumenEfectos.value}%`;
}


// Guarda cambios de audio.
function guardarAjustesDashboard() {

    FleetApp.guardarAjustes({

        musica: dashMusicaActiva.checked,

        efectos: dashEfectosActivos.checked,

        volumenMusica:
            Number(dashVolumenMusica.value) / 100,

        volumenEfectos:
            Number(dashVolumenEfectos.value) / 100

    });


    dashValorMusica.textContent =
        `${dashVolumenMusica.value}%`;

    dashValorEfectos.textContent =
        `${dashVolumenEfectos.value}%`;


    if (dashMusicaActiva.checked) {
        FleetApp.iniciarMusica();
    }
}


// Abre modal de ajustes.
function abrirAjustesDashboard() {

    cargarAjustesDashboard();

    modalAjustes.classList.add("abierto");
}


// Cierra modal de ajustes.
function cerrarAjustesDashboard() {

    modalAjustes.classList.remove("abierto");
}



// Botón para abrir ajustes.

btnAjustes.addEventListener(
    "click",
    abrirAjustesDashboard
);


// Botón X del modal.

btnCerrarAjustes.addEventListener(
    "click",
    cerrarAjustesDashboard
);


// Controles de música y efectos.

[
    dashMusicaActiva,
    dashEfectosActivos,
    dashVolumenMusica,
    dashVolumenEfectos

].forEach((control) => {

    control.addEventListener(
        "input",
        guardarAjustesDashboard
    );

    control.addEventListener(
        "change",
        guardarAjustesDashboard
    );

});



// Fondo del modal cierra ajustes.

modalAjustes.addEventListener(
    "click",
    (evento) => {

        if (evento.target === modalAjustes) {

            cerrarAjustesDashboard();

        }

    }
);


// Escape cierra ajustes abiertos.

document.addEventListener(
    "keydown",
    (evento) => {

        if (
            evento.key === "Escape" &&
            modalAjustes.classList.contains("abierto")
        ) {

            evento.stopImmediatePropagation();

            cerrarAjustesDashboard();

        }

    },
    true
);


// Salida desde ajustes.

btnSalirDesdeAjustes.addEventListener(
    "click",
    () => {

        window.location.href = "index.html";

    }
);

actualizarEstado();
cargarAjustesDashboard();
