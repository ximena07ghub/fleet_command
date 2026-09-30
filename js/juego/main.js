import * as THREE from "three";
import { crearEscena } from "./escena.js";
import {
    aplicarEstadoBarco,
    animarFlota,
    crearBarcoProvisional,
    crearFlotaProvisional,
    encontrarBarcoDesdeObjeto,
    marcarSeleccion,
    moverBarcoSeguro,
    rotarBarcoSeguro,
    serializarBarco,
    serializarFlota
} from "./barcos.js";
import {
    describirConfiguracion,
    obtenerCantidadBarcos,
    obtenerConfiguracion,
    obtenerTamanoTablero
} from "./configuracion.js";
import { crearClienteRed } from "./red.js";

const perfil = window.FleetApp?.obtenerPerfil();
if (!perfil) {
    sessionStorage.setItem("fleetAviso", "Inicia sesión antes de entrar a una partida.");
    window.location.href = "index.html";
    throw new Error("No hay sesión activa.");
}

const configuracion = obtenerConfiguracion();
const tamanoTablero = obtenerTamanoTablero(configuracion.dificultad);
const cantidadBarcos = obtenerCantidadBarcos(configuracion.dificultad);
const contenedor = document.getElementById("contenedorThree");
const mundo = crearEscena({
    mapa: configuracion.mapa,
    tamanoTablero,
    contenedor
});

const hudConfiguracion = document.getElementById("hudConfiguracion");
const estadoConexion = document.getElementById("estadoConexion");
const estadoSala = document.getElementById("estadoSala");
const estadoJugador = document.getElementById("estadoJugador");
const mensajeJuego = document.getElementById("mensajeJuego");
const codigoSala = document.getElementById("codigoSala");
const estadoLobby = document.getElementById("estadoLobby");
const btnSala = document.getElementById("btnSala");
const btnCrearSala = document.getElementById("btnCrearSala");
const btnUnirseSala = document.getElementById("btnUnirseSala");
const btnPausa = document.getElementById("btnPausa");
const btnContinuar = document.getElementById("btnContinuar");
const btnPantallaCompleta = document.getElementById("btnPantallaCompleta");
const btnVolverDashboard = document.getElementById("btnVolverDashboard");

hudConfiguracion.textContent = describirConfiguracion(configuracion);

const modalSala = window.bootstrap.Modal.getOrCreateInstance(document.getElementById("modalSala"), {
    backdrop: "static",
    keyboard: false
});
const modalPausa = window.bootstrap.Modal.getOrCreateInstance(document.getElementById("modalPausa"), {
    backdrop: "static",
    keyboard: false
});

const raycaster = new THREE.Raycaster();
const puntero = new THREE.Vector2();
let flotaLocal = [];
let flotaRemota = [];
let barcoSeleccionado = null;
let slotLocal = null;
let pausado = false;
let salaConDosJugadores = false;
let red = null;
let temporizadorIA = null;

function limpiarFlota(flota) {
    flota.forEach((barco) => mundo.scene.remove(barco));
    flota.length = 0;
}

function seleccionarBarco(barco) {
    if (barcoSeleccionado === barco) return;
    marcarSeleccion(barcoSeleccionado, false);
    barcoSeleccionado = barco;
    marcarSeleccion(barcoSeleccionado, true);

    if (barcoSeleccionado) {
        mensajeJuego.textContent = `Seleccionado: ${barcoSeleccionado.userData.barcoId}. Usa WASD, flechas o una casilla.`;
        window.FleetApp.sonidoClick();
    }
}

function prepararFlotaLocal(slot) {
    limpiarFlota(flotaLocal);
    seleccionarBarco(null);
    slotLocal = slot;

    flotaLocal = crearFlotaProvisional({
        slot,
        cantidad: cantidadBarcos,
        scene: mundo.scene,
        boardHalf: mundo.boardHalf,
        cellSize: mundo.cellSize
    });

    seleccionarBarco(flotaLocal[0]);
    estadoJugador.textContent = `JUGADOR ${slot} // ${perfil.nombre.toUpperCase()}`;
}

