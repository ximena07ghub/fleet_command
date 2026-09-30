import express from "express";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Server } from "socket.io";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = Number(process.env.PORT) || 3000;

const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer);

const paginas = new Set([
    "index.html",
    "dashboard.html",
    "loading.html",
    "juego.html",
    "ajustes.html",
    "perfil.html",
    "reglas.html",
    "pause.html",
    "puntuaciones.html"
]);

app.disable("x-powered-by");
app.use("/css", express.static(path.join(__dirname, "css")));
app.use("/js", express.static(path.join(__dirname, "js")));
app.use("/assets", express.static(path.join(__dirname, "assets")));
app.use("/ejercicio", express.static(path.join(__dirname, "ejercicio")));
app.use("/vendor/three", express.static(path.join(__dirname, "node_modules", "three")));

app.get("/api/status", (_req, res) => {
    res.json({
        ok: true,
        proyecto: "Fleet Command",
        servidor: "Express + Socket.IO",
        puerto: PORT
    });
});

app.get("/", (_req, res) => res.sendFile(path.join(__dirname, "index.html")));
app.get("/:pagina", (req, res, next) => {
    if (!paginas.has(req.params.pagina)) return next();
    res.sendFile(path.join(__dirname, req.params.pagina));
});

app.use((_req, res) => {
    res.status(404).send("Recurso no encontrado.");
});

const salas = new Map();

function crearCodigoSala() {
    const alfabeto = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let codigo = "";

    do {
        codigo = Array.from({ length: 5 }, () =>
            alfabeto[Math.floor(Math.random() * alfabeto.length)]
        ).join("");
    } while (salas.has(codigo));

    return codigo;
}

function normalizarCodigo(valor) {
    return String(valor || "").trim().toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8);
}

function datosSala(codigo) {
    const sala = salas.get(codigo);
    if (!sala) return null;

    return {
        codigo,
        jugadores: [...sala.jugadores.values()].map((jugador) => ({
            socketId: jugador.socketId,
            nombre: jugador.nombre,
            slot: jugador.slot,
            listo: Boolean(jugador.listo)
        }))
    };
}

function publicarSala(codigo) {
    const datos = datosSala(codigo);
    if (datos) io.to(codigo).emit("sala:estado", datos);
}

function salirDeSala(socket) {
    const codigo = socket.data.sala;
    if (!codigo || !salas.has(codigo)) return;

    const sala = salas.get(codigo);
    sala.jugadores.delete(socket.id);
    socket.leave(codigo);
    socket.data.sala = null;
    socket.data.slot = null;

    if (sala.jugadores.size === 0) {
        salas.delete(codigo);
        return;
    }

    publicarSala(codigo);
}

function unirJugador(socket, codigo, nombre) {
    const sala = salas.get(codigo);
    if (!sala) return { ok: false, mensaje: "La sala no existe." };
    if (sala.jugadores.size >= 2) return { ok: false, mensaje: "La sala ya tiene dos jugadores." };

    salirDeSala(socket);

    const slotsUsados = new Set([...sala.jugadores.values()].map((j) => j.slot));
    const slot = slotsUsados.has(1) ? 2 : 1;
    const jugador = {
        socketId: socket.id,
        nombre: String(nombre || `Jugador ${slot}`).trim().slice(0, 24) || `Jugador ${slot}`,
        slot,
        listo: true
    };

    sala.jugadores.set(socket.id, jugador);
    socket.join(codigo);
    socket.data.sala = codigo;
    socket.data.slot = slot;

    publicarSala(codigo);
    return { ok: true, codigo, slot, socketId: socket.id };
}

io.on("connection", (socket) => {
    socket.emit("servidor:conectado", { socketId: socket.id });

    socket.on("sala:crear", (datos = {}, responder = () => {}) => {
        const codigo = crearCodigoSala();
        salas.set(codigo, { jugadores: new Map() });
        responder(unirJugador(socket, codigo, datos.nombre));
    });

    socket.on("sala:unirse", (datos = {}, responder = () => {}) => {
        const codigo = normalizarCodigo(datos.codigo);
        if (!codigo) {
            responder({ ok: false, mensaje: "Escribe un código de sala." });
            return;
        }
        responder(unirJugador(socket, codigo, datos.nombre));
    });

    socket.on("sala:salir", (_datos, responder = () => {}) => {
        salirDeSala(socket);
        responder({ ok: true });
    });

    socket.on("juego:estadoBarco", (estado = {}) => {
        const codigo = socket.data.sala;
        if (!codigo) return;

        const limpio = {
            propietario: socket.data.slot,
            barcoId: String(estado.barcoId || "").slice(0, 40),
            x: Number(estado.x) || 0,
            y: Number(estado.y) || 0,
            z: Number(estado.z) || 0,
            rotY: Number(estado.rotY) || 0
        };

        socket.to(codigo).emit("juego:estadoBarco", limpio);
    });

    socket.on("juego:sincronizarFlota", (flota = []) => {
        const codigo = socket.data.sala;
        if (!codigo || !Array.isArray(flota)) return;

        const limpia = flota.slice(0, 8).map((estado) => ({
            propietario: socket.data.slot,
            barcoId: String(estado.barcoId || "").slice(0, 40),
            x: Number(estado.x) || 0,
            y: Number(estado.y) || 0,
            z: Number(estado.z) || 0,
            rotY: Number(estado.rotY) || 0
        }));

        socket.to(codigo).emit("juego:sincronizarFlota", limpia);
    });

    socket.on("juego:seleccionCasilla", (datos = {}) => {
        const codigo = socket.data.sala;
        if (!codigo) return;

        socket.to(codigo).emit("juego:seleccionCasilla", {
            propietario: socket.data.slot,
            columna: Number(datos.columna) || 0,
            fila: Number(datos.fila) || 0
        });
    });

    socket.on("juego:pausa", (pausado) => {
        const codigo = socket.data.sala;
        if (!codigo) return;
        socket.to(codigo).emit("juego:pausaRival", Boolean(pausado));
    });

    socket.on("disconnect", () => salirDeSala(socket));
});

httpServer.listen(PORT, () => {
    console.log(`Fleet Command disponible en http://localhost:${PORT}`);
    console.log("Abre otra ventana de Chrome o incógnito para probar multijugador.");
});
