<script>
  import { chat, post } from '../lib/store.svelte.js';
</script>

<div class="empty">
  <svg class="logo" viewBox="0 0 48 48" aria-hidden="true">
    <defs>
      <linearGradient id="lg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="var(--accent)" />
        <stop offset="1" stop-color="var(--accent-2)" />
      </linearGradient>
    </defs>
    <rect x="2" y="2" width="44" height="44" rx="13" fill="url(#lg)" opacity=".14" />
    <path fill="url(#lg)" d="M24 9c.7 6.9 3.8 10.4 11 11.3-7.2.9-10.3 4.4-11 11.3-.7-6.9-3.8-10.4-11-11.3 7.2-.9 10.3-4.4 11-11.3Z" />
    <path fill="url(#lg)" opacity=".7" d="M34.5 29c.35 3.2 1.8 4.8 5 5.2-3.2.4-4.65 2-5 5.2-.35-3.2-1.8-4.8-5-5.2 3.2-.4 4.65-2 5-5.2Z" />
  </svg>
  {#if chat.empty.title}<h1>{chat.empty.title}</h1>{/if}
  {#if chat.empty.subtitle}<p>{chat.empty.subtitle}</p>{/if}
  {#if chat.empty.suggestions.length}
    <div class="chips">
      {#each chat.empty.suggestions as s, i (i)}
        <button type="button" class="chip" onclick={() => post({ action: 'suggest', text: s })}>{s}</button>
      {/each}
    </div>
  {/if}
</div>
