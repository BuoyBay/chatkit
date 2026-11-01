export function fmtCount(n) {
  n = Math.max(0, Math.round(n));
  if (n < 1000) return String(n);
  if (n < 10000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  if (n < 1e6) return Math.round(n / 1000) + 'k';
  return (n / 1e6).toFixed(1).replace(/\.0$/, '') + 'M';
}

export function fmtStats(s) {
  if (!s) return '';
  const parts = [];
  const est = s.estimated ? '~' : '';
  if (s.tokensOut > 0) parts.push('↓ ' + est + fmtCount(s.tokensOut) + ' tokens');
  if (s.tokensIn > 0) parts.push('↑ ' + fmtCount(s.tokensIn) + ' in');
  if (s.tokensPerSecond > 0) parts.push(est + (s.tokensPerSecond < 10 ? s.tokensPerSecond.toFixed(1) : Math.round(s.tokensPerSecond)) + ' tok/s');
  if (s.elapsedMs > 0) {
    const sec = s.elapsedMs / 1000;
    parts.push(sec < 60 ? sec.toFixed(1) + 's' : Math.floor(sec / 60) + 'm ' + Math.round(sec % 60) + 's');
  }
  return parts.join(' · ');
}

export function prettyJson(text) {
  const t = String(text || '').trim();
  if (!t || (t[0] !== '{' && t[0] !== '[')) return String(text || '');
  try {
    return JSON.stringify(JSON.parse(t), null, 2);
  } catch (_) {
    return String(text);
  }
}

export function isJson(text) {
  const t = String(text || '').trim();
  if (!t || (t[0] !== '{' && t[0] !== '[')) return false;
  try {
    JSON.parse(t);
    return true;
  } catch (_) {
    return false;
  }
}
