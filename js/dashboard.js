// ========================================================
// FLEET COMMAND
// DASHBOARD
// ========================================================


// --------------------------------------------------------
// CONFIGURACIÓN INICIAL
// --------------------------------------------------------

const configuracion = {

    rival: "online",

    modo: "rafaga",

    mapa: "playa",

    dificultad: "normal"

};


// --------------------------------------------------------
// ELEMENTOS
// --------------------------------------------------------

const opciones = document.querySelectorAll(
    "[data-grupo]"
);

const btnIniciar = document.getElementById(
    "btnIniciar"
);

const textoEstado = document.getElementById(
    "textoEstado"
);


// --------------------------------------------------------
// SELECCIONAR OPCIONES
// --------------------------------------------------------

opciones.forEach((boton) => {

    boton.addEventListener("click", () => {

        const grupo =
            boton.dataset.grupo;

        const valor =
            boton.dataset.valor;


        // Buscar todos los botones
        // pertenecientes al mismo grupo.

        const grupoBotones =
            document.querySelectorAll(
                `[data-grupo="${grupo}"]`
            );


        // Quitar selección anterior.

        grupoBotones.forEach((elemento) => {

            elemento.classList.remove(
                "seleccionada"
            );

        });


        // Agregar selección actual.

        boton.classList.add(
            "seleccionada"
        );


        // Guardar valor.

        configuracion[grupo] = valor;


        actualizarEstado();

    });

});



// --------------------------------------------------------
// ACTUALIZAR TEXTO INFERIOR
// --------------------------------------------------------

function actualizarEstado() {

    const mapaNombre = {

        playa: "Playa",

        tormenta: "Tormenta",

        artico: "Mar Ártico"

    };


    const modoNombre = {

        clasico: "Clásico",

        rafaga: "Ráfaga"

    };


    textoEstado.textContent =

        `${modoNombre[configuracion.modo]} · ` +

        `${mapaNombre[configuracion.mapa]}`;

}



// --------------------------------------------------------
// INICIAR JUEGO
// --------------------------------------------------------

btnIniciar.addEventListener(
    "click",
    () => {

        // Guardar configuración elegida.

        localStorage.setItem(

            "fleetCommandConfig",

            JSON.stringify(
                configuracion
            )

        );


        console.log(
            "Configuración del juego:"
        );

        console.table(
            configuracion
        );


        // Cambio visual temporal mientras
        // todavía no creamos colocar-flota.html

        const textoOriginal =
            btnIniciar.innerHTML;


        btnIniciar.innerHTML =
            "✓ CONFIGURACIÓN GUARDADA";


        setTimeout(() => {

            btnIniciar.innerHTML =
                textoOriginal;

        }, 1300);



        /*
        =========================================
        MÁS ADELANTE:

        window.location.href =
            "colocar-flota.html";

        =========================================
        */

    }

);



// --------------------------------------------------------
// MOSTRAR CONFIGURACIÓN INICIAL
// --------------------------------------------------------

actualizarEstado();