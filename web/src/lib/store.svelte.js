// Reactive transcript model plus the window.chat host API.
import { post, debug } from './host.js';

export const chat = $state({
  items: [],
  empty: {
    title: 'Ask the agent',
    subtitle: 'Describe a change, ask about your project, or pick a suggestion.',
    suggestions: [],
  },
  busy: false,
  busyLabel: '',
  lightbox: null,
});

// id -> reactive proxy, per kind (message ids and tool ids may overlap).
const messages = new Map();
const tools = new Map();
const cards = new Map();

const str = (v, d = '') => (v === undefined || v === null ? d : typeof v === 'string' ? v : String(v));
const num = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};
const obj = (v) => (v && typeof v === 'object' ? v : {});
const ROLES = ['user', 'assistant', 'system', 'error', 'notice'];

let seq = 0;
const autoId = (p) => p + '-' + ++seq;

function push(item) {
  chat.items.push(item);
  return chat.items[chat.items.length - 1];
}

function normAttachments(list) {
  if (!Array.isArray(list)) return [];
  return list
    .filter((a) => a && typeof a === 'object')
    .map((a) => {
      const dataUrl = str(a.dataUrl);
      const kind = a.kind === 'image' && /^data:image\//i.test(dataUrl) ? 'image' : 'file';
      return { name: str(a.name, 'attachment'), kind, dataUrl: kind === 'image' ? dataUrl : '', detail: str(a.detail) };
    });
}

// ---- streaming: deltas accumulate in plain buffers, flushed once per frame.
const pending = new Map(); // id -> appended text not yet in state
let frame = 0;

function schedule() {
  if (frame) return;
  const raf = typeof requestAnimationFrame === 'function' ? requestAnimationFrame : (f) => setTimeout(f, 16);
  frame = raf(flush) || 1;
  // rAF is paused in hidden/occluded webviews; make sure text still lands.
  setTimeout(() => frame && flush(), 120);
}

function flush() {
  frame = 0;
  if (!pending.size) return;
  for (const [id, text] of pending) {
    const m = messages.get(id);
    if (m) m.text += text;
  }
  pending.clear();
}

function flushOne(id) {
  const t = pending.get(id);
  if (t === undefined) return;
  pending.delete(id);
  const m = messages.get(id);
  if (m) m.text += t;
}

function ensureMessage(id, role = 'assistant') {
  let m = messages.get(id);
  if (!m) {
    m = push({ kind: 'message', id, role, author: '', text: '', attachments: [], streaming: false, stats: null, continuation: false });
    messages.set(id, m);
  }
  return m;
}

function upsertCard(kind, p, fields) {
  const id = str(p.id) || autoId(kind);
  let c = cards.get(id);
  if (!c) {
    c = push({ kind, id, outcome: '', ...fields });
    cards.set(id, c);
  } else {
    Object.assign(c, fields);
    c.outcome = '';
  }
  return c;
}

