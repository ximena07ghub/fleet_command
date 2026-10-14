-- Ejecuta este archivo UNA VEZ si ya creaste gcw.score con solo:
-- id, nombre y score.

USE gcw;

ALTER TABLE score
    ADD COLUMN resultado VARCHAR(12) NOT NULL DEFAULT 'practica' AFTER score,
    ADD COLUMN modo VARCHAR(20) NOT NULL DEFAULT 'clasico' AFTER resultado,
    ADD COLUMN mapa VARCHAR(20) NOT NULL DEFAULT 'playa' AFTER modo,
    ADD COLUMN dificultad VARCHAR(20) NOT NULL DEFAULT 'normal' AFTER mapa,
    ADD COLUMN fecha TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER dificultad;

CREATE INDEX idx_score_nombre ON score(nombre);
CREATE INDEX idx_score_puntos ON score(score);

SELECT * FROM score;
