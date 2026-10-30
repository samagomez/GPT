# EduManager V19.4

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

## V16.1

El select `pfMonth` del formulario de pago se llena con `catalogo_mensualidades` de Supabase (concepto y monto). El valor base de cada mes sale del catálogo; la mora ($3.00 por mes de atraso) se sigue calculando para conceptos que contengan un nombre de mes, y la matrícula no genera mora.

## V17

- Configuración › Catálogos: nuevos submódulos **Grados** y **Secciones** (un solo campo: Nombre), conectados a Supabase (`catalogo_grados`, `catalogo_secciones`). Ejecutar `supabase-schema.sql` para crearlas.
- Los selects de Grado y Sección de los catálogos de Estudiantes y Docentes se llenan desde esas tablas.
- `app.js` es el archivo activo; `js/` no se carga desde `index.html`.
- Modal "Registrar pago" ampliado (hasta 960 px de ancho).

## V18

- Nuevas tablas `catalogo_estudiantes` y `catalogo_docentes` (nombre, apellido, grado, seccion). Script: `supabase-schema-v18.sql` (también incluido al final de `supabase-schema.sql`).
- Los catálogos de Estudiantes y Docentes ahora leen, agregan y editan en Supabase (con copia local de respaldo si Supabase no está configurado), igual que Materiales y Mensualidades.

## V19.1

- Pagos: la tabla "Pagos por docente" muestra los datos de `catalogo_docentes` (docente, grado, sección).
- Filtros por docente (búsqueda) y por grado.

## V19.2

- Pagos › Ver: la pantalla de estudiantes muestra los alumnos del grado y sección del docente desde `catalogo_estudiantes`.

## V19.3

- Paginado de 10 en 10 en Pagos y en Estudiantes de pagos.

## V19.4

- Al registrar un pago en el modal se guarda en la tabla `Pagos` de Supabase (NumRegistro, estudiante, fechaPago, detallePago, MoraTotal, PagoTotal). Script: `supabase-schema-v19.4.sql`.
