<?php
$origen = $_SERVER['HTTP_ORIGIN'] ?? '';
$permitidos = [
    'http://localhost:3000',
    'http://127.0.0.1:3000'
];

if (in_array($origen, $permitidos, true)) {
    header("Access-Control-Allow-Origin: $origen");
}

header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}
