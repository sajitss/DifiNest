import type { Category, WebApp } from '../types/app';

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'all',
    name: 'All Applications',
    description: 'Browse the complete catalogue of applications',
    iconName: 'Grid'
  },
  {
    id: 'ui-components',
    name: 'UI Components & Kits',
    description: 'Interactive widgets, dynamic controls, and design system components',
    iconName: 'Layout'
  },
  {
    id: 'games-canvas',
    name: 'Games & Canvas',
    description: 'Interactive HTML5 Canvas, 2D/3D physics, particle effects, and web games',
    iconName: 'Gamepad2'
  },
  {
    id: 'dashboards',
    name: 'Dashboards & Tools',
    description: 'Productivity apps, task boards, analytics visualizers, and admin layouts',
    iconName: 'Kanban'
  },
  {
    id: 'utilities',
    name: 'Utilities & Editors',
    description: 'Converters, text formatters, live previewers, and developer helpers',
    iconName: 'Wrench'
  },
  {
    id: 'css-art',
    name: 'CSS Art & Animations',
    description: 'Pure CSS graphics, keyframe animations, and glowing neon effects',
    iconName: 'Sparkles'
  }
];

export const INITIAL_APPS: WebApp[] = [
  {
    id: 'app-matrix-synth',
    name: 'Cyberpunk Matrix Rain & Audio Synth',
    description: 'Interactive HTML5 Canvas Matrix stream with Web Audio API sound synthesis. Move your cursor to warp streams or click to generate sound frequencies.',
    category: 'games-canvas',
    tags: ['canvas', 'audio-api', 'cyberpunk', 'animation', 'interactive'],
    author: 'System Admin',
    createdAt: '2026-08-20T10:00:00.000Z',
    updatedAt: '2026-08-21T12:00:00.000Z',
    isFeatured: true,
    viewCount: 142,
    thumbnailColor: 'from-emerald-900 to-teal-950',
    html: `<div class="container">
  <canvas id="matrixCanvas"></canvas>
  <div class="hud">
    <div class="title">⚡ CYBERPUNK MATRIX STREAM</div>
    <div class="controls">
      <button id="audioToggle">🔊 Enable Audio Synth</button>
      <button id="speedBtn">⚡ Speed: Normal</button>
      <button id="resetBtn">🔄 Reset Streams</button>
    </div>
    <div class="status" id="statusText">Move mouse to distort flow. Click to trigger synth chord.</div>
  </div>
</div>`,
    css: `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Courier New', Courier, monospace;
}

body, html {
  width: 100%;
  height: 100%;
  background-color: #030a08;
  overflow: hidden;
}

.container {
  position: relative;
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

#matrixCanvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.hud {
  position: absolute;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(4, 20, 15, 0.85);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(16, 185, 129, 0.3);
  padding: 16px 24px;
  border-radius: 14px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.8), 0 0 20px rgba(16, 185, 129, 0.2);
  color: #10b981;
  text-align: center;
  z-index: 10;
  min-width: 320px;
}

.title {
  font-size: 14px;
  font-weight: bold;
  letter-spacing: 2px;
  margin-bottom: 12px;
  text-shadow: 0 0 8px rgba(16, 185, 129, 0.8);
}

.controls {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-bottom: 10px;
}

button {
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid #10b981;
  color: #a7f3d0;
  padding: 8px 14px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s ease;
}

button:hover {
  background: #10b981;
  color: #030a08;
  box-shadow: 0 0 12px #10b981;
}

.status {
  font-size: 11px;
  color: #6ee7b7;
  opacity: 0.8;
}`,
    js: `const canvas = document.getElementById('matrixCanvas');
const ctx = canvas.getContext('2d');

let width = canvas.width = window.innerWidth;
let height = canvas.height = window.innerHeight;

window.addEventListener('resize', () => {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
  initColumns();
});

const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZアカサタナハマヤラワガザダバパイキシチニヒミリヰギジヂビピウクスツヌフムユルグズブヅプエケセテネヘメレヱゲゼデベペオコソトノホモヨロヲゴゾドボポ';
const fontSize = 16;
let columns = Math.floor(width / fontSize);
let drops = [];
let speeds = [];

function initColumns() {
  columns = Math.floor(width / fontSize);
  drops = [];
  speeds = [];
  for (let i = 0; i < columns; i++) {
    drops[i] = Math.random() * -100;
    speeds[i] = 1 + Math.random() * 2;
  }
}
initColumns();

let mouseX = width / 2;
let mouseY = height / 2;
let speedMultiplier = 1;

canvas.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

// Audio Synth Setup
let audioCtx = null;
let audioEnabled = false;

document.getElementById('audioToggle').addEventListener('click', () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  audioEnabled = !audioEnabled;
  document.getElementById('audioToggle').innerText = audioEnabled ? '🔊 Audio Synth: ON' : '🔈 Audio Synth: OFF';
  document.getElementById('statusText').innerText = audioEnabled ? 'Audio Synth active! Click canvas for sound.' : 'Move mouse to distort stream.';
});

document.getElementById('speedBtn').addEventListener('click', () => {
  speedMultiplier = speedMultiplier === 1 ? 2.5 : (speedMultiplier === 2.5 ? 0.4 : 1);
  const label = speedMultiplier === 1 ? 'Normal' : (speedMultiplier > 1 ? 'Hyper' : 'Slow');
  document.getElementById('speedBtn').innerText = '⚡ Speed: ' + label;
});

document.getElementById('resetBtn').addEventListener('click', initColumns);

canvas.addEventListener('click', (e) => {
  playSynthChord(e.clientX / width);
});

function playSynthChord(ratio) {
  if (!audioEnabled || !audioCtx) return;
  const freqs = [220, 277.18, 329.63, 440, 554.37];
  const baseFreq = freqs[Math.floor(ratio * freqs.length)];
  
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(baseFreq, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, audioCtx.currentTime + 0.3);
  
  gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
  
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  
  osc.start();
  osc.stop(audioCtx.currentTime + 0.5);
}

function draw() {
  ctx.fillStyle = 'rgba(3, 10, 8, 0.08)';
  ctx.fillRect(0, 0, width, height);

  ctx.font = fontSize + 'px monospace';

  for (let i = 0; i < drops.length; i++) {
    const text = chars[Math.floor(Math.random() * chars.length)];
    const x = i * fontSize;
    const y = drops[i] * fontSize;

    const distToMouse = Math.hypot(x - mouseX, y - mouseY);
    if (distToMouse < 120) {
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#10b981';
      ctx.shadowBlur = 15;
    } else {
      ctx.fillStyle = i % 5 === 0 ? '#6ee7b7' : '#10b981';
      ctx.shadowBlur = 0;
    }

    ctx.fillText(text, x, y);

    if (y > height && Math.random() > 0.975) {
      drops[i] = 0;
    }
    drops[i] += speeds[i] * speedMultiplier;
  }
  requestAnimationFrame(draw);
}

draw();`
  },
  {
    id: 'app-glass-ui',
    name: 'Glassmorphism Interactive Design Suite',
    description: 'Dynamic frosted glass UI control panel with live customizers for backdrop blur, border shine, gradient hues, and instant CSS code generator.',
    category: 'ui-components',
    tags: ['glassmorphism', 'ui-kit', 'css-vars', 'customizer', 'modern'],
    author: 'Design Team',
    createdAt: '2026-08-19T14:30:00.000Z',
    updatedAt: '2026-08-21T09:15:00.000Z',
    isFeatured: true,
    viewCount: 205,
    thumbnailColor: 'from-purple-900 to-indigo-950',
    html: `<div class="glass-bg">
  <div class="glow-orb orb-1"></div>
  <div class="glow-orb orb-2"></div>

  <div class="glass-card">
    <div class="card-header">
      <span class="badge">UI Customizer</span>
      <h2>Frosted Glass Studio</h2>
      <p>Adjust parameters to generate live CSS glass styles.</p>
    </div>

    <div class="controls-grid">
      <div class="control-group">
        <label>Opacity: <span id="valOpacity">0.2</span></label>
        <input type="range" id="opacitySlider" min="0.05" max="0.6" step="0.05" value="0.2">
      </div>

      <div class="control-group">
        <label>Backdrop Blur: <span id="valBlur">16px</span></label>
        <input type="range" id="blurSlider" min="0" max="40" step="2" value="16">
      </div>

      <div class="control-group">
        <label>Border Glow: <span id="valBorder">0.25</span></label>
        <input type="range" id="borderSlider" min="0" max="0.8" step="0.05" value="0.25">
      </div>

      <div class="control-group">
        <label>Accent Hue: <span id="valHue">260°</span></label>
        <input type="range" id="hueSlider" min="0" max="360" step="5" value="260">
      </div>
    </div>

    <div class="sample-widgets">
      <div class="widget-item">
        <div class="widget-icon">⚡</div>
        <div>
          <h4>Performance</h4>
          <span class="muted">99.8% Uptime</span>
        </div>
      </div>
      <div class="widget-item">
        <div class="widget-icon">🛡️</div>
        <div>
          <h4>Security PIN</h4>
          <span class="muted">Encrypted Storage</span>
        </div>
      </div>
    </div>

    <div class="code-box">
      <pre id="cssSnippet">background: rgba(255, 255, 255, 0.2);
backdrop-filter: blur(16px);
border: 1px solid rgba(255, 255, 255, 0.25);</pre>
      <button id="copyCssBtn">📋 Copy CSS</button>
    </div>
  </div>
</div>`,
    css: `:root {
  --glass-opacity: 0.2;
  --glass-blur: 16px;
  --glass-border: 0.25;
  --accent-hue: 260;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
}

body, html {
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #0f0c1b;
  color: #fff;
}

.glass-bg {
  position: relative;
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: radial-gradient(circle at 50% 50%, hsl(var(--accent-hue), 60%, 15%), #0a0714);
}

.glow-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.65;
  animation: floatOrb 8s infinite alternate ease-in-out;
}

.orb-1 {
  width: 320px;
  height: 320px;
  background: hsl(var(--accent-hue), 85%, 55%);
  top: 15%;
  left: 20%;
}

.orb-2 {
  width: 280px;
  height: 280px;
  background: hsl(calc(var(--accent-hue) + 60), 90%, 50%);
  bottom: 15%;
  right: 20%;
  animation-delay: -4s;
}

@keyframes floatOrb {
  0% { transform: translate(0, 0) scale(1); }
  100% { transform: translate(50px, -40px) scale(1.15); }
}

.glass-card {
  position: relative;
  z-index: 10;
  width: 480px;
  max-width: 90vw;
  padding: 32px;
  border-radius: 24px;
  background: rgba(255, 255, 255, var(--glass-opacity));
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border: 1px solid rgba(255, 255, 255, var(--glass-border));
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.3);
}

.card-header h2 {
  font-size: 24px;
  margin: 6px 0;
}

.card-header p {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 20px;
}

.badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 12px;
  background: hsl(var(--accent-hue), 80%, 45%);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.controls-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 20px;
}

.control-group label {
  display: block;
  font-size: 12px;
  margin-bottom: 6px;
  color: rgba(255, 255, 255, 0.85);
}

.control-group label span {
  font-weight: bold;
  color: hsl(var(--accent-hue), 90%, 75%);
}

input[type=range] {
  width: 100%;
  accent-color: hsl(var(--accent-hue), 85%, 60%);
  cursor: pointer;
}

.sample-widgets {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.widget-item {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.widget-icon {
  font-size: 20px;
}

.widget-item h4 {
  font-size: 13px;
}

.widget-item .muted {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.6);
}

.code-box {
  position: relative;
  background: rgba(0, 0, 0, 0.4);
  padding: 14px;
  border-radius: 12px;
  font-family: monospace;
  font-size: 11px;
  line-height: 1.5;
  color: #d8b4fe;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.code-box button {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(255, 255, 255, 0.15);
  border: none;
  color: #fff;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 11px;
  cursor: pointer;
}

.code-box button:hover {
  background: hsl(var(--accent-hue), 80%, 50%);
}`,
    js: `const opacitySlider = document.getElementById('opacitySlider');
const blurSlider = document.getElementById('blurSlider');
const borderSlider = document.getElementById('borderSlider');
const hueSlider = document.getElementById('hueSlider');

const valOpacity = document.getElementById('valOpacity');
const valBlur = document.getElementById('valBlur');
const valBorder = document.getElementById('valBorder');
const valHue = document.getElementById('valHue');
const cssSnippet = document.getElementById('cssSnippet');
const copyCssBtn = document.getElementById('copyCssBtn');

function updateStyles() {
  const op = opacitySlider.value;
  const bl = blurSlider.value + 'px';
  const bo = borderSlider.value;
  const hu = hueSlider.value;

  document.documentElement.style.setProperty('--glass-opacity', op);
  document.documentElement.style.setProperty('--glass-blur', bl);
  document.documentElement.style.setProperty('--glass-border', bo);
  document.documentElement.style.setProperty('--accent-hue', hu);

  valOpacity.textContent = op;
  valBlur.textContent = bl;
  valBorder.textContent = bo;
  valHue.textContent = hu + '°';

  cssSnippet.textContent = \`background: rgba(255, 255, 255, \${op});\\nbackdrop-filter: blur(\${bl});\\nborder: 1px solid rgba(255, 255, 255, \${bo});\`;
}

[opacitySlider, blurSlider, borderSlider, hueSlider].forEach(slider => {
  slider.addEventListener('input', updateStyles);
});

copyCssBtn.addEventListener('click', () => {
  navigator.clipboard.writeText(cssSnippet.textContent);
  copyCssBtn.textContent = '✅ Copied!';
  setTimeout(() => {
    copyCssBtn.textContent = '📋 Copy CSS';
  }, 2000);
});`
  },
  {
    id: 'app-kanban-flow',
    name: 'Kanban Flow Interactive Task Board',
    description: 'Full-featured task management application with drag-and-drop workflow, task creation, tag filters, and column state persistence.',
    category: 'dashboards',
    tags: ['kanban', 'drag-drop', 'productivity', 'dashboard', 'interactive'],
    author: 'DevOps Team',
    createdAt: '2026-08-18T11:20:00.000Z',
    updatedAt: '2026-08-20T16:45:00.000Z',
    isFeatured: true,
    viewCount: 188,
    thumbnailColor: 'from-blue-900 to-slate-950',
    html: `<div class="kanban-app">
  <header class="app-header">
    <div class="logo">📌 Kanban Flow Board</div>
    <div class="actions">
      <button id="addTaskBtn" class="btn-primary">+ Add New Task</button>
      <button id="clearAllBtn" class="btn-secondary">🧹 Reset Default Board</button>
    </div>
  </header>

  <main class="board-grid">
    <div class="column" id="col-todo" data-status="todo">
      <div class="col-header todo-hdr">
        <h3>📋 To Do</h3>
        <span class="count" id="count-todo">0</span>
      </div>
      <div class="task-list" id="list-todo"></div>
    </div>

    <div class="column" id="col-progress" data-status="progress">
      <div class="col-header progress-hdr">
        <h3>⚡ In Progress</h3>
        <span class="count" id="count-progress">0</span>
      </div>
      <div class="task-list" id="list-progress"></div>
    </div>

    <div class="column" id="col-done" data-status="done">
      <div class="col-header done-hdr">
        <h3>✅ Completed</h3>
        <span class="count" id="count-done">0</span>
      </div>
      <div class="task-list" id="list-done"></div>
    </div>
  </main>
</div>`,
    css: `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

body, html {
  width: 100%;
  height: 100%;
  background: #0f172a;
  color: #f8fafc;
}

.kanban-app {
  display: flex;
  flex-direction: column;
  height: 100vh;
  padding: 20px;
}

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 20px;
  border-bottom: 1px solid #334155;
  margin-bottom: 20px;
}

.logo {
  font-size: 20px;
  font-weight: 700;
  color: #38bdf8;
}

.actions {
  display: flex;
  gap: 10px;
}

button {
  padding: 8px 16px;
  border-radius: 8px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary {
  background: #0284c7;
  color: #fff;
}

.btn-primary:hover {
  background: #0369a1;
}

.btn-secondary {
  background: #334155;
  color: #94a3b8;
}

.btn-secondary:hover {
  background: #475569;
  color: #fff;
}

.board-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  flex: 1;
  overflow: hidden;
}

.column {
  background: #1e293b;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  border: 1px solid #334155;
}

.col-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 10px;
  border-bottom: 2px solid;
}

.todo-hdr { border-color: #f59e0b; }
.progress-hdr { border-color: #38bdf8; }
.done-hdr { border-color: #10b981; }

.col-header h3 {
  font-size: 15px;
}

.count {
  background: #334155;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
}

.task-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 100px;
}

.task-card {
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 10px;
  padding: 14px;
  cursor: grab;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.task-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0,0,0,0.4);
  border-color: #38bdf8;
}

.task-card.dragging {
  opacity: 0.5;
}

.task-title {
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 8px;
}

.task-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11px;
}

.tag {
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 600;
  text-transform: uppercase;
}

.tag-high { background: rgba(239, 68, 68, 0.2); color: #f87171; }
.tag-medium { background: rgba(245, 158, 11, 0.2); color: #fbbf24; }
.tag-low { background: rgba(16, 185, 129, 0.2); color: #34d399; }

.del-btn {
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  font-size: 14px;
  padding: 0 4px;
}

.del-btn:hover {
  color: #ef4444;
}`,
    js: `let tasks = [
  { id: '1', title: 'Upload DifiNest source templates', status: 'done', priority: 'high' },
  { id: '2', title: 'Implement CSS Glassmorphism previewer', status: 'progress', priority: 'medium' },
  { id: '3', title: 'Add dark/light theme switch to navigation', status: 'todo', priority: 'low' },
  { id: '4', title: 'Test drag and drop event handlers', status: 'progress', priority: 'high' }
];

function renderBoard() {
  ['todo', 'progress', 'done'].forEach(status => {
    const listEl = document.getElementById('list-' + status);
    const countEl = document.getElementById('count-' + status);
    listEl.innerHTML = '';
    
    const filtered = tasks.filter(t => t.status === status);
    countEl.textContent = filtered.length;

    filtered.forEach(task => {
      const card = document.createElement('div');
      card.className = 'task-card';
      card.draggable = true;
      card.dataset.id = task.id;

      card.innerHTML = \`
        <div class="task-title">\${task.title}</div>
        <div class="task-meta">
          <span class="tag tag-\${task.priority}">\${task.priority}</span>
          <button class="del-btn" onclick="deleteTask('\${task.id}')">🗑️</button>
        </div>
      \`;

      card.addEventListener('dragstart', (e) => {
        card.classList.add('dragging');
        e.dataTransfer.setData('text/plain', task.id);
      });

      card.addEventListener('dragend', () => {
        card.classList.remove('dragging');
      });

      listEl.appendChild(card);
    });
  });
}

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  renderBoard();
}

window.deleteTask = deleteTask;

document.querySelectorAll('.column').forEach(col => {
  col.addEventListener('dragover', (e) => {
    e.preventDefault();
    col.style.background = '#1e293b';
  });

  col.addEventListener('drop', (e) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    const newStatus = col.dataset.status;
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      task.status = newStatus;
      renderBoard();
    }
  });
});

document.getElementById('addTaskBtn').addEventListener('click', () => {
  const title = prompt('Enter Task Title:');
  if (title) {
    tasks.push({
      id: Date.now().toString(),
      title,
      status: 'todo',
      priority: 'medium'
    });
    renderBoard();
  }
});

document.getElementById('clearAllBtn').addEventListener('click', () => {
  tasks = [
    { id: '1', title: 'Create HTML, CSS, JS starter package', status: 'todo', priority: 'high' },
    { id: '2', title: 'Verify responsive canvas preview', status: 'progress', priority: 'medium' }
  ];
  renderBoard();
});

renderBoard();`
  },
  {
    id: 'app-3d-gravity',
    name: '3D Orbit Particle Physics Sandbox',
    description: 'Interactive HTML5 particle simulation with velocity decay, gravitational attraction fields, and real-time particle count counters.',
    category: 'games-canvas',
    tags: ['canvas', 'physics', 'particles', 'interactive', 'gravity'],
    author: 'Canvas Lab',
    createdAt: '2026-08-17T08:00:00.000Z',
    updatedAt: '2026-08-20T19:00:00.000Z',
    isFeatured: false,
    viewCount: 96,
    thumbnailColor: 'from-amber-900 to-slate-950',
    html: `<canvas id="spaceCanvas"></canvas>
<div class="hud-panel">
  <h3>✨ Gravity Sandbox</h3>
  <div class="stat">Particles: <span id="pCount">0</span></div>
  <div class="btn-group">
    <button id="addBurstBtn">💥 Spawn Burst</button>
    <button id="resetCanvasBtn">🧹 Clear</button>
  </div>
  <p class="hint">Click anywhere on canvas to create a gravitational black hole!</p>
</div>`,
    css: `* { margin: 0; padding: 0; box-sizing: border-box; }
body, html { width: 100%; height: 100%; overflow: hidden; background: #050508; font-family: system-ui, sans-serif; }
#spaceCanvas { position: absolute; top:0; left:0; width:100%; height:100%; }
.hud-panel {
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(15, 15, 25, 0.85);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(245, 158, 11, 0.3);
  padding: 16px;
  border-radius: 12px;
  color: #fff;
  width: 220px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.6);
}
.hud-panel h3 { font-size: 15px; color: #fbbf24; margin-bottom: 8px; }
.stat { font-size: 12px; margin-bottom: 12px; color: #cbd5e1; }
.btn-group { display: flex; gap: 8px; margin-bottom: 10px; }
button { flex: 1; background: rgba(245, 158, 11, 0.2); border: 1px solid #fbbf24; color: #fef08a; padding: 6px; border-radius: 6px; font-size: 11px; cursor: pointer; }
button:hover { background: #fbbf24; color: #000; }
.hint { font-size: 10px; color: #94a3b8; line-height: 1.4; }`,
    js: `const canvas = document.getElementById('spaceCanvas');
const ctx = canvas.getContext('2d');
let w = canvas.width = window.innerWidth;
let h = canvas.height = window.innerHeight;

window.addEventListener('resize', () => {
  w = canvas.width = window.innerWidth;
  h = canvas.height = window.innerHeight;
});

class Particle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = (Math.random() - 0.5) * 4;
    this.vy = (Math.random() - 0.5) * 4;
    this.radius = Math.random() * 2.5 + 1;
    this.hue = Math.random() * 60 + 20; // warm gold/orange hues
    this.alpha = 1;
  }
  update(gravityX, gravityY) {
    if (gravityX !== null && gravityY !== null) {
      const dx = gravityX - this.x;
      const dy = gravityY - this.y;
      const dist = Math.hypot(dx, dy);
      if (dist > 10) {
        this.vx += (dx / dist) * 0.4;
        this.vy += (dy / dist) * 0.4;
      }
    }
    this.vx *= 0.98;
    this.vy *= 0.98;
    this.x += this.vx;
    this.y += this.vy;
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = \`hsla(\${this.hue}, 90%, 60%, \${this.alpha})\`;
    ctx.fill();
  }
}

let particles = [];
let gravityPoint = null;

function spawn(x, y, count = 30) {
  for (let i = 0; i < count; i++) {
    particles.push(new Particle(x, y));
  }
  document.getElementById('pCount').textContent = particles.length;
}

spawn(w / 2, h / 2, 80);

canvas.addEventListener('mousedown', (e) => {
  gravityPoint = { x: e.clientX, y: e.clientY };
  spawn(e.clientX, e.clientY, 20);
});

canvas.addEventListener('mousemove', (e) => {
  if (e.buttons === 1) {
    gravityPoint = { x: e.clientX, y: e.clientY };
  }
});

canvas.addEventListener('mouseup', () => {
  gravityPoint = null;
});

document.getElementById('addBurstBtn').addEventListener('click', () => {
  spawn(w / 2, h / 2, 100);
});

document.getElementById('resetCanvasBtn').addEventListener('click', () => {
  particles = [];
  document.getElementById('pCount').textContent = 0;
});

function animate() {
  ctx.fillStyle = 'rgba(5, 5, 8, 0.2)';
  ctx.fillRect(0, 0, w, h);

  if (gravityPoint) {
    ctx.beginPath();
    ctx.arc(gravityPoint.x, gravityPoint.y, 8, 0, Math.PI * 2);
    ctx.fillStyle = '#fbbf24';
    ctx.shadowColor = '#fbbf24';
    ctx.shadowBlur = 15;
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  const gx = gravityPoint ? gravityPoint.x : null;
  const gy = gravityPoint ? gravityPoint.y : null;

  particles.forEach(p => {
    p.update(gx, gy);
    p.draw();
  });

  requestAnimationFrame(animate);
}
animate();`
  },
  {
    id: 'app-markdown-studio',
    name: 'Live Markdown Studio & Previewer',
    description: 'Instant live split-screen Markdown authoring studio with real-time HTML formatting, word counter, and instant export tools.',
    category: 'utilities',
    tags: ['markdown', 'editor', 'previewer', 'text-tool', 'utilities'],
    author: 'Tools Division',
    createdAt: '2026-08-16T12:00:00.000Z',
    updatedAt: '2026-08-21T08:30:00.000Z',
    isFeatured: false,
    viewCount: 112,
    thumbnailColor: 'from-emerald-900 to-cyan-950',
    html: `<div class="editor-container">
  <div class="toolbar">
    <span class="brand">📝 Markdown Studio</span>
    <div class="tools">
      <button onclick="insertMd('# ')">H1</button>
      <button onclick="insertMd('## ')">H2</button>
      <button onclick="insertMd('**', '**')">Bold</button>
      <button onclick="insertMd('*', '*')">Italic</button>
      <button onclick="insertMd('- ')">List</button>
      <button onclick="insertMd('\`', '\`')">Code</button>
    </div>
    <div class="stats">Words: <span id="wordCount">0</span></div>
  </div>
  <div class="pane-split">
    <textarea id="markdownInput" placeholder="Type Markdown here..."></textarea>
    <div id="htmlPreview" class="preview-pane"></div>
  </div>
</div>`,
    css: `* { margin: 0; padding: 0; box-sizing: border-box; font-family: system-ui, sans-serif; }
body, html { width: 100%; height: 100%; background: #0d1117; color: #c9d1d9; }
.editor-container { display: flex; flex-direction: column; height: 100vh; }
.toolbar { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; background: #161b22; border-bottom: 1px solid #30363d; }
.brand { font-weight: bold; color: #58a6ff; font-size: 14px; }
.tools { display: flex; gap: 6px; }
button { background: #21262d; border: 1px solid #30363d; color: #c9d1d9; padding: 4px 10px; border-radius: 6px; cursor: pointer; font-size: 12px; }
button:hover { background: #30363d; color: #58a6ff; }
.stats { font-size: 12px; color: #8b949e; }
.pane-split { display: flex; flex: 1; overflow: hidden; }
textarea { flex: 1; background: #0d1117; color: #c9d1d9; padding: 16px; border: none; border-right: 1px solid #30363d; resize: none; font-family: monospace; font-size: 13px; outline: none; line-height: 1.6; }
.preview-pane { flex: 1; padding: 16px; overflow-y: auto; background: #0d1117; font-size: 14px; line-height: 1.6; }
.preview-pane h1 { border-bottom: 1px solid #30363d; padding-bottom: 8px; margin-bottom: 16px; color: #58a6ff; }
.preview-pane h2 { margin-top: 16px; margin-bottom: 12px; color: #79c0ff; }
.preview-pane ul { padding-left: 20px; margin-bottom: 12px; }
.preview-pane code { background: rgba(110, 118, 129, 0.4); padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 12px; }`,
    js: `const input = document.getElementById('markdownInput');
const preview = document.getElementById('htmlPreview');
const wordCount = document.getElementById('wordCount');

const sampleMarkdown = \`# Welcome to DifiNest Markdown Studio

DifiNest allows admins to **upload, edit, and test** HTML, CSS, and JS web applications in real time!

## Features Checklist
- Real-time Markdown rendering
- Interactive code playground
- Application categorization & search
- Clean admin workflow

\`\`Try editing this text directly!\`\`\`;

input.value = sampleMarkdown;

function parseMarkdown(md) {
  let html = md
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/^## (.*$)/gim, '<h2>$2</h2>'.replace('$2', '$1'))
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/\\*\\*(.*)\\*\\*/gim, '<strong>$1</strong>')
    .replace(/\\*(.*)\\*/gim, '<em>$1</em>')
    .replace(/\`\`(.*)\`\`/gim, '<code>$1</code>')
    .replace(/^\- (.*$)/gim, '<ul><li>$1</li></ul>')
    .replace(/\n\n/gim, '<p></p>');
  return html;
}

function updatePreview() {
  const text = input.value;
  preview.innerHTML = parseMarkdown(text);
  const words = text.trim() ? text.trim().split(/\\s+/).length : 0;
  wordCount.textContent = words;
}

input.addEventListener('input', updatePreview);

window.insertMd = function(before, after = '') {
  const start = input.selectionStart;
  const end = input.selectionEnd;
  const val = input.value;
  input.value = val.substring(0, start) + before + val.substring(start, end) + after + val.substring(end);
  updatePreview();
  input.focus();
};

updatePreview();`
  },
  {
    id: 'app-cyber-clock',
    name: 'Cyberpunk Neon Analog Clock & Stopwatch',
    description: 'Stylized glowing neon analog clock with precision lap stopwatch and glowing CSS SVG hands.',
    category: 'css-art',
    tags: ['css-art', 'neon', 'clock', 'stopwatch', 'cyberpunk'],
    author: 'CSS Artists',
    createdAt: '2026-08-15T09:00:00.000Z',
    updatedAt: '2026-08-19T10:00:00.000Z',
    isFeatured: false,
    viewCount: 165,
    thumbnailColor: 'from-pink-900 to-rose-950',
    html: `<div class="clock-stage">
  <div class="clock-outer">
    <div class="hand hour-hand" id="hourHand"></div>
    <div class="hand minute-hand" id="minHand"></div>
    <div class="hand second-hand" id="secHand"></div>
    <div class="center-cap"></div>
    <div class="digital-readout" id="digitalTime">00:00:00</div>
  </div>

  <div class="stopwatch-card">
    <div class="sw-time" id="swDisplay">00:00.00</div>
    <div class="sw-controls">
      <button id="swStartBtn">▶ Start</button>
      <button id="swResetBtn">⏱️ Reset</button>
    </div>
  </div>
</div>`,
    css: `* { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Courier New', monospace; }
body, html { width: 100%; height: 100%; overflow: hidden; background: #07030e; color: #ff007f; }
.clock-stage { width: 100vw; height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 30px; }
.clock-outer {
  position: relative;
  width: 240px;
  height: 240px;
  border-radius: 50%;
  background: rgba(15, 5, 25, 0.9);
  border: 2px solid #ff007f;
  box-shadow: 0 0 20px #ff007f, inset 0 0 15px rgba(255, 0, 127, 0.4);
}
.hand {
  position: absolute;
  bottom: 50%;
  left: 50%;
  transform-origin: bottom center;
  border-radius: 4px;
}
.hour-hand { width: 4px; height: 60px; background: #00f0ff; box-shadow: 0 0 8px #00f0ff; margin-left: -2px; }
.minute-hand { width: 3px; height: 85px; background: #ff007f; box-shadow: 0 0 8px #ff007f; margin-left: -1.5px; }
.second-hand { width: 1.5px; height: 95px; background: #ffe600; box-shadow: 0 0 6px #ffe600; margin-left: -0.75px; }
.center-cap { position: absolute; top: 50%; left: 50%; width: 12px; height: 12px; background: #fff; border-radius: 50%; transform: translate(-50%, -50%); box-shadow: 0 0 10px #fff; }
.digital-readout { position: absolute; bottom: 40px; left: 50%; transform: translateX(-50%); font-size: 13px; font-weight: bold; color: #00f0ff; text-shadow: 0 0 6px #00f0ff; }

.stopwatch-card {
  background: rgba(255, 0, 127, 0.1);
  border: 1px solid #ff007f;
  padding: 16px 24px;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 0 15px rgba(255, 0, 127, 0.2);
}
.sw-time { font-size: 22px; font-weight: bold; color: #ffe600; margin-bottom: 12px; text-shadow: 0 0 8px #ffe600; }
.sw-controls { display: flex; gap: 10px; }
button { background: rgba(0, 240, 255, 0.2); border: 1px solid #00f0ff; color: #00f0ff; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 12px; }
button:hover { background: #00f0ff; color: #000; box-shadow: 0 0 10px #00f0ff; }`,
    js: `function updateClock() {
  const now = new Date();
  const sec = now.getSeconds() + now.getMilliseconds() / 1000;
  const min = now.getMinutes() + sec / 60;
  const hr = (now.getHours() % 12) + min / 60;

  document.getElementById('secHand').style.transform = \`rotate(\${sec * 6}deg)\`;
  document.getElementById('minHand').style.transform = \`rotate(\${min * 6}deg)\`;
  document.getElementById('hourHand').style.transform = \`rotate(\${hr * 30}deg)\`;

  const pad = n => n.toString().padStart(2, '0');
  document.getElementById('digitalTime').textContent = \`\${pad(now.getHours())}:\${pad(now.getMinutes())}:\${pad(now.getSeconds())}\`;

  requestAnimationFrame(updateClock);
}
requestAnimationFrame(updateClock);

let swRunning = false;
let swStartTime = 0;
let swElapsed = 0;
let swInterval = null;

const swDisplay = document.getElementById('swDisplay');
const swStartBtn = document.getElementById('swStartBtn');
const swResetBtn = document.getElementById('swResetBtn');

swStartBtn.addEventListener('click', () => {
  if (!swRunning) {
    swRunning = true;
    swStartTime = Date.now() - swElapsed;
    swInterval = setInterval(() => {
      swElapsed = Date.now() - swStartTime;
      const ms = Math.floor((swElapsed % 1000) / 10).toString().padStart(2, '0');
      const s = Math.floor((swElapsed / 1000) % 60).toString().padStart(2, '0');
      const m = Math.floor(swElapsed / 60000).toString().padStart(2, '0');
      swDisplay.textContent = \`\${m}:\${s}.\${ms}\`;
    }, 30);
    swStartBtn.textContent = '⏸ Pause';
  } else {
    swRunning = false;
    clearInterval(swInterval);
    swStartBtn.textContent = '▶ Resume';
  }
});

swResetBtn.addEventListener('click', () => {
  swRunning = false;
  clearInterval(swInterval);
  swElapsed = 0;
  swDisplay.textContent = '00:00.00';
  swStartBtn.textContent = '▶ Start';
});`
  }
];
