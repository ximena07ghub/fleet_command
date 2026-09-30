// Perfil de sesión; las estadísticas oficiales vienen del Web Service.
const perfil = FleetApp.obtenerPerfil();
const API_BASE = localStorage.getItem("fleetApiBaseUrl") || "http://localhost/fleet_command_api";

if (!perfil) {
    window.location.href = "index.html";
} else {
    document.getElementById("nombrePerfil").textContent = perfil.nombre.toUpperCase();

    const partidas = document.getElementById("partidasPerfil");
    const victorias = document.getElementById("victoriasPerfil");
    const derrotas = document.getElementById("derrotasPerfil");
    const efectividad = document.getElementById("efectividadPerfil");
    const lista = document.getElementById("listaHistorial");

    [partidas, victorias, derrotas, efectividad].forEach((elemento) => {
        elemento.textContent = "—";
    });

    async function cargarResumenRemoto() {
        try {
            const respuesta = await fetch(`${API_BASE}/obtener_puntajes.php`, { cache: "no-store" });
            if (!respuesta.ok) throw new Error("API no disponible");
            const datos = await respuesta.json();
            const fila = datos.puntuaciones?.find(
                (item) => String(item.nombre).toLowerCase() === perfil.nombre.toLowerCase()
            );

            const total = Number(fila?.partidas) || 0;
            const ganadas = Number(fila?.victorias) || 0;
            const perdidas = Math.max(0, total - ganadas);

            partidas.textContent = total;
            victorias.textContent = ganadas;
            derrotas.textContent = perdidas;
            efectividad.textContent = total ? `${Math.round((ganadas / total) * 100)}%` : "0%";

            lista.innerHTML = `
                <div class="historial-vacio">
                    Estadísticas consultadas desde MySQL. El historial detallado se conectará a este mismo Web Service en la entrega final.
                </div>
            `;
        } catch (_error) {
            lista.innerHTML = `
                <div class="historial-vacio">
                    Web Service sin configurar. No se usan puntuaciones guardadas en localStorage.
                </div>
            `;
        }
    }

    document.getElementById("btnCerrarPanelSistema").addEventListener("click", () => {
        const origen = new URLSearchParams(window.location.search).get("from");
        window.location.href = origen === "index" ? "index.html" : "dashboard.html";
    });

    cargarResumenRemoto();
}
