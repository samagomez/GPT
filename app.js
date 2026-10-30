// ===== data/config.js =====
const CONFIG = {
  app: { name: 'EduManager', version: '14.0' },
  students: [
    {nie:'100001', name:'Ana Martínez', grade:'6° A', date:'15 Sep 2026', status:'Activo'},
    {nie:'100002', name:'Carlos Hernández', grade:'5° B', date:'14 Sep 2026', status:'Activo'},
    {nie:'100003', name:'Sofía López', grade:'6° B', date:'13 Sep 2026', status:'Activo'},
    {nie:'100004', name:'Diego Ramírez', grade:'4° A', date:'12 Sep 2026', status:'Pendiente'},
    {nie:'100005', name:'María González', grade:'5° A', date:'11 Sep 2026', status:'Activo'},
    {nie:'100006', name:'José Rivera', grade:'6° A', date:'10 Sep 2026', status:'Activo'}
  ],
  payments: [
    {teacher:'María López', grade:'6° A'},
    {teacher:'Carlos Hernández', grade:'5° B'},
    {teacher:'Sofía Martínez', grade:'6° B'},
    {teacher:'Diego Ramírez', grade:'4° A'},
    {teacher:'Ana González', grade:'5° A'}
  ],
  paymentStudents: [
    {nie:'100001', name:'Ana Martínez'},
    {nie:'100002', name:'Carlos Hernández'},
    {nie:'100003', name:'Sofía López'},
    {nie:'100004', name:'Diego Ramírez'},
    {nie:'100005', name:'María González'}
  ],
  activity: [
    {icon:'person-plus-fill', text:'Nuevo estudiante registrado', detail:'Ana Martínez', time:'Hace 10 min'},
    {icon:'cash-stack', text:'Pago recibido', detail:'Carlos Hernández · $150', time:'Hace 35 min'},
    {icon:'person-check-fill', text:'Estudiante actualizado', detail:'Sofía López', time:'Hace 1 hora'},
    {icon:'file-earmark-text-fill', text:'Reporte generado', detail:'Reporte mensual', time:'Hace 2 horas'}
  ],
  paymentRules: {
    moraPorMes: 3.00
  }
};

const MONTH_ORDER = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre'];
const REPORT_COLUMNS = ['Matricula', ...MONTH_ORDER];
const REPORT_COLUMN_LABELS = {
  Matricula:'Matrícula', Enero:'Ene', Febrero:'Feb', Marzo:'Mar', Abril:'Abr', Mayo:'May',
  Junio:'Jun', Julio:'Jul', Agosto:'Ago', Septiembre:'Sep', Octubre:'Oct', Noviembre:'Nov'
};
const ALL_MONTH_OPTIONS = [...MONTH_ORDER, 'Matricula'];
const DECIMAL_REGEX = /^\d+(\.\d{1,2})?$/;

// ===== js/state.js =====
const state = {
  pfMesesCart: [],
  materialesCart: [],
  comprobanteCounter: 5,
  pagosRealizados: [
    {comprobante:'COMP-000001', nie:'100001', student:'Ana Martínez', month:'Septiembre', date:'2026-09-10', items:[{mes:'Septiembre',valorMes:25,mora:0,subtotal:25}], moraTotal:0, total:'25.00'},
    {comprobante:'COMP-000002', nie:'100002', student:'Carlos Hernández', month:'Matrícula', date:'2026-09-05', items:[{mes:'Matricula',valorMes:50,mora:0,subtotal:50}], moraTotal:0, total:'50.00'},
    {comprobante:'COMP-000003', nie:'100004', student:'Diego Ramírez', month:'Junio', date:'2026-09-12', items:[{mes:'Junio',valorMes:25,mora:9,subtotal:34}], moraTotal:9, total:'34.00'},
    {comprobante:'COMP-000004', nie:'100006', student:'José Rivera', month:'Enero, Febrero, Marzo, Abril, Mayo', date:'2026-06-01', items:[
      {mes:'Enero',valorMes:25,mora:0,subtotal:25},{mes:'Febrero',valorMes:25,mora:0,subtotal:25},
      {mes:'Marzo',valorMes:25,mora:0,subtotal:25},{mes:'Abril',valorMes:25,mora:0,subtotal:25},
      {mes:'Mayo',valorMes:25,mora:0,subtotal:25}
    ], moraTotal:0, total:'125.00'}
  ]
};

// ===== js/dom.js =====
const $ = selector => document.querySelector(selector);
const $$ = selector => document.querySelectorAll(selector);

function todayISO(){
  return new Date().toISOString().slice(0,10);
}

// ===== js/ui.js =====

function renderStudents(rows, target){
  const element = $(target);
  if(!element) return;
  element.innerHTML = rows.map(s => `<tr><td><div class="student"><div class="mini-avatar">${s.name.split(' ').map(x=>x[0]).slice(0,2).join('')}</div><strong>${s.name}</strong></div></td><td>${s.grade}</td><td>${s.date}</td><td><span class="status ${s.status==='Activo'?'active':'pending'}">${s.status}</span></td></tr>`).join('');
}

function renderActivity(){
  $('#activityList').innerHTML = CONFIG.activity.map(a => `<div class="activity"><div class="activity-icon"><i class="bi bi-${a.icon}"></i></div><div><strong>${a.text}</strong><span>${a.detail}</span><small>${a.time}</small></div></div>`).join('');
}

function showSection(id){
  const validSection = document.getElementById(id);
  if(!validSection || !validSection.classList.contains('section')) id = 'dashboard';
  const catalogSections = ['catalog-materiales','catalog-mensualidades','catalog-estudiantes','catalog-docentes','catalog-grados','catalog-secciones'];
  const inCatalogs = catalogSections.includes(id);
  $$('.section').forEach(x => x.classList.toggle('active-section', x.id === id));
  $$('.nav-item').forEach(x => x.classList.toggle('active', x.dataset.section === id || (x.dataset.section === 'settings' && inCatalogs)));
  $$('.submenu-item').forEach(x => x.classList.toggle('active', x.dataset.section === id));
  const submenu = $('#settingsSubmenu');
  if(submenu) submenu.classList.toggle('expanded', id === 'settings' || inCatalogs);
  const chevron = $('#settingsNav .nav-chevron');
  if(chevron) chevron.style.transform = (id === 'settings' || inCatalogs) ? 'rotate(180deg)' : '';
  if(id === 'payments' && typeof loadPaymentTeachers === 'function') loadPaymentTeachers();
  if(id === 'materiales' && typeof loadMaterialesSelect === 'function') loadMaterialesSelect();
  if(['catalog-estudiantes','catalog-docentes','catalog-grados','catalog-secciones'].includes(id) && typeof refreshGradosSecciones === 'function') refreshGradosSecciones();
  if(['catalog-estudiantes','catalog-docentes'].includes(id) && typeof refreshPersonCatalogs === 'function') refreshPersonCatalogs();
  if(location.hash !== '#'+id) history.replaceState(null,'','#'+id);
  $('#sidebar').classList.remove('open');
}

function newStudent(){ alert('Formulario de nuevo estudiante próximamente.'); }

function initUI(){
  $$('.nav-item, [data-section]').forEach(el => el.addEventListener('click', e => {
    const id = el.dataset.section;
    if(id){ e.preventDefault(); showSection(id); }
  }));
  window.addEventListener('hashchange', () => showSection(location.hash.slice(1) || 'dashboard'));
  $('#searchInput').addEventListener('input', e => {
    const q = e.target.value.toLowerCase();
    const rows = CONFIG.students.filter(s => Object.values(s).some(v => String(v).toLowerCase().includes(q)));
    renderStudents(rows,'#studentTable');
    renderStudents(rows,'#studentTableFull');
  });
  $('#themeToggle').addEventListener('click', () => {
    document.body.classList.toggle('dark');
    $('#themeToggle i').className = document.body.classList.contains('dark') ? 'bi bi-sun-fill' : 'bi bi-moon-fill';
  });
  $('#mobileMenu').addEventListener('click', () => $('#sidebar').classList.toggle('open'));
  $('#backPayments').addEventListener('click', () => showSection('payments'));
  $('#backReports').addEventListener('click', () => showSection('reports'));
  $('#newStudent').addEventListener('click', newStudent);
  $('#newStudent2').addEventListener('click', newStudent);
}

// ===== js/students.js =====

function initStudents(){
  renderStudents(CONFIG.students,'#studentTable');
  renderStudents(CONFIG.students,'#studentTableFull');
}

// ===== js/payments.js =====

const REPORT_MONTH_VALUES = {
  moraPorMes: CONFIG.paymentRules.moraPorMes
};

