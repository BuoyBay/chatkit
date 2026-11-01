<script>
  import Markdown from './Markdown.svelte';
  import Avatar from './Avatar.svelte';
  import Icon from './Icon.svelte';
  import { chat, post } from '../lib/store.svelte.js';
  import { fmtStats } from '../lib/format.js';

  let { m } = $props();
  const stats = $derived(fmtStats(m.stats));
  let copied = $state(false);

  function copyAll() {
    try {
      navigator.clipboard && navigator.clipboard.writeText(m.text).catch(() => {});
    } catch (_) {}
    post({ action: 'copy', text: m.text });
    copied = true;
    setTimeout(() => (copied = false), 1200);
  }
</script>

{#snippet attachments(list)}
  {#if list.length}
    <div class="attachments">
      {#each list as a, i (i)}
        {#if a.kind === 'image'}
          <button type="button" class="thumb" title={a.name} onclick={() => (chat.lightbox = { src: a.dataUrl, name: a.name })}>
            <img src={a.dataUrl} alt={a.name} />
          </button>
        {:else}
          <span class="file-chip" title={a.detail ? a.name + ' — ' + a.detail : a.name}>
            <Icon name="file" size={13} />
            <span class="file-name">{a.name}</span>
            {#if a.detail}<span class="file-detail">{a.detail}</span>{/if}
          </span>
        {/if}
      {/each}
    </div>
  {/if}
{/snippet}

{#if m.role === 'user'}
  <div class="msg user">
    <div class="msg-head right">
      <span class="author">{m.author || 'You'}</span>
      <Avatar role="user" name={m.author || 'You'} />
    </div>
    <div class="bubble">
      {@render attachments(m.attachments)}
      {#if m.text}<div class="user-text">{m.text}</div>{/if}
    </div>
  </div>
{:else if m.role === 'assistant'}
  <div class="msg assistant" class:streaming={m.streaming} class:continuation={m.continuation}>
    {#if !m.continuation}
    <div class="msg-head">
      <Avatar role="assistant" />
      <span class="author">{m.author || 'Assistant'}</span>
      {#if !m.streaming && m.text}
        <button type="button" class="icon-btn msg-copy" title="Copy message" onclick={copyAll}>
          <Icon name={copied ? 'check' : 'copy'} size={13} />
        </button>
      {/if}
    </div>
    {/if}
    <div class="msg-body">
      {@render attachments(m.attachments)}
      <Markdown text={m.text} streaming={m.streaming} />
      {#if stats}<div class="stats">{stats}</div>{/if}
    </div>
  </div>
{:else if m.role === 'error'}
  <div class="msg error" role="alert">
    <Icon name="alert" size={15} />
    <div class="error-body">
      {#if m.author}<div class="error-title">{m.author}</div>{/if}
      <Markdown text={m.text} />
    </div>
  </div>
{:else}
  <div class="msg note {m.role}">
    <Icon name="info" size={12} />
    <span class="note-text">{#if m.author}<b>{m.author}</b>{' '}{/if}{m.text}</span>
  </div>
{/if}
