// Botones del menú de pausa.

const botonesPausa =
    document.querySelectorAll(
        ".boton-pausa"
    );



// Marca opción activa.
botonesPausa.forEach(
    (boton) => {

        boton.addEventListener(
            "mouseenter",
            () => {

                botonesPausa.forEach(
                    (elemento) => {

                        elemento.classList.remove(
                            "seleccionado"
                        );

                    }
                );


                boton.classList.add(
                    "seleccionado"
                );

            }
        );


        boton.addEventListener(
            "click",
            () => {

                botonesPausa.forEach(
                    (elemento) => {

                        elemento.classList.remove(
                            "seleccionado"
                        );

                    }
                );


                boton.classList.add(
                    "seleccionado"
                );


                // Acción pendiente del juego.
                console.log(
                    "Acción seleccionada:",
                    boton.dataset.accion
                );

            }
        );

    }
);