const PAGE_SIZE = 10;
const pagerState = {};
function paginate(key, list){
  const total = list.length, pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const st = pagerState[key] || (pagerState[key] = {page:1});
  if(st.page > pages) st.page = pages;
  if(st.page < 1) st.page = 1;
  const start = (st.page - 1) * PAGE_SIZE;
  return { items: list.slice(start, start + PAGE_SIZE), page: st.page, pages, total, start };
}
function renderPager(key, containerId, info, rerender){
  const box = $('#' + containerId); if(!box) return;
  if(info.total <= PAGE_SIZE){ box.innerHTML = ''; return; }
  const end = Math.min(info.start + PAGE_SIZE, info.total);
  box.innerHTML = `<span class="pager-info">${info.start+1}–${end} de ${info.total}</span><div class="pager-btns"><button type="button" class="secondary-btn" data-pg="prev" ${info.page<=1?'disabled':''}><i class="bi bi-chevron-left"></i></button><span class="pager-page">Página ${info.page} de ${info.pages}</span><button type="button" class="secondary-btn" data-pg="next" ${info.page>=info.pages?'disabled':''}><i class="bi bi-chevron-right"></i></button></div>`;
  box.onclick = e => {
    const b = e.target.closest('[data-pg]'); if(!b || b.disabled) return;
    pagerState[key].page += b.dataset.pg === 'next' ? 1 : -1;
    rerender();
  };
}
function resetPager(key){ pagerState[key] = {page:1}; }

let paymentTeachers = [];
function normFilter(s){ return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim(); }

async function loadPaymentTeachers(){
  const tbody = $('#paymentsTable'); if(!tbody) return;
  try {
    let rows;
    if(window.EduManagerSupabase && window.EduManagerSupabase.configured){
      rows = (await window.EduManagerSupabase.select('docentes')).map(r => ({id:String(r.id), nombre:String(r.nombre), apellido:String(r.apellido), grado:String(r.grado), seccion:String(r.seccion)}));
    } else {
      let local = [];
      try { local = JSON.parse(localStorage.getItem('edumanager.catalogo.docentes.v1') || '[]'); } catch(_) {}
      rows = (Array.isArray(local) ? local : []).filter(i => i && typeof i.id === 'string').map(i => ({id:i.id, nombre:String(i.nombres||''), apellido:String(i.apellidos||''), grado:String(i.grado||''), seccion:String(i.seccion||'')}));
    }
    paymentTeachers = rows;
  } catch(err) {
    console.error(err); paymentTeachers = [];
  }
  renderPaymentFilters();
  renderPayments();
}

function renderPaymentFilters(){
  const list = $('#payFilterDocenteList'), select = $('#payFilterGrado'); if(!list || !select) return;
  const prev = select.value;
  const names = [...new Set(paymentTeachers.map(t => `${t.nombre} ${t.apellido}`.trim()))].sort((a,b)=>a.localeCompare(b,'es'));
  list.innerHTML = names.map(n => `<option value="${escapeCatalogText(n)}"></option>`).join('');
  const grados = [...new Set(paymentTeachers.map(t => t.grado))].filter(Boolean).sort((a,b)=>a.localeCompare(b,'es',{numeric:true}));
  select.innerHTML = '<option value="">Todos los grados</option>' + grados.map(g => `<option value="${escapeCatalogText(g)}">${escapeCatalogText(g)}</option>`).join('');
  if(grados.includes(prev)) select.value = prev;
}

function renderPayments(){
  const tbody = $('#paymentsTable'); if(!tbody) return;
  const q = normFilter($('#payFilterDocente') && $('#payFilterDocente').value);
  const g = $('#payFilterGrado') ? $('#payFilterGrado').value : '';
  const filtered = paymentTeachers.filter(t => (!q || normFilter(`${t.nombre} ${t.apellido}`).includes(q)) && (!g || t.grado === g));
  const info = paginate('teachers', filtered), rows = info.items;
  renderPager('teachers', 'paymentsPager', info, renderPayments);
  if(!rows.length){
    tbody.innerHTML = `<tr><td colspan="4" class="catalog-empty">${paymentTeachers.length ? 'No hay docentes que coincidan con los filtros.' : 'No hay docentes registrados en el catálogo.'}</td></tr>`;
    return;
  }
  tbody.innerHTML = rows.map(t => {
    const full = `${t.nombre} ${t.apellido}`.trim(), grade = `${t.grado} ${t.seccion}`.trim();
    return `<tr><td><strong>${escapeCatalogText(full)}</strong></td><td>${escapeCatalogText(t.grado)}</td><td>${escapeCatalogText(t.seccion)}</td><td><button class="view-btn" data-action="view-payment" data-teacher="${escapeCatalogText(full)}" data-grade="${escapeCatalogText(grade)}" data-grado="${escapeCatalogText(t.grado)}" data-seccion="${escapeCatalogText(t.seccion)}">Ver</button></td></tr>`;
  }).join('');
}

let paymentStudentsList = [];
function renderPaymentStudents(){
  const tbody = $('#paymentStudentsTable'); if(!tbody) return;
  const info = paginate('students', paymentStudentsList);
  renderPager('students', 'paymentStudentsPager', info, renderPaymentStudents);
  if(!paymentStudentsList.length){
    tbody.innerHTML = '<tr><td colspan="3" class="catalog-empty">No hay estudiantes registrados en este grado y sección.</td></tr>';
    return;
  }
  tbody.innerHTML = info.items.map(s => `<tr><td>${escapeCatalogText(s.code)}</td><td><strong>${escapeCatalogText(s.name)}</strong></td><td><button class="view-btn" data-action="make-payment" data-nie="${escapeCatalogText(s.code)}" data-name="${escapeCatalogText(s.name)}">Pago</button></td></tr>`).join('');
}

async function loadPaymentStudents(grado, seccion){
  const tbody = $('#paymentStudentsTable');
  if(tbody) tbody.innerHTML = '<tr><td colspan="3" class="catalog-empty">Cargando estudiantes...</td></tr>';
  let rows = [];
  try {
    if(window.EduManagerSupabase && window.EduManagerSupabase.configured){
      rows = (await window.EduManagerSupabase.select('estudiantes')).map(r => ({nombre:String(r.nombre), apellido:String(r.apellido), grado:String(r.grado), seccion:String(r.seccion)}));
    } else {
      let local = [];
      try { local = JSON.parse(localStorage.getItem('edumanager.catalogo.estudiantes.v1') || '[]'); } catch(_) {}
      rows = (Array.isArray(local) ? local : []).filter(i => i && typeof i.id === 'string').map(i => ({nombre:String(i.nombres||''), apellido:String(i.apellidos||''), grado:String(i.grado||''), seccion:String(i.seccion||'')}));
    }
  } catch(err) { console.error(err); rows = []; }
  paymentStudentsList = rows
    .map((r,index) => ({...r, code:`EST-${String(index+1).padStart(3,'0')}`, name:`${r.nombre} ${r.apellido}`.trim()}))
    .filter(r => r.grado === grado && r.seccion === seccion);
  renderPaymentStudents();
}

function viewPayment(teacher, grade, grado, seccion){
  $('#paymentStudentsTitle').textContent = `Estudiantes · ${grade}`;
  paymentStudentsList = []; resetPager('students');
  loadPaymentStudents(grado, seccion);
  showSection('paymentStudents');
}

function itemLabel(it){ return it.label || (it.mes === 'Matricula' ? 'Matrícula' : it.mes); }

// Identifica a qué mes (o matrícula) corresponde un concepto del catálogo de mensualidades.
function detectarMesCatalogo(concepto){
  const norm = String(concepto).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  if(/\bmatricula\b/.test(norm)) return 'Matricula';
  return MONTH_ORDER.find(m => new RegExp('\\b' + m.toLowerCase() + '\\b').test(norm)) || null;
}

// La mora solo aplica a conceptos reconocidos como mes; el monto base viene del catálogo.
function calcularMoraYTotal(mesPagar, fechaStr, valorBase){
  const fecha = new Date(fechaStr + 'T00:00:00');
  const mesFechaNum = fecha.getMonth() + 1;
  const mesPagarNum = MONTH_ORDER.indexOf(mesPagar) + 1;
  if(mesPagar === 'Matricula' || mesPagarNum === 0) return { mora: 0.00, total: valorBase };
  const diffMeses = mesFechaNum - mesPagarNum;
  const mora = diffMeses > 0 ? diffMeses * REPORT_MONTH_VALUES.moraPorMes : 0.00;
  return { mora, total: valorBase + mora };
}

function calcularItemMes(item, fechaStr){
  const { mora, total } = calcularMoraYTotal(item.mes, fechaStr, item.valorMes);
  return { id: item.id, mes: item.mes, label: item.label, valorMes: item.valorMes, mora, subtotal: total };
}

