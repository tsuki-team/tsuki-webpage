# tsuki — Guía de Estilo

Referencia completa del sistema de diseño del IDE tsuki. Trasládala a cualquier app del ecosistema (server-gui, client, web) para mantener coherencia visual.

---

## 1. Fuentes

```css
--font-sans: 'IBM Plex Sans', system-ui, sans-serif;
--font-mono: 'IBM Plex Mono', 'Fira Code', monospace;
```

**Pesos usados:** 300 · 400 · 500 · 600  
**Tamaño base (fluido):**

```css
--base-size: clamp(11px, 0.85vw, 14px);
```

A 1024 px de ancho → ~12 px. A 1440 px → 13 px. A 1920 px → 14 px.  
`min()` previene tamaños gigantes en monitores ultrawide.

**Smooth rendering:**

```css
-webkit-font-smoothing: antialiased;
-moz-osx-font-smoothing: grayscale;
```

**Escalas tipográficas frecuentes (sin ser exhaustivo):**

| Clase / uso           | Tamaño     | Peso |
|---|---|---|
| Título de sección     | `text-lg` / 18 px | 600 |
| Label de campo        | `text-sm` / 13 px | 500 |
| Texto de cuerpo       | `text-sm` / 13 px | 400 |
| Metadato / ruta       | `text-xs` / 11 px | 400 |
| Badge / tecla         | `text-[10px]`     | 600, monoespaciado |
| Label de acción chrome| `7.5 px`          | 600, uppercase, tracking 0.07em |

---

## 2. Tokens de color — CSS Variables

Todos los tokens se definen en `:root` y se sobreescriben por clase (`html.dark`, `html.light`) o mediante `document.documentElement.style.setProperty()` al cambiar de tema.

### 2.1 Sistema de superficies

```css
/* Escala de grises — de más oscuro a más claro (dark mode) */
--surface:    #0a0a0a   /* fondo raíz / body */
--surface-1:  #111111   /* panels primarios, sidebar */
--surface-2:  #171717   /* panels secundarios */
--surface-3:  #1f1f1f   /* hover de cards, inputs */
--surface-4:  #282828   /* controles, toggles */
```

Regla: cada nivel es ~8–10 puntos de luminosidad más claro que el anterior.

### 2.2 Bordes

```css
--border:        #242424   /* borde principal */
--border-subtle: #1c1c1c   /* separadores muy finos dentro de panels */
```

### 2.3 Foreground

```css
--fg:        #ededed   /* texto principal */
--fg-muted:  #8c8c8c   /* texto secundario, labels */
--fg-faint:  #484848   /* placeholders, iconos inactivos */
```

### 2.4 Interacción

```css
--hover:         rgba(255,255,255,0.04)   /* overlay hover sobre cualquier superficie */
--active:        rgba(255,255,255,0.08)   /* overlay presionado */
--active-border: #555                     /* borde del item seleccionado en sidebar */
```

### 2.5 Semánticos

```css
--ok:    #22c55e
--err:   #ef4444
--warn:  #f59e0b
--info:  #93c5fd
```

### 2.6 Acento

```css
--accent:     #ededed   /* en dark = blanco; en light = negro */
--accent-inv: #0a0a0a   /* inverso — fondo de botones solid */
```

Nota: el acento de tsuki es **deliberadamente neutro** (blanco/negro según tema). No hay un color de marca llamativo como azul o verde — la identidad viene de la tipografía y la densidad de la UI, no del color.

### 2.7 AppChrome (barra superior de la ventana)

Variables separadas para el chrome porque tiene más contraste que el resto de la UI:

```css
--chrome-bg:       #0e0f10
--chrome-border:   #1e2022
--chrome-sep:      #242628   /* separadores verticales dentro del chrome */
--chrome-fg:       #c8ccd0   /* texto del proyecto / acciones */
--chrome-fg-muted: #6b6f72   /* texto secundario */
--chrome-input:    #181a1b   /* fondo del board selector */
--chrome-group:    #141618   /* fondo del action group pill */
```

