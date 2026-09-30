import * as THREE from "three";

function materialIluminado(material) {
    if (!material?.isMeshBasicMaterial) return material;

    return new THREE.MeshPhongMaterial({
        color: material.color?.clone() || new THREE.Color(0xffffff),
        map: material.map || null,
        transparent: material.transparent,
        opacity: material.opacity,
        side: material.side,
        shininess: 55
    });
}

function prepararModelo(modelo) {
    modelo.traverse((objeto) => {
        if (!objeto.isMesh) return;
        objeto.castShadow = true;
        objeto.receiveShadow = true;

        if (Array.isArray(objeto.material)) {
            objeto.material = objeto.material.map(materialIluminado);
        } else {
            objeto.material = materialIluminado(objeto.material);
        }
    });
}

// Punto de entrada para sustituir los barcos provisionales por OBJ o FBX.
export async function cargarModeloBarco({ ruta, formato, escala = 1 }) {
    if (!ruta) return null;

    const tipo = String(formato || "").toLowerCase();
    let modelo;

    if (tipo === "fbx") {
        const { FBXLoader } = await import("three/addons/loaders/FBXLoader.js");
        modelo = await new FBXLoader().loadAsync(ruta);
    } else if (tipo === "obj") {
        const { OBJLoader } = await import("three/addons/loaders/OBJLoader.js");
        modelo = await new OBJLoader().loadAsync(ruta);
    } else {
        throw new Error(`Formato 3D no soportado: ${formato}`);
    }

    modelo.scale.setScalar(escala);
    prepararModelo(modelo);

    let mixer = null;
    if (modelo.animations?.length) {
        mixer = new THREE.AnimationMixer(modelo);
        modelo.animations.forEach((clip) => mixer.clipAction(clip).play());
    }

    return { modelo, mixer };
}
