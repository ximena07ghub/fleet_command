<?php
require __DIR__ . '/cors.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'mensaje' => 'Usa POST para registrar un puntaje.']);
    exit;
}

$datos = json_decode(file_get_contents('php://input'), true) ?: [];
$nombre = trim((string)($datos['nombre'] ?? ''));
$puntos = max(0, (int)($datos['puntos'] ?? 0));
$resultado = ($datos['resultado'] ?? '') === 'victoria' ? 'victoria' : 'derrota';
$modo = substr((string)($datos['modo'] ?? 'clasico'), 0, 20);
$mapa = substr((string)($datos['mapa'] ?? 'playa'), 0, 20);
$dificultad = substr((string)($datos['dificultad'] ?? 'normal'), 0, 20);

if (strlen($nombre) < 3) {
    http_response_code(422);
    echo json_encode(['ok' => false, 'mensaje' => 'Nombre de jugador inválido.']);
    exit;
}

try {
    require __DIR__ . '/conexion.php';
    $pdo->beginTransaction();

    $usuario = $pdo->prepare('INSERT INTO usuarios (nombre) VALUES (?) ON DUPLICATE KEY UPDATE nombre = VALUES(nombre)');
    $usuario->execute([$nombre]);

    $consultaId = $pdo->prepare('SELECT id FROM usuarios WHERE nombre = ? LIMIT 1');
    $consultaId->execute([$nombre]);
    $usuarioId = (int)$consultaId->fetchColumn();

    $puntaje = $pdo->prepare('INSERT INTO puntajes (usuario_id, puntos, resultado, modo, mapa, dificultad) VALUES (?, ?, ?, ?, ?, ?)');
    $puntaje->execute([$usuarioId, $puntos, $resultado, $modo, $mapa, $dificultad]);

    $pdo->commit();
    echo json_encode(['ok' => true, 'id' => (int)$pdo->lastInsertId()]);
} catch (Throwable $error) {
    if (isset($pdo) && $pdo->inTransaction()) $pdo->rollBack();
    http_response_code(500);
    echo json_encode(['ok' => false, 'mensaje' => 'No fue posible registrar el puntaje.']);
}
