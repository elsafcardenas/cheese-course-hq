// The in-app guide, in English and Spanish. Keep both languages in step when editing.
type L = { en: string; es: string };
const t = (en: string, es: string): L => ({ en, es });

export const BASICS: { title: L; body: L }[] = [
  {
    title: t("Signing in", "Entrar"),
    body: t(
      "Open the link Elsa sent you and enter your email. You'll get an email with a sign-in button; there's no password to remember. It works on a phone, tablet or computer.",
      "Abre el enlace que te mandó Elsa y escribe tu email. Te llegará un correo con un botón para entrar; no hay contraseña que recordar. Funciona en el móvil, la tablet o el ordenador.",
    ),
  },
  {
    title: t("Miami or Spain", "Miami o España"),
    body: t(
      "The switch at the top of the menu changes everything between the Miami business and the Spain project. They never mix: tasks, posts, menus and documents belong to one or the other (a few shared decisions show in both, marked “Both”).",
      "El interruptor arriba del menú cambia todo entre el negocio de Miami y el proyecto de España. Nunca se mezclan: tareas, posts, menús y documentos son de uno u otro (algunas decisiones compartidas salen en los dos, marcadas como «Both»).",
    ),
  },
  {
    title: t("Finding things", "Encontrar cosas"),
    body: t(
      "The menu on the left is grouped by department. To jump anywhere, press ⌘K (Ctrl+K on Windows) or click “Search or jump to…” and type a page, task, post, order, menu item, person or document.",
      "El menú de la izquierda está agrupado por departamento. Para ir a cualquier sitio, pulsa ⌘K (Ctrl+K en Windows) o «Search or jump to…» y escribe una página, tarea, post, pedido, plato, persona o documento.",
    ),
  },
  {
    title: t("Adding and editing", "Añadir y editar"),
    body: t(
      "Every list has an “Add” button. Click any row or card to open it, change what you need and press Save. On boards, drag a card to another column to change its status.",
      "Cada lista tiene un botón «Add». Haz clic en cualquier fila o tarjeta para abrirla, cambia lo que necesites y pulsa Guardar. En los tableros, arrastra una tarjeta a otra columna para cambiar su estado.",
    ),
  },
  {
    title: t("Bringing in a spreadsheet", "Importar una hoja de cálculo"),
    body: t(
      "On any list press Import. In Google Sheets or Excel, copy your rows including the header row and paste them in (or upload a CSV). Columns are matched by name and checked before anything is saved. The download button exports any list back to a spreadsheet.",
      "En cualquier lista pulsa Import. En Google Sheets o Excel copia tus filas incluida la fila de títulos y pégalas (o sube un CSV). Las columnas se emparejan por nombre y se revisan antes de guardar. El botón de descarga exporta cualquier lista a una hoja de cálculo.",
    ),
  },
  {
    title: t("Spanish", "Español"),
    body: t(
      "At the bottom of the menu, switch Language to ES and the whole interface turns Spanish on that device. What people type (task names, captions, notes) stays in the language it was written in.",
      "Abajo del menú, cambia Language a ES y toda la interfaz pasa a español en ese dispositivo. Lo que escribe la gente (tareas, textos, notas) se queda en el idioma en que se escribió.",
    ),
  },
];

