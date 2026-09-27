export const state = {
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