let mensualidadesDisponibles = [];
async function loadMensualidadesSelect(){
  const select = $('#pfMonth'), error = $('#pfMonthError'); if(!select) return;
  const previous = select.value;
  select.innerHTML = '<option value="" disabled selected>Cargando mensualidades...</option>';
  try {
    if(!window.EduManagerSupabase || !window.EduManagerSupabase.configured) throw new Error('Falta configurar Supabase.');
    const rows = await window.EduManagerSupabase.select('mensualidades');
    mensualidadesDisponibles = rows.map(r => ({id:String(r.id), concepto:String(r.concepto), monto:Number(r.monto)})).filter(r => Number.isFinite(r.monto));
    select.innerHTML = '';
    const placeholder = document.createElement('option'); placeholder.value=''; placeholder.disabled=true; placeholder.selected=true;
    placeholder.textContent = mensualidadesDisponibles.length ? 'Selecciona un mes' : 'No hay mensualidades en el catálogo';
    select.appendChild(placeholder);
    mensualidadesDisponibles.forEach(m => { const o = document.createElement('option'); o.value=m.id; o.dataset.price=m.monto.toFixed(2); o.textContent=`${m.concepto} — $${m.monto.toFixed(2)}`; select.appendChild(o); });
    if(previous && mensualidadesDisponibles.some(m => m.id === previous)) select.value = previous;
    if(error && error.textContent === 'No se pudieron cargar las mensualidades desde Supabase.') error.textContent = '';
  } catch(err) {
    console.error(err); mensualidadesDisponibles = [];
    select.innerHTML = '<option value="" disabled selected>No se pudo cargar el catálogo</option>';
    if(error) error.textContent = 'No se pudieron cargar las mensualidades desde Supabase.';
  }
}

function renderPfMesesCart(){
  const tbody = $('#pfMesesCartTable');
  if(state.pfMesesCart.length === 0){
    tbody.innerHTML = '';
    $('#pfMesesCartHint').style.display = '';
    return;
  }
  $('#pfMesesCartHint').style.display = 'none';
  tbody.innerHTML = state.pfMesesCart.map((it,i) => `<tr><td>${itemLabel(it)}</td><td>$${it.valorMes.toFixed(2)}</td><td>$${it.mora.toFixed(2)}</td><td>$${it.subtotal.toFixed(2)}</td><td><button type="button" class="view-btn" data-action="remove-payment-month" data-index="${i}">Quitar</button></td></tr>`).join('');
}

function updatePfTotals(){
  const mora = state.pfMesesCart.reduce((s,it)=>s+it.mora,0);
  const total = state.pfMesesCart.reduce((s,it)=>s+it.subtotal,0);
  $('#pfMora').value = `$${mora.toFixed(2)}`;
  $('#pfTotal').value = `$${total.toFixed(2)}`;
}

function agregarMes(){
  const id = $('#pfMonth').value;
  const fecha = $('#pfDate').value;
  if(!id){ $('#pfMonthError').textContent = 'Selecciona un mes.'; return; }
  if(!fecha){ $('#pfMonthError').textContent = 'Selecciona primero una fecha.'; return; }
  const concepto = mensualidadesDisponibles.find(m => m.id === id);
  if(!concepto){ $('#pfMonthError').textContent = 'El concepto seleccionado ya no está disponible.'; return; }
  const base = { id: concepto.id, mes: detectarMesCatalogo(concepto.concepto) || concepto.concepto, label: concepto.concepto, valorMes: concepto.monto };
  if(state.pfMesesCart.some(it => it.id === base.id || it.mes === base.mes)){ $('#pfMonthError').textContent = 'Ese mes ya fue agregado.'; return; }
  $('#pfMonthError').textContent = '';
  state.pfMesesCart.push(calcularItemMes(base, fecha));
  $('#pfMonth').value = '';
  renderPfMesesCart(); updatePfTotals();
  $('#pagarBtn').disabled = false;
  $('#modalHint').textContent = 'Verifica los montos y presiona Pagar, o agrega otro mes.';
}

function quitarMesPago(index){
  state.pfMesesCart.splice(index,1);
  renderPfMesesCart(); updatePfTotals();
  if(state.pfMesesCart.length===0){
    $('#pagarBtn').disabled = true;
    $('#modalHint').textContent = 'Agrega uno o más meses y presiona Calcular antes de pagar.';
  }
}

function calcularPago(){
  const fecha = $('#pfDate').value;
  if(!fecha){ $('#pfMonthError').textContent='Selecciona una fecha.'; return; }
  if(state.pfMesesCart.length===0){ $('#pfMonthError').textContent='Agrega al menos un mes antes de calcular.'; return; }
  $('#pfMonthError').textContent='';
  state.pfMesesCart = state.pfMesesCart.map(it=>calcularItemMes(it,fecha));
  renderPfMesesCart(); updatePfTotals();
  $('#modalHint').textContent='Cálculo actualizado. Verifica los montos y presiona Pagar.';
  $('#pagarBtn').disabled=false;
}

function openPaymentModal(nie,name){
  $('#pfNie').value=nie; $('#pfStudent').value=name; $('#pfDate').value=todayISO();
  $('#pfMonth').value=''; $('#pfMonthError').textContent=''; loadMensualidadesSelect(); $('#pfMora').value=''; $('#pfTotal').value='';
  state.pfMesesCart=[]; renderPfMesesCart(); $('#pagarBtn').disabled=true;
  $('#modalHint').textContent='Agrega uno o más meses y presiona Calcular antes de pagar.';
  $('#paymentModalOverlay').classList.add('open');
}

function closePaymentModal(){ $('#paymentModalOverlay').classList.remove('open'); }

function makePayment(nie,name){ openPaymentModal(nie,name); }

function generarComprobante(){ return 'COMP-' + String(state.comprobanteCounter).padStart(6,'0'); }

function generarComprobantePDF(registro){
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const primary = [79,70,229];
  doc.setFillColor(...primary); doc.rect(0,0,210,28,'F');
  doc.setTextColor(255,255,255); doc.setFont('helvetica','bold'); doc.setFontSize(18); doc.text('EduManager',14,14);
  doc.setFont('helvetica','normal'); doc.setFontSize(11); doc.text('Comprobante de pago',14,21); doc.setFontSize(10);
  doc.text(`N° ${registro.comprobante}`,196,14,{align:'right'}); doc.text(`Emitido: ${new Date().toLocaleDateString('es-SV')}`,196,21,{align:'right'});
  doc.setTextColor(23,32,51); doc.setFont('helvetica','bold'); doc.setFontSize(11); doc.text('Datos del estudiante',14,40);
  doc.setFont('helvetica','normal'); doc.setFontSize(10); doc.text(`NIE: ${registro.nie}`,14,47); doc.text(`Estudiante: ${registro.student}`,14,53); doc.text(`Fecha de pago: ${registro.date || '-'}`,14,59);
  const items=registro.items||[];
  const rows=items.length?items.map(it=>[itemLabel(it),`$${Number(it.valorMes).toFixed(2)}`,`$${Number(it.mora).toFixed(2)}`,`$${Number(it.subtotal).toFixed(2)}`]):[[registro.month||'-','-','-',`$${Number(registro.total).toFixed(2)}`]];
  doc.autoTable({startY:66,head:[['Mes','Valor','Mora','Subtotal']],body:rows,headStyles:{fillColor:primary},styles:{fontSize:10},theme:'grid'});
  const finalY=doc.lastAutoTable.finalY+10;
  const moraTotal=registro.moraTotal!==undefined?registro.moraTotal:items.reduce((s,it)=>s+Number(it.mora||0),0);
  doc.setFont('helvetica','normal'); doc.setFontSize(11); doc.text(`Mora total: $${Number(moraTotal).toFixed(2)}`,196,finalY,{align:'right'});
  doc.setFont('helvetica','bold'); doc.setFontSize(14); doc.text(`Total pagado: $${Number(registro.total).toFixed(2)}`,196,finalY+9,{align:'right'});
  doc.setFont('helvetica','normal'); doc.setFontSize(8.5); doc.setTextColor(138,146,161);
  doc.text('Este comprobante fue generado electrónicamente por EduManager y sirve como constancia de pago.',14,280);
  doc.text('Consérvelo para cualquier aclaración con la institución.',14,285);
  doc.save(`Comprobante_${registro.comprobante}.pdf`);
}

let guardandoPago = false;
async function sincronizarContadorComprobante(){
  const sb = window.EduManagerSupabase;
  if(!sb || !sb.configured) return;
  const last = await sb.lastPaymentNumber();
  const m = last && /^COMP-(\d+)$/.exec(last);
  if(m) state.comprobanteCounter = Math.max(state.comprobanteCounter, Number(m[1]) + 1);
}