export const ROLES: { who: L; does: L; steps: L[] }[] = [
  {
    who: t("Elsa (admin)", "Elsa (administradora)"),
    does: t("Runs everything: plans, approves content, manages the team and the connections.", "Lo lleva todo: planifica, aprueba contenido, gestiona el equipo y las conexiones."),
    steps: [
      t("Monday: check Overview, plan the week in the Content calendar, and brief Luis from Toolkit → Brief for Luis.", "Lunes: mira el Resumen, planifica la semana en el Calendario de contenido y manda el brief a Luis desde Toolkit → Brief for Luis."),
      t("Through the week: approve or send back pieces in Review & approval; approved pieces move their post to Ready to post.", "Durante la semana: aprueba o devuelve piezas en Review & approval; lo aprobado pasa su post a Ready to post."),
      t("Add people in Team & access. Click anyone to rename them, pause them, change their level, or switch pages on and off.", "Añade gente en Equipo y acceso. Pulsa a cualquiera para cambiarle el nombre, pausarle, cambiar su nivel o activar y desactivar páginas."),
      t("First Friday of the month: log KPIs in Performance and check Finance.", "Primer viernes de mes: registra los KPI en Performance y revisa Finanzas."),
    ],
  },
  {
    who: t("Luis (designer)", "Luis (diseñador)"),
    does: t("Makes the graphics and uploads them for review.", "Hace los gráficos y los sube para revisión."),
    steps: [
      t("Open Review & approval to see what's waiting and any changes requested.", "Abre Review & approval para ver qué está pendiente y los cambios pedidos."),
      t("Open a piece, read the comments, and press “New version” with the Drive or Canva link (share it as “anyone with the link” so the preview shows).", "Abre una pieza, lee los comentarios y pulsa «New version» con el enlace de Drive o Canva (compártelo como «cualquier persona con el enlace» para que se vea la vista previa)."),
      t("The Content calendar shows what's coming and the brief for each post.", "El Calendario de contenido muestra lo que viene y el brief de cada post."),
    ],
  },
  {
    who: t("Ricardo (viewer)", "Ricardo (lector)"),
    does: t("Sees everything, comments on content and answers decisions.", "Ve todo, comenta el contenido y responde decisiones."),
    steps: [
      t("Overview shows “Waiting on Ricardo”: write the answer and press Decide.", "El Resumen muestra «Waiting on Ricardo»: escribe la respuesta y pulsa Decide."),
      t("Content calendar → “For Ricardo” shows finished posts; leave your opinion in Ricardo's comments (it's an opinion, not an approval step).", "Calendario de contenido → «For Ricardo» muestra los posts terminados; deja tu opinión en Ricardo's comments (es una opinión, no un paso de aprobación)."),
      t("Finance, Stores and the Madrid opening are there to read at any time.", "Finanzas, Tiendas y la apertura de Madrid están para consultar cuando quieras."),
    ],
  },
  {
    who: t("Store managers", "Encargados de tienda"),
    does: t("Run their store's day: checklists, orders, stock, issues and footage. They only see their own store.", "Llevan el día de su tienda: checklists, pedidos, stock, incidencias y vídeos. Solo ven su propia tienda."),
    steps: [
      t("Open and close with Checklists: tick each item on the phone.", "Abre y cierra con Checklists: marca cada punto en el móvil."),
      t("Log catering orders as they come in and move them along the board to Picked up.", "Apunta los pedidos de catering al recibirlos y muévelos en el tablero hasta Picked up."),
      t("Report broken equipment in Maintenance and log waste every night in Inventory → Waste log.", "Avisa de equipos rotos en Maintenance y apunta la merma cada noche en Inventory → Waste log."),
      t("Weekly: film the shoot list from Toolkit and add it in Assets & footage.", "Cada semana: graba la lista de planos de Toolkit y súbela en Assets & footage."),
    ],
  },
];

