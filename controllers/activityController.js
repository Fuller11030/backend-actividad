const db = require('../config/db');

// Crear nueva actividad (por administrador)
exports.crearActividad = (req, res) => {
  const { nombre, descripcion, empleado_nombre, fecha } = req.body;

  const buscarEmpleado = `SELECT id FROM usuarios WHERE nombre = ? AND rol = 'Empleado'`;
  db.query(buscarEmpleado, [empleado_nombre], (err, results) => {
    if (err) return res.status(500).send(err);
    if (results.length === 0) return res.status(400).json({ mensaje: 'Empleado no encontrado' });

    const empleado_id = results[0].id;
    const sql = `INSERT INTO actividades (nombre, descripcion, empleado_id, fecha_limite)
                 VALUES (?, ?, ?, ?)`;

    db.query(sql, [nombre, descripcion, empleado_id, fecha], (err) => {
      if (err) return res.status(500).send(err);
      res.json({ mensaje: 'Actividad creada' });
    });
  });
};

// Modificar actividad
exports.modificarActividad = (req, res) => {
  const { nombre, nuevaDescripcion, nuevaFecha, nuevoEmpleado } = req.body;

  const buscarEmpleado = `SELECT id FROM usuarios WHERE nombre = ? AND rol = 'Empleado'`;
  db.query(buscarEmpleado, [nuevoEmpleado], (err, results) => {
    if (err) return res.status(500).send(err);
    if (results.length === 0) return res.status(400).json({ mensaje: 'Empleado no encontrado' });

    const empleado_id = results[0].id;
    const sql = `UPDATE actividades SET descripcion = ?, fecha_limite = ?, empleado_id = ? WHERE nombre = ?`;

    db.query(sql, [nuevaDescripcion, nuevaFecha, empleado_id, nombre], (err) => {
      if (err) return res.status(500).send(err);
      res.json({ mensaje: 'Actividad modificada' });
    });
  });
};

// Eliminar actividad
exports.eliminarActividad = (req, res) => {
  const { nombre, fecha } = req.body;

  const sql = `DELETE FROM actividades WHERE nombre = ? AND fecha_limite = ?`;
  db.query(sql, [nombre, fecha], (err) => {
    if (err) return res.status(500).send(err);
    res.json({ mensaje: 'Actividad eliminada' });
  });
};

// Aceptar actividad (por empleado)
exports.aceptarActividad = (req, res) => {
  const { nombreActividad, nombreEmpleado, fecha } = req.body;

  const buscarActividad = `SELECT id FROM actividades WHERE nombre = ?`;
  const buscarEmpleado = `SELECT id FROM usuarios WHERE nombre = ?`;

  db.query(buscarActividad, [nombreActividad], (err, actividadRes) => {
    if (err) return res.status(500).send(err);
    if (actividadRes.length === 0) return res.status(400).json({ mensaje: 'Actividad no encontrada' });

    db.query(buscarEmpleado, [nombreEmpleado], (err, empleadoRes) => {
      if (err) return res.status(500).send(err);
      if (empleadoRes.length === 0) return res.status(400).json({ mensaje: 'Empleado no encontrado' });

      const sql = `INSERT INTO actividad_aceptada (actividad_id, empleado_id, fecha_aceptada) VALUES (?, ?, ?)`;
      db.query(sql, [actividadRes[0].id, empleadoRes[0].id, fecha], (err) => {
        if (err) return res.status(500).send(err);
        res.json({ mensaje: 'Actividad aceptada' });
      });
    });
  });
};

//obtener todas las actividades
exports.obtenerActividades = (req, res) => {
  const sql = `
    SELECT a.id, a.nombre, a.descripcion, a.fecha_limite, u.nombre AS empleado 
    FROM actividades a
    LEFT JOIN usuarios u ON a.empleado_id = u.id
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ mensaje: 'Error al obtener actividades', error: err });
    res.json(results);
  });
};

//buscar actividad por nombre
exports.buscarPorNombre = (req, res) => {
  const nombre = req.params.nombre;
  const sql = `
    SELECT a.id, a.nombre, a.descripcion, a.fecha_limite, u.nombre AS empleado
    FROM actividades a
    LEFT JOIN usuarios u ON a.empleado_id = u.id
    WHERE a.nombre LIKE ?
  `;
  db.query(sql, [`%${nombre}%`], (err, results) => {
    if (err) return res.status(500).json({ mensaje: 'Error al buscar actividad', error: err });
    if (results.length === 0) return res.status(404).json({ mensaje: 'No se encontraron actividades con ese nombre' });
    res.json(results);
  });
};