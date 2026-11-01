// Small, safe markdown renderer for untrusted model output. Every piece of
// source text passes through esc() before it is placed in the output HTML.
import { esc, safeUrl } from './escape.js';
import { highlight } from './highlight.js';

const CARET = '<span class="caret" aria-hidden="true"></span>';

// ---------- inline ----------
const PH = '\uE000'; // private-use sentinel; stripped from input below

export function inline(src) {
  const slots = [];
  const hold = (html) => PH + (slots.push(html) - 1) + PH;
  let s = String(src).replace(/\uE000/g, '');

  // code spans (before escaping, contents are literal)
  s = s.replace(/(`+)([\s\S]*?[^`])\1(?!`)/g, (_, __, code) => hold('<code>' + esc(code.replace(/^ (.*) $/, '$1')) + '</code>'));
  // links [text](url "title")
  s = s.replace(/\[([^\]\n]+)\]\(\s*<?((?:[^\s()<>]|\([^\s()<>]*\))+)>?(?:\s+"[^"]*")?\s*\)/g, (all, text, url) => {
    if (!safeUrl(url)) return hold(emph(esc(text)));
    return hold('<a href="' + esc(url) + '" data-href="' + esc(url) + '" title="' + esc(url) + '">' + emph(esc(text)) + '</a>');
  });
  // autolinks <https://..> and bare urls
  s = s.replace(/<((?:https?|file):\/\/[^\s>]+)>|\b((?:https?:\/\/|file:\/\/)[^\s<>()\[\]"'`]*[^\s<>()\[\]"'`.,;:!?*_~])/gi, (_, a, b) => {
    const url = a || b;
    return hold('<a href="' + esc(url) + '" data-href="' + esc(url) + '">' + esc(url) + '</a>');
  });

  s = emph(esc(s));
  // hard break: two trailing spaces or backslash before newline
  s = s.replace(/(?: {2,}|\\)\n/g, '<br>');
  return s.replace(new RegExp(PH + '(\\d+)' + PH, 'g'), (_, n) => slots[+n]);
}

function emph(s) {
  return s
    .replace(/\*\*(?=\S)([\s\S]*?\S)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^\w])__(?=\S)([\s\S]*?\S)__(?!\w)/g, '$1<strong>$2</strong>')
    .replace(/(^|[^*\w])\*(?=[^\s*])([^*\n]*?[^\s*])\*(?!\*)/g, '$1<em>$2</em>')
    .replace(/(^|[^\w])_(?=[^\s_])([^_\n]*?[^\s_])_(?!\w)/g, '$1<em>$2</em>')
    .replace(/~~(?=\S)([\s\S]*?\S)~~/g, '<del>$1</del>');
}

// ---------- blocks ----------
const RE = {
  fence: /^ {0,3}(`{3,}|~{3,})\s*([^\s`]*)[^`]*$/,
  heading: /^ {0,3}(#{1,6})(?:\s+(.*?))?\s*#*\s*$/,
  hr: /^ {0,3}([-*_])(?:\s*\1){2,}\s*$/,
  quote: /^ {0,3}>\s?/,
  list: /^(\s*)([-*+]|\d{1,9}[.)])\s+(.*)$/,
  listEmpty: /^(\s*)([-*+]|\d{1,9}[.)])\s*$/,
  tableSep: /^\s*\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)*\|?\s*$/,
  blank: /^\s*$/,
};

const indentOf = (l) => {
  const m = /^[ \t]*/.exec(l)[0];
  return m.replace(/\t/g, '    ').length;
};

function startsBlock(line, next) {
  return (
    RE.fence.test(line) ||
    RE.heading.test(line) ||
    RE.hr.test(line) ||
    RE.quote.test(line) ||
    RE.list.test(line) ||
    (line.includes('|') && next !== undefined && RE.tableSep.test(next) && next.includes('-'))
  );
}

function splitRow(line) {
  let s = line.trim();
  if (s.startsWith('|')) s = s.slice(1);
  if (s.endsWith('|') && !s.endsWith('\\|')) s = s.slice(0, -1);
  const cells = [];
  let cur = '';
  let code = false;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === '\\' && s[i + 1] === '|') {
      cur += '|';
      i++;
    } else if (c === '`') {
      code = !code;
      cur += c;
    } else if (c === '|' && !code) {
      cells.push(cur.trim());
      cur = '';
    } else cur += c;
  }
  cells.push(cur.trim());
  return cells;
}

