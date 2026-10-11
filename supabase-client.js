/* Cliente REST ligero para Supabase; no requiere build ni npm. */
(function () {
  const config = window.EDUMANAGER_SUPABASE_CONFIG || {};
  const url = String(config.url || '').replace(/\/$/, '');
  const key = String(config.anonKey || '');
  const configured = /^https:\/\/.+\.supabase\.co$/.test(url) && key.length > 10;
  const tables = { materiales: 'catalogo_materiales', mensualidades: 'catalogo_mensualidades' };

  async function request(path, options = {}) {
    if (!configured) throw new Error('Falta configurar la URL y la clave pública de Supabase.');
    const response = await fetch(`${url}/rest/v1/${path}`, {
      ...options,
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        Prefer: options.method === 'POST' ? 'return=representation' : 'return=representation',
        ...(options.headers || {})
      }
    });
    const body = await response.text();
    let data = null;
    try { data = body ? JSON.parse(body) : null; } catch (_) { data = body; }
    if (!response.ok) throw new Error(data && (data.message || data.hint || data.details) || `Supabase respondió HTTP ${response.status}`);
    return data;
  }
  function table(type) {
    const name = tables[type];
    if (!name) throw new Error('Catálogo no reconocido.');
    return name;
  }
  window.EduManagerSupabase = {
    configured,
    async select(type) { return await request(`${table(type)}?select=id,concepto,monto&order=created_at.asc`) || []; },
    async insert(type, item) {
      const rows = await request(table(type), { method: 'POST', body: JSON.stringify({ concepto: item.concepto, monto: item.monto }) });
      if (!rows || !rows[0]) throw new Error('Supabase no devolvió el registro insertado.');
      return rows[0];
    },
    async update(type, item) {
      const rows = await request(`${table(type)}?id=eq.${encodeURIComponent(item.id)}`, { method: 'PATCH', body: JSON.stringify({ concepto: item.concepto, monto: item.monto }) });
      if (!rows || !rows.length) throw new Error('No se encontró el registro que intentas editar.');
      return rows[0];
    }
  };
})();