async function pagar(e){
  e.preventDefault();
  if(guardandoPago) return;
  if(state.pfMesesCart.length===0){ $('#pfMonthError').textContent='Agrega al menos un mes antes de pagar.'; return; }
  const btn=$('#pagarBtn'); guardandoPago=true; if(btn) btn.disabled=true;
  try {
    const sb=window.EduManagerSupabase, usaSupabase=Boolean(sb && sb.configured);
    if(usaSupabase) await sincronizarContadorComprobante();
    const comprobante=generarComprobante();
    const mesesTexto=state.pfMesesCart.map(it=>itemLabel(it)).join(', ');
    const moraTotal=state.pfMesesCart.reduce((s,it)=>s+it.mora,0);
    const total=state.pfMesesCart.reduce((s,it)=>s+it.subtotal,0);
    const registro={comprobante,nie:$('#pfNie').value,student:$('#pfStudent').value,date:$('#pfDate').value,month:mesesTexto,items:state.pfMesesCart.map(it=>({...it})),moraTotal,total:total.toFixed(2)};
    if(usaSupabase){
      await sb.insert('pagos',{NumRegistro:comprobante,estudiante:registro.student,fechaPago:registro.date,detallePago:mesesTexto,MoraTotal:Number(moraTotal.toFixed(2)),PagoTotal:Number(total.toFixed(2))});
    }
    state.comprobanteCounter++; state.pagosRealizados.push(registro);
    window.dispatchEvent(new CustomEvent('payments:updated'));
    closePaymentModal(); generarComprobantePDF(registro);
    alert(`Pago registrado con éxito.\nN° comprobante: ${comprobante}\nSe descargó el comprobante en PDF.`);
  } catch(err) {
    console.error(err);
    alert('No se pudo guardar el pago en Supabase. Intenta de nuevo.\n' + (err && err.message ? err.message : ''));
    if(btn) btn.disabled=false;
  } finally {
    guardandoPago=false;
  }
}

function initPayments(){
  loadPaymentTeachers(); renderPfMesesCart(); loadMensualidadesSelect();
  $('#payFilterDocente').addEventListener('input', () => { resetPager('teachers'); renderPayments(); });
  $('#payFilterGrado').addEventListener('change', () => { resetPager('teachers'); renderPayments(); });
  $('#payFilterClear').addEventListener('click', () => { $('#payFilterDocente').value=''; $('#payFilterGrado').value=''; resetPager('teachers'); renderPayments(); });
  $('#paymentsTable').addEventListener('click',e=>{
    const btn=e.target.closest('[data-action="view-payment"]'); if(btn) viewPayment(btn.dataset.teacher,btn.dataset.grade,btn.dataset.grado,btn.dataset.seccion);
  });
  $('#paymentStudentsTable').addEventListener('click',e=>{
    const btn=e.target.closest('[data-action="make-payment"]'); if(btn) makePayment(btn.dataset.nie,btn.dataset.name);
  });
  $('#pfMesesCartTable').addEventListener('click',e=>{
    const btn=e.target.closest('[data-action="remove-payment-month"]'); if(btn) quitarMesPago(Number(btn.dataset.index));
  });
  $('#closePaymentModal').addEventListener('click',closePaymentModal);
  $('#paymentModalOverlay').addEventListener('click',e=>{if(e.target.id==='paymentModalOverlay')closePaymentModal();});
  $('#agregarMesBtn').addEventListener('click',agregarMes);
  $('#calcularBtn').addEventListener('click',calcularPago);
  $('#paymentForm').addEventListener('submit',pagar);
  $('#pfDate').addEventListener('change',()=>{
    if(state.pfMesesCart.length>0){ $('#pagarBtn').disabled=true; $('#modalHint').textContent='Cambiaste la fecha: presiona Calcular para actualizar mora y total.'; }
  });
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closePaymentModal();});
}

// ===== js/reports.js =====

function renderReports(){
  $('#reportsTable').innerHTML=CONFIG.payments.map(p=>`<tr><td><strong>${p.grade}</strong></td><td><button class="view-btn" data-action="view-report" data-grade="${p.grade}">Ver</button></td></tr>`).join('');
}

function viewReport(grade){
  $('#reportsGradeSubtitle').textContent=`Mensualidades por alumno · ${grade}`;
  const alumnos=CONFIG.students.filter(s=>s.grade===grade);
  $('#reportsGradeHead').innerHTML='<th>Alumno</th>'+REPORT_COLUMNS.map(c=>`<th>${REPORT_COLUMN_LABELS[c]}</th>`).join('');
  $('#reportsGradeTable').innerHTML=alumnos.length?alumnos.map(a=>{
    const pagosAlumno=state.pagosRealizados.filter(p=>p.nie===a.nie);
    const mesesPagados=new Set(pagosAlumno.flatMap(p=>(p.items||[]).map(it=>it.mes)));
    const celdas=REPORT_COLUMNS.map(c=>`<td class="${mesesPagados.has(c)?'paid':''}">${mesesPagados.has(c)?'x':''}</td>`).join('');
    return `<tr><td class="alumno-name">${a.name}</td>${celdas}</tr>`;
  }).join(''):`<tr><td colspan="${REPORT_COLUMNS.length+1}" style="text-align:center;color:#8a92a1">No hay alumnos registrados en este grado.</td></tr>`;
  showSection('reportsGrade');
}

function initReports(){
  renderReports();
  $('#reportsTable').addEventListener('click',e=>{
    const btn=e.target.closest('[data-action="view-report"]'); if(btn) viewReport(btn.dataset.grade);
  });
  window.addEventListener('payments:updated',()=>renderReports());
}

// ===== js/caja.js =====

function renderCajaNumeroOptions(){
  $('#cajaNumeroList').innerHTML=state.pagosRealizados.map(p=>`<option value="${p.comprobante}" label="${p.student} · ${p.month} · $${p.total}"></option>`).join('');
}
function sanitizeDecimalInput(input){
  let v=input.value.replace(/[^0-9.]/g,'');
  if(v.startsWith('.'))v='0'+v;
  const firstDot=v.indexOf('.');
  if(firstDot!==-1){v=v.slice(0,firstDot+1)+v.slice(firstDot+1).replace(/\./g,'');const [intPart,decPart]=v.split('.');v=intPart+'.'+decPart.slice(0,2);}
  input.value=v;
}
function validateCajaField(input,errorEl){
  const v=input.value.trim(); let error='';
  if(v==='')error='Este campo es obligatorio.';
  else if(!DECIMAL_REGEX.test(v))error='Solo números, máximo 2 decimales.';
  else if(parseFloat(v)<=0)error='Debe ser mayor a $0.00.';
  $(errorEl).textContent=error; input.closest('.form-group').classList.toggle('has-error',!!error); return error==='';
}
function validateCajaNumero(){
  const v=$('#cajaNumero').value.trim(); let error='';
  if(v==='')error='Selecciona o busca un N° de comprobante.';
  else if(!state.pagosRealizados.some(p=>p.comprobante===v))error='N° de comprobante no encontrado.';
  $('#cajaNumeroError').textContent=error; $('#cajaNumero').closest('.form-group').classList.toggle('has-error',!!error); return error==='';
}
function formatCajaField(input){const v=input.value.trim();if(DECIMAL_REGEX.test(v)&&parseFloat(v)>0)input.value=parseFloat(v).toFixed(2);}
function updateCambio(){
  const efectivo=$('#cajaEfectivo').value.trim(), monto=$('#cajaMonto').value.trim(), errorEl=$('#cajaCambioError');
  if(!DECIMAL_REGEX.test(efectivo)||!DECIMAL_REGEX.test(monto)){ $('#cajaCambio').value=''; errorEl.textContent=''; return true; }
  const cambio=parseFloat(efectivo)-parseFloat(monto); $('#cajaCambio').value=`$${cambio.toFixed(2)}`;
  if(cambio<0){errorEl.textContent='El efectivo recibido es menor al monto pagado.';return false;} errorEl.textContent='';return true;
}
function updateProcesarBtn(){
  const okNumero=validateCajaNumero(), okEfectivo=validateCajaField($('#cajaEfectivo'),'#cajaEfectivoError'), okMonto=validateCajaField($('#cajaMonto'),'#cajaMontoError'), okCambio=updateCambio();
  $('#procesarCajaBtn').disabled=!(okNumero&&okEfectivo&&okMonto&&okCambio);
}
function limpiarCaja(){
  ['#cajaNumero','#cajaEfectivo','#cajaMonto','#cajaCambio'].forEach(s=>$(s).value='');
  ['#cajaNumeroError','#cajaEfectivoError','#cajaMontoError','#cajaCambioError'].forEach(s=>$(s).textContent='');
  $$('#cajaForm .form-group').forEach(g=>g.classList.remove('has-error')); $('#procesarCajaBtn').disabled=true;
}
function procesarCaja(e){
  e.preventDefault();
  const okNumero=validateCajaNumero(), okEfectivo=validateCajaField($('#cajaEfectivo'),'#cajaEfectivoError'), okMonto=validateCajaField($('#cajaMonto'),'#cajaMontoError'), okCambio=updateCambio();
  if(!okNumero||!okEfectivo||!okMonto||!okCambio)return;
  const numero=$('#cajaNumero').value, efectivo=parseFloat($('#cajaEfectivo').value).toFixed(2), monto=parseFloat($('#cajaMonto').value).toFixed(2), cambio=(parseFloat(efectivo)-parseFloat(monto)).toFixed(2);
  alert(`Pago procesado en caja\nN° pago: ${numero}\nEfectivo recibido: $${efectivo}\nMonto pagado: $${monto}\nCambio: $${cambio}`); limpiarCaja();
}
function initCaja(){
  renderCajaNumeroOptions();
  window.addEventListener('payments:updated',renderCajaNumeroOptions);
  $('#cajaNumero').addEventListener('input',updateProcesarBtn); $('#cajaNumero').addEventListener('change',updateProcesarBtn);
  $('#cajaEfectivo').addEventListener('input',e=>{sanitizeDecimalInput(e.target);updateProcesarBtn();}); $('#cajaMonto').addEventListener('input',e=>{sanitizeDecimalInput(e.target);updateProcesarBtn();});
  $('#cajaEfectivo').addEventListener('blur',e=>{formatCajaField(e.target);updateProcesarBtn();}); $('#cajaMonto').addEventListener('blur',e=>{formatCajaField(e.target);updateProcesarBtn();});
  $('#limpiarCajaBtn').addEventListener('click',limpiarCaja); $('#cajaForm').addEventListener('submit',procesarCaja);
}

