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
  materialPrices: {
    'Uniforme':20.00,
    'Tela':5.00,
    'Libro Matemática 1° grado':6.00,
    'Libro Sociales 9° grado':9.00
  },
  paymentRules: {
    moraPorMes: 3.00,
    valorMensualidad: 25.00,
    valorMatricula: 50.00
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
  $$('.section').forEach(x => x.classList.toggle('active-section', x.id === id));
  $$('.nav-item').forEach(x => x.classList.toggle('active', x.dataset.section === id));
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
  moraPorMes: CONFIG.paymentRules.moraPorMes,
  valorMensualidad: CONFIG.paymentRules.valorMensualidad,
  valorMatricula: CONFIG.paymentRules.valorMatricula
};

function renderPayments(){
  $('#paymentsTable').innerHTML = CONFIG.payments.map(p => `<tr><td><strong>${p.teacher}</strong></td><td>${p.grade}</td><td><button class="view-btn" data-action="view-payment" data-teacher="${p.teacher}" data-grade="${p.grade}">Ver</button></td></tr>`).join('');
}

function renderPaymentStudents(){
  $('#paymentStudentsTable').innerHTML = CONFIG.paymentStudents.map(s => `<tr><td>${s.nie}</td><td><strong>${s.name}</strong></td><td><button class="view-btn" data-action="make-payment" data-nie="${s.nie}" data-name="${s.name}">Pago</button></td></tr>`).join('');
}

function viewPayment(teacher, grade){
  $('#paymentStudentsTitle').textContent = `Estudiantes · ${grade}`;
  renderPaymentStudents();
  showSection('paymentStudents');
}

function calcularMoraYTotal(mesPagar, fechaStr){
  const fecha = new Date(fechaStr + 'T00:00:00');
  const mesFechaNum = fecha.getMonth() + 1;
  if(mesPagar === 'Matricula') return { mora: 0.00, total: REPORT_MONTH_VALUES.valorMatricula };
  const mesPagarNum = MONTH_ORDER.indexOf(mesPagar) + 1;
  const diffMeses = mesFechaNum - mesPagarNum;
  const mora = diffMeses > 0 ? diffMeses * REPORT_MONTH_VALUES.moraPorMes : 0.00;
  return { mora, total: REPORT_MONTH_VALUES.valorMensualidad + mora };
}

function calcularItemMes(mes, fechaStr){
  const { mora, total } = calcularMoraYTotal(mes, fechaStr);
  const valorMes = mes === 'Matricula' ? REPORT_MONTH_VALUES.valorMatricula : REPORT_MONTH_VALUES.valorMensualidad;
  return { mes, valorMes, mora, subtotal: total };
}

function renderPfMesesCart(){
  const tbody = $('#pfMesesCartTable');
  if(state.pfMesesCart.length === 0){
    tbody.innerHTML = '';
    $('#pfMesesCartHint').style.display = '';
    return;
  }
  $('#pfMesesCartHint').style.display = 'none';
  tbody.innerHTML = state.pfMesesCart.map((it,i) => `<tr><td>${it.mes === 'Matricula' ? 'Matrícula' : it.mes}</td><td>$${it.valorMes.toFixed(2)}</td><td>$${it.mora.toFixed(2)}</td><td>$${it.subtotal.toFixed(2)}</td><td><button type="button" class="view-btn" data-action="remove-payment-month" data-index="${i}">Quitar</button></td></tr>`).join('');
}

function updatePfTotals(){
  const mora = state.pfMesesCart.reduce((s,it)=>s+it.mora,0);
  const total = state.pfMesesCart.reduce((s,it)=>s+it.subtotal,0);
  $('#pfMora').value = `$${mora.toFixed(2)}`;
  $('#pfTotal').value = `$${total.toFixed(2)}`;
}

