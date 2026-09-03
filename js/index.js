// ======================================================
// FLEET COMMAND
// MENÚ PRINCIPAL
// ======================================================


// Botones que tienen una pantalla de destino.

const opcionesMenu =
    document.querySelectorAll(
        ".opcion-menu[data-destino]"
    );


const btnSalir =
    document.getElementById(
        "btnSalir"
    );



// ======================================================
// HOVER / SELECCIÓN
// ======================================================

opcionesMenu.forEach(
    (boton) => {

        boton.addEventListener(
            "mouseenter",
            () => {

                opcionesMenu.forEach(
                    (elemento) => {

                        elemento.classList.remove(
                            "seleccionada"
                        );

                    }
                );


                boton.classList.add(
                    "seleccionada"
                );

            }
        );



        boton.addEventListener(
            "click",
            () => {

                const destino =
                    boton.dataset.destino;


                // Guardar hacia dónde debe ir
                // después del loading.

                sessionStorage.setItem(
                    "fleetDestino",
                    destino
                );



                // Mensaje que mostrará
                // la pantalla de carga.

                let mensaje =
                    "Cargando sistema...";


                if (
                    destino ===
                    "dashboard.html"
                ) {

                    mensaje =
                        "Preparando mando de flota...";

                }


                else if (
                    destino ===
                    "perfil.html"
                ) {

                    mensaje =
                        "Accediendo al perfil...";

                }


                else if (
                    destino ===
                    "reglas.html"
                ) {

                    mensaje =
                        "Cargando archivos tácticos...";

                }


                else if (
                    destino ===
                    "ajustes.html"
                ) {

                    mensaje =
                        "Iniciando configuración...";

                }



                sessionStorage.setItem(
                    "fleetMensajeCarga",
                    mensaje
                );



                // Ir al loading.

                window.location.href =
                    "loading.html";

            }
        );

    }
);



// ======================================================
// SALIR
// ======================================================

btnSalir.addEventListener(
    "click",
    () => {

        const confirmar =
            confirm(
                "¿Deseas salir de Fleet Command?"
            );


        if (confirmar) {

            /*
                Los navegadores normalmente no permiten
                cerrar una pestaña que el usuario abrió.

                Por ahora mostramos una pantalla simple.
            */

            document.body.innerHTML = `

                <div style="
                    height:100vh;
                    display:flex;
                    justify-content:center;
                    align-items:center;
                    background:#020913;
                    color:#7ffff6;
                    font-family:Arial;
                    text-align:center;
                ">

                    <div>

                        <h2>
                            FLEET COMMAND
                        </h2>

                        <p style="
                            margin-top:15px;
                            color:#aabfc2;
                        ">
                            Sesión finalizada
                        </p>

                    </div>

                </div>

            `;

        }

    }
);