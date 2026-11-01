<script>
  import { parseDiff } from '../lib/diff.js';
  let { diff } = $props();
  const rows = $derived(parseDiff(diff));
</script>

{#if !rows.some((r) => r.t !== 'meta')}
  <div class="diff-empty">No textual preview</div>
{:else}
  <div class="diff" role="table">
    <div class="diff-inner">
      {#each rows as r, i (i)}
        {#if r.t === 'hunk'}
          <div class="drow hunk"><span class="gut">&#8943;</span><span class="gut"></span><span class="code">{r.text}</span></div>
        {:else if r.t === 'meta'}
          <div class="drow meta"><span class="gut"></span><span class="gut"></span><span class="code">{r.text}</span></div>
        {:else}
          <div class="drow {r.t}">
            <span class="gut">{r.o}</span><span class="gut">{r.n}</span><span class="code"><span class="sign">{r.t === 'add' ? '+' : r.t === 'del' ? '-' : ' '}</span>{r.text}</span>
          </div>
        {/if}
      {/each}
    </div>
  </div>
{/if}
