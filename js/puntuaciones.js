const API_BASE = localStorage.getItem("fleetApiBaseUrl") || "http://localhost/fleet_command_api";
const estadoApi = document.getElementById("estadoApi");
const cuerpo = document.getElementById("cuerpoPuntuaciones");

function escaparTexto(valor) {
    return String(valor ?? "");
}

async function cargarPuntuaciones() {
    estadoApi.className = "estado-api";
    estadoApi.textContent = `Consultando ${API_BASE}...`;

    try {
        const respuesta = await fetch(`${API_BASE}/obtener_puntajes.php`, { cache: "no-store" });
        if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);
        const datos = await respuesta.json();
        if (!datos.ok || !Array.isArray(datos.puntuaciones)) throw new Error(datos.mensaje || "Respuesta no válida");

        cuerpo.innerHTML = "";
        if (!datos.puntuaciones.length) {
            cuerpo.innerHTML = '<tr><td colspan="5">La base de datos está conectada, pero aún no hay partidas registradas.</td></tr>';
        } else {
            datos.puntuaciones.forEach((fila, indice) => {
                const tr = document.createElement("tr");
                [
                    indice + 1,
                    escaparTexto(fila.nombre),
                    Number(fila.puntos) || 0,
                    Number(fila.partidas) || 0,
                    Number(fila.victorias) || 0
                ].forEach((valor) => {
                    const td = document.createElement("td");
                    td.textContent = valor;
                    tr.appendChild(td);
                });
                cuerpo.appendChild(tr);
            });
        }

        estadoApi.classList.add("ok");
        estadoApi.textContent = "Web Service conectado // puntuaciones obtenidas desde MySQL.";
    } catch (_error) {
        estadoApi.classList.add("error");
        estadoApi.textContent = "Web Service todavía no está activo. Sigue INSTRUCCIONES_INSTALACION.md para configurar XAMPP/MySQL.";
        cuerpo.innerHTML = '<tr><td colspan="5">Sin conexión con la base de datos.</td></tr>';
    }
}

function volver() {
    const origen = new URLSearchParams(window.location.search).get("from");
    window.location.href = origen === "dashboard" ? "dashboard.html" : "index.html";
}

document.getElementById("btnCerrarPuntuaciones").addEventListener("click", volver);
document.getElementById("btnReintentarPuntuaciones").addEventListener("click", cargarPuntuaciones);

cargarPuntuaciones();
