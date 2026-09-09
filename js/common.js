// ==========================================================
// FLEET COMMAND - FUNCIONES COMPARTIDAS
// Este archivo controla:
// - ajustes de audio
// - sonido de click
// - música por segmento
// - sesión local de demostración
// - historial de victorias/derrotas
// - pantalla completa con ESC
// ==========================================================

(function () {
    "use strict";

    const CLAVES = {
        ajustes: "fleetAjustes",
        usuarios: "fleetUsuarios",
        sesion: "fleetSesion"
    };

    const AJUSTES_DEFECTO = {
        musica: true,
        efectos: true,
        volumenMusica: 0.32,
        volumenEfectos: 0.55
    };

    let contextoAudio = null;
    let musica = null;
    let temporizadorMusica = null;

    function leerJSON(clave, respaldo) {
        try {
            const valor = localStorage.getItem(clave);
            return valor ? JSON.parse(valor) : respaldo;
        } catch (error) {
            return respaldo;
        }
    }

    function guardarJSON(clave, valor) {
        localStorage.setItem(clave, JSON.stringify(valor));
    }

    function obtenerAjustes() {
        return {
            ...AJUSTES_DEFECTO,
            ...leerJSON(CLAVES.ajustes, {})
        };
    }

    function guardarAjustes(nuevos) {
        const ajustes = {
            ...obtenerAjustes(),
            ...nuevos
        };

        guardarJSON(CLAVES.ajustes, ajustes);
        aplicarVolumenMusica();
        return ajustes;
    }

    // SONIDO DE CLICK


    function crearBeep() {
        const ajustes = obtenerAjustes();
        if (!ajustes.efectos) return;

        try {
            contextoAudio = contextoAudio || new (window.AudioContext || window.webkitAudioContext)();
            const ahora = contextoAudio.currentTime;
            const oscilador = contextoAudio.createOscillator();
            const ganancia = contextoAudio.createGain();

            oscilador.type = "triangle";
            oscilador.frequency.setValueAtTime(330, ahora);
            oscilador.frequency.exponentialRampToValueAtTime(170, ahora + 0.065);

            const volumen = Math.max(0.001, ajustes.volumenEfectos * 0.11);
            ganancia.gain.setValueAtTime(volumen, ahora);
            ganancia.gain.exponentialRampToValueAtTime(0.001, ahora + 0.075);

            oscilador.connect(ganancia);
            ganancia.connect(contextoAudio.destination);
            oscilador.start(ahora);
            oscilador.stop(ahora + 0.08);
        } catch (error) {
        }
    }

    function reproducirClickLocal() {
        const ajustes = obtenerAjustes();
        if (!ajustes.efectos) return;

        const audio = new Audio("assets/audio/click-source.mp3");
        audio.preload = "auto";
        audio.volume = Math.min(1, Math.max(0, 0.9 * ajustes.volumenEfectos));
        audio.play().catch(() => crearBeep());
    }

    function sonidoClick() {
        reproducirClickLocal();
    }

    function instalarSonidosUI() {
        document.addEventListener("click", (evento) => {
            if (evento.target.closest("button, a, [data-sonido-ui]")) {
                sonidoClick();
            }
        });
    }

    // ------------------------------------------------------
    // MÚSICA:
    // 

    function aplicarVolumenMusica() {
        if (!musica) return;

        const ajustes = obtenerAjustes();
        const pagina = document.body.dataset.page || "otra";
        const multiplicadorPagina = pagina === "index" ? 1 : 0.42;

        musica.volume = ajustes.musica
            ? Math.min(1, ajustes.volumenMusica * multiplicadorPagina)
            : 0;

        if (!ajustes.musica) musica.pause();
    }

    function iniciarMusica() {
        const pagina = document.body.dataset.page || "otra";
        if (pagina !== "index" && pagina !== "dashboard") return;

        const ajustes = obtenerAjustes();
        if (!ajustes.musica) return;
        if (musica && !musica.paused) return;

        if (!musica) {
            musica = new Audio("assets/audio/music-source.mp3");
            musica.preload = "auto";
            musica.loop = false;

            musica.addEventListener("loadedmetadata", () => {
                if (Number.isFinite(musica.duration) && musica.duration > 458) {
                    musica.currentTime = 458;
                }
            });

            musica.addEventListener("error", () => {
            }, { once: true });
        }

        aplicarVolumenMusica();

        if (musica.currentTime < 458 || musica.currentTime >= 636) {
            try { musica.currentTime = 458; } catch (error) {}
        }

        musica.play().catch(() => {
        });

        if (!temporizadorMusica) {
            temporizadorMusica = window.setInterval(() => {
                if (!musica) return;
                if (musica.currentTime >= 636) {
                    musica.currentTime = 458;
                    musica.play().catch(() => {});
                }
            }, 200);
        }
    }

    function instalarInicioMusica() {
        iniciarMusica();

        const activar = () => {
            iniciarMusica();
            document.removeEventListener("pointerdown", activar);
            document.removeEventListener("keydown", activar);
        };

        document.addEventListener("pointerdown", activar);
        document.addEventListener("keydown", activar);
    }

    // 
    // PANTALLA CON ESC
  

    async function alternarPantallaCompleta() {
        try {
            if (!document.fullscreenElement) {
                await document.documentElement.requestFullscreen();
            } else {
                await document.exitFullscreen();
            }
        } catch (error) {
            mostrarToast("El navegador bloqueó la pantalla completa. Usa el botón de Ajustes o F11.");
        }
    }

    function instalarEscapeFullscreen() {
        document.addEventListener("keydown", (evento) => {
            if (evento.key !== "Escape") return;

            const modal = document.querySelector(".modal-overlay.abierto");
            if (modal) return;

            if (!document.fullscreenElement) {
                alternarPantallaCompleta();
            }
        });
    }

    // USUARIOS / SESIÓN LOCAL 
    // 

    function obtenerUsuarios() {
        return leerJSON(CLAVES.usuarios, {});
    }

    function usuarioActual() {
        try {
            return sessionStorage.getItem(CLAVES.sesion) || "";
        } catch (error) {
            return "";
        }
    }

    function iniciarSesion(usuario, password) {
        const nombre = String(usuario || "").trim();
        const clave = String(password || "");

        if (nombre.length < 3) {
            return { ok: false, mensaje: "El usuario debe tener al menos 3 caracteres." };
        }

        if (clave.length < 4) {
            return { ok: false, mensaje: "La contraseña debe tener al menos 4 caracteres." };
        }

        const usuarios = obtenerUsuarios();
        const id = nombre.toLowerCase();

        if (usuarios[id] && usuarios[id].password !== clave) {
            return { ok: false, mensaje: "La contraseña no coincide con este usuario." };
        }

        const esNuevo = !usuarios[id];

        if (esNuevo) {
            usuarios[id] = {
                nombre,
                password: clave,
                victorias: 0,
                derrotas: 0,
                partidas: 0,
                historial: [],
                creado: new Date().toISOString()
            };
            guardarJSON(CLAVES.usuarios, usuarios);
        }

        sessionStorage.setItem(CLAVES.sesion, id);
        return { ok: true, usuario: usuarios[id], nuevo: esNuevo };
    }

    function cerrarSesion() {
        sessionStorage.removeItem(CLAVES.sesion);
    }

    function obtenerPerfil() {
        const id = usuarioActual();
        if (!id) return null;
        const usuarios = obtenerUsuarios();
        return usuarios[id] || null;
    }

    function registrarResultado(resultado, detalle) {
        const id = usuarioActual();
        if (!id) return false;

        const usuarios = obtenerUsuarios();
        const perfil = usuarios[id];
        if (!perfil) return false;

        const normalizado = resultado === "victoria" ? "victoria" : "derrota";
        perfil.partidas = (perfil.partidas || 0) + 1;

        if (normalizado === "victoria") {
            perfil.victorias = (perfil.victorias || 0) + 1;
        } else {
            perfil.derrotas = (perfil.derrotas || 0) + 1;
        }

        perfil.historial = Array.isArray(perfil.historial) ? perfil.historial : [];
        perfil.historial.unshift({
            resultado: normalizado,
            detalle: detalle || "Partida Fleet Command",
            fecha: new Date().toISOString()
        });
        perfil.historial = perfil.historial.slice(0, 20);

        guardarJSON(CLAVES.usuarios, usuarios);
        return true;
    }

    // NAVEGACIÓN CON LOADING


    function irConLoading(destino, mensaje) {
        sessionStorage.setItem("fleetDestino", destino);
        sessionStorage.setItem("fleetMensajeCarga", mensaje || "Preparando sistema...");
        window.location.href = "loading.html";
    }

    

    function mostrarToast(mensaje, duracion) {
        let toast = document.getElementById("fleetToast");

        if (!toast) {
            toast = document.createElement("div");
            toast.id = "fleetToast";
            toast.className = "toast-fleet";
            document.body.appendChild(toast);
        }

        toast.textContent = mensaje;
        toast.classList.add("visible");

        window.clearTimeout(toast._timer);
        toast._timer = window.setTimeout(() => {
            toast.classList.remove("visible");
        }, duracion || 2200);
    }

    // API sencilla disponible para los demás archivos JS.
    window.FleetApp = {
        obtenerAjustes,
        guardarAjustes,
        sonidoClick,
        iniciarMusica,
        alternarPantallaCompleta,
        iniciarSesion,
        cerrarSesion,
        usuarioActual,
        obtenerPerfil,
        registrarResultado,
        irConLoading,
        mostrarToast
    };

    document.addEventListener("DOMContentLoaded", () => {
        instalarSonidosUI();
        instalarEscapeFullscreen();
        instalarInicioMusica();
    });
})();
