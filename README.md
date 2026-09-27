# EduManager V14

Versión reorganizada de EduManager V13 con separación de responsabilidades.

## Estructura

```text
EduManager_v14/
├── index.html
├── styles.css
├── data/
│   ├── config.js
│   └── logic.json
└── js/
    ├── main.js
    ├── dom.js
    ├── state.js
    ├── ui.js
    ├── students.js
    ├── payments.js
    ├── reports.js
    ├── caja.js
    └── materiales.js
```

`index.html` contiene únicamente la estructura de la interfaz. `styles.css` concentra la presentación. `config.js` contiene configuración y datos iniciales para que el proyecto pueda abrirse localmente sin depender de `fetch()` sobre `file://`. Cada módulo JavaScript contiene la lógica de una responsabilidad concreta.

## Ejecución

Abre `index.html` en un navegador moderno. Se requiere conexión a Internet para Bootstrap Icons y las librerías jsPDF cargadas desde CDN.