export const PAGES: { href: string; title: L; body: L }[] = [
  { href: "/", title: t("Overview", "Resumen"), body: t("Today in one screen: clocks for Madrid, Miami and Mexico City, what's due, pickups, low stock, issues, reviews, next posts and decisions. Click any tile to go to it.", "El día en una pantalla: relojes de Madrid, Miami y México, lo que vence, recogidas, stock bajo, incidencias, reseñas, próximos posts y decisiones. Haz clic en cualquier recuadro para ir.") },
  { href: "/marketing/calendar", title: t("Content calendar", "Calendario de contenido"), body: t("Month view (drag a post to another day), board (drag it from Idea to Posted) and list. Open a post to see its hook, footage and copy, copy the brief, or press Send for review. In Spain it's the content bank, grouped by the milestone that unlocks each post.", "Vista de mes (arrastra un post a otro día), tablero (arrástralo de Idea a Posted) y lista. Abre un post para ver el gancho, el material y el texto, copiar el brief o pulsar Send for review. En España es el banco de contenido, agrupado por el hito que desbloquea cada post.") },
  { href: "/marketing/review", title: t("Review & approval", "Revisión y aprobación"), body: t("Graphics, Videos and Copy tabs. Each piece shows a preview, its version and a conversation. Elsa approves or requests changes (with a comment); the maker uploads a new version; anyone can comment.", "Pestañas de Gráficos, Vídeos y Textos. Cada pieza muestra la vista previa, su versión y una conversación. Elsa aprueba o pide cambios (con un comentario); quien la hizo sube una nueva versión; todos pueden comentar.") },
  { href: "/marketing/platforms", title: t("Platforms", "Plataformas"), body: t("Every account in the order it opens, its status, cadence and a setup checklist you can tick.", "Cada cuenta en el orden en que se abre, su estado, frecuencia y una checklist de configuración para marcar.") },
  { href: "/marketing/performance", title: t("Performance", "Rendimiento"), body: t("Targets for 3 and 6 months with progress bars. Click a row to log the month's number and see the trend. The video log charts every Reel against the median.", "Objetivos a 3 y 6 meses con barras de progreso. Haz clic en una fila para registrar el número del mes y ver la tendencia. El registro de vídeos compara cada Reel con la mediana.") },
  { href: "/marketing/toolkit", title: t("Toolkit", "Herramientas"), body: t("Hook library, caption builder, shoot-list generator for the stores, a brief for Luis, a time-zone helper and hashtag sets. Everything copies with one click.", "Biblioteca de ganchos, generador de textos, lista de planos para las tiendas, brief para Luis, ayuda de husos horarios y hashtags. Todo se copia con un clic.") },
  { href: "/marketing/plan", title: t("Plan", "Plan"), body: t("The rules, the timeline (the green line is the team start, Nov 30), the content mix and the weekly rhythm.", "Las reglas, el calendario (la línea verde es el inicio del equipo, 30 de noviembre), la mezcla de contenido y el ritmo semanal.") },
  { href: "/marketing/assets", title: t("Assets & footage", "Material y vídeos"), body: t("Drive folders and links, and footage uploaded by the stores.", "Carpetas y enlaces de Drive, y vídeos subidos por las tiendas.") },
  { href: "/ops/stores", title: t("Stores", "Tiendas"), body: t("Each store's card: address, hours, manager, ordering link, and live counts for team, pickups, stock, issues, rating and today's checklists.", "La ficha de cada tienda: dirección, horario, encargado, enlace de pedidos y datos al momento de equipo, recogidas, stock, incidencias, valoración y checklists del día.") },
  { href: "/ops/catering", title: t("Catering orders", "Pedidos de catering"), body: t("The next 14 days at a glance, a pipeline from Enquiry to Picked up, payments and deposits, and a weekly trend.", "Los próximos 14 días de un vistazo, un embudo de Enquiry a Picked up, pagos y señales, y la tendencia semanal.") },
  { href: "/ops/staff", title: t("Staff & schedule", "Equipo y horarios"), body: t("The team list and a weekly rota per store: click + in a day to add a shift; hours add up automatically.", "La lista del equipo y el horario semanal por tienda: pulsa + en un día para añadir un turno; las horas se suman solas.") },
  { href: "/ops/checklists", title: t("Checklists", "Checklists"), body: t("Opening, closing, weekly and monthly lists per store. Tick on a phone; the 14-day grid shows which days were done. Elsa edits the templates at the bottom.", "Listas de apertura, cierre, semanales y mensuales por tienda. Marca en el móvil; la cuadrícula de 14 días muestra qué días se hicieron. Elsa edita las plantillas abajo.") },
  { href: "/ops/inventory", title: t("Inventory & suppliers", "Inventario y proveedores"), body: t("Stock with par levels (red bars are below par), a reorder list that drafts purchase orders, suppliers, orders on a board, and the waste log with cost charts.", "Stock con niveles mínimos (las barras rojas están por debajo), una lista de reposición que prepara pedidos, proveedores, pedidos en tablero y el registro de merma con gráficos de coste.") },
  { href: "/ops/maintenance", title: t("Maintenance", "Mantenimiento"), body: t("Report a problem, move it from Open to Scheduled to Fixed, and track what repairs cost.", "Avisa de un problema, muévelo de Open a Scheduled a Fixed y controla lo que cuestan las reparaciones.") },
  { href: "/menu", title: t("Menu & pricing", "Menú y precios"), body: t("Price, food cost and margin for every item (green ≤30%, amber ≤35%, red above). With Square connected, the matrix shows stars, plowhorses, puzzles and dogs.", "Precio, coste y margen de cada plato (verde ≤30 %, ámbar ≤35 %, rojo por encima). Con Square conectado, la matriz muestra estrellas, caballos de tiro, enigmas y perros.") },
  { href: "/finance", title: t("Finance", "Finanzas"), body: t("Sales, spending, budget vs actual and a monthly P&L. Import expenses from the bank or QuickBooks as CSV; Square fills sales.", "Ventas, gastos, presupuesto frente a real y una cuenta de resultados mensual. Importa gastos del banco o QuickBooks en CSV; Square rellena las ventas.") },
  { href: "/customers", title: t("Reviews & feedback", "Reseñas y opiniones"), body: t("Log reviews, complaints and compliments; move them from New to Replied or Resolved. Ratings and the spread of stars update as you go.", "Apunta reseñas, quejas y felicitaciones; muévelas de New a Replied o Resolved. Las valoraciones y la distribución de estrellas se actualizan solas.") },
  { href: "/madrid", title: t("Madrid opening", "Apertura de Madrid"), body: t("Milestones by phase with progress rings, the location board, the opening budget (estimate vs actual) and every contact.", "Hitos por fase con anillos de progreso, el tablero de locales, el presupuesto de apertura (estimado frente a real) y todos los contactos.") },
  { href: "/company/tasks", title: t("Tasks", "Tareas"), body: t("List, board and by-owner views. Change status in the list or drag on the board; overdue dates turn red.", "Vistas de lista, tablero y por persona. Cambia el estado en la lista o arrastra en el tablero; las fechas vencidas se ponen en rojo.") },
  { href: "/company/decisions", title: t("Decisions & meetings", "Decisiones y reuniones"), body: t("What's decided, what's waiting on Ricardo, and a log of every meeting.", "Lo decidido, lo que espera a Ricardo y un registro de cada reunión.") },
  { href: "/company/docs", title: t("SOPs & documents", "Procedimientos y documentos"), body: t("Write a how-to right here (one step per line) or link a Drive, Notion or PDF file.", "Escribe un procedimiento aquí mismo (un paso por línea) o enlaza un archivo de Drive, Notion o PDF.") },
  { href: "/company/integrations", title: t("Integrations", "Integraciones"), body: t("Connect Square, Instagram and Facebook, Google Business Profile and TikTok. Each card shows the steps; once connected they sync every morning.", "Conecta Square, Instagram y Facebook, Google Business Profile y TikTok. Cada tarjeta muestra los pasos; una vez conectadas se sincronizan cada mañana.") },
  { href: "/company/team", title: t("Team & access", "Equipo y acceso"), body: t("Click Add a person, or click anyone to edit them. Five steps: name and job title; Active or Paused (paused people can't sign in, nothing is deleted); what they can change (Admin, Editor, Viewer or Store manager); Miami, Spain or both; and which pages they can open. Use Back to usual to undo page changes. Check the result with Preview as.", "Pulsa Añadir una persona, o pulsa a cualquiera para editarle. Cinco pasos: nombre y puesto; Activo o En pausa (en pausa no puede entrar, no se borra nada); qué puede cambiar (Admin, Editor, Lector o Encargado); Miami, España o ambos; y qué páginas puede abrir. Usa Volver a lo habitual para deshacer cambios de páginas. Compruébalo con Ver como.") },
];

