import { state } from './state.js';
import { $, todayISO } from './dom.js';

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
export function initMateriales(){
  $('#matFecha').value=todayISO();renderMaterialesCart();loadMaterialesSelect();window.addEventListener('hashchange',()=>{if(location.hash==='#materiales')loadMaterialesSelect();});
  $('#materialesCartTable').addEventListener('click',e=>{const btn=e.target.closest('[data-action="remove-material"]');if(btn)quitarMaterial(Number(btn.dataset.index));});
  $('#agregarMaterialBtn').addEventListener('click',agregarMaterial);$('#limpiarMaterialesBtn').addEventListener('click',limpiarMateriales);$('#procesarMaterialesBtn').addEventListener('click',procesarMateriales);
}
