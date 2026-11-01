<script>
  import Icon from './Icon.svelte';
  let { outcome } = $props();
  const good = $derived(outcome === 'applied' || outcome === 'allowed');
  const label = $derived(outcome ? outcome[0].toUpperCase() + outcome.slice(1) : '');
</script>

<span class="badge outcome {good ? 'ok' : outcome === 'dismissed' ? 'muted' : 'fail'}">
  <Icon name={good ? 'check' : 'x'} size={11} />{label}
</span>
