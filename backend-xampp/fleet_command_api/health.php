<?php
require __DIR__ . '/cors.php';

try {
    require __DIR__ . '/conexion.php';
    $pdo->query('SELECT 1');
    echo json_encode(['ok' => true, 'servicio' => 'Fleet Command API', 'mysql' => true]);
} catch (Throwable $error) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'mensaje' => 'No fue posible conectar con MySQL.']);
}