function agregarMes(){
  const mes = $('#pfMonth').value;
  const fecha = $('#pfDate').value;
  if(!mes){ $('#pfMonthError').textContent = 'Selecciona un mes.'; return; }
  if(!fecha){ $('#pfMonthError').textContent = 'Selecciona primero una fecha.'; return; }
  if(state.pfMesesCart.some(it=>it.mes===mes)){ $('#pfMonthError').textContent = 'Ese mes ya fue agregado.'; return; }
  $('#pfMonthError').textContent = '';
  state.pfMesesCart.push(calcularItemMes(mes,fecha));
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
  state.pfMesesCart = state.pfMesesCart.map(it=>calcularItemMes(it.mes,fecha));
  renderPfMesesCart(); updatePfTotals();
  $('#modalHint').textContent='Cálculo actualizado. Verifica los montos y presiona Pagar.';
  $('#pagarBtn').disabled=false;
}

function openPaymentModal(nie,name){
  $('#pfNie').value=nie; $('#pfStudent').value=name; $('#pfDate').value=todayISO();
  $('#pfMonth').value=''; $('#pfMonthError').textContent=''; $('#pfMora').value=''; $('#pfTotal').value='';
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
  const rows=items.length?items.map(it=>[it.mes==='Matricula'?'Matrícula':it.mes,`$${Number(it.valorMes).toFixed(2)}`,`$${Number(it.mora).toFixed(2)}`,`$${Number(it.subtotal).toFixed(2)}`]):[[registro.month||'-','-','-',`$${Number(registro.total).toFixed(2)}`]];
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

function pagar(e){
  e.preventDefault();
  if(state.pfMesesCart.length===0){ $('#pfMonthError').textContent='Agrega al menos un mes antes de pagar.'; return; }
  const comprobante=generarComprobante();
  const mesesTexto=state.pfMesesCart.map(it=>it.mes==='Matricula'?'Matrícula':it.mes).join(', ');
  const moraTotal=state.pfMesesCart.reduce((s,it)=>s+it.mora,0);
  const total=state.pfMesesCart.reduce((s,it)=>s+it.subtotal,0);
  const registro={comprobante,nie:$('#pfNie').value,student:$('#pfStudent').value,date:$('#pfDate').value,month:mesesTexto,items:state.pfMesesCart.map(it=>({...it})),moraTotal,total:total.toFixed(2)};
  state.comprobanteCounter++; state.pagosRealizados.push(registro);
  window.dispatchEvent(new CustomEvent('payments:updated'));
  closePaymentModal(); generarComprobantePDF(registro);
  alert(`Pago registrado con éxito.\nN° comprobante: ${comprobante}\nSe descargó el comprobante en PDF.`);
}

function initPayments(){
  renderPayments(); renderPaymentStudents(); renderPfMesesCart();
  $('#paymentsTable').addEventListener('click',e=>{
    const btn=e.target.closest('[data-action="view-payment"]'); if(btn) viewPayment(btn.dataset.teacher,btn.dataset.grade);
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
function agregarMaterial(){
  const select=$('#matMaterial'), material=select.value;
  if(!material){$('#matMaterialError').textContent='Selecciona un material.';return;}
  $('#matMaterialError').textContent=''; const price=CONFIG.materialPrices[material]; const existing=state.materialesCart.find(it=>it.material===material);
  if(existing)existing.qty+=1;else state.materialesCart.push({material,qty:1,price}); select.value=''; renderMaterialesCart();
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
  $('#matFecha').value=todayISO();renderMaterialesCart();
  $('#materialesCartTable').addEventListener('click',e=>{const btn=e.target.closest('[data-action="remove-material"]');if(btn)quitarMaterial(Number(btn.dataset.index));});
  $('#agregarMaterialBtn').addEventListener('click',agregarMaterial);$('#limpiarMaterialesBtn').addEventListener('click',limpiarMateriales);$('#procesarMaterialesBtn').addEventListener('click',procesarMateriales);
}

// ===== js/main.js =====

function init(){
  initUI();
  initStudents();
  initPayments();
  initReports();
  initCaja();
  initMateriales();
  renderActivity();
  showSection(location.hash.slice(1) || 'dashboard');
  document.title = `${CONFIG.app.name} V14`;
}

document.addEventListener('DOMContentLoaded', init);