const pool = require('../config/db');
const PDFDocument = require('pdfkit');

// Guardar un nuevo reporte (empleado)
exports.crearReporte = async (req, res) => {
  const { actividadNombre, contenido, fecha } = req.body;

  try{
    const result = await pool.query('SELECT id FROM actividades WHERE nombre = $1', [actividadNombre]);

    if (result.rows.length === 0) {
      return res.status(400).json({ mensaje: 'Actividad no econtrada' });
    }

    const actividad_id = result.rows[0].id;

    await pool.query(
      'INSERT INTO reportes (actividad_id, contenido, fecha) VALUES ($1,$2, $3)',
      [actividad_id, contenido, fecha]
    );

    res.json({ mensaje: 'Reporte guardado correctamente' });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error del servidor', error: err.message });
  }
};

// Monitorear progreso (administrador)
exports.monitorear = async (req, res) => {
  const { nombreActividad } = req.body;

  const sql = `
    SELECT a.nombre AS actividad, a.fecha_limite, u.nombre AS empleado, r.contenido, r.fecha 
    FROM actividades a
    LEFT JOIN usuarios u ON a.empleado_id = u.id
    LEFT JOIN reportes r ON r.actividad_id = a.id
    WHERE a.nombre = $1
    ORDER BY r.fecha DESC
  `;

  try {
    const result = await pool.query(sql, [nombreActividad]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error del servidor', error: err.message });
  }
};

// Generar reporte PDF (último)
exports.generarPDF = async (req, res) => {
  const { nombreActividad } = req.body;

  const sql = `
    SELECT a.nombre AS actividad, r.contenido, r.fecha, u.nombre AS empleado
    FROM actividades a
    JOIN reportes r ON r.actividad_id = a.id
    JOIN usuarios u ON a.empleado_id = u.id
    WHERE a.nombre = $1
    ORDER BY r.fecha DESC
    LIMIT 1
  `;

  try {
    const result = await pool.query(sql, [nombreActividad]);

    if (result.rows.length === 0) {
      return res.status(404).json({ mensaje: 'No hay reportes disponibles' });
    }

    const reporte = result.rows[0];
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
  } catch (err) {
    res.status(500).json({ mensaje: 'Error del servidor', error: err.message });
  }
};

//obtener el ultimo reporte (sin PDF)
exports.obtenerUltimo = async (req, res) => {
  const { nombreActividad } = req.body;

  const sql = `
    SELECT r.contenido, r.fecha, u.nombre AS empleado
    FROM actividades a
    JOIN reportes r ON r.actividad_id = a.id
    JOIN usuarios u ON a.empleado_id = u.id
    WHERE a.nombre = $1
    ORDER BY r.fecha DESC
    LIMIT 1
  `;

  try {
    const result = await pool.query(sql, [nombreActividad]);

    if (result.rows.length === 0) {
      return res.status(404).json({ mensaje: 'No hay reportes' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error del servidor', error: err.message });
  }
};

//obtener todos los reportes de una actividad
exports.obtenerTodos = async (req, res) => {
  const { nombreActividad } = req.body;

  const sql = `
    SELECT r.id, r.contenido, r.fecha, u.nombre AS empleado
    FROM actividades a
    JOIN reportes r ON r.actividad_id = a.id
    JOIN usuarios u ON a.empleado_id = u.id
    WHERE a.nombre = $1
    ORDER BY r.fecha ASC
  `;

  try {
    const result = await pool.query(sql, [nombreActividad]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error del servidor', error: err.message });
  }
};