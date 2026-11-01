<script>
  import Icon from './Icon.svelte';
  import Outcome from './Outcome.svelte';
  import { post } from '../lib/store.svelte.js';
  import { prettyJson } from '../lib/format.js';

  let { c } = $props();
  let showDetails = $state(true);
  const resolved = $derived(!!c.outcome);
  const details = $derived(prettyJson(c.details));
</script>

<section class="card permission" class:resolved>
  <div class="card-head static">
    <span class="card-icon amber"><Icon name="shield" size={14} /></span>
    <span class="card-title">
      <span class="t">{c.title}</span>
      {#if !resolved}<span class="sub">The agent is asking for permission</span>{/if}
    </span>
    {#if c.outcome}<Outcome outcome={c.outcome} />{/if}
  </div>
  {#if details && !resolved}
    <button type="button" class="details-toggle" aria-expanded={showDetails} onclick={() => (showDetails = !showDetails)}>
      <span class="chev" class:open={showDetails}><Icon name="chevron" size={11} /></span>Details
    </button>
    {#if showDetails}<pre class="io details">{details}</pre>{/if}
  {/if}
  {#if !resolved}
    <div class="card-actions">
      {#if c.canAccept}
        <button type="button" class="btn primary amber" onclick={() => post({ action: 'approve', id: c.id })}>Allow once</button>
      {/if}
      <button type="button" class="btn" onclick={() => post({ action: 'reject', id: c.id })}>Deny</button>
    </div>
  {/if}
</section>
