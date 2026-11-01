// Tiny tokenizing highlighter. Input is raw code; output is escaped HTML.
import { esc } from './escape.js';

const words = (s) => new Set(s.split(' '));

const BUOY_KW = words(
  'dim as if then else elseif end sub function class return for next each in public private property new nil true false try catch throw select case while import handle inherits implements me and or not xor mod to step do loop exit continue byref byval optional const var enum interface shared static protected friend overrides overridable mustoverride finally declare of is isnot wend until with event raiseevent addhandler get set structure namespace'
);
const BUOY_TY = words('string integer double boolean array object variant int8 int16 int32 int64 uint8 uint16 uint32 uint64 single byte');
const JS_KW = words(
  'const let var function return if else for while do switch case break continue new this class extends super import export from default async await try catch finally throw typeof instanceof in of void delete yield static get set interface type enum implements public private protected readonly as declare namespace keyof'
);
const JS_LIT = words('true false null undefined NaN Infinity');
const PY_KW = words(
  'def return if elif else for while in not and or is import from as class try except finally raise with lambda pass break continue global nonlocal yield async await del assert match case'
);
const PY_LIT = words('True False None self');
const SH_KW = words('if then else elif fi for while do done case esac in function return export local readonly set unset echo cd exit source sudo');

const LANGS = {
  buoy: { re: /('[^\n]*|\bREM\b[^\n]*)|("(?:[^"\\\n]|\\.)*"?)|(\b\d+(?:\.\d+)?\b|&H[0-9A-F]+\b)|([A-Za-z_]\w*)/giy, kw: BUOY_KW, ty: BUOY_TY, ci: true },
  js: { re: /(\/\/[^\n]*|\/\*[\s\S]*?(?:\*\/|$))|("(?:[^"\\\n]|\\.)*"?|'(?:[^'\\\n]|\\.)*'?|`(?:[^`\\]|\\.)*`?)|(\b(?:0x[\da-f]+|\d+(?:\.\d+)?(?:e[+-]?\d+)?)n?\b)|([A-Za-z_$][\w$]*)/giy, kw: JS_KW, lit: JS_LIT },
  py: { re: /(#[^\n]*)|("""[\s\S]*?(?:"""|$)|'''[\s\S]*?(?:'''|$)|[rbfu]?"(?:[^"\\\n]|\\.)*"?|[rbfu]?'(?:[^'\\\n]|\\.)*'?)|(\b\d+(?:\.\d+)?\b)|([A-Za-z_]\w*)/giy, kw: PY_KW, lit: PY_LIT },
  json: { re: /(\/\/[^\n]*)|("(?:[^"\\\n]|\\.)*"?)|(-?\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b)|([A-Za-z_]\w*)/gy, lit: words('true false null'), json: true },
  sh: { re: /(#[^\n]*)|("(?:[^"\\]|\\.)*"?|'[^']*'?)|(\$\{?[\w@#?*!-]+\}?)|([A-Za-z_][\w-]*)/gmy, kw: SH_KW, vars: true },
};

const ALIAS = {
  buoy: 'buoy', bui: 'buoy', vb: 'buoy', vbnet: 'buoy', basic: 'buoy', xojo: 'buoy',
  js: 'js', javascript: 'js', jsx: 'js', ts: 'js', typescript: 'js', tsx: 'js', mjs: 'js', svelte: 'js',
  py: 'py', python: 'py', python3: 'py',
  json: 'json', jsonc: 'json', json5: 'json',
  sh: 'sh', bash: 'sh', shell: 'sh', zsh: 'sh', console: 'sh', shellsession: 'sh', terminal: 'sh',
};

export function langOf(label) {
  return ALIAS[String(label || '').toLowerCase()] || '';
}

export function highlight(code, label) {
  const def = LANGS[langOf(label)];
  if (!def) return esc(code);
  const re = def.re;
  let out = '';
  let i = 0;
  let plain = '';
  const flushPlain = () => {
    if (plain) out += esc(plain);
    plain = '';
  };
  const span = (cls, t) => {
    flushPlain();
    out += '<span class="tk-' + cls + '">' + esc(t) + '</span>';
  };
  while (i < code.length) {
    re.lastIndex = i;
    const m = re.exec(code);
    if (!m || m[0] === '') {
      plain += code[i++];
      continue;
    }
    const t = m[0];
    if (m[1] && def.vars && i > 0 && !/\s/.test(code[i - 1])) {
      plain += code[i++];
      continue;
    }
    if (m[1]) span('c', t);
    else if (m[2]) {
      if (def.json && /^\s*:/.test(code.slice(i + t.length, i + t.length + 8))) span('k', t);
      else span('s', t);
    } else if (m[3]) span(def.vars ? 'v' : 'n', t);
    else {
      const w = def.ci ? t.toLowerCase() : t;
      const prev = out.length || plain.length ? code[i - 1] : '';
      if (prev === '.' && !def.ci) plain += t;
      else if ((def.lit && def.lit.has(t)) || (def.ci && (w === 'true' || w === 'false' || w === 'nil'))) span('l', t);
      else if (def.kw && def.kw.has(w)) span('kw', t);
      else if (def.ty && def.ty.has(w)) span('t', t);
      else if (/^[A-Z]/.test(t) && !def.ci && !def.json && def !== LANGS.sh) span('t', t);
      else if (code[i + t.length] === '(') span('f', t);
      else plain += t;
    }
    i += t.length;
  }
  flushPlain();
  return out;
}
