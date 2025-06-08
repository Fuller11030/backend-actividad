CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    telefono VARCHAR(10) NOT NULL,
    rol VARCHAR(20) NOT NULL,
    area VARCHAR(100),
    usuario VARCHAR(50) UNIQUE NOT NULL,
    contrasena VARCHAR(255) NOT NULL
	calle VARCHAR(100),
	colonia VARCHAR(100),
	numero VARCHAR(10),
	email VARCHAR(100),
);

CREATE TABLE IF NOT EXISTS actividades (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    empleado_id INT,
    fecha_limite DATE,
    FOREIGN KEY (empleado_id) REFERENCES usuarios(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS reportes (
    id SERIAL PRIMARY KEY,
    actividad_id INT NOT NULL,
    contenido TEXT NOT NULL,
    fecha DATE NOT NULL,
    FOREIGN KEY (actividad_id) REFERENCES actividades(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS actividad_aceptada (
    id SERIAL PRIMARY KEY,
    actividad_id INT NOT NULL,
    empleado_id INT NOT NULL,
    fecha_aceptada DATE NOT NULL,
    FOREIGN KEY (actividad_id) REFERENCES actividades(id) ON DELETE CASCADE,
    FOREIGN KEY (empleado_id) REFERENCES usuarios(id) ON DELETE CASCADE
);