// ===== js/materiales.js =====

function renderMaterialesCart(){
  const tbody=$('#materialesCartTable');
  if(state.materialesCart.length===0){tbody.innerHTML='';$('#materialesCartHint').style.display='';}
  else {$('#materialesCartHint').style.display='none';tbody.innerHTML=state.materialesCart.map((it,i)=>`<tr><td>${it.material}</td><td>${it.qty}</td><td>$${it.price.toFixed(2)}</td><td>$${(it.price*it.qty).toFixed(2)}</td><td><button type="button" class="view-btn" data-action="remove-material" data-index="${i}">Quitar</button></td></tr>`).join('');}
  const total=state.materialesCart.reduce((sum,it)=>sum+it.price*it.qty,0); $('#materialesTotal').textContent=`$${total.toFixed(2)}`; $('#procesarMaterialesBtn').disabled=state.materialesCart.length===0;
}
let materialesDisponibles = [];
async function loadMaterialesSelect(){
  const select=$('#matMaterial'), error=$('#matMaterialError'); if(!select) return;
  const previous=select.value;
  select.innerHTML='<option value="" disabled selected>Cargando materiales...</option>';
  try {
    if(!window.EduManagerSupabase || !window.EduManagerSupabase.configured) throw new Error('Falta configurar Supabase.');
    const rows=await window.EduManagerSupabase.select('materiales');
    materialesDisponibles=rows.map(r=>({id:String(r.id),concepto:String(r.concepto),monto:Number(r.monto)})).filter(r=>Number.isFinite(r.monto));
    select.innerHTML='';
    const placeholder=document.createElement('option'); placeholder.value=''; placeholder.disabled=true; placeholder.selected=true;
    placeholder.textContent=materialesDisponibles.length?'Selecciona un material':'No hay materiales en el catálogo';
    select.appendChild(placeholder);
    materialesDisponibles.forEach(m=>{const o=document.createElement('option'); o.value=m.id; o.dataset.price=m.monto.toFixed(2); o.textContent=`${m.concepto} — $${m.monto.toFixed(2)}`; select.appendChild(o);});
    if(previous && materialesDisponibles.some(m=>m.id===previous)) select.value=previous;
    if(error) error.textContent='';
  } catch(err) {
    console.error(err); materialesDisponibles=[];
    select.innerHTML='<option value="" disabled selected>No se pudo cargar el catálogo</option>';
    if(error) error.textContent='No se pudieron cargar los materiales desde Supabase.';
  }
}
function agregarMaterial(){
  const select=$('#matMaterial'), id=select.value;
  if(!id){$('#matMaterialError').textContent='Selecciona un material.';return;}
  const item=materialesDisponibles.find(m=>m.id===id);
  if(!item){$('#matMaterialError').textContent='El material seleccionado ya no está disponible.';return;}
  $('#matMaterialError').textContent=''; const existing=state.materialesCart.find(it=>it.id===id);
  if(existing)existing.qty+=1;else state.materialesCart.push({id,material:item.concepto,qty:1,price:item.monto}); select.value=''; renderMaterialesCart();
}
function quitarMaterial(index){const item=state.materialesCart[index];if(!item)return;item.qty-=1;if(item.qty<=0)state.materialesCart.splice(index,1);renderMaterialesCart();}
function limpiarMateriales(){
  $('#matEstudiante').value='';$('#matFecha').value='';$('#matMaterial').value='';$('#matEstudianteError').textContent='';$('#matMaterialError').textContent='';$('#matEstudiante').closest('.form-group').classList.remove('has-error');state.materialesCart=[];renderMaterialesCart();
}
function procesarMateriales(){
  const estudiante=$('#matEstudiante').value.trim();let ok=true;
  if(estudiante===''){$('#matEstudianteError').textContent='Ingresa el nombre del estudiante.';$('#matEstudiante').closest('.form-group').classList.add('has-error');ok=false;}else{$('#matEstudianteError').textContent='';$('#matEstudiante').closest('.form-group').classList.remove('has-error');}
  if(state.materialesCart.length===0)ok=false;if(!ok)return;
  const fecha=$('#matFecha').value||todayISO(), total=state.materialesCart.reduce((sum,it)=>sum+it.price*it.qty,0), detalle=state.materialesCart.map(it=>`${it.material} x${it.qty} ($${(it.price*it.qty).toFixed(2)})`).join('\n');
  alert(`Compra de materiales procesada\nEstudiante: ${estudiante}\nFecha: ${fecha}\n\n${detalle}\n\nTotal: $${total.toFixed(2)}`);limpiarMateriales();
}
function initMateriales(){
  $('#matFecha').value=todayISO();renderMaterialesCart();loadMaterialesSelect();
  $('#materialesCartTable').addEventListener('click',e=>{const btn=e.target.closest('[data-action="remove-material"]');if(btn)quitarMaterial(Number(btn.dataset.index));});
  $('#agregarMaterialBtn').addEventListener('click',agregarMaterial);$('#limpiarMaterialesBtn').addEventListener('click',limpiarMateriales);$('#procesarMaterialesBtn').addEventListener('click',procesarMateriales);
}


// ===== Persistencia Supabase para catálogos =====
async function fetchCatalog(type) {
  if (!window.EduManagerSupabase || !window.EduManagerSupabase.configured) return type === 'materiales' ? loadMaterialesCatalog() : loadMensualidadesCatalog();
  const rows = await window.EduManagerSupabase.select(type);
  return rows.map(row => ({id: String(row.id), concepto: row.concepto, monto: Number(row.monto)}));
}
async function persistCatalogItem(type, editingId, concepto, monto) {
  const current = type === 'materiales' ? materialesCatalog : mensualidadesCatalog;
  const item = {id: editingId || ((window.crypto && crypto.randomUUID) ? crypto.randomUUID() : `${type}-${Date.now()}-${Math.random().toString(16).slice(2)}`), concepto, monto};
  if (window.EduManagerSupabase && window.EduManagerSupabase.configured) {
    if (editingId) await window.EduManagerSupabase.update(type, item);
    else { const inserted = await window.EduManagerSupabase.insert(type, item); item.id = String(inserted.id); }
    return await fetchCatalog(type);
  }
  const updated = editingId ? current.map(row => row.id === editingId ? item : row) : [...current, item];
  return updated;
}
function showCatalogSaveError(error) {
  console.error('Error guardando catálogo:', error);
  alert(`No se pudo guardar el registro en Supabase. Verifica la configuración, ejecuta supabase-schema.sql y revisa las políticas RLS.\n\nDetalle: ${error.message || error}`);
}

