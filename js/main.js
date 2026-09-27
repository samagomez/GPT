import { CONFIG } from '../data/config.js';
import { initUI, renderActivity, showSection } from './ui.js';
import { initStudents } from './students.js';
import { initPayments } from './payments.js';
import { initReports } from './reports.js';
import { initCaja } from './caja.js';
import { initMateriales } from './materiales.js';

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
