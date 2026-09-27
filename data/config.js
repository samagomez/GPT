export const CONFIG = {
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

export const MONTH_ORDER = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre'];
export const REPORT_COLUMNS = ['Matricula', ...MONTH_ORDER];
export const REPORT_COLUMN_LABELS = {
  Matricula:'Matrícula', Enero:'Ene', Febrero:'Feb', Marzo:'Mar', Abril:'Abr', Mayo:'May',
  Junio:'Jun', Julio:'Jul', Agosto:'Ago', Septiembre:'Sep', Octubre:'Oct', Noviembre:'Nov'
};
export const ALL_MONTH_OPTIONS = [...MONTH_ORDER, 'Matricula'];
export const DECIMAL_REGEX = /^\d+(\.\d{1,2})?$/;