// ===== Catálogo de mensualidades =====
const MENSUALIDADES_STORAGE_KEY = 'edumanager.catalogo.mensualidades.v1';
let mensualidadesCatalog = loadMensualidadesCatalog();
let mensualidadEditingId = null;

function loadMensualidadesCatalog(){
  try { const saved = localStorage.getItem(MENSUALIDADES_STORAGE_KEY); const parsed = saved ? JSON.parse(saved) : []; return Array.isArray(parsed) ? parsed.filter(item => item && typeof item.id === 'string' && typeof item.concepto === 'string' && Number.isFinite(Number(item.monto))) : []; } catch(error) { return []; }
}
function saveMensualidadesCatalog(){ try { localStorage.setItem(MENSUALIDADES_STORAGE_KEY, JSON.stringify(mensualidadesCatalog)); } catch(error) { console.warn('No se pudo guardar la copia local.', error); } }
function escapeCatalogText(value){
  return String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
}
function renderMensualidadesCatalog(){
  const tbody = $('#mensualidadesCatalogTable');
  if(!tbody) return;
  if(mensualidadesCatalog.length === 0){
    tbody.innerHTML = '<tr><td colspan="4" class="catalog-empty">No hay mensualidades registradas en este catálogo.</td></tr>';
    return;
  }
  tbody.innerHTML = mensualidadesCatalog.map((item,index) => `<tr><td>MEN-${String(index+1).padStart(3,'0')}</td><td>${escapeCatalogText(item.concepto)}</td><td>$${Number(item.monto).toFixed(2)}</td><td><button type="button" class="view-btn" data-action="edit-mensualidad" data-id="${escapeCatalogText(item.id)}"><i class="bi bi-pencil-square"></i> Editar</button></td></tr>`).join('');
}
function resetMensualidadForm(){
  const form = $('#mensualidadForm');
  if(!form) return;
  form.reset(); mensualidadEditingId = null;
  $('#mensualidadFormTitle').textContent = 'Agregar mensualidad';
  $('#guardarMensualidadBtn').innerHTML = '<i class="bi bi-plus-lg"></i> Agregar';
  $('#mensualidadConceptoError').textContent = '';
  $('#mensualidadMontoError').textContent = '';
  $('#mensualidadConcepto').closest('.form-group').classList.remove('has-error');
  $('#mensualidadMonto').closest('.form-group').classList.remove('has-error');
}
function editMensualidad(id){
  const item = mensualidadesCatalog.find(row => row.id === id);
  if(!item) return;
  mensualidadEditingId = id;
  $('#mensualidadConcepto').value = item.concepto;
  $('#mensualidadMonto').value = Number(item.monto).toFixed(2);
  $('#mensualidadFormTitle').textContent = 'Editar mensualidad';
  $('#guardarMensualidadBtn').innerHTML = '<i class="bi bi-check-lg"></i> Guardar cambios';
  $('#mensualidadConceptoError').textContent = '';
  $('#mensualidadMontoError').textContent = '';
  $('#mensualidadConcepto').closest('.form-group').classList.remove('has-error');
  $('#mensualidadMonto').closest('.form-group').classList.remove('has-error');
  $('#mensualidadConcepto').focus();
}
function submitMensualidadForm(event){
  event.preventDefault();
  const conceptoInput = $('#mensualidadConcepto');
  const montoInput = $('#mensualidadMonto');
  const concepto = conceptoInput.value.trim();
  const montoText = montoInput.value.trim();
  const monto = Number(montoText);
  const conceptoError = concepto ? '' : 'Ingresa el concepto.';
  const montoError = montoText && Number.isFinite(monto) && monto > 0 ? '' : 'Ingresa un monto mayor que cero.';
  $('#mensualidadConceptoError').textContent = conceptoError;
  $('#mensualidadMontoError').textContent = montoError;
  conceptoInput.closest('.form-group').classList.toggle('has-error', Boolean(conceptoError));
  montoInput.closest('.form-group').classList.toggle('has-error', Boolean(montoError));
  if(conceptoError || montoError){ (conceptoError ? conceptoInput : montoInput).focus(); return; }
  const duplicate = mensualidadesCatalog.some(item => item.concepto.toLocaleLowerCase() === concepto.toLocaleLowerCase() && item.id !== mensualidadEditingId);
  if(duplicate){ $('#mensualidadConceptoError').textContent = 'Ya existe una mensualidad con ese concepto.'; conceptoInput.closest('.form-group').classList.add('has-error'); conceptoInput.focus(); return; }
  persistCatalogItem('mensualidades', mensualidadEditingId, concepto, Number(monto.toFixed(2))).then(items => { mensualidadesCatalog = items; saveMensualidadesCatalog(); renderMensualidadesCatalog(); resetMensualidadForm(); }).catch(error => showCatalogSaveError(error));
}
async function initCatalogoMensualidades(){
  if(!$('#mensualidadForm')) return;
  try { mensualidadesCatalog = await fetchCatalog('mensualidades'); saveMensualidadesCatalog(); } catch(error) { console.error(error); }
  renderMensualidadesCatalog();
  $('#mensualidadForm').addEventListener('submit', submitMensualidadForm);
  $('#limpiarMensualidadBtn').addEventListener('click', resetMensualidadForm);
  $('#mensualidadesCatalogTable').addEventListener('click', event => {
    const button = event.target.closest('[data-action="edit-mensualidad"]');
    if(button) editMensualidad(button.dataset.id);
  });
}

// ===== Catálogo de materiales =====
const MATERIALES_CATALOG_STORAGE_KEY = 'edumanager.catalogo.materiales.v1';
let materialesCatalog = loadMaterialesCatalog();
let materialCatalogEditingId = null;

function loadMaterialesCatalog(){ try { const saved = localStorage.getItem(MATERIALES_CATALOG_STORAGE_KEY); const parsed = saved ? JSON.parse(saved) : []; return Array.isArray(parsed) ? parsed.filter(item => item && typeof item.id === 'string' && typeof item.concepto === 'string' && Number.isFinite(Number(item.monto))) : []; } catch(error) { return []; } }
function saveMaterialesCatalog(){
  try { localStorage.setItem(MATERIALES_CATALOG_STORAGE_KEY, JSON.stringify(materialesCatalog)); }
  catch(error) { alert('No se pudieron guardar los cambios en este navegador.'); }
}
function renderMaterialesCatalog(){
  const tbody = $('#materialesCatalogTable');
  if(!tbody) return;
  if(materialesCatalog.length === 0){
    tbody.innerHTML = '<tr><td colspan="4" class="catalog-empty">No hay materiales registrados en este catálogo.</td></tr>';
    return;
  }
  tbody.innerHTML = materialesCatalog.map((item,index) => `<tr><td>MAT-${String(index+1).padStart(3,'0')}</td><td>${escapeCatalogText(item.concepto)}</td><td>$${Number(item.monto).toFixed(2)}</td><td><button type="button" class="view-btn" data-action="edit-material-catalog" data-id="${escapeCatalogText(item.id)}"><i class="bi bi-pencil-square"></i> Editar</button></td></tr>`).join('');
}
function resetMaterialCatalogForm(){
  const form = $('#materialCatalogForm');
  if(!form) return;
  form.reset(); materialCatalogEditingId = null;
  $('#materialCatalogFormTitle').textContent = 'Agregar material';
  $('#guardarMaterialCatalogBtn').innerHTML = '<i class="bi bi-plus-lg"></i> Agregar';
  $('#materialCatalogConceptoError').textContent = '';
  $('#materialCatalogMontoError').textContent = '';
  $('#materialCatalogConcepto').closest('.form-group').classList.remove('has-error');
  $('#materialCatalogMonto').closest('.form-group').classList.remove('has-error');
}
function editMaterialCatalog(id){
  const item = materialesCatalog.find(row => row.id === id);
  if(!item) return;
  materialCatalogEditingId = id;
  $('#materialCatalogConcepto').value = item.concepto;
  $('#materialCatalogMonto').value = Number(item.monto).toFixed(2);
  $('#materialCatalogFormTitle').textContent = 'Editar material';
  $('#guardarMaterialCatalogBtn').innerHTML = '<i class="bi bi-check-lg"></i> Guardar cambios';
  $('#materialCatalogConceptoError').textContent = '';
  $('#materialCatalogMontoError').textContent = '';
  $('#materialCatalogConcepto').closest('.form-group').classList.remove('has-error');
  $('#materialCatalogMonto').closest('.form-group').classList.remove('has-error');
  $('#materialCatalogConcepto').focus();
}
function submitMaterialCatalogForm(event){
  event.preventDefault();
  const conceptoInput = $('#materialCatalogConcepto');
  const montoInput = $('#materialCatalogMonto');
  const concepto = conceptoInput.value.trim();
  const montoText = montoInput.value.trim();
  const monto = Number(montoText);
  const conceptoError = concepto ? '' : 'Ingresa el concepto.';
  const montoError = montoText && Number.isFinite(monto) && monto > 0 ? '' : 'Ingresa un monto mayor que cero.';
  $('#materialCatalogConceptoError').textContent = conceptoError;
  $('#materialCatalogMontoError').textContent = montoError;
  conceptoInput.closest('.form-group').classList.toggle('has-error', Boolean(conceptoError));
  montoInput.closest('.form-group').classList.toggle('has-error', Boolean(montoError));
  if(conceptoError || montoError){ (conceptoError ? conceptoInput : montoInput).focus(); return; }
  const duplicate = materialesCatalog.some(item => item.concepto.toLocaleLowerCase() === concepto.toLocaleLowerCase() && item.id !== materialCatalogEditingId);
  if(duplicate){ $('#materialCatalogConceptoError').textContent = 'Ya existe un material con ese concepto.'; conceptoInput.closest('.form-group').classList.add('has-error'); conceptoInput.focus(); return; }
  persistCatalogItem('materiales', materialCatalogEditingId, concepto, Number(monto.toFixed(2))).then(items => { materialesCatalog = items; saveMaterialesCatalog(); renderMaterialesCatalog(); resetMaterialCatalogForm(); }).catch(error => showCatalogSaveError(error));
}
async function initCatalogoMateriales(){
  if(!$('#materialCatalogForm')) return;
  try { materialesCatalog = await fetchCatalog('materiales'); saveMaterialesCatalog(); } catch(error) { console.error(error); }
  renderMaterialesCatalog();
  $('#materialCatalogForm').addEventListener('submit', submitMaterialCatalogForm);
  $('#limpiarMaterialCatalogBtn').addEventListener('click', resetMaterialCatalogForm);
  $('#materialesCatalogTable').addEventListener('click', event => {
    const button = event.target.closest('[data-action="edit-material-catalog"]');
    if(button) editMaterialCatalog(button.dataset.id);
  });
}

