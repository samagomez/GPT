import { CONFIG } from '../data/config.js';
import { renderStudents } from './ui.js';

export function initStudents(){
  renderStudents(CONFIG.students,'#studentTable');
  renderStudents(CONFIG.students,'#studentTableFull');
}