function asegurarBarcoRemoto(estado) {
    let barco = flotaRemota.find((item) => item.userData.barcoId === estado.barcoId);
    if (barco) return barco;

    const color = estado.propietario === 1 ? 0x00d9cf : 0xff9c38;
    barco = crearBarcoProvisional({
        id: estado.barcoId,
        propietario: estado.propietario,
        color
    });
    barco.userData.seleccionable = false;
    mundo.scene.add(barco);
    flotaRemota.push(barco);
    return barco;
}

function aplicarFlotaRemota(estados) {
    estados.forEach((estado) => {
        if (!estado?.barcoId) return;
        const barco = asegurarBarcoRemoto(estado);
        aplicarEstadoBarco(barco, estado);
    });
}

function estadoActualBarco(barco) {
    return serializarBarco(barco);
}

function notificarMovimiento(barco) {
    if (!barco || configuracion.rival !== "online") return;
    red?.enviarBarco(estadoActualBarco(barco));
}

function puntoACelda(punto) {
    const columna = THREE.MathUtils.clamp(
        Math.floor((punto.x + mundo.boardHalf) / mundo.cellSize),
        0,
        tamanoTablero - 1
    );
    const fila = THREE.MathUtils.clamp(
        Math.floor((punto.z + mundo.boardHalf) / mundo.cellSize),
        0,
        tamanoTablero - 1
    );

    return {
        columna,
        fila,
        x: -mundo.boardHalf + mundo.cellSize * (columna + 0.5),
        z: -mundo.boardHalf + mundo.cellSize * (fila + 0.5)
    };
}

function marcarCasilla(celda, color = 0x69ffd7) {
    mundo.marcador.material.color.setHex(color);
    mundo.marcador.position.x = celda.x;
    mundo.marcador.position.z = celda.z;
    mundo.marcador.visible = true;
}

function intentarMoverSeleccionado(x, z) {
    if (!barcoSeleccionado || pausado) return false;

    const valido = moverBarcoSeguro(
        barcoSeleccionado,
        { x, z },
        flotaLocal,
        mundo.boardHalf
    );

    if (!valido) {
        mensajeJuego.textContent = "Movimiento bloqueado: evita salir del tablero o atravesar otro barco.";
        window.FleetApp.mostrarToast("Posición no válida.", 1300);
        return false;
    }

    notificarMovimiento(barcoSeleccionado);
    mensajeJuego.textContent = `Movimiento sincronizado: ${barcoSeleccionado.userData.barcoId}.`;
    return true;
}