const api = {
  reset() {
    pending.clear();
    messages.clear();
    tools.clear();
    cards.clear();
    chat.items = [];
    chat.busy = false;
    chat.lightbox = null;
  },

  setTheme(p) {
    const dark = obj(p).dark;
    const root = document.documentElement;
    if (dark === true || dark === false) root.setAttribute('data-theme', dark ? 'dark' : 'light');
    else root.removeAttribute('data-theme');
  },

  setEmpty(p) {
    p = obj(p);
    if (p.title !== undefined) chat.empty.title = str(p.title);
    if (p.subtitle !== undefined) chat.empty.subtitle = str(p.subtitle);
    if (p.suggestions !== undefined)
      chat.empty.suggestions = Array.isArray(p.suggestions) ? p.suggestions.map((s) => str(s)).filter(Boolean) : [];
  },

  addMessage(p) {
    p = obj(p);
    const id = str(p.id) || autoId('msg');
    const role = ROLES.includes(p.role) ? p.role : 'assistant';
    pending.delete(id);
    const m = ensureMessage(id, role);
    m.role = role;
    m.author = str(p.author);
    m.text = str(p.text);
    m.attachments = normAttachments(p.attachments);
    m.streaming = role === 'assistant' && p.streaming === true;
    // A continuation segment resumes the same reply after tool calls or cards.
    m.continuation = role === 'assistant' && p.continuation === true;
  },

  appendDelta(p) {
    p = obj(p);
    const id = str(p.id);
    const text = str(p.text);
    if (!id) return;
    const m = ensureMessage(id);
    if (!m.streaming && m.role === 'assistant') m.streaming = true;
    if (!text) return;
    pending.set(id, (pending.get(id) || '') + text);
    schedule();
  },

  finishMessage(p) {
    const id = str(obj(p).id);
    flushOne(id);
    const m = messages.get(id);
    if (m) m.streaming = false;
  },

  upsertTool(p) {
    p = obj(p);
    const id = str(p.id) || autoId('tool');
    const status = ['running', 'complete', 'failed'].includes(p.status) ? p.status : 'running';
    let t = tools.get(id);
    if (!t) {
      t = push({ kind: 'tool', id, name: str(p.name, 'tool'), status, detail: str(p.detail), input: str(p.input), output: str(p.output) });
      tools.set(id, t);
      return;
    }
    t.status = status;
    for (const k of ['name', 'detail', 'input', 'output']) {
      if (p[k] !== undefined && p[k] !== null) t[k] = typeof p[k] === 'string' ? p[k] : JSON.stringify(p[k]);
    }
  },

  showProposal(p) {
    p = obj(p);
    const files = (Array.isArray(p.files) ? p.files : [])
      .filter((f) => f && typeof f === 'object')
      .map((f) => ({ path: str(f.path, 'untitled'), revision: str(f.revision), added: num(f.added), removed: num(f.removed), diff: str(f.diff) }));
    upsertCard('proposal', p, { title: str(p.title), files, canApply: p.canApply !== false });
  },

  showPermission(p) {
    p = obj(p);
    upsertCard('permission', p, {
      title: str(p.title, 'Permission requested'),
      details: typeof p.details === 'string' || p.details == null ? str(p.details) : JSON.stringify(p.details),
      canAccept: p.canAccept !== false,
    });
  },

  resolveCard(p) {
    p = obj(p);
    const c = cards.get(str(p.id));
    if (c) c.outcome = str(p.outcome, 'dismissed');
  },

  setBusy(p) {
    p = obj(p);
    chat.busy = !!p.busy;
    chat.busyLabel = str(p.label);
  },

  setStats(p) {
    p = obj(p);
    const m = messages.get(str(p.id));
    if (!m) return;
    const s = {
      tokensOut: num(p.tokensOut),
      tokensIn: num(p.tokensIn),
      tokensPerSecond: num(p.tokensPerSecond),
      elapsedMs: num(p.elapsedMs),
      estimated: !!p.estimated,
    };
    const o = m.stats;
    if (o && o.tokensOut === s.tokensOut && o.tokensIn === s.tokensIn && o.tokensPerSecond === s.tokensPerSecond && o.elapsedMs === s.elapsedMs && o.estimated === s.estimated) return;
    m.stats = s;
  },

  // Host Edit > Copy: reply with the current selection (empty when nothing is selected).
  copySelection() {
    const sel = window.getSelection ? window.getSelection() : null;
    post({ action: 'copySelection', text: sel ? sel.toString() : '' });
  },

  // Host Edit > Select All: select the conversation content only (not page chrome).
  selectAll() {
    const root = document.querySelector('.content') || document.body;
    const sel = window.getSelection ? window.getSelection() : null;
    if (!sel || !root) return;
    sel.selectAllChildren(root);
  },
};

// Wrap every entry point: unknown input must never throw into the host.
export const chatApi = {};
for (const [name, fn] of Object.entries(api)) {
  chatApi[name] = function (arg) {
    try {
      fn(arg);
    } catch (e) {
      debug(name + ': ' + (e && e.stack ? e.stack : e));
    }
    return true;
  };
}

export { post, debug };