export const FAQ: { q: L; a: L }[] = [
  { q: t("I can't see a page someone mentioned.", "No veo una página que alguien mencionó."), a: t("Pages depend on your role, and on whether you're in Miami or Spain. Check the switch at the top of the menu, or ask Elsa to change your role.", "Las páginas dependen de tu rol y de si estás en Miami o en España. Revisa el interruptor arriba del menú o pide a Elsa que cambie tu rol.") },
  { q: t("My change disappeared.", "Mi cambio desapareció."), a: t("If you see “Preview mode” at the top, the database isn't connected yet and changes are temporary. Once it's connected, everything saves.", "Si ves «Preview mode» arriba, la base de datos aún no está conectada y los cambios son temporales. Cuando esté conectada, todo se guarda.") },
  { q: t("The preview of a design doesn't show.", "No se ve la vista previa de un diseño."), a: t("Drive and Canva files need to be shared as “anyone with the link can view”. Or paste a direct link to the image or video.", "Los archivos de Drive y Canva tienen que estar compartidos como «cualquier persona con el enlace puede ver». O pega un enlace directo a la imagen o el vídeo.") },
  { q: t("How do I install it on my phone?", "¿Cómo lo instalo en el móvil?"), a: t("Open the link in Safari (iPhone) or Chrome (Android) and choose “Add to Home Screen”. It opens like an app.", "Abre el enlace en Safari (iPhone) o Chrome (Android) y elige «Añadir a pantalla de inicio». Se abre como una app.") },
  { q: t("Who sees sales and finance?", "¿Quién ve las ventas y las finanzas?"), a: t("Only Elsa and Ricardo. Luis and the store managers don't.", "Solo Elsa y Ricardo. Luis y los encargados no.") },
];
