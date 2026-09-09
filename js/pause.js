
// BOTONES

const botonesPausa =
    document.querySelectorAll(
        ".boton-pausa"
    );



// SELECCIÓN VISUAL


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


                // Por ahora solo mostramos
                // qué botón fue presionado.

                console.log(
                    "Acción seleccionada:",
                    boton.dataset.accion
                );

            }
        );

    }
);