function codeBlock(code, lang, open, caret) {
  const label = esc(lang || 'text');
  return (
    '<div class="code-block' + (open ? ' open' : '') + '"><div class="code-head"><span class="code-lang">' + label +
    '</span><button type="button" class="code-copy" data-copy title="Copy code"><svg viewBox="0 0 16 16" aria-hidden="true"><rect x="5" y="5" width="8.5" height="8.5" rx="1.6"/><path d="M10.5 3V2.6c0-.9-.7-1.6-1.6-1.6H3.6C2.7 1 2 1.7 2 2.6v5.3c0 .9.7 1.6 1.6 1.6H4"/></svg><span>Copy</span></button></div><pre><code>' +
    highlight(code, lang) + caret + '</code></pre></div>'
  );
}

function renderBlocks(lines, caret) {
  const out = [];
  let lastCaretable = -1; // index in out where caret can go inline
  let lastKind = '';
  let i = 0;
  const n = lines.length;

  while (i < n) {
    const line = lines[i];
    if (RE.blank.test(line)) {
      i++;
      continue;
    }
    let m;

    if ((m = RE.fence.exec(line))) {
      const fence = m[1];
      const lang = m[2] || '';
      const ind = indentOf(line);
      const body = [];
      i++;
      let closed = false;
      while (i < n) {
        const l = lines[i];
        const t = l.trim();
        if (t.startsWith(fence[0].repeat(fence.length)) && /^(`+|~+)$/.test(t) && t[0] === fence[0]) {
          closed = true;
          i++;
          break;
        }
        body.push(ind ? l.replace(new RegExp('^ {0,' + ind + '}'), '') : l);
        i++;
      }
      out.push({ kind: 'code', code: body.join('\n'), lang, open: !closed });
      continue;
    }

    if ((m = RE.heading.exec(line))) {
      const lvl = Math.min(m[1].length + 0, 6);
      out.push({ kind: 'inline', tag: 'h' + lvl, text: m[2] || '' });
      i++;
      continue;
    }

    if (RE.hr.test(line)) {
      out.push({ kind: 'html', html: '<hr>' });
      i++;
      continue;
    }

    if (RE.quote.test(line)) {
      const body = [];
      while (i < n && !RE.blank.test(lines[i]) && (RE.quote.test(lines[i]) || !startsBlock(lines[i], lines[i + 1]))) {
        body.push(lines[i].replace(RE.quote, ''));
        i++;
      }
      out.push({ kind: 'quote', lines: body });
      continue;
    }

    if (line.includes('|') && i + 1 < n && RE.tableSep.test(lines[i + 1]) && lines[i + 1].includes('-')) {
      const head = splitRow(line);
      const aligns = splitRow(lines[i + 1]).map((c) => (/^:-+:$/.test(c) ? 'center' : /-+:$/.test(c) ? 'right' : /^:-+/.test(c) ? 'left' : ''));
      i += 2;
      const rows = [];
      while (i < n && !RE.blank.test(lines[i]) && lines[i].includes('|')) {
        rows.push(splitRow(lines[i]));
        i++;
      }
      out.push({ kind: 'table', head, aligns, rows });
      continue;
    }

    if (RE.list.test(line)) {
      const r = parseList(lines, i);
      i = r.next;
      out.push(r.block);
      continue;
    }

    // paragraph
    const para = [line];
    i++;
    while (i < n && !RE.blank.test(lines[i]) && !startsBlock(lines[i], lines[i + 1])) {
      para.push(lines[i]);
      i++;
    }
    out.push({ kind: 'inline', tag: 'p', text: para.join('\n').trim() });
  }

  // render, placing caret in the last block
  return out
    .map((b, idx) => {
      const c = idx === out.length - 1 ? caret : '';
      switch (b.kind) {
        case 'code':
          return codeBlock(b.code, b.lang, b.open, c);
        case 'inline':
          return '<' + b.tag + '>' + inline(b.text) + c + '</' + b.tag + '>';
        case 'quote':
          return '<blockquote>' + renderBlocks(b.lines, c) + '</blockquote>';
        case 'table':
          return renderTable(b) + c;
        case 'list':
          return renderList(b, c);
        default:
          return b.html + c;
      }
    })
    .join('');
}

function parseList(lines, start) {
  const first = RE.list.exec(lines[start]);
  const base = indentOf(lines[start]);
  const ordered = /\d/.test(first[2]);
  const startNum = ordered ? parseInt(first[2], 10) : 1;
  const items = [];
  let cur = null;
  let i = start;
  let sawBlank = false;
  while (i < lines.length) {
    const l = lines[i];
    if (RE.blank.test(l)) {
      sawBlank = true;
      i++;
      continue;
    }
    const ind = indentOf(l);
    const m = RE.list.exec(l) || RE.listEmpty.exec(l);
    if (m && ind < base + 2 && ind >= base - 1) {
      if (/\d/.test(m[2]) !== ordered) break;
      cur = { text: [m[3] || ''], sub: [] };
      items.push(cur);
      sawBlank = false;
      i++;
      continue;
    }
    if (ind >= base + 2 && cur) {
      // nested content (sub lists, continuation paragraphs, code)
      if (cur.sub.length || RE.list.test(l) || RE.fence.test(l.trim()) || sawBlank) {
        if (sawBlank && cur.sub.length) cur.sub.push('');
        cur.sub.push(l.slice(Math.min(ind, base + 2)).replace(/^\s{0,2}/, ''));
        // keep fenced code inside the item intact
        if (RE.fence.test(l.trim())) {
          i++;
          while (i < lines.length) {
            const inner = lines[i];
            cur.sub.push(inner.replace(new RegExp('^ {0,' + (base + 2) + '}'), ''));
            i++;
            if (/^\s*(`{3,}|~{3,})\s*$/.test(inner)) break;
          }
          sawBlank = false;
          continue;
        }
      } else cur.text.push(l.trim());
      sawBlank = false;
      i++;
      continue;
    }
    if (!sawBlank && cur && !startsBlock(l, lines[i + 1])) {
      cur.text.push(l.trim());
      i++;
      continue;
    }
    break;
  }
  return { next: i, block: { kind: 'list', ordered, startNum, items } };
}

