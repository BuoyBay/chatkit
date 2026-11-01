import { mount } from 'svelte';
import './app.css';
import App from './App.svelte';
import { chatApi } from './lib/store.svelte.js';

window.chat = chatApi;
mount(App, { target: document.getElementById('app') });

/* global __DEMO_AUTOPLAY__, __DEMO_FAST__ */
const hash = location.hash;
if (__DEMO_AUTOPLAY__ || hash === '#demo' || hash === '#demo-fast') {
  const fast = __DEMO_FAST__ || hash === '#demo-fast';
  import('./demo.js').then((d) => d.runDemo(window.chat, { fast })).catch((e) => console.error(e));
}
