<script>
  let { name, size = 14 } = $props();
</script>

<svg class="icon icon-{name}" width={size} height={size} viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
  {#if name === 'sparkle'}
    <path fill="currentColor" stroke="none" d="M8 1.2c.3 2.9 1.6 4.4 4.6 4.8-3 .4-4.3 1.9-4.6 4.8-.3-2.9-1.6-4.4-4.6-4.8 3-.4 4.3-1.9 4.6-4.8Z" />
    <path fill="currentColor" stroke="none" d="M12.6 9.6c.15 1.4.8 2.1 2.2 2.3-1.4.2-2.05.9-2.2 2.3-.15-1.4-.8-2.1-2.2-2.3 1.4-.2 2.05-.9 2.2-2.3Z" opacity=".75" />
  {:else if name === 'check'}
    <path d="m3.5 8.4 3 3 6-6.6" />
  {:else if name === 'x'}
    <path d="m4.5 4.5 7 7m0-7-7 7" />
  {:else if name === 'chevron'}
    <path d="m6 4 4 4-4 4" />
  {:else if name === 'file'}
    <path d="M9.2 1.8H4.6c-.7 0-1.3.6-1.3 1.3v9.8c0 .7.6 1.3 1.3 1.3h6.8c.7 0 1.3-.6 1.3-1.3V5.3L9.2 1.8Z" /><path d="M9 2v3.5h3.5" />
  {:else if name === 'shield'}
    <path d="M8 1.6 2.9 3.4v4c0 3.2 2.2 5.8 5.1 7 2.9-1.2 5.1-3.8 5.1-7v-4L8 1.6Z" /><path d="M8 5v3.4M8 10.6v.1" />
  {:else if name === 'edit'}
    <path d="M10.6 2.6a1.6 1.6 0 0 1 2.3 2.3L5.6 12.2l-3 .8.8-3 7.2-7.4Z" />
  {:else if name === 'tools'}
    <path d="M10.2 2.1a3.2 3.2 0 0 0-3.8 4.1L2.3 10.3a1.3 1.3 0 0 0 1.9 1.9l4.1-4.1a3.2 3.2 0 0 0 4.1-3.8l-2 2-1.8-.3-.3-1.8 1.9-2.1Z" />
  {:else if name === 'alert'}
    <circle cx="8" cy="8" r="6.2" /><path d="M8 4.8v3.6M8 10.9v.1" />
  {:else if name === 'info'}
    <circle cx="8" cy="8" r="6.2" /><path d="M8 7.3v3.8M8 4.9v.1" />
  {:else if name === 'arrow-down'}
    <path d="M8 3v10m-4-4 4 4 4-4" />
  {:else if name === 'copy'}
    <rect x="5" y="5" width="8.5" height="8.5" rx="1.6" /><path d="M10.5 3v-.4c0-.9-.7-1.6-1.6-1.6H3.6C2.7 1 2 1.7 2 2.6v5.3c0 .9.7 1.6 1.6 1.6H4" />
  {:else if name === 'external'}
    <path d="M9 2.5h4.5V7M13.3 2.7 7.5 8.5M11.5 9.5v2.9c0 .7-.5 1.1-1.1 1.1H3.6c-.6 0-1.1-.4-1.1-1.1V5.6c0-.6.5-1.1 1.1-1.1h2.9" />
  {/if}
</svg>
