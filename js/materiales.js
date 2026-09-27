import { CONFIG } from '../data/config.js';
import { state } from './state.js';
import { $, todayISO } from './dom.js';

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
export function initMateriales(){
  $('#matFecha').value=todayISO();renderMaterialesCart();
  $('#materialesCartTable').addEventListener('click',e=>{const btn=e.target.closest('[data-action="remove-material"]');if(btn)quitarMaterial(Number(btn.dataset.index));});
  $('#agregarMaterialBtn').addEventListener('click',agregarMaterial);$('#limpiarMaterialesBtn').addEventListener('click',limpiarMateriales);$('#procesarMaterialesBtn').addEventListener('click',procesarMateriales);
}
