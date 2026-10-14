CREATE DATABASE IF NOT EXISTS gcw
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE gcw;

CREATE TABLE IF NOT EXISTS score (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    score INT NOT NULL DEFAULT 0,
    resultado VARCHAR(12) NOT NULL DEFAULT 'practica',
    modo VARCHAR(20) NOT NULL DEFAULT 'clasico',
    mapa VARCHAR(20) NOT NULL DEFAULT 'playa',
    dificultad VARCHAR(20) NOT NULL DEFAULT 'normal',
    fecha TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_score_nombre (nombre),
    INDEX idx_score_puntos (score)
);

SELECT * FROM score;
