const perfil = FleetApp.obtenerPerfil();

if (!perfil) {
    window.location.href = "index.html";
} else {
    document.getElementById("nombrePerfil").textContent = perfil.nombre.toUpperCase();
    document.getElementById("partidasPerfil").textContent = perfil.partidas || 0;
    document.getElementById("victoriasPerfil").textContent = perfil.victorias || 0;
    document.getElementById("derrotasPerfil").textContent = perfil.derrotas || 0;

    const partidas = perfil.partidas || 0;
    const victorias = perfil.victorias || 0;
    const efectividad = partidas ? Math.round((victorias / partidas) * 100) : 0;
    document.getElementById("efectividadPerfil").textContent = `${efectividad}%`;

    const lista = document.getElementById("listaHistorial");
    const historial = Array.isArray(perfil.historial) ? perfil.historial : [];

    if (!historial.length) {
        lista.innerHTML = `
            <div class="historial-vacio">
                Aún no hay partidas registradas.
            </div>
        `;
    } else {
        historial.forEach((partida) => {
            const item = document.createElement("article");
            item.className = `item-historial ${partida.resultado}`;

            const fecha = new Date(partida.fecha);
            item.innerHTML = `
                <span class="resultado">${partida.resultado.toUpperCase()}</span>
                <span class="detalle"></span>
                <time></time>
            `;
            item.querySelector(".detalle").textContent = partida.detalle;
            item.querySelector("time").textContent = fecha.toLocaleString("es-MX", {
                dateStyle: "short",
                timeStyle: "short"
            });
            lista.appendChild(item);
        });
    }
        const btnCerrarPanelSistema =
            document.getElementById("btnCerrarPanelSistema");

        btnCerrarPanelSistema.addEventListener("click", () => {
            const parametros =
                new URLSearchParams(window.location.search);

            const origen = parametros.get("from");

            if (origen === "index") {
                window.location.href = "index.html";
            } else {
                window.location.href = "dashboard.html";
            }
        });

}