function renderList(b, caret) {
  const tag = b.ordered ? 'ol' : 'ul';
  const startAttr = b.ordered && b.startNum !== 1 ? ' start="' + b.startNum + '"' : '';
  const items = b.items.map((it, idx) => {
    const last = idx === b.items.length - 1;
    let text = it.text.join('\n');
    let task = '';
    const tm = /^\[([ xX])\]\s+/.exec(text);
    if (tm) {
      task = '<span class="task' + (tm[1] === ' ' ? '' : ' done') + '"></span>';
      text = text.slice(tm[0].length);
    }
    const sub = it.sub.length ? renderBlocks(it.sub, last ? caret : '') : '';
    return '<li' + (task ? ' class="task-item"' : '') + '>' + task + inline(text) + (last && !sub ? caret : '') + sub + '</li>';
  });
  return '<' + tag + startAttr + '>' + items.join('') + '</' + tag + '>';
}

function renderTable(b) {
  const cell = (tag, text, i) => '<' + tag + (b.aligns[i] ? ' style="text-align:' + b.aligns[i] + '"' : '') + '>' + inline(text) + '</' + tag + '>';
  const cols = b.head.length;
  const head = '<tr>' + b.head.map((h, i) => cell('th', h, i)).join('') + '</tr>';
  const rows = b.rows
    .map((r) => {
      const cells = [];
      for (let i = 0; i < cols; i++) cells.push(cell('td', r[i] || '', i));
      return '<tr>' + cells.join('') + '</tr>';
    })
    .join('');
  return '<div class="table-wrap"><table><thead>' + head + '</thead><tbody>' + rows + '</tbody></table></div>';
}

export function renderMarkdown(text, streaming = false) {
  const src = String(text || '').replace(/\r\n?/g, '\n');
  const caret = streaming ? CARET : '';
  if (!src.trim()) return caret;
  return renderBlocks(src.split('\n'), caret);
}
