/* Cliente REST ligero para Supabase; no requiere build ni npm. */
(function () {
  const config = window.EDUMANAGER_SUPABASE_CONFIG || {};
  const url = String(config.url || '').replace(/\/$/, '');
  const key = String(config.anonKey || '');
  const configured = /^https:\/\/.+\.supabase\.co$/.test(url) && key.length > 10;
  const catalogs = {
    materiales: { table: 'catalogo_materiales', columns: ['concepto', 'monto'] },
    mensualidades: { table: 'catalogo_mensualidades', columns: ['concepto', 'monto'] },
    grados: { table: 'catalogo_grados', columns: ['nombre'] },
    secciones: { table: 'catalogo_secciones', columns: ['nombre'] },
    estudiantes: { table: 'catalogo_estudiantes', columns: ['nombre', 'apellido', 'grado', 'seccion'] },
    docentes: { table: 'catalogo_docentes', columns: ['nombre', 'apellido', 'grado', 'seccion'] },
    pagos: { table: 'Pagos', columns: ['NumRegistro', 'estudiante', 'fechaPago', 'detallePago', 'MoraTotal', 'PagoTotal'] }
  };

  async function request(path, options = {}) {
    if (!configured) throw new Error('Falta configurar la URL y la clave pública de Supabase.');
    const response = await fetch(`${url}/rest/v1/${path}`, {
      ...options,
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
        ...(options.headers || {})
      }
    });
    const body = await response.text();
    let data = null;
    try { data = body ? JSON.parse(body) : null; } catch (_) { data = body; }
    if (!response.ok) throw new Error(data && (data.message || data.hint || data.details) || `Supabase respondió HTTP ${response.status}`);
    return data;
  }
  function catalog(type) {
    const definition = catalogs[type];
    if (!definition) throw new Error('Catálogo no reconocido.');
    return definition;
  }
  function payload(definition, item) {
    const body = {};
    definition.columns.forEach(column => { body[column] = item[column]; });
    return JSON.stringify(body);
  }
  window.EduManagerSupabase = {
    configured,
    async select(type) {
      const definition = catalog(type);
      return await request(`${definition.table}?select=id,${definition.columns.join(',')}&order=created_at.asc`) || [];
    },
    async insert(type, item) {
      const definition = catalog(type);
      const rows = await request(definition.table, { method: 'POST', body: payload(definition, item) });
      if (!rows || !rows[0]) throw new Error('Supabase no devolvió el registro insertado.');
      return rows[0];
    },
    async lastPaymentNumber() {
      const rows = await request('Pagos?select=NumRegistro&order=NumRegistro.desc&limit=1');
      return rows && rows[0] ? String(rows[0].NumRegistro) : null;
    },
    async update(type, item) {
      const definition = catalog(type);
      const rows = await request(`${definition.table}?id=eq.${encodeURIComponent(item.id)}`, { method: 'PATCH', body: payload(definition, item) });
      if (!rows || !rows.length) throw new Error('No se encontró el registro que intentas editar.');
      return rows[0];
    }
  };
})();
