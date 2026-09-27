import { CONFIG, REPORT_COLUMNS, REPORT_COLUMN_LABELS } from '../data/config.js';
import { state } from './state.js';
import { $ } from './dom.js';
import { showSection } from './ui.js';

export function renderReports(){
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

export function initReports(){
  renderReports();
  $('#reportsTable').addEventListener('click',e=>{
    const btn=e.target.closest('[data-action="view-report"]'); if(btn) viewReport(btn.dataset.grade);
  });
  window.addEventListener('payments:updated',()=>renderReports());
}
