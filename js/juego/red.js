export function crearClienteRed(callbacks = {}) {
    if (typeof window.io !== "function") {
        throw new Error("Socket.IO no está disponible. Inicia el proyecto con node server.js.");
    }

    const socket = window.io();
    let salaActual = "";
    let slot = null;

    socket.on("connect", () => callbacks.conexion?.(true, socket.id));
    socket.on("disconnect", () => callbacks.conexion?.(false, socket.id));
    socket.on("sala:estado", (datos) => callbacks.sala?.(datos));
    socket.on("juego:estadoBarco", (estado) => callbacks.estadoBarco?.(estado));
    socket.on("juego:sincronizarFlota", (flota) => callbacks.flota?.(flota));
    socket.on("juego:seleccionCasilla", (datos) => callbacks.seleccionCasilla?.(datos));
    socket.on("juego:pausaRival", (pausado) => callbacks.pausaRival?.(pausado));

    function solicitar(evento, datos) {
        return new Promise((resolve) => {
            let respondido = false;
            const timer = window.setTimeout(() => {
                if (!respondido) resolve({ ok: false, mensaje: "El servidor no respondió a tiempo." });
            }, 5000);

            socket.emit(evento, datos, (respuesta) => {
                respondido = true;
                window.clearTimeout(timer);
                if (respuesta?.ok) {
                    salaActual = respuesta.codigo || salaActual;
                    slot = respuesta.slot ?? slot;
                }
                resolve(respuesta || { ok: false, mensaje: "Respuesta inválida del servidor." });
            });
        });
    }

    return {
        socket,
        get sala() { return salaActual; },
        get slot() { return slot; },
        crearSala(nombre) {
            return solicitar("sala:crear", { nombre });
        },
        unirseSala(codigo, nombre) {
            return solicitar("sala:unirse", { codigo, nombre });
        },
        salirSala() {
            socket.emit("sala:salir", {}, () => {});
            salaActual = "";
            slot = null;
        },
        enviarBarco(estado) {
            if (salaActual) socket.emit("juego:estadoBarco", estado);
        },
        enviarFlota(flota) {
            if (salaActual) socket.emit("juego:sincronizarFlota", flota);
        },
        enviarCasilla(datos) {
            if (salaActual) socket.emit("juego:seleccionCasilla", datos);
        },
        enviarPausa(pausado) {
            if (salaActual) socket.emit("juego:pausa", pausado);
        }
    };
}
