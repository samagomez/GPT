import { CONFIG, MONTH_ORDER } from '../data/config.js';
import { state } from './state.js';
import { $, $$, todayISO } from './dom.js';
import { showSection } from './ui.js';

const REPORT_MONTH_VALUES = {
  moraPorMes: CONFIG.paymentRules.moraPorMes
};

export function renderPayments(){
  $('#paymentsTable').innerHTML = CONFIG.payments.map(p => `<tr><td><strong>${p.teacher}</strong></td><td>${p.grade}</td><td><button class="view-btn" data-action="view-payment" data-teacher="${p.teacher}" data-grade="${p.grade}">Ver</button></td></tr>`).join('');
}

export function renderPaymentStudents(){
  $('#paymentStudentsTable').innerHTML = CONFIG.paymentStudents.map(s => `<tr><td>${s.nie}</td><td><strong>${s.name}</strong></td><td><button class="view-btn" data-action="make-payment" data-nie="${s.nie}" data-name="${s.name}">Pago</button></td></tr>`).join('');
}

export function viewPayment(teacher, grade){
  $('#paymentStudentsTitle').textContent = `Estudiantes · ${grade}`;
  renderPaymentStudents();
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

export function openPaymentModal(nie,name){
  $('#pfNie').value=nie; $('#pfStudent').value=name; $('#pfDate').value=todayISO();
  $('#pfMonth').value=''; $('#pfMonthError').textContent=''; loadMensualidadesSelect(); $('#pfMora').value=''; $('#pfTotal').value='';
  state.pfMesesCart=[]; renderPfMesesCart(); $('#pagarBtn').disabled=true;
  $('#modalHint').textContent='Agrega uno o más meses y presiona Calcular antes de pagar.';
  $('#paymentModalOverlay').classList.add('open');
}

export function closePaymentModal(){ $('#paymentModalOverlay').classList.remove('open'); }

export function makePayment(nie,name){ openPaymentModal(nie,name); }

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

function pagar(e){
  e.preventDefault();
  if(state.pfMesesCart.length===0){ $('#pfMonthError').textContent='Agrega al menos un mes antes de pagar.'; return; }
  const comprobante=generarComprobante();
  const mesesTexto=state.pfMesesCart.map(it=>itemLabel(it)).join(', ');
  const moraTotal=state.pfMesesCart.reduce((s,it)=>s+it.mora,0);
  const total=state.pfMesesCart.reduce((s,it)=>s+it.subtotal,0);
  const registro={comprobante,nie:$('#pfNie').value,student:$('#pfStudent').value,date:$('#pfDate').value,month:mesesTexto,items:state.pfMesesCart.map(it=>({...it})),moraTotal,total:total.toFixed(2)};
  state.comprobanteCounter++; state.pagosRealizados.push(registro);
  window.dispatchEvent(new CustomEvent('payments:updated'));
  closePaymentModal(); generarComprobantePDF(registro);
  alert(`Pago registrado con éxito.\nN° comprobante: ${comprobante}\nSe descargó el comprobante en PDF.`);
}

export function initPayments(){
  renderPayments(); renderPaymentStudents(); renderPfMesesCart(); loadMensualidadesSelect();
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