// ===== js/main.js =====

// ===== Catálogos de grados y secciones (Supabase) =====
const GRADOS_STORAGE_KEY = 'edumanager.catalogo.grados.v1';
const SECCIONES_STORAGE_KEY = 'edumanager.catalogo.secciones.v1';
function loadSimpleLocal(storageKey){
  try { const parsed = JSON.parse(localStorage.getItem(storageKey) || '[]'); return Array.isArray(parsed) ? parsed.filter(i => i && typeof i.id === 'string' && typeof i.nombre === 'string') : []; } catch(error) { return []; }
}
function saveSimpleLocal(storageKey, list){ try { localStorage.setItem(storageKey, JSON.stringify(list)); } catch(error) { console.warn('No se pudo guardar la copia local.', error); } }
let gradosCatalog = loadSimpleLocal(GRADOS_STORAGE_KEY);
let seccionesCatalog = loadSimpleLocal(SECCIONES_STORAGE_KEY);
const simpleCatalogs = {};

async function fetchSimpleCatalog(type, storageKey){
  if(!window.EduManagerSupabase || !window.EduManagerSupabase.configured) return loadSimpleLocal(storageKey);
  const rows = await window.EduManagerSupabase.select(type);
  return rows.map(row => ({id: String(row.id), nombre: String(row.nombre)}));
}

function setSelectValue(select, value){
  if(value && ![...select.options].some(option => option.value === value)){
    const option = document.createElement('option'); option.value = value; option.textContent = value; select.appendChild(option);
  }
  select.value = value;
}

function fillGradoSeccionSelects(failed){
  const sets = [['Grado', gradosCatalog, 'Selecciona un grado', 'No hay grados en el catálogo'], ['Seccion', seccionesCatalog, 'Selecciona una sección', 'No hay secciones en el catálogo']];
  sets.forEach(([suffix, list, label, emptyLabel]) => {
    ['estudiante','docente'].forEach(key => {
      const select = $('#' + key + suffix); if(!select) return;
      const previous = select.value;
      select.innerHTML = '';
      const placeholder = document.createElement('option'); placeholder.value = ''; placeholder.disabled = true; placeholder.selected = true;
      placeholder.textContent = failed ? 'No se pudo cargar el catálogo' : (list.length ? label : emptyLabel);
      select.appendChild(placeholder);
      list.forEach(item => { const option = document.createElement('option'); option.value = item.nombre; option.textContent = item.nombre; select.appendChild(option); });
      if(previous && list.some(item => item.nombre === previous)) select.value = previous;
      const errorEl = $('#' + key + suffix + 'Error');
      if(errorEl && failed) errorEl.textContent = 'No se pudo cargar el catálogo desde Supabase.';
    });
  });
}

async function refreshGradosSecciones(){
  let failed = false;
  try {
    gradosCatalog = await fetchSimpleCatalog('grados', GRADOS_STORAGE_KEY);
    seccionesCatalog = await fetchSimpleCatalog('secciones', SECCIONES_STORAGE_KEY);
    saveSimpleLocal(GRADOS_STORAGE_KEY, gradosCatalog);
    saveSimpleLocal(SECCIONES_STORAGE_KEY, seccionesCatalog);
  } catch(error) { console.error(error); failed = true; }
  fillGradoSeccionSelects(failed);
  Object.values(simpleCatalogs).forEach(catalog => catalog.render());
}

