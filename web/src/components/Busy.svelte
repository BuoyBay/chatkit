<script>
  import Icon from './Icon.svelte';
  let { label = '' } = $props();
</script>

<div class="busy" role="status" aria-live="polite">
  <span class="avatar bot pulse"><Icon name="sparkle" size={12} /></span>
  <span class="shimmer">{label || 'Thinking…'}</span>
  <span class="dots" aria-hidden="true"><i></i><i></i><i></i></span>
</div>
