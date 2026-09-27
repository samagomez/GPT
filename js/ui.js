import { CONFIG } from '../data/config.js';
import { $, $$ } from './dom.js';

export function renderStudents(rows, target){
  const element = $(target);
  if(!element) return;
  element.innerHTML = rows.map(s => `<tr><td><div class="student"><div class="mini-avatar">${s.name.split(' ').map(x=>x[0]).slice(0,2).join('')}</div><strong>${s.name}</strong></div></td><td>${s.grade}</td><td>${s.date}</td><td><span class="status ${s.status==='Activo'?'active':'pending'}">${s.status}</span></td></tr>`).join('');
}

export function renderActivity(){
  $('#activityList').innerHTML = CONFIG.activity.map(a => `<div class="activity"><div class="activity-icon"><i class="bi bi-${a.icon}"></i></div><div><strong>${a.text}</strong><span>${a.detail}</span><small>${a.time}</small></div></div>`).join('');
}

export function showSection(id){
  $$('.section').forEach(x => x.classList.toggle('active-section', x.id === id));
  $$('.nav-item').forEach(x => x.classList.toggle('active', x.dataset.section === id));
  if(location.hash !== '#'+id) history.replaceState(null,'','#'+id);
  $('#sidebar').classList.remove('open');
}

function newStudent(){ alert('Formulario de nuevo estudiante próximamente.'); }

export function initUI(){
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
