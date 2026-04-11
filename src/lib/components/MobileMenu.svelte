<script lang="ts">
  import { fly } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
  import { authModal } from '$lib/stores/auth-modal.svelte';

  let { open = $bindable(false) } = $props();

  // Honor reduced motion — render without transition when user prefers reduce.
  let reducedMotion = $state(false);

  $effect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    reducedMotion = mq.matches;
    const handler = (e: MediaQueryListEvent) => {
      reducedMotion = e.matches;
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  });

  // Escape key to close — only listen while open.
  $effect(() => {
    if (!open) return;
    if (typeof window === 'undefined') return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        open = false;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  });

  function closeMenu() {
    open = false;
  }

  function handleSignIn() {
    authModal.openModal();
    open = false;
  }
</script>

{#if open}
  {#if reducedMotion}
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Main menu"
      class="fixed inset-0 z-50 bg-[color:var(--color-paper)] px-6 py-24"
    >
      <button
        type="button"
        aria-label="Close menu"
        onclick={closeMenu}
        class="absolute top-6 right-6 inline-flex min-h-11 min-w-11 items-center justify-center text-[color:var(--color-ink)]"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          aria-hidden="true"
        >
          <line x1="5" y1="5" x2="19" y2="19" />
          <line x1="19" y1="5" x2="5" y2="19" />
        </svg>
      </button>

      <nav class="flex flex-col gap-6">
        <a
          href="#"
          onclick={closeMenu}
          class="font-serif text-[28px] font-normal leading-tight text-[color:var(--color-ink)]"
        >
          The Space
        </a>
        <a
          href="#"
          onclick={closeMenu}
          class="font-serif text-[28px] font-normal leading-tight text-[color:var(--color-ink)]"
        >
          Menu
        </a>
        <a
          href="#"
          onclick={closeMenu}
          class="font-serif text-[28px] font-normal leading-tight text-[color:var(--color-ink)]"
        >
          Visit
        </a>
        <button
          type="button"
          onclick={handleSignIn}
          class="text-left font-serif text-[28px] font-normal leading-tight text-[color:var(--color-ink)]"
        >
          Sign in
        </button>
      </nav>
    </div>
  {:else}
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Main menu"
      class="fixed inset-0 z-50 bg-[color:var(--color-paper)] px-6 py-24"
      transition:fly={{ x: 300, duration: 200, easing: cubicOut }}
    >
      <button
        type="button"
        aria-label="Close menu"
        onclick={closeMenu}
        class="absolute top-6 right-6 inline-flex min-h-11 min-w-11 items-center justify-center text-[color:var(--color-ink)]"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          aria-hidden="true"
        >
          <line x1="5" y1="5" x2="19" y2="19" />
          <line x1="19" y1="5" x2="5" y2="19" />
        </svg>
      </button>

      <nav class="flex flex-col gap-6">
        <a
          href="#"
          onclick={closeMenu}
          class="font-serif text-[28px] font-normal leading-tight text-[color:var(--color-ink)]"
        >
          The Space
        </a>
        <a
          href="#"
          onclick={closeMenu}
          class="font-serif text-[28px] font-normal leading-tight text-[color:var(--color-ink)]"
        >
          Menu
        </a>
        <a
          href="#"
          onclick={closeMenu}
          class="font-serif text-[28px] font-normal leading-tight text-[color:var(--color-ink)]"
        >
          Visit
        </a>
        <button
          type="button"
          onclick={handleSignIn}
          class="text-left font-serif text-[28px] font-normal leading-tight text-[color:var(--color-ink)]"
        >
          Sign in
        </button>
      </nav>
    </div>
  {/if}
{/if}
