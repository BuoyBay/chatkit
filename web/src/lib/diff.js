// Unified diff -> display rows with old/new line numbers computed from the
// @@ headers. Remaining-line counts decide when a hunk ends, so content lines
// such as "--- x" inside a hunk are not mistaken for file headers.
export function parseDiff(text) {
  const rows = [];
  let o = 0;
  let n = 0;
  let oLeft = 0;
  let nLeft = 0;
  const lines = String(text || '').replace(/\r\n?/g, '\n').split('\n');
  if (lines.length && lines[lines.length - 1] === '') lines.pop();
  for (const line of lines) {
    const inHunk = oLeft > 0 || nLeft > 0;
    // A body line always starts with ' ', '+', '-' or '\\', so "@@" begins a
    // new hunk even if the previous header under-counted its lines.
    const h = /^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@(.*)$/.exec(line);
    if (h || !inHunk) {
      if (h) {
        o = +h[1];
        n = +h[3];
        oLeft = h[2] === undefined ? 1 : +h[2];
        nLeft = h[4] === undefined ? 1 : +h[4];
        rows.push({ t: 'hunk', text: line, ctx: h[5].trim() });
      } else if (line.startsWith('\\')) rows.push({ t: 'meta', text: line });
      // file headers (diff/index/---/+++) are shown by the card, not the body
      continue;
    }
    const c = line[0];
    if (c === '+') {
      rows.push({ t: 'add', o: '', n: n++, text: line.slice(1) });
      nLeft--;
    } else if (c === '-') {
      rows.push({ t: 'del', o: o++, n: '', text: line.slice(1) });
      oLeft--;
    } else if (c === '\\') rows.push({ t: 'meta', text: line });
    else {
      rows.push({ t: 'ctx', o: o++, n: n++, text: line.slice(1) });
      oLeft--;
      nLeft--;
    }
  }
  return rows;
}
