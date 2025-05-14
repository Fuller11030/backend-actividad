const db = require('../config/db');
const PDFDocument = require('pdfkit');

// Guardar un nuevo reporte (empleado)
exports.crearReporte = (req, res) => {
  const { actividadNombre, contenido, fecha } = req.body;

  const buscarActividad = `SELECT id FROM actividades WHERE nombre = ?`;
  db.query(buscarActividad, [actividadNombre], (err, results) => {
    if (err) return res.status(500).send(err);
    if (results.length === 0) return res.status(400).json({ mensaje: 'Actividad no encontrada' });

    const actividad_id = results[0].id;
    const sql = `INSERT INTO reportes (actividad_id, contenido, fecha) VALUES (?, ?, ?)`;

    db.query(sql, [actividad_id, contenido, fecha], (err) => {
      if (err) return res.status(500).send(err);
      res.json({ mensaje: 'Reporte guardado correctamente' });
    });
  });
};

// Monitorear progreso (administrador)
exports.monitorear = (req, res) => {
  const { nombreActividad } = req.body;

  const sql = `
    SELECT a.nombre AS actividad, a.fecha_limite, u.nombre AS empleado, r.contenido, r.fecha 
    FROM actividades a
    LEFT JOIN usuarios u ON a.empleado_id = u.id
    LEFT JOIN reportes r ON r.actividad_id = a.id
    WHERE a.nombre = ?
    ORDER BY r.fecha DESC
  `;

  db.query(sql, [nombreActividad], (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
};

// Generar reporte PDF (último)
exports.generarPDF = (req, res) => {
  const { nombreActividad } = req.body;

  const sql = `
    SELECT a.nombre AS actividad, r.contenido, r.fecha, u.nombre AS empleado
    FROM actividades a
    JOIN reportes r ON r.actividad_id = a.id
    JOIN usuarios u ON a.empleado_id = u.id
    WHERE a.nombre = ?
    ORDER BY r.fecha DESC
    LIMIT 1
  `;

  db.query(sql, [nombreActividad], (err, results) => {
    if (err) return res.status(500).send(err);
    if (results.length === 0) return res.status(404).json({ mensaje: 'No hay reportes disponibles' });

    const reporte = results[0];
    const doc = new PDFDocument();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=reporte_${nombreActividad}.pdf`);
    doc.pipe(res);

    doc.fontSize(20).text('Reporte de Actividad', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Actividad: ${reporte.actividad}`);
    doc.text(`Empleado: ${reporte.empleado}`);
    doc.text(`Fecha del reporte: ${reporte.fecha}`);
    doc.moveDown();
    doc.text('Progreso:');
    doc.text(reporte.contenido);

    doc.end();
  });
};

//obtener el ultimo reporte (sin PDF)
exports.obtenerUltimo = (req, res) => {
  const { nombreActividad } = req.body;

  const sql = `
    SELECT r.contenido, r.fecha, u.nombre AS empleado
    FROM actividades a
    JOIN reportes r ON r.actividad_id = a.id
    JOIN usuarios u ON a.empleado_id = u.id
    WHERE a.nombre = ?
    ORDER BY r.fecha DESC
    LIMIT 1
  `;

  db.query(sql, [nombreActividad], (err, results) => {
    if (err) return res.status(500).send(err);
    if (results.length === 0) return res.status(404).json({ mensaje: 'No hay reportes' });

    res.json(results[0]);
  });
};

//obtener todos los reportes de una actividad
exports.obtenerTodos = (req, res) => {
  const { nombreActividad } = req.body;

  const sql = `
    SELECT r.id, r.contenido, r.fecha, u.nombre AS empleado
    FROM actividades a
    JOIN reportes r ON r.actividad_id = a.id
    JOIN usuarios u ON a.empleado_id = u.id
    WHERE a.nombre = ?
    ORDER BY r.fecha ASC
  `;

  db.query(sql, [nombreActividad], (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
};