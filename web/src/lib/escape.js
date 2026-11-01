const MAP = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const esc = (s) => String(s).replace(/[&<>"']/g, (c) => MAP[c]);
export const safeUrl = (u) => /^https?:/i.test(String(u).trim());
