const musicaActiva = document.getElementById("musicaActiva");
const efectosActivos = document.getElementById("efectosActivos");
const volumenMusica = document.getElementById("volumenMusica");
const volumenEfectos = document.getElementById("volumenEfectos");
const valorMusica = document.getElementById("valorMusica");
const valorEfectos = document.getElementById("valorEfectos");

function cargarAjustes() {
    const ajustes = FleetApp.obtenerAjustes();

    musicaActiva.checked = ajustes.musica;
    efectosActivos.checked = ajustes.efectos;
    volumenMusica.value = Math.round(ajustes.volumenMusica * 100);
    volumenEfectos.value = Math.round(ajustes.volumenEfectos * 100);
    actualizarEtiquetas();
}

function actualizarEtiquetas() {
    valorMusica.textContent = `${volumenMusica.value}%`;
    valorEfectos.textContent = `${volumenEfectos.value}%`;
}

function guardar() {
    FleetApp.guardarAjustes({
        musica: musicaActiva.checked,
        efectos: efectosActivos.checked,
        volumenMusica: Number(volumenMusica.value) / 100,
        volumenEfectos: Number(volumenEfectos.value) / 100
    });

    actualizarEtiquetas();
}

[musicaActiva, efectosActivos, volumenMusica, volumenEfectos].forEach((control) => {
    control.addEventListener("input", guardar);
    control.addEventListener("change", guardar);
});


const btnCerrarPanelSistema = document.getElementById("btnCerrarPanelSistema");

btnCerrarPanelSistema.addEventListener("click", () => {
    const parametros = new URLSearchParams(window.location.search);
    const origen = parametros.get("from");

    if (origen === "dashboard") {
        window.location.href = "dashboard.html";
    } else {
        window.location.href = "index.html";
    }
});

document.getElementById("btnCerrarSesion").addEventListener("click", () => {
    FleetApp.cerrarSesion();
    FleetApp.mostrarToast("Sesión cerrada");
    window.setTimeout(() => {
        window.location.href = "index.html";
    }, 500);
});

cargarAjustes();
