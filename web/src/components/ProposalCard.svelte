<script>
  import Icon from './Icon.svelte';
  import DiffView from './DiffView.svelte';
  import Outcome from './Outcome.svelte';
  import { post } from '../lib/store.svelte.js';

  let { c } = $props();
  let closed = $state({});
  let collapsed = $state(false);

  const added = $derived(c.files.reduce((a, f) => a + f.added, 0));
  const removed = $derived(c.files.reduce((a, f) => a + f.removed, 0));
  const resolved = $derived(!!c.outcome);
  const isCollapsed = $derived(collapsed);
  // Resolving collapses the card; reopening the proposal expands it again.
  $effect.pre(() => {
    collapsed = resolved;
  });

  const base = (p) => p.split(/[\\/]/).pop();
  const dir = (p) => {
    const parts = p.split(/[\\/]/);
    parts.pop();
    return parts.join('/');
  };
</script>

<section class="card proposal" class:resolved>
  <button type="button" class="card-head" aria-expanded={!isCollapsed} onclick={() => (collapsed = !collapsed)}>
    <span class="card-icon"><Icon name="edit" size={14} /></span>
    <span class="card-title">
      <span class="t">{c.title || 'Proposed changes'}</span>
      <span class="sub">{c.files.length} {c.files.length === 1 ? 'file' : 'files'}
        <span class="add">+{added}</span> <span class="del">&minus;{removed}</span></span>
    </span>
    {#if c.outcome}<Outcome outcome={c.outcome} />{/if}
    <span class="chev" class:open={!isCollapsed}><Icon name="chevron" size={12} /></span>
  </button>

  {#if !isCollapsed}
    <div class="files">
      {#each c.files as f, i (i)}
        {@const fileOpen = !closed[i]}
        <div class="file">
          <div class="file-head">
            <button type="button" class="file-toggle" aria-expanded={fileOpen} onclick={() => (closed[i] = fileOpen)}>
              <span class="chev" class:open={fileOpen}><Icon name="chevron" size={11} /></span>
              <span class="path" title={f.path}><span class="base">{base(f.path)}</span>{#if dir(f.path)}<span class="dir">{dir(f.path)}</span>{/if}</span>
            </button>
            <span class="counts"><span class="badge add">+{f.added}</span><span class="badge del">&minus;{f.removed}</span></span>
            <button type="button" class="link-btn" title={'Open ' + f.path} onclick={() => post({ action: 'openFile', path: f.path })}>Open</button>
          </div>
          {#if fileOpen}<DiffView diff={f.diff} />{/if}
        </div>
      {/each}
      {#if !c.files.length}<div class="diff-empty">No files</div>{/if}
    </div>
  {/if}

  {#if !resolved}
    <div class="card-actions">
      {#if c.canApply}
        <button type="button" class="btn primary" onclick={() => post({ action: 'approve', id: c.id })}>Apply changes</button>
      {/if}
      <button type="button" class="btn" onclick={() => post({ action: 'reject', id: c.id })}>Reject</button>
    </div>
  {/if}
</section>
