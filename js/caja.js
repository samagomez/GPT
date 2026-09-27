import { DECIMAL_REGEX } from '../data/config.js';
import { state } from './state.js';
import { $, $$ } from './dom.js';

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
export function initCaja(){
  renderCajaNumeroOptions();
  window.addEventListener('payments:updated',renderCajaNumeroOptions);
  $('#cajaNumero').addEventListener('input',updateProcesarBtn); $('#cajaNumero').addEventListener('change',updateProcesarBtn);
  $('#cajaEfectivo').addEventListener('input',e=>{sanitizeDecimalInput(e.target);updateProcesarBtn();}); $('#cajaMonto').addEventListener('input',e=>{sanitizeDecimalInput(e.target);updateProcesarBtn();});
  $('#cajaEfectivo').addEventListener('blur',e=>{formatCajaField(e.target);updateProcesarBtn();}); $('#cajaMonto').addEventListener('blur',e=>{formatCajaField(e.target);updateProcesarBtn();});
  $('#limpiarCajaBtn').addEventListener('click',limpiarCaja); $('#cajaForm').addEventListener('submit',procesarCaja);
}