### 2.8 Modo oscuro vs. claro (valores completos)

```css
/* DARK (default) */
html, html.dark {
  --surface: #0a0a0a; --surface-1: #111111; --surface-2: #171717;
  --surface-3: #1f1f1f; --surface-4: #282828;
  --border: #242424; --border-subtle: #1c1c1c;
  --fg: #ededed; --fg-muted: #8c8c8c; --fg-faint: #484848;
  --accent: #ededed; --accent-inv: #0a0a0a;
  --hover: rgba(255,255,255,0.04); --active: rgba(255,255,255,0.08);
  --ok: #22c55e; --err: #ef4444; --warn: #f59e0b; --info: #93c5fd;
}

/* LIGHT */
html.light {
  --surface: #ffffff; --surface-1: #fafafa; --surface-2: #f5f5f5;
  --surface-3: #efefef; --surface-4: #e8e8e8;
  --border: #e8e8e8; --border-subtle: #f0f0f0;
  --fg: #111111; --fg-muted: #737373; --fg-faint: #c4c4c4;
  --accent: #111111; --accent-inv: #ffffff;
  --hover: rgba(0,0,0,0.03); --active: rgba(0,0,0,0.06);
  --ok: #16a34a; --err: #dc2626; --warn: #d97706; --info: #3b82f6;
}
```

### 2.9 Temas de UI disponibles

El sistema admite múltiples temas de UI (no solo dark/light). Se aplican sobreescribiendo variables en `document.documentElement.style`:

| ID | Nombre | Base |
|---|---|---|
| `dark` | Dark | dark |
| `light` | Light | light |
| `midnight` | Midnight | dark |
| `warm-dark` | Warm Dark | dark |
| `solarized-dark` | Solarized | dark |
| `high-contrast` | High Contrast | dark |
| `catppuccin-mocha` | Catppuccin Mocha | dark |
| `catppuccin-latte` | Catppuccin Latte | light |
| `tokyo-night` | Tokyo Night | dark |
| `dracula` | Dracula | dark |
| `one-dark` | One Dark | dark |
| `rose-pine` | Rosé Pine | dark |
| `gruvbox` | Gruvbox | dark |

Función de aplicación:

```ts
import { IDE_THEMES, SYNTAX_THEMES } from '@/lib/themes'

function applyTheme(ideThemeId: string, syntaxThemeId: string) {
  const theme  = IDE_THEMES.find(t => t.id === ideThemeId) ?? IDE_THEMES[0]
  const syntax = SYNTAX_THEMES.find(s => s.id === syntaxThemeId) ?? SYNTAX_THEMES[0]
  const root = document.documentElement
  root.classList.remove('dark', 'light')
  root.classList.add(theme.base)
  for (const [k, v] of Object.entries({ ...theme.vars, ...syntax.vars })) {
    root.style.setProperty(k, v)
  }
}
```

---

## 3. Tokens de sintaxis

Para cualquier editor de código embebido:

```css
--syn-kw:  #ededed   /* keywords: func, for, if… — weight 500 */
--syn-fn:  #d4d4d4   /* nombres de función */
--syn-str: #a0a0a0   /* strings */
--syn-num: #b0b0b0   /* números */
--syn-com: #525252   /* comentarios — font-style italic */
--syn-typ: #c8c8c8   /* tipos */
--syn-pkg: #b8b8b8   /* nombres de paquetes */
--syn-op:  #ededed   /* operadores */
```

Clases CSS para tokens:

```css
.syn-kw  { color: var(--syn-kw);  font-weight: 500; }
.syn-fn  { color: var(--syn-fn); }
.syn-str { color: var(--syn-str); }
.syn-num { color: var(--syn-num); }
.syn-com { color: var(--syn-com); font-style: italic; }
.syn-typ { color: var(--syn-typ); }
.syn-pkg { color: var(--syn-pkg); }
.syn-op  { color: var(--syn-op); }
```

