

const opciones = document.querySelectorAll(".opcion-menu");
const opcionesLista = Array.from(opciones);
const tituloPanel = document.getElementById("tituloPanel");
const descripcionPanel = document.getElementById("descripcionPanel");
const btnAccionPrincipal = document.getElementById("btnAccionPrincipal");
const textoAccionPrincipal = document.getElementById("textoAccionPrincipal");
const estadoSesion = document.getElementById("estadoSesion");
const textoSesion = document.getElementById("textoSesion");
const perfilPanel = document.getElementById("perfilPanel");
const estadoAudioPie = document.getElementById("estadoAudioPie");

const modalLogin = document.getElementById("modalLogin");
const formLogin = document.getElementById("formLogin");
const usuarioInput = document.getElementById("usuario");
const passwordInput = document.getElementById("password");
const errorLogin = document.getElementById("errorLogin");

let accionSeleccionada = "nave";

function actualizarSesionVisual() {
    const perfil = FleetApp.obtenerPerfil();

    if (perfil) {
        estadoSesion.classList.add("con-sesion");
        textoSesion.textContent = `SESIÓN // ${perfil.nombre.toUpperCase()}`;
        if (perfilPanel) perfilPanel.textContent = perfil.nombre.toUpperCase();
    } else {
        estadoSesion.classList.remove("con-sesion");
        textoSesion.textContent = "SIN SESIÓN";
        if (perfilPanel) perfilPanel.textContent = "NO IDENTIFICADO";
    }

    if (estadoAudioPie) {
        const ajustes = FleetApp.obtenerAjustes();
        if (!ajustes.musica && !ajustes.efectos) {
            estadoAudioPie.textContent = "AUDIO // OFF";
        } else if (!ajustes.musica) {
            estadoAudioPie.textContent = "AUDIO // SOLO FX";
        } else if (!ajustes.efectos) {
            estadoAudioPie.textContent = "AUDIO // SOLO MÚSICA";
        } else {
            estadoAudioPie.textContent = "AUDIO // CONFIGURADO";
        }
    }
}

function seleccionarOpcion(boton) {
    if (!boton) return;

    opciones.forEach((opcion) => opcion.classList.remove("seleccionada"));
    boton.classList.add("seleccionada");

    accionSeleccionada = boton.dataset.accion;
    tituloPanel.textContent = boton.dataset.titulo;
    descripcionPanel.textContent = boton.dataset.descripcion;

    const textosBoton = {
        nave: "INICIAR SESIÓN",

        reglas: "ABRIR REGLAS",
        ajustes: "ABRIR AJUSTES",
        salir: "DESCONECTAR"
    };

    textoAccionPrincipal.textContent = textosBoton[accionSeleccionada];
}

function moverSeleccion(delta) {
    const indiceActual = Math.max(0, opcionesLista.findIndex((opcion) => opcion.classList.contains("seleccionada")));
    const nuevoIndice = (indiceActual + delta + opcionesLista.length) % opcionesLista.length;
    const nuevaOpcion = opcionesLista[nuevoIndice];
    seleccionarOpcion(nuevaOpcion);
    nuevaOpcion.focus({ preventScroll: true });
}

function abrirModal(modal) {
    modal.classList.add("abierto");
}

function cerrarModal(modal) {
    modal.classList.remove("abierto");
}

function ejecutarAccion(accion) {
    switch (accion) {
        case "nave": {
            if (!FleetApp.usuarioActual()) {
                errorLogin.textContent = "Inicia sesión para entrar al puente de mando.";
                abrirModal(modalLogin);
                usuarioInput.focus();
                return;
            }

            FleetApp.irConLoading("dashboard.html", "Preparando puente de mando...");
            break;
        }

        case "login": {
            errorLogin.textContent = "";
            abrirModal(modalLogin);
            usuarioInput.focus();
            break;
        }

        case "reglas":
            window.location.href = "reglas.html?from=index";
            break;

        case "ajustes":
            window.location.href = "ajustes.html?from=index";
            break;

        case "salir":
            abrirModal(document.getElementById("modalSalir"));
            break;
    }
}

opciones.forEach((boton) => {
    boton.addEventListener("mouseenter", () => seleccionarOpcion(boton));
    boton.addEventListener("focus", () => seleccionarOpcion(boton));
    boton.addEventListener("click", () => ejecutarAccion(boton.dataset.accion));
});

btnAccionPrincipal.addEventListener("click", () => ejecutarAccion(accionSeleccionada));

document.querySelectorAll("[data-cerrar-modal]").forEach((boton) => {
    boton.addEventListener("click", () => {
        const modal = document.getElementById(boton.dataset.cerrarModal);
        if (modal) cerrarModal(modal);
    });
});

document.querySelectorAll(".modal-overlay").forEach((modal) => {
    modal.addEventListener("click", (evento) => {
        if (evento.target === modal) cerrarModal(modal);
    });
});

document.addEventListener("keydown", (evento) => {
    const modalAbierto = document.querySelector(".modal-overlay.abierto");

    if (evento.key === "Escape" && modalAbierto) {
        evento.stopImmediatePropagation();
        cerrarModal(modalAbierto);
        return;
    }

    if (modalAbierto) return;

    if (evento.key === "ArrowDown") {
        evento.preventDefault();
        moverSeleccion(1);
        return;
    }

    if (evento.key === "ArrowUp") {
        evento.preventDefault();
        moverSeleccion(-1);
        return;
    }

    if (evento.key === "Enter") {
        const tag = document.activeElement?.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA") return;
        evento.preventDefault();
        ejecutarAccion(accionSeleccionada);
    }
}, true);

formLogin.addEventListener("submit", (evento) => {
    evento.preventDefault();
    errorLogin.textContent = "";

    const resultado = FleetApp.iniciarSesion(usuarioInput.value, passwordInput.value);

    if (!resultado.ok) {
        errorLogin.textContent = resultado.mensaje;
        return;
    }

    cerrarModal(modalLogin);
    actualizarSesionVisual();
    FleetApp.mostrarToast(`Sesión iniciada: ${resultado.usuario.nombre}`);

    window.setTimeout(() => {
        FleetApp.irConLoading("dashboard.html", "Validando credenciales y preparando la nave...");
    }, 850);
});

document.getElementById("confirmarSalir").addEventListener("click", () => {
    cerrarModal(document.getElementById("modalSalir"));

    window.close();

    window.setTimeout(() => {
        const pantalla = document.getElementById("pantallaDesconexion");
        pantalla.classList.add("visible");
        pantalla.setAttribute("aria-hidden", "false");
    }, 120);
});

document.getElementById("volverSistema").addEventListener("click", () => {
    const pantalla = document.getElementById("pantallaDesconexion");
    pantalla.classList.remove("visible");
    pantalla.setAttribute("aria-hidden", "true");
});

seleccionarOpcion(document.querySelector('.opcion-menu[data-accion="nave"]'));
actualizarSesionVisual();

const avisoPendiente = sessionStorage.getItem("fleetAviso");
if (avisoPendiente) {
    sessionStorage.removeItem("fleetAviso");
    window.setTimeout(() => FleetApp.mostrarToast(avisoPendiente), 180);
}
