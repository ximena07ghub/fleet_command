import * as THREE from "three";

function materialesBarco(color) {
    const casco = new THREE.MeshPhongMaterial({
        color,
        shininess: 72,
        specular: 0x8afaf1,
        emissive: 0x001317
    });

    const metal = new THREE.MeshPhongMaterial({
        color: 0xa9c5cb,
        shininess: 95,
        specular: 0xffffff,
        emissive: 0x020809
    });

    return { casco, metal };
}

export function crearBarcoProvisional({ id, propietario, color }) {
    const grupo = new THREE.Group();
    const materiales = materialesBarco(color);

    const casco = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.42, 2.45), materiales.casco);
    casco.castShadow = true;
    casco.receiveShadow = true;
    grupo.add(casco);

    const proa = new THREE.Mesh(new THREE.ConeGeometry(0.48, 0.95, 4), materiales.casco);
    proa.rotation.x = Math.PI / 2;
    proa.rotation.y = Math.PI / 4;
    proa.position.z = -1.58;
    proa.castShadow = true;
    grupo.add(proa);

    const cabina = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.34, 0.72), materiales.metal);
    cabina.position.set(0, 0.34, 0.15);
    cabina.castShadow = true;
    grupo.add(cabina);

    const torreta = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.18, 0.22, 14), materiales.metal);
    torreta.position.set(0, 0.34, -0.62);
    torreta.castShadow = true;
    grupo.add(torreta);

    grupo.userData = {
        barcoId: id,
        propietario,
        seleccionable: true,
        baseY: 0.36,
        fase: Math.random() * Math.PI * 2,
        materiales: [materiales.casco, materiales.metal]
    };

    grupo.position.y = grupo.userData.baseY;
    return grupo;
}

export function crearFlotaProvisional({ slot, cantidad, scene, boardHalf, cellSize }) {
    const color = slot === 1 ? 0x00d9cf : 0xff9c38;
    const flota = [];
    const celdas = Math.round((boardHalf * 2) / cellSize);
    const fila = slot === 1 ? celdas - 2 : 1;
    const zBase = -boardHalf + cellSize * (fila + 0.5);
    const inicioX = -((cantidad - 1) * cellSize) / 2;

    for (let i = 0; i < cantidad; i += 1) {
        const barco = crearBarcoProvisional({
            id: `p${slot}-b${i + 1}`,
            propietario: slot,
            color
        });

        barco.position.x = inicioX + i * cellSize;
        barco.position.z = zBase;
        barco.rotation.y = slot === 1 ? 0 : Math.PI;
        scene.add(barco);
        flota.push(barco);
    }

    return flota;
}

export function encontrarBarcoDesdeObjeto(objeto) {
    let actual = objeto;
    while (actual) {
        if (actual.userData?.barcoId) return actual;
        actual = actual.parent;
    }
    return null;
}

export function marcarSeleccion(barco, seleccionado) {
    if (!barco) return;

    barco.userData.materiales?.forEach((material) => {
        material.emissive.setHex(seleccionado ? 0x0a605c : material === barco.userData.materiales[0] ? 0x001317 : 0x020809);
    });
}

export function animarFlota(flota, tiempo) {
    flota.forEach((barco, indice) => {
        const fase = barco.userData.fase || 0;
        barco.position.y = barco.userData.baseY + Math.sin(tiempo * 1.35 + fase + indice * 0.2) * 0.055;
        barco.rotation.z = Math.sin(tiempo * 1.1 + fase) * 0.018;
    });
}

function cajaDe(barco) {
    barco.updateMatrixWorld(true);
    return new THREE.Box3().setFromObject(barco);
}

function dentroDelTablero(barco, boardHalf) {
    const caja = cajaDe(barco);
    const margen = 0.08;
    return caja.min.x >= -boardHalf + margen &&
        caja.max.x <= boardHalf - margen &&
        caja.min.z >= -boardHalf + margen &&
        caja.max.z <= boardHalf - margen;
}

function colisionaConFlota(barco, flota) {
    const caja = cajaDe(barco);
    return flota.some((otro) => {
        if (otro === barco) return false;
        return caja.intersectsBox(cajaDe(otro));
    });
}

export function moverBarcoSeguro(barco, destino, flota, boardHalf) {
    const anterior = barco.position.clone();
    barco.position.x = destino.x;
    barco.position.z = destino.z;

    const valido = dentroDelTablero(barco, boardHalf) && !colisionaConFlota(barco, flota);
    if (!valido) barco.position.copy(anterior);
    return valido;
}

export function rotarBarcoSeguro(barco, giro, flota, boardHalf) {
    const anterior = barco.rotation.y;
    barco.rotation.y += giro;

    const valido = dentroDelTablero(barco, boardHalf) && !colisionaConFlota(barco, flota);
    if (!valido) barco.rotation.y = anterior;
    return valido;
}

export function aplicarEstadoBarco(barco, estado) {
    barco.position.x = Number(estado.x) || 0;
    barco.position.z = Number(estado.z) || 0;
    barco.rotation.y = Number(estado.rotY) || 0;
    barco.userData.baseY = Number.isFinite(Number(estado.y)) ? Number(estado.y) : barco.userData.baseY;
}

export function serializarBarco(barco) {
    return {
        barcoId: barco.userData.barcoId,
        x: barco.position.x,
        y: barco.userData.baseY,
        z: barco.position.z,
        rotY: barco.rotation.y
    };
}

export function serializarFlota(flota) {
    return flota.map(serializarBarco);
}