---

## 4. Sizing system

### 4.1 Variables de layout

```css
--topbar-h:     clamp(34px, 3.5vh, 44px)   /* altura de la barra superior */
--row-h:        clamp(26px, 2.8vh, 32px)   /* altura de rows en listas/sidebars */
--sidebar-min:  140px
--sidebar-max:  220px
```

**Compact mode** (`data-compact="true"` en `<html>`):

```css
--topbar-h:  clamp(28px, 3vh, 34px);
--row-h:     clamp(22px, 2.4vh, 26px);
--base-size: clamp(10px, 0.78vw, 12px);
```

### 4.2 Settings layout

```css
--settings-sidebar-w:    clamp(152px, 14vw, 200px)
--settings-field-ctrl:   clamp(180px, 22vw, 220px)
--settings-content-px:   clamp(16px, 4vw, 40px)
```

### 4.3 Editor

```css
/* Code editor textarea + highlight overlay */
font-family: var(--font-mono);
font-size: 13px;
line-height: 21px;
padding: 12px 80px 200px 16px;   /* bottom padding grande para scroll cómodo */
tab-size: 4;
```

---

## 5. Componentes primitivos

Todos viven en `src/components/shared/primitives.tsx` y usan `clsx` para composición de clases.

### 5.1 Btn

```tsx
<Btn variant="ghost" size="sm">Texto</Btn>
<Btn variant="solid">Confirmar</Btn>
<Btn variant="outline">Cancelar</Btn>
<Btn variant="danger">Eliminar</Btn>
```

| Variante | Fondo | Texto | Hover |
|---|---|---|---|
| `ghost` | transparente | `--fg-muted` | `--hover`, texto `--fg` |
| `solid` | `--fg` | `--accent-inv` | `opacity-80` |
| `outline` | transparente | `--fg-muted` | `--hover`, texto `--fg` |
| `danger` | transparente | `--err` | `color-mix(--err 8%, transparent)` |

Tamaños: `xs` (px-1.5 py-0.5 text-xs) · `sm` (px-2.5 py-1 text-sm) · `md` (px-3.5 py-1.5 text-base)

Base compartida: `inline-flex items-center gap-1.5 font-medium rounded transition-colors cursor-pointer border-0 disabled:opacity-40`

### 5.2 Input

```tsx
<Input placeholder="…" onValue={v => setValue(v)} />
<Input mono placeholder="TSUKI-XXXX-…" />
```

```css
bg-[var(--surface)] border border-[var(--border)] rounded text-[var(--fg)] text-sm
placeholder-[var(--fg-faint)] px-2.5 py-1.5 outline-none transition-colors
focus:border-[var(--fg-muted)]
```

### 5.3 Select

```tsx
<Select options={[{ value: 'uno', label: 'Arduino Uno' }]} onValue={v => …} />
```

Mismo estilo que Input. `appearance-none` para eliminar el chevron nativo.

### 5.4 Textarea

Mismo estilo que Input, con `resize-none`.

### 5.5 Toggle

```tsx
<Toggle on={enabled} onToggle={() => setEnabled(v => !v)} />
```

```
Ancho: 32px (w-8) · Alto: 18px · Thumb: 14px × 14px
ON:  bg-[var(--fg)]      Thumb: desliza a la derecha
OFF: bg-[var(--surface-4)] Thumb: posición izquierda
role="switch" aria-checked={on}
```

### 5.6 Badge

```tsx
<Badge>default</Badge>
<Badge variant="ok">active</Badge>
<Badge variant="warn">grace</Badge>
<Badge variant="err">expired</Badge>
```

```css
text-xs px-1.5 py-0.5 rounded font-mono
ok:   bg = color-mix(--ok 10%, transparent)  text = --ok
warn: bg = color-mix(--warn 10%, transparent) text = --warn
err:  bg = color-mix(--err 10%, transparent)  text = --err
```

