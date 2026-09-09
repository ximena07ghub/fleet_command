
// DASHBOARD / SELECCIÓN DE PARTIDA
const perfilActual = FleetApp.obtenerPerfil();

if (!perfilActual) {
    sessionStorage.setItem("fleetAviso", "Inicia sesión para entrar a NAVE.");
    window.location.href = "index.html";
}

if (perfilActual) {
    document.getElementById("nombreUsuarioDashboard").textContent = perfilActual.nombre;
    document.getElementById("nivelUsuarioDashboard").textContent =
        `${perfilActual.victorias || 0} V · ${perfilActual.derrotas || 0} D`;
}

const configuracion = {
    rival: "online",
    modo: "rafaga",
    mapa: "playa",
    dificultad: "normal"
};

const opciones = document.querySelectorAll("[data-grupo]");
const btnIniciar = document.getElementById("btnIniciar");
const textoEstado = document.getElementById("textoEstado");

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




// AJUSTES DENTRO DEL DASHBOARD

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


function abrirAjustesDashboard() {

    cargarAjustesDashboard();

    modalAjustes.classList.add("abierto");
}


function cerrarAjustesDashboard() {

    modalAjustes.classList.remove("abierto");
}



// ABRIR AJUSTES

btnAjustes.addEventListener(
    "click",
    abrirAjustesDashboard
);


// X → CIERRA EL MODAL

btnCerrarAjustes.addEventListener(
    "click",
    cerrarAjustesDashboard
);


// CONTROLES DE AUDIO

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



// CLICK FUERA DEL PANEL → CIERRA AJUSTES

modalAjustes.addEventListener(
    "click",
    (evento) => {

        if (evento.target === modalAjustes) {

            cerrarAjustesDashboard();

        }

    }
);


// ESC → CIERRA AJUSTES

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


// SALIR → INDEX

btnSalirDesdeAjustes.addEventListener(
    "click",
    () => {

        window.location.href = "index.html";

    }
);

actualizarEstado();
cargarAjustesDashboard();
