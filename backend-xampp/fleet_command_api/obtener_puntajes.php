<?php
require __DIR__ . '/cors.php';

try {
    require __DIR__ . '/conexion.php';

    $sql = "SELECT u.nombre,
                   COALESCE(MAX(p.puntos), 0) AS puntos,
                   COUNT(p.id) AS partidas,
                   COALESCE(SUM(p.resultado = 'victoria'), 0) AS victorias
            FROM usuarios u
            LEFT JOIN puntajes p ON p.usuario_id = u.id
            GROUP BY u.id, u.nombre
            ORDER BY puntos DESC, victorias DESC, partidas ASC, u.nombre ASC
            LIMIT 20";

    $filas = $pdo->query($sql)->fetchAll();
    echo json_encode(['ok' => true, 'puntuaciones' => $filas]);
} catch (Throwable $error) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'mensaje' => 'Error al consultar las puntuaciones.']);
}
