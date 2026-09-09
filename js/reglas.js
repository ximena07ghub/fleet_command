const tabsReglas = document.querySelectorAll("[data-regla]");
const panelesReglas = document.querySelectorAll("[data-panel-regla]");

const btnCerrarPanelSistema =
    document.getElementById("btnCerrarPanelSistema");

btnCerrarPanelSistema.addEventListener("click", () => {
    const parametros =
        new URLSearchParams(window.location.search);

    const origen = parametros.get("from");

    if (origen === "dashboard") {
        window.location.href = "dashboard.html";
    } else {
        window.location.href = "index.html";
    }
});

tabsReglas.forEach((tab) => {
    tab.addEventListener("click", () => {
        const objetivo = tab.dataset.regla;
        tabsReglas.forEach((item) => item.classList.toggle("activa", item === tab));
        panelesReglas.forEach((panel) => {
            panel.classList.toggle("activa", panel.dataset.panelRegla === objetivo);
        });

        const contenido = document.querySelector(".reglas-contenido");
        if (contenido) contenido.scrollTop = 0;
    });
});
