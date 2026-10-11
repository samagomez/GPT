# EduManager V16

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

## Conexión con Supabase

1. Abre tu proyecto Supabase y entra en **SQL Editor**.
2. Ejecuta el contenido de `supabase-schema.sql` para crear `catalogo_materiales` y `catalogo_mensualidades` con sus políticas RLS.
3. Revisa `supabase-config.js`: contiene la URL del proyecto y la clave publicable proporcionadas.
4. Publica la carpeta en un hosting HTTPS (por ejemplo GitHub Pages) o ejecútala con un servidor local. La conexión remota puede fallar si se abre directamente con `file://`.
5. En EduManager, entra a **Configuración > Catálogos > Materiales/Mensualidades**. Los registros se consultan, agregan y editan en Supabase.

**Seguridad:** la clave incluida es una clave publicable, no una clave secreta. El SQL deja estos dos catálogos con escritura anónima para facilitar el prototipo; cualquier visitante que conozca la URL puede modificar los catálogos. No uses estas políticas con datos reales hasta añadir autenticación y políticas RLS restringidas por rol.

## V16

El select `matMaterial` del submódulo Materiales ya no usa valores fijos: se llena con `catalogo_materiales` de Supabase (se recarga al abrir la sección). El precio del carrito sale del monto del catálogo.