### 5.7 IconBtn

Botón cuadrado 24×24 px para iconos sueltos:

```tsx
<IconBtn tooltip="Settings" onClick={…}><GearIcon /></IconBtn>
```

```css
w-6 h-6 flex items-center justify-center rounded
text-[var(--fg-faint)] hover:text-[var(--fg)] hover:bg-[var(--hover)]
transition-colors cursor-pointer border-0 bg-transparent
```

### 5.8 Divider

```tsx
<Divider />           {/* horizontal — h-px w-full */}
<Divider vertical />  {/* vertical   — w-px h-4   */}
```

`bg-[var(--border)] flex-shrink-0`

### 5.9 Label

Etiqueta de sección pequeña en mayúsculas:

```tsx
<Label>Apariencia</Label>
```

```css
text-2xs font-semibold text-[var(--fg-faint)] uppercase tracking-widest
```

---

## 6. Layout — AppChrome

La barra superior unificada de 44 px (`h-11`) tiene tres zonas:

```
[ Logo + proyecto ] | [ Board selector ] | [ Action group + RUN ] · · · [ Icono utils ] | [ Win controls ]
←── drag region ──────────────────────────────────────────────────────────────────────────────────────────→
                                                                           ←── no-drag ──→   ←── no-drag ──→
```

- **Drag region:** `style={{ WebkitAppRegion: 'drag' }}` en el contenedor raíz. Las zonas interactivas llevan `WebkitAppRegion: 'no-drag'`.
- **Separadores:** `w-px` con `background: var(--chrome-sep)`, `self-stretch`.
- **Action group pill:** `h-[26px] rounded-md overflow-hidden` con `border: 1px solid var(--chrome-sep)`.
- **ActionBtn:** `w-12 h-full` con label debajo del icono a 7.5 px uppercase.
- **RUN button:** standalone, `h-[26px] px-3.5 rounded-md`, fondo `#00b87a`, texto `#001a10`.

**MinimalChrome** para pantallas sin IDE (Welcome, Settings, Docs): misma estructura pero sin el action group ni el board selector.

**Window controls:**

```
Minimize: 44px wide, hover → rgba(255,255,255,0.08)
Maximize: 44px wide, hover → rgba(255,255,255,0.08)
Close:    44px wide, hover → #c0392b background, text #fff
          normal           → text #6b3b3b
```

---

## 7. Layout — Pantalla principal del IDE

```
┌─ AppChrome (h-11) ──────────────────────────────────────────────────┐
├─ sidebar nav (w variable, --sidebar-min → --sidebar-max) ──┬─ editor ─┤
│  Tab icons (Files/Git/Packages/Examples)                   │         │
│  ─────────────────────────────────────────────            │         │
│  Contenido del tab activo                                  │         │
├────────────────────────────────────────────────────────────┤         │
│  Bottom panel (resize handle arriba, altura configurable)  │         │
│  [Output] [Problems] [Terminal] [Monitor] [Explorer]       │         │
└────────────────────────────────────────────────────────────┴─────────┘
```

- **Resize del bottom panel:** handle de 3 px con `cursor-row-resize`, `hover:border-[var(--accent)]`.
- **Sidebar tabs:** `w-9 h-9` botones, icono centrado, `hover:bg-[var(--hover)]`, activo con borde izquierdo `2px var(--active-border)`.

---

## 8. Layout — Settings screen

```
┌─ MinimalChrome ──────────────────────────────────────────────────────┐
├─ nav (--settings-sidebar-w) ────┬─ contenido (padding --settings-content-px) ─┤
│  [Apariencia]                   │  <SectionHeader title desc />                │
│  [Editor]                       │  <SettingsField name desc>                   │
│  [Board]                        │    <control />   (ancho --settings-field-ctrl)│
│  [Herramientas]                 │  </SettingsField>                            │
│  ─── Experiments ────           │  ...                                         │
│  [General]                      │                                              │
│  [Sandbox]                      │                                              │
└─────────────────────────────────┴──────────────────────────────────────────────┘
```

