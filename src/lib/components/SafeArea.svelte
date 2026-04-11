<script lang="ts">
  import type { Snippet } from 'svelte';

  let {
    children,
    top = true,
    bottom = true,
    sides = true
  }: {
    children: Snippet;
    top?: boolean;
    bottom?: boolean;
    sides?: boolean;
  } = $props();
</script>

<div
  class="min-h-dvh"
  style:padding-top={top ? 'var(--safe-top)' : undefined}
  style:padding-bottom={bottom ? 'var(--safe-bottom)' : undefined}
  style:padding-left={sides ? 'var(--safe-left)' : undefined}
  style:padding-right={sides ? 'var(--safe-right)' : undefined}
>
  {@render children()}
</div>