function createSimpleCatalog(cfg){
  const { key, plural, singular, type, codePrefix, storageKey, get, set } = cfg;
  const Key = key.charAt(0).toUpperCase() + key.slice(1);
  const el = suffix => $('#' + key + suffix);
  let editingId = null;

  function render(){
    const tbody = $('#' + plural + 'CatalogTable'); if(!tbody) return;
    const list = get();
    if(list.length === 0){ tbody.innerHTML = `<tr><td colspan="3" class="catalog-empty">No hay ${plural} registrados en este catálogo.</td></tr>`; return; }
    tbody.innerHTML = list.map((item,index) => `<tr><td>${codePrefix}-${String(index+1).padStart(3,'0')}</td><td>${escapeCatalogText(item.nombre)}</td><td><button type="button" class="view-btn" data-action="edit-${key}" data-id="${escapeCatalogText(item.id)}"><i class="bi bi-pencil-square"></i> Editar</button></td></tr>`).join('');
  }
  function clearError(){ el('NombreError').textContent = ''; el('Nombre').closest('.form-group').classList.remove('has-error'); }
  function reset(){
    el('Form').reset(); editingId = null;
    el('FormTitle').textContent = 'Agregar ' + singular;
    $('#guardar' + Key + 'Btn').innerHTML = '<i class="bi bi-plus-lg"></i> Agregar';
    clearError();
  }
  function edit(id){
    const item = get().find(row => row.id === id); if(!item) return;
    editingId = id; el('Nombre').value = item.nombre;
    el('FormTitle').textContent = 'Editar ' + singular;
    $('#guardar' + Key + 'Btn').innerHTML = '<i class="bi bi-check-lg"></i> Guardar cambios';
    clearError(); el('Nombre').focus();
  }
  async function persist(nombre){
    const supabase = window.EduManagerSupabase;
    if(supabase && supabase.configured){
      if(editingId) await supabase.update(type, {id: editingId, nombre}); else await supabase.insert(type, {nombre});
      return await fetchSimpleCatalog(type, storageKey);
    }
    const current = get();
    if(editingId) return current.map(row => row.id === editingId ? {...row, nombre} : row);
    const id = (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : `${key}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    return [...current, {id, nombre}];
  }
  function submit(event){
    event.preventDefault();
    const input = el('Nombre');
    const nombre = input.value.trim().replace(/\s+/g,' ');
    let error = nombre ? '' : 'Ingresa el nombre.';
    if(!error && get().some(item => item.id !== editingId && item.nombre.toLocaleLowerCase() === nombre.toLocaleLowerCase())) error = `Ya existe un ${singular} con ese nombre.`;
    el('NombreError').textContent = error;
    input.closest('.form-group').classList.toggle('has-error', Boolean(error));
    if(error){ input.focus(); return; }
    persist(nombre).then(list => { set(list); saveSimpleLocal(storageKey, list); reset(); return refreshGradosSecciones(); }).catch(showCatalogSaveError);
  }
  simpleCatalogs[type] = { render };
  return function init(){
    if(!el('Form')) return;
    render();
    el('Form').addEventListener('submit', submit);
    $('#limpiar' + Key + 'Btn').addEventListener('click', reset);
    $('#' + plural + 'CatalogTable').addEventListener('click', event => {
      const button = event.target.closest(`[data-action="edit-${key}"]`);
      if(button) edit(button.dataset.id);
    });
  };
}

const initCatalogoGrados = createSimpleCatalog({ key:'grado', plural:'grados', singular:'grado', type:'grados', codePrefix:'GRA', storageKey:GRADOS_STORAGE_KEY, get:() => gradosCatalog, set:list => { gradosCatalog = list; } });
const initCatalogoSecciones = createSimpleCatalog({ key:'seccion', plural:'secciones', singular:'sección', type:'secciones', codePrefix:'SEC', storageKey:SECCIONES_STORAGE_KEY, get:() => seccionesCatalog, set:list => { seccionesCatalog = list; } });

// ===== Catálogos de estudiantes y docentes (Supabase) =====
const personCatalogs = {};
async function refreshPersonCatalogs(){
  await Promise.all(Object.values(personCatalogs).map(catalog => catalog.refresh()));
}

function createPersonCatalog(cfg){
  const { key, plural, type, codePrefix, storageKey, singular } = cfg;
  const Key = key.charAt(0).toUpperCase() + key.slice(1);
  const el = suffix => $('#' + key + suffix);
  const fields = ['Nombres','Apellidos','Grado','Seccion'];
  let items = loadLocal();
  let editingId = null;

  function loadLocal(){
    try {
      const parsed = JSON.parse(localStorage.getItem(storageKey) || '[]');
      return Array.isArray(parsed) ? parsed.filter(i => i && typeof i.id === 'string' && ['nombres','apellidos','grado','seccion'].every(k => typeof i[k] === 'string')) : [];
    } catch(error) { return []; }
  }
  function saveLocal(){
    try { localStorage.setItem(storageKey, JSON.stringify(items)); }
    catch(error) { console.warn('No se pudo guardar la copia local.', error); }
  }
  async function fetchItems(){
    const supabase = window.EduManagerSupabase;
    if(!supabase || !supabase.configured) return loadLocal();
    const rows = await supabase.select(type);
    return rows.map(row => ({id: String(row.id), nombres: String(row.nombre), apellidos: String(row.apellido), grado: String(row.grado), seccion: String(row.seccion)}));
  }
  async function refresh(){
    try { items = await fetchItems(); saveLocal(); } catch(error) { console.error(error); }
    render();
  }
  async function persist(data){
    const supabase = window.EduManagerSupabase;
    if(supabase && supabase.configured){
      const body = {nombre: data.nombres, apellido: data.apellidos, grado: data.grado, seccion: data.seccion};
      if(editingId) await supabase.update(type, {id: editingId, ...body}); else await supabase.insert(type, body);
      return await fetchItems();
    }
    if(editingId) return items.map(i => i.id === editingId ? {...i, ...data} : i);
    const id = (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : `${key}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    return [...items, {id, ...data}];
  }
  function clearErrors(){
    fields.forEach(f => { el(f + 'Error').textContent = ''; el(f).closest('.form-group').classList.remove('has-error'); });
  }
  function render(){
    const tbody = $('#' + plural + 'CatalogTable');
    if(!tbody) return;
    if(items.length === 0){
      tbody.innerHTML = `<tr><td colspan="6" class="catalog-empty">No hay ${plural} registrados en este catálogo.</td></tr>`;
      return;
    }
    tbody.innerHTML = items.map((item,index) => `<tr><td>${codePrefix}-${String(index+1).padStart(3,'0')}</td><td>${escapeCatalogText(item.nombres)}</td><td>${escapeCatalogText(item.apellidos)}</td><td>${escapeCatalogText(item.grado)}</td><td>${escapeCatalogText(item.seccion)}</td><td><button type="button" class="view-btn" data-action="edit-${key}" data-id="${escapeCatalogText(item.id)}"><i class="bi bi-pencil-square"></i> Editar</button></td></tr>`).join('');
  }
  function reset(){
    el('Form').reset(); editingId = null;
    el('FormTitle').textContent = 'Agregar ' + singular;
    $('#guardar' + Key + 'Btn').innerHTML = '<i class="bi bi-plus-lg"></i> Agregar';
    clearErrors();
  }
  function edit(id){
    const item = items.find(row => row.id === id);
    if(!item) return;
    editingId = id;
    el('Nombres').value = item.nombres;
    el('Apellidos').value = item.apellidos;
    setSelectValue(el('Grado'), item.grado);
    setSelectValue(el('Seccion'), item.seccion);
    el('FormTitle').textContent = 'Editar ' + singular;
    $('#guardar' + Key + 'Btn').innerHTML = '<i class="bi bi-check-lg"></i> Guardar cambios';
    clearErrors();
    el('Nombres').focus();
  }
  function submit(event){
    event.preventDefault();
    const data = {
      nombres: el('Nombres').value.trim().replace(/\s+/g,' '),
      apellidos: el('Apellidos').value.trim().replace(/\s+/g,' '),
      grado: el('Grado').value,
      seccion: el('Seccion').value
    };
    const errors = {
      Nombres: data.nombres ? '' : 'Ingresa los nombres.',
      Apellidos: data.apellidos ? '' : 'Ingresa los apellidos.',
      Grado: data.grado ? '' : 'Selecciona el grado.',
      Seccion: data.seccion ? '' : 'Selecciona la sección.'
    };
    fields.forEach(f => {
      el(f + 'Error').textContent = errors[f];
      el(f).closest('.form-group').classList.toggle('has-error', Boolean(errors[f]));
    });
    const firstError = fields.find(f => errors[f]);
    if(firstError){ el(firstError).focus(); return; }
    const norm = s => s.toLocaleLowerCase();
    const duplicate = items.some(i => i.id !== editingId && norm(i.nombres) === norm(data.nombres) && norm(i.apellidos) === norm(data.apellidos) && i.grado === data.grado && i.seccion === data.seccion);
    if(duplicate){
      el('NombresError').textContent = 'Ya existe un registro con esos datos.';
      el('Nombres').closest('.form-group').classList.add('has-error');
      el('Nombres').focus();
      return;
    }
    persist(data).then(list => { items = list; saveLocal(); render(); reset(); }).catch(showCatalogSaveError);
  }
  personCatalogs[type] = { refresh };
  return async function init(){
    if(!el('Form')) return;
    render();
    el('Form').addEventListener('submit', submit);
    $('#limpiar' + Key + 'Btn').addEventListener('click', reset);
    $('#' + plural + 'CatalogTable').addEventListener('click', event => {
      const button = event.target.closest(`[data-action="edit-${key}"]`);
      if(button) edit(button.dataset.id);
    });
    await refresh();
  };
}

const initCatalogoEstudiantes = createPersonCatalog({ key:'estudiante', plural:'estudiantes', singular:'estudiante', type:'estudiantes', codePrefix:'EST', storageKey:'edumanager.catalogo.estudiantes.v1' });
const initCatalogoDocentes = createPersonCatalog({ key:'docente', plural:'docentes', singular:'docente', type:'docentes', codePrefix:'DOC', storageKey:'edumanager.catalogo.docentes.v1' });

// ===== Estadísticas del dashboard desde Supabase =====
async function refreshDashboardStats(){
  const studentsEl = $('#dashboardStudentCount');
  const incomeEl = $('#dashboardIncomeTotal');
  if(!studentsEl || !incomeEl) return;
  if(!window.EduManagerSupabase || !window.EduManagerSupabase.configured){
    studentsEl.textContent = '—';
    incomeEl.textContent = '—';
    return;
  }
  try{
    const [students, payments] = await Promise.all([
      window.EduManagerSupabase.select('estudiantes'),
      window.EduManagerSupabase.select('pagos')
    ]);
    studentsEl.textContent = students.length.toLocaleString('en-US');
    const total = payments.reduce((sum, payment) => sum + (Number(payment.PagoTotal ?? payment.pagoTotal ?? 0) || 0), 0);
    incomeEl.textContent = total.toLocaleString('en-US', {style:'currency', currency:'USD'});
  }catch(error){
    console.error('No se pudieron cargar las estadísticas del dashboard desde Supabase:', error);
    studentsEl.textContent = '—';
    incomeEl.textContent = '—';
  }
}

function init(){
  initUI();
  initStudents();
  initPayments();
  initReports();
  initCaja();
  initMateriales();
  initCatalogoMensualidades();
  initCatalogoMateriales();
  initCatalogoEstudiantes();
  initCatalogoDocentes();
  initCatalogoGrados();
  initCatalogoSecciones();
  refreshGradosSecciones();
  renderActivity();
  refreshDashboardStats();
  showSection(location.hash.slice(1) || 'dashboard');
  document.title = `${CONFIG.app.name} V19.4`;
}

document.addEventListener('DOMContentLoaded', init);