const pool = require('../config/db');

// Crear nueva actividad (por administrador)
exports.crearActividad = async (req, res) => {
  const { nombre, descripcion, empleado_nombre, fecha } = req.body;

  try {
    const empleadoRes = await pool.query(
      `SELECT id FROM usuarios WHERE nombre = $1 AND rol = 'Empleado'`,
      [empleado_nombre]
    );

    if (empleadoRes.rows.length === 0) {
      return res.status(400).json({ mensaje: 'Empleado no encotrado' });
    }

    const empleado_id = empleadoRes.rows[0].id;

    await pool.query(
      `INSERT INTO actividades (nombre, descripcion, empleado_id, fecha_limite)
      VALUES ($1, $2, $3, $4)`,
      [nombre, descripcion, empleado_id, fecha]
    );

    res.json({ mensaje: 'Actividad creada' });
  } catch (err) {
    res.status(500).send(err);
  }
};

// Modificar actividad
exports.modificarActividad = async (req, res) => {
  const { nombre, nuevaDescripcion, nuevaFecha, nuevoEmpleado } = req.body;

  try {
    const empleadoRes = await pool.query(
      `SELECT id FROM usuarios WHERE nombre = $1 AND rol = 'Empleado'`,
      [nuevoEmpleado]
    );

    if (empleadoRes.rows.length === 0) {
      return res.status(400).json({ mensaje: 'Empleado no encontrado' });
    }

    const empleado_id = empleadoRes.rows[0].id;

    await pool.query(
      `UPDATE actividades
      SET descripcion = $1, fecha_limite = $2, empleado_id = $3
      WHERE nombre = $4`,
      [nuevaDescripcion, nuevaFecha, empleado_id, nombre]
    );
 
    res.json({ mensaje: 'Actividad modificada' });
  } catch (err) {
    res.status(500).send(err);
  }
};

// Eliminar actividad
exports.eliminarActividad = async (req, res) => {
  const { nombre, fecha } = req.body;

  try {
    await pool.query(
      `DELETE FROM actividades WHERE nombre = $1 AND fecha_limite = $2`,
      [nombre, fecha]
    );

    res.json({ mensaje: 'Actividad eliminada correctamente' });
  } catch (err) {
    console.error("Error al eliminar actividad:", err.message || err);
    res.status(500).json({ mensaje: 'Error al eliminar actividad', error: err.message });
  }
};

// Aceptar actividad (por empleado)
exports.aceptarActividad = async (req, res) => {
  const { nombreActividad, nombreEmpleado, fecha } = req.body;

  try {
    const actividadRes = await pool.query(
      `SELECT id FROM actividades WHERE nombre = $1`,
      [nombreActividad]
    );

    if (actividadRes.rows.length === 0) {
      return res.status(400).json({ mensaje: 'Actividad no encontrada' });
    }

    const empleadoRes = await pool.query(
      `SELECT id FROM usuarios WHERE nombre =$1`,
      [nombreEmpleado]
    );

    if (empleadoRes.rows.length === 0) {
      return res.status(400).json({ mensaje: 'Empleado no encotrado' });
    }

    await pool.query(
      `INSERT INTO actividad_aceptada (actividad_id, empleado_id, fecha_aceptada)
      VALUES ($1, $2, $3)`,
      [actividadRes.rows[0].id, empleadoRes.rows[0].id, fecha]
    );

    res.json({ mensaje: 'Actividad aceptada' });
  } catch (err) {
    res.status(500).send(err);
  }
};

//obtener actividad asignada por empleado
exports.obtenerPorEmpleado = async (req, res) => {
  const { nombreEmpleado } = req.body;

  try {
    const result = await pool.query(`
      SELECT a.nombre, a.descripcion, a.fecha_limite
      FROM actividades a
      JOIN usuarios u ON a.empleado_id = u.id
      WHERE u.nombre = $1
      `, [nombreEmpleado]);

      res.json(result.rows);
  } catch (err) {
    console.error("Error al obtener actividades del empleado:", err.message || err);
    res.status(500).json({ mensaje: 'Error al obtener actividades', error: err.message });
  }
};

//obtener todas las actividades
exports.obtenerActividades = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT a.id, a.nombre, a.descripcion, a.fecha_limite, u.nombre AS empleado
      FROM actividades a
      LEFT JOIN usuarios u ON a.empleado_id = u.id
      `);

      res.json(result.rows);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al obtener actividades', error: err });
  }
};

//buscar actividad por nombre
exports.buscarPorNombre = async (req, res) => {
  const nombre = req.params.nombre;
   try {
    const result = await pool.query(`
      SELECT a.id, a.nombre, a.descripcion, a.fecha_limite, u.nombre AS empleado
      FROM actividades a
      LEFT JOIN usuarios u ON a.empleado_id = u.id
      WHERE a.nombre ILIKE $1
      `, [`%${nombre}%`]);

      if (result.rows.length === 0) {
        return res.status(404).json({ mensaje: 'No se encontraron actividades con ese nombre' });
      }

      res.json(result.rows);
   } catch (err) {
    res.status(500).json({ mensaje: 'Error al buscar actividad', error: err });
   }
};