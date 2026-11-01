<script>
  import Icon from './Icon.svelte';
  import { prettyJson } from '../lib/format.js';

  let { tools } = $props();

  // null = automatic (open while anything is running); boolean once toggled.
  let userOpen = $state(null);
  let openRows = $state({});

  const running = $derived(tools.filter((t) => t.status === 'running').length);
  const failed = $derived(tools.filter((t) => t.status === 'failed').length);
  const open = $derived(userOpen === null ? running > 0 || tools.length < 2 : userOpen);

  function verb(name) {
    const n = String(name).toLowerCase();
    if (n.includes('read')) return 'Read';
    if (n.includes('check')) return 'Checked';
    if (n.includes('propose')) return 'Proposed edits';
    if (n.includes('search')) return 'Searched';
    if (n.includes('script')) return 'Ran script';
    if (n.includes('render')) return 'Rendered';
    if (n.includes('list')) return 'Listed';
    return name;
  }
</script>

<div class="tool-group" class:single={tools.length < 2}>
  {#if tools.length > 1}
    <button type="button" class="tool-group-head" aria-expanded={open} onclick={() => (userOpen = !open)}>
      <span class="tg-icon" class:spin={running > 0}>
        {#if running > 0}<span class="spinner"></span>{:else}<Icon name="tools" size={13} />{/if}
      </span>
      <span class="tg-label">
        {#if running > 0}Running {running} of {tools.length} tools{:else}Used {tools.length} tools{/if}
      </span>
      {#if failed}<span class="badge fail">{failed} failed</span>{/if}
      <span class="chev" class:open><Icon name="chevron" size={12} /></span>
    </button>
  {/if}
  {#if open}
    <div class="tool-rows">
      {#each tools as t (t.id)}
        {@const expandable = !!(t.input || t.output)}
        {@const rowOpen = !!openRows[t.id]}
        <div class="tool-row {t.status}">
          <button type="button" class="tool-line" disabled={!expandable} aria-expanded={rowOpen} onclick={() => (openRows[t.id] = !rowOpen)}>
            <span class="tool-status" title={t.status}>
              {#if t.status === 'running'}<span class="spinner"></span>
              {:else if t.status === 'failed'}<Icon name="x" size={12} />
              {:else}<Icon name="check" size={12} />{/if}
            </span>
            <span class="tool-verb">{verb(t.name)}</span>
            {#if t.detail}<span class="tool-detail" title={t.detail}>{t.detail}</span>{/if}
            {#if expandable}<span class="chev" class:open={rowOpen}><Icon name="chevron" size={11} /></span>{/if}
          </button>
          {#if rowOpen}
            <div class="tool-io">
              {#if t.input}
                <div class="io-label">Input</div>
                <pre class="io">{prettyJson(t.input)}</pre>
              {/if}
              {#if t.output}
                <div class="io-label">Output</div>
                <pre class="io">{prettyJson(t.output)}</pre>
              {/if}
            </div>
          {/if}
        </div>
      {/each}
    </div>
  {/if}
</div>