`SettingsField` layout: `flex items-center gap-4 py-3.5 border-b border-[var(--border-subtle)] last:border-0`

---

## 9. Scrollbar

```css
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,0.08);
  border-radius: 100px;
  border: 1px solid transparent;
  background-clip: padding-box;
}
::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.18); }
::-webkit-scrollbar-corner { background: transparent; }

/* Light mode */
html.light ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.12); }
html.light ::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.24); }
```

---

## 10. Focus ring

```css
:focus-visible {
  outline: 1.5px solid var(--fg-muted);
  outline-offset: 1px;
  border-radius: 3px;
}
```

---

## 11. Selección de texto

```css
::selection { background: rgba(100,100,100,0.25); }
```

---

## 12. Animaciones

```css
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
.animate-fade-up { animation: fadeUp 200ms ease forwards; }
.animate-fade-in { animation: fadeIn 150ms ease forwards; }
.animate-spin    { animation: spin 1s linear infinite; }
```

Duraciones: **150–200 ms ease** para transiciones de UI. Nunca más de 300 ms salvo animaciones decorativas.

---

## 13. Context Menu

Menú contextual global singleton (`showContextMenu(e, items)`):

```css
/* Contenedor */
bg-[var(--surface-2)] border border-[var(--border)] rounded-md shadow-xl py-1
position: fixed  zIndex: 9999  minWidth: 200px

/* Item normal */
w-full flex items-center gap-2 px-3 py-1 text-xs
text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--hover)]

/* Item danger */
text-[var(--err)] hover:bg-[color-mix(in_srgb,var(--err)_10%,transparent)]

/* Separador */
h-px bg-[var(--border)] my-1

/* Shortcut */
text-[var(--fg-faint)] font-mono text-[10px] ml-4
```

Cierra con click fuera o `Escape`. Pequeño delay (50 ms) para que el `mousedown` del trigger no lo cierre inmediatamente.

---

## 14. Iconos

**Librería principal:** `lucide-react` en tamaños `size={12}` (inline en texto) hasta `size={16}` (sidebar tabs).

**Iconos del chrome:** SVG inline de 12×12 px, `stroke="currentColor"`, `strokeWidth` entre 1.2 y 1.5.

**Colores de icono por tipo de archivo:**

```ts
const EXT_COLORS: Record<string, string> = {
  go: '#6ba4e0', json: '#e0b96b', md: '#7ec89c',
  cpp: '#e07898', ino: '#70c8c0', h: '#c8a870',
  ts: '#4db8ff', tsx: '#61dafb', js: '#f7df1e',
  rs: '#f74c00', py: '#3572a5', css: '#563d7c',
  html: '#e34c26', svg: '#ffb13b',
}
```

---

## 15. Patrones de escritura de clases

### Usar CSS variables directamente en Tailwind

```tsx
// ✅ Correcto
className="text-[var(--fg-muted)] bg-[var(--surface-2)]"

// ✅ También correcto para colores compuestos
className="hover:bg-[color-mix(in_srgb,var(--err)_10%,transparent)]"

// ❌ Evitar colores hardcoded
className="text-gray-400 bg-zinc-900"
```

### Composición con clsx

```tsx
import { clsx } from 'clsx'

className={clsx(
  'base-classes',
  condition && 'conditional-class',
  variant === 'danger' && 'danger-classes',
  className  // prop forwarding al final
)}
```

### Inline styles solo para valores dinámicos

```tsx
// ✅ Dinámico → inline style
style={{ width: `${pct}%`, background: color }}

// ❌ Estático → clase Tailwind
style={{ display: 'flex' }}  // → className="flex"
```

---

## 16. Base CSS global

