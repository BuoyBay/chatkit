// Bridge to the Buoy host (HTMLView message handler) with a console fallback.
export function post(msg) {
  let json;
  try {
    json = JSON.stringify(msg);
  } catch (e) {
    debug('post: ' + e);
    return;
  }
  try {
    const b = window.buoy;
    if (b && typeof b.postMessage === 'function') {
      b.postMessage(json);
      return;
    }
  } catch (e) {
    debug('post: ' + e);
  }
  try {
    console.log('[chat -> host]', json);
  } catch (_) {}
}

const MAX_DEBUG = 50;
const debugLog = [];

// Errors are recorded into the hidden #debug element so the host can read them
// with ExecuteJavaScript("document.getElementById('debug').textContent").
export function debug(text) {
  try {
    debugLog.push(String(text));
    if (debugLog.length > MAX_DEBUG) debugLog.shift();
    const el = document.getElementById('debug');
    if (el) el.textContent = debugLog.join('\n');
  } catch (_) {}
}
