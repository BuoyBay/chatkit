<script>
  import { onMount } from 'svelte';
  import { chat, post } from './lib/store.svelte.js';
  import { safeUrl } from './lib/escape.js';
  import Message from './components/Message.svelte';
  import ToolGroup from './components/ToolGroup.svelte';
  import ProposalCard from './components/ProposalCard.svelte';
  import PermissionCard from './components/PermissionCard.svelte';
  import EmptyState from './components/EmptyState.svelte';
  import Busy from './components/Busy.svelte';
  import Icon from './components/Icon.svelte';

  // Consecutive tool items collapse into a single group block.
  const blocks = $derived.by(() => {
    const out = [];
    for (const it of chat.items) {
      const prev = out[out.length - 1];
      if (it.kind === 'tool') {
        if (prev && prev.kind === 'tools') prev.tools.push(it);
        else out.push({ kind: 'tools', key: 'g:' + it.id, tools: [it] });
      } else out.push({ kind: it.kind, key: it.kind[0] + ':' + it.id, item: it });
    }
    return out;
  });

  let scroller;
  let content;
  let stick = true;
  let showJump = $state(false);
  const NEAR = 48;

  function atBottom() {
    return scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight <= NEAR;
  }
  function toBottom(smooth) {
    scroller.scrollTo({ top: scroller.scrollHeight, behavior: smooth ? 'smooth' : 'auto' });
  }
  function onScroll() {
    stick = atBottom();
    if (stick) showJump = false;
  }
  function jump() {
    stick = true;
    showJump = false;
    toBottom(true);
  }

  function onClick(e) {
    const t = e.target;
    if (!(t instanceof Element)) return;
    const a = t.closest('a');
    if (a) {
      e.preventDefault();
      const url = a.getAttribute('data-href') || a.getAttribute('href') || '';
      if (safeUrl(url)) post({ action: 'link', url });
      return;
    }
    const btn = t.closest('[data-copy]');
    if (btn) {
      const code = btn.closest('.code-block')?.querySelector('code');
      const text = code ? code.textContent : '';
      try {
        navigator.clipboard && navigator.clipboard.writeText(text).catch(() => {});
      } catch (_) {}
      post({ action: 'copy', text });
      const label = btn.querySelector('span');
      if (label) {
        label.textContent = 'Copied';
        btn.classList.add('done');
        setTimeout(() => {
          label.textContent = 'Copy';
          btn.classList.remove('done');
        }, 1200);
      }
    }
  }

  function onKey(e) {
    if (e.key === 'Escape' && chat.lightbox) chat.lightbox = null;
  }

  onMount(() => {
    const ro = new ResizeObserver(() => {
      if (stick) toBottom(false);
      else showJump = scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight > NEAR;
    });
    ro.observe(content);
    ro.observe(scroller);
    post({ action: 'ready' });
    // The host routes menu-bar Copy / Select All here while the page has focus.
    const onFocus = () => post({ action: 'focus', focused: true });
    const onBlur = () => post({ action: 'focus', focused: false });
    window.addEventListener('focus', onFocus);
    window.addEventListener('blur', onBlur);
    if (document.hasFocus()) onFocus();
    return () => {
      ro.disconnect();
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('blur', onBlur);
    };
  });
</script>

<svelte:window onkeydown={onKey} />
<svelte:document onclick={onClick} />

<main class="pane">
  <div class="scroller" bind:this={scroller} onscroll={onScroll}>
    <div class="content" bind:this={content}>
      {#if !blocks.length && !chat.busy}
        <EmptyState />
      {/if}
      {#each blocks as b (b.key)}
        <div class="item">
          {#if b.kind === 'message'}
            <Message m={b.item} />
          {:else if b.kind === 'tools'}
            <ToolGroup tools={b.tools} />
          {:else if b.kind === 'proposal'}
            <ProposalCard c={b.item} />
          {:else if b.kind === 'permission'}
            <PermissionCard c={b.item} />
          {/if}
        </div>
      {/each}
      {#if chat.busy}
        <div class="item"><Busy label={chat.busyLabel} /></div>
      {/if}
    </div>
  </div>

  {#if showJump}
    <button type="button" class="jump" onclick={jump}><Icon name="arrow-down" size={12} />Jump to latest</button>
  {/if}

  {#if chat.lightbox}
    <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
    <div class="lightbox" onclick={() => (chat.lightbox = null)}>
      <img src={chat.lightbox.src} alt={chat.lightbox.name} />
      <div class="lb-name">{chat.lightbox.name}</div>
      <button type="button" class="lb-close" title="Close (Esc)" onclick={() => (chat.lightbox = null)}><Icon name="x" size={16} /></button>
    </div>
  {/if}
</main>
<div id="debug" hidden></div>