function alPulsarCanvas(evento) {
    if (pausado) return;

    const rect = mundo.renderer.domElement.getBoundingClientRect();
    puntero.x = ((evento.clientX - rect.left) / rect.width) * 2 - 1;
    puntero.y = -((evento.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(puntero, mundo.camera);

    const impactoLocal = raycaster.intersectObjects(flotaLocal, true)[0];
    if (impactoLocal) {
        const barco = encontrarBarcoDesdeObjeto(impactoLocal.object);
        seleccionarBarco(barco);
        return;
    }

    const impactoRemoto = raycaster.intersectObjects(flotaRemota, true)[0];
    if (impactoRemoto) {
        mensajeJuego.textContent = "Ese barco pertenece al rival y no puede ser controlado desde esta ventana.";
        return;
    }

    const impactoTablero = raycaster.intersectObject(mundo.tableroRaycast, false)[0];
    if (!impactoTablero) return;

    const celda = puntoACelda(impactoTablero.point);
    marcarCasilla(celda);
    red?.enviarCasilla({ columna: celda.columna, fila: celda.fila });
    intentarMoverSeleccionado(celda.x, celda.z);
}

function alPulsarTecla(evento) {
    if (evento.key === "Escape") {
        const salaVisible = document.getElementById("modalSala").classList.contains("show");
        if (salaVisible) return;
        evento.preventDefault();
        pausado ? continuarPartida() : pausarPartida();
        return;
    }

    const objetivo = evento.target?.tagName;
    if (["INPUT", "TEXTAREA", "SELECT"].includes(objetivo) || pausado || !barcoSeleccionado) return;

    const tecla = evento.key.toLowerCase();
    const paso = mundo.cellSize;
    let x = barcoSeleccionado.position.x;
    let z = barcoSeleccionado.position.z;
    let manejada = true;

    if (tecla === "w" || evento.key === "ArrowUp") z -= paso;
    else if (tecla === "s" || evento.key === "ArrowDown") z += paso;
    else if (tecla === "a" || evento.key === "ArrowLeft") x -= paso;
    else if (tecla === "d" || evento.key === "ArrowRight") x += paso;
    else if (tecla === "q" || tecla === "e") {
        const giro = tecla === "q" ? Math.PI / 2 : -Math.PI / 2;
        const valido = rotarBarcoSeguro(barcoSeleccionado, giro, flotaLocal, mundo.boardHalf);
        if (valido) notificarMovimiento(barcoSeleccionado);
        else window.FleetApp.mostrarToast("No hay espacio para girar el barco.", 1300);
        evento.preventDefault();
        return;
    } else {
        manejada = false;
    }

    if (manejada) {
        evento.preventDefault();
        intentarMoverSeleccionado(x, z);
    }
}

function renderLoop(tiempoMs) {
    const tiempo = tiempoMs / 1000;
    animarFlota(flotaLocal, tiempo);
    animarFlota(flotaRemota, tiempo);

    mundo.pointLight.intensity = configuracion.mapa === "tormenta"
        ? 2.4 + Math.max(0, Math.sin(tiempo * 2.8)) * 2.1
        : 1.6 + Math.sin(tiempo * 1.3) * 0.18;

    mundo.renderer.render(mundo.scene, mundo.camera);
}

function pausarPartida() {
    if (pausado) return;
    pausado = true;
    mundo.renderer.setAnimationLoop(null);
    red?.enviarPausa(true);
    modalPausa.show();
}

function continuarPartida() {
    if (!pausado) return;
    pausado = false;
    modalPausa.hide();
    mundo.renderer.setAnimationLoop(renderLoop);
    red?.enviarPausa(false);
}

function iniciarModoIA() {
    estadoConexion.textContent = "MODO LOCAL // ACTIVO";
    estadoConexion.classList.add("ok");
    estadoSala.textContent = "RIVAL // IA PROVISIONAL";
    btnSala.disabled = true;

    prepararFlotaLocal(1);
    flotaRemota = crearFlotaProvisional({
        slot: 2,
        cantidad: cantidadBarcos,
        scene: mundo.scene,
        boardHalf: mundo.boardHalf,
        cellSize: mundo.cellSize
    });
    flotaRemota.forEach((barco) => { barco.userData.seleccionable = false; });

    mensajeJuego.textContent = "Modo IA de prueba: la flota rival realiza movimientos simples mientras desarrollamos la lógica final.";

    temporizadorIA = window.setInterval(() => {
        if (pausado || !flotaRemota.length) return;
        const barco = flotaRemota[Math.floor(Math.random() * flotaRemota.length)];
        const opciones = [
            { x: barco.position.x + mundo.cellSize, z: barco.position.z },
            { x: barco.position.x - mundo.cellSize, z: barco.position.z },
            { x: barco.position.x, z: barco.position.z + mundo.cellSize },
            { x: barco.position.x, z: barco.position.z - mundo.cellSize }
        ];
        const destino = opciones[Math.floor(Math.random() * opciones.length)];
        moverBarcoSeguro(barco, destino, flotaRemota, mundo.boardHalf);
    }, 2400);
}

function actualizarSala(datos) {
    const jugadores = datos?.jugadores || [];
    const codigo = datos?.codigo || red?.sala || "--";
    estadoSala.textContent = `SALA // ${codigo} // ${jugadores.length}/2`;
    estadoSala.classList.toggle("ok", jugadores.length === 2);
    estadoSala.classList.toggle("alerta", jugadores.length < 2);
    estadoLobby.textContent = `Sala ${codigo}: ${jugadores.map((j) => `J${j.slot} ${j.nombre}`).join(" · ") || "sin jugadores"}`;

    salaConDosJugadores = jugadores.length === 2;

    if (salaConDosJugadores && slotLocal) {
        red.enviarFlota(serializarFlota(flotaLocal));
        modalSala.hide();
        mensajeJuego.textContent = "Enlace completo. Los movimientos de ambos jugadores se replican en tiempo real.";
    } else if (slotLocal) {
        limpiarFlota(flotaRemota);
        mensajeJuego.textContent = "Sala creada. Comparte el código con el segundo navegador.";
    }
}

async function entrarSala(accion) {
    btnCrearSala.disabled = true;
    btnUnirseSala.disabled = true;
    estadoLobby.textContent = "Contactando servidor...";

    const respuesta = accion === "crear"
        ? await red.crearSala(perfil.nombre)
        : await red.unirseSala(codigoSala.value, perfil.nombre);

    btnCrearSala.disabled = false;
    btnUnirseSala.disabled = false;

    if (!respuesta?.ok) {
        estadoLobby.textContent = respuesta?.mensaje || "No fue posible entrar a la sala.";
        return;
    }

    codigoSala.value = respuesta.codigo;
    prepararFlotaLocal(respuesta.slot);
    estadoSala.textContent = `SALA // ${respuesta.codigo} // 1/2`;
    estadoLobby.textContent = `Conectado como Jugador ${respuesta.slot}. Código: ${respuesta.codigo}`;
    red.enviarFlota(serializarFlota(flotaLocal));
}

function iniciarModoOnline() {
    red = crearClienteRed({
        conexion(conectado) {
            estadoConexion.textContent = conectado ? "SERVIDOR // CONECTADO" : "SERVIDOR // DESCONECTADO";
            estadoConexion.classList.toggle("ok", conectado);
            estadoConexion.classList.toggle("alerta", !conectado);
        },
        sala: actualizarSala,
        estadoBarco(estado) {
            if (!estado?.barcoId) return;
            const barco = asegurarBarcoRemoto(estado);
            aplicarEstadoBarco(barco, estado);
        },
        flota: aplicarFlotaRemota,
        seleccionCasilla(datos) {
            const celda = {
                x: -mundo.boardHalf + mundo.cellSize * (datos.columna + 0.5),
                z: -mundo.boardHalf + mundo.cellSize * (datos.fila + 0.5)
            };
            marcarCasilla(celda, 0xffb14a);
        },
        pausaRival(rivalPausado) {
            window.FleetApp.mostrarToast(rivalPausado ? "El rival pausó su control local." : "El rival reanudó la partida.");
        }
    });

    estadoJugador.textContent = "MULTIJUGADOR // SIN SALA";
    window.setTimeout(() => modalSala.show(), 220);
}

mundo.renderer.domElement.addEventListener("pointerdown", alPulsarCanvas);
document.addEventListener("keydown", alPulsarTecla, true);
btnSala.addEventListener("click", () => modalSala.show());
btnCrearSala.addEventListener("click", () => entrarSala("crear"));
btnUnirseSala.addEventListener("click", () => entrarSala("unir"));
btnPausa.addEventListener("click", pausarPartida);
btnContinuar.addEventListener("click", continuarPartida);
btnPantallaCompleta.addEventListener("click", () => window.FleetApp.alternarPantallaCompleta());
btnVolverDashboard.addEventListener("click", () => {
    red?.salirSala();
    window.location.href = "dashboard.html";
});

codigoSala.addEventListener("input", () => {
    codigoSala.value = codigoSala.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
});

window.addEventListener("beforeunload", () => {
    if (temporizadorIA) window.clearInterval(temporizadorIA);
    red?.salirSala();
    mundo.dispose();
});

mundo.renderer.setAnimationLoop(renderLoop);

if (configuracion.rival === "online") iniciarModoOnline();
else iniciarModoIA();
