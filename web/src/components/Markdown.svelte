<script>
  import { renderMarkdown } from '../lib/markdown.js';
  let { text = '', streaming = false } = $props();
  // Message text is updated at most once per animation frame by the store,
  // so this re-parses at most once per frame per streaming message.
  const html = $derived(renderMarkdown(text, streaming));
</script>

<div class="md">{@html html}</div>