```css
* { box-sizing: border-box; }
html, body { height: 100%; overflow: hidden; }  /* IDE: sin scroll de página */
body {
  background: var(--surface);
  color: var(--fg);
  font-family: var(--font-sans);
  font-size: var(--base-size);
}
```

Utilidades:

```css
.no-select { user-select: none; }
.truncate  { overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
.topbar    { height: var(--topbar-h); }
```

Media queries:

```css
@media (max-width: 1200px) { .topbar-label { display: none; } }
@media (max-width: 960px)  { .topbar-label-sm { display: none; } }
```

---

## 17. Editor de código embebido

Patrón de editor dividido en dos capas absolutas (highlight + textarea transparente):

```
position: relative
├─ .editor-highlight  (z-index: 1, pointer-events: none)  — HTML coloreado
├─ .editor-curline    (z-index: 0, pointer-events: none)  — highlight línea activa
├─ .editor-indent-guide (z-index: 0)                      — guías de indentación
└─ .editor-textarea   (z-index: 2, color: transparent, caret-color: var(--fg))
```

El texto del `textarea` es invisible; el color del cursor es `--fg`. El highlight renderiza el mismo contenido coloreado debajo.

```css
/* Línea activa */
.editor-curline {
  background: rgba(255,255,255,0.03);
  border-left: 2px solid rgba(255,255,255,0.08);
}

/* Match de búsqueda */
.editor-search-match {
  background: rgba(251,191,36,0.25);
  border: 1px solid rgba(251,191,36,0.5);
  border-radius: 2px;
}
.editor-search-match.active {
  background: rgba(251,191,36,0.45);
  border-color: rgba(251,191,36,0.9);
}
```

---

## 18. Semántica de estados

| Estado | Color token | Uso |
|---|---|---|
| Éxito / running | `--ok` `#22c55e` | Build OK, VM running, badges verdes |
| Error / stopped | `--err` `#ef4444` | Errores de compilación, botones danger |
| Advertencia / suspended | `--warn` `#f59e0b` | VM suspendida, trial license |
| Info | `--info` `#93c5fd` | Mensajes informativos |

---

## 19. Aplicar el estilo en una nueva app

### Checklist de setup

- [ ] Importar `IBM Plex Sans` + `IBM Plex Mono` (Google Fonts o self-hosted)
- [ ] Copiar el bloque de `:root` + `.dark` + `.light` de `globals.css`
- [ ] Montar `ContextMenuProvider` una vez en el root
- [ ] Aplicar `overflow: hidden` al `body` si es una app de escritorio
- [ ] Usar `clsx` para composición de clases
- [ ] Para Tauri: configurar `decorations: false` en `tauri.conf.json` y montar el componente chrome propio

### Jerarquía de superficies recomendada

```
body                → var(--surface)    #0a0a0a
sidebar / nav       → var(--surface-1)  #111111
cards / modals      → var(--surface-2)  #171717
inputs / dropdowns  → var(--surface-3)  #1f1f1f
toggles / chips     → var(--surface-4)  #282828
```

### Modelo de botón correcto

```
Acción primaria de pantalla  → Btn variant="solid"   (fondo --fg, texto --accent-inv)
Acción secundaria            → Btn variant="outline"
Acciones inline / toolbars   → Btn variant="ghost"
Acción destructiva           → Btn variant="danger"
```

---

## 20. Lo que tsuki NO hace

- No usa sombras visibles entre panels (solo `border` de 1 px).
- No usa radios grandes — `rounded` = 4–6 px. Cards: 8–12 px max.
- No usa gradientes decorativos en la UI del IDE.
- No usa colores de acento llamativos como azul, verde o morado como color de marca. El acento es neutro (blanco/negro).
- No usa animaciones > 300 ms en transiciones de UI.
- No usa `!important` ni `@apply` de Tailwind salvo excepciones muy justificadas.
- No usa `px` fijos para tamaños de layout principales — usa `clamp()` para que escale con el viewport.