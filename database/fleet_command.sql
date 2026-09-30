CREATE DATABASE IF NOT EXISTS fleet_command
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE fleet_command;

CREATE TABLE IF NOT EXISTS usuarios (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS puntajes (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT UNSIGNED NOT NULL,
    puntos INT UNSIGNED NOT NULL DEFAULT 0,
    resultado ENUM('victoria', 'derrota') NOT NULL,
    modo VARCHAR(20) NOT NULL,
    mapa VARCHAR(20) NOT NULL,
    dificultad VARCHAR(20) NOT NULL,
    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_puntajes_usuario
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
        ON DELETE CASCADE,
    INDEX idx_puntajes_puntos (puntos),
    INDEX idx_puntajes_usuario (usuario_id)
);
