<script>
  import Icon from './Icon.svelte';
  let { role = 'assistant', name = '' } = $props();
  const initial = $derived((name.trim()[0] || 'Y').toUpperCase());
</script>

{#if role === 'user'}
  <span class="avatar user" aria-hidden="true">{initial}</span>
{:else}
  <span class="avatar bot" aria-hidden="true"><Icon name="sparkle" size={12} /></span>
{/if}
