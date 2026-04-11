<script lang="ts">
  import MobileMenu from '$lib/components/MobileMenu.svelte';
  import { authModal } from '$lib/stores/auth-modal.svelte';

  let scrollY = $state(0);
  let mobileMenuOpen = $state(false);

  // Track window scrollY so the header can fade + blur once the user has scrolled past 24px.
  $effect(() => {
    if (typeof window === 'undefined') return;
    const onScroll = () => {
      scrollY = window.scrollY;
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  });

  const scrolled = $derived(scrollY > 24);

  const scrollClasses = $derived(
    scrolled
      ? 'bg-[color:var(--color-paper)]/80 backdrop-blur-sm'
      : 'bg-[color:var(--color-paper)]'
  );

  function openSignIn() {
    authModal.openModal();
  }

  function openMobileMenu() {
    mobileMenuOpen = true;
  }
</script>

<header
  class="sticky top-0 z-40 h-16 md:h-20 px-6 md:px-12 flex items-center justify-between border-b border-[color:var(--color-hairline)] transition-[background-color,backdrop-filter] duration-200 ease-out {scrollClasses}"
>
  <a
    href="/"
    class="inline-flex min-h-11 items-center font-serif text-[28px] font-normal leading-none text-[color:var(--color-ink)]"
  >
    Rule 257
  </a>

  <nav class="hidden items-center gap-8 md:flex">
    <a
      href="#"
      class="group relative inline-flex min-h-11 min-w-11 items-center font-sans text-[13px] font-normal uppercase tracking-wide text-[color:var(--color-ink)]"
    >
      <span class="relative after:absolute after:left-0 after:-bottom-1 after:h-px after:w-0 after:bg-[color:var(--color-ink)] after:transition-[width] after:duration-150 after:ease-out group-hover:after:w-full">The Space</span>
    </a>
    <a
      href="#"
      class="group relative inline-flex min-h-11 min-w-11 items-center font-sans text-[13px] font-normal uppercase tracking-wide text-[color:var(--color-ink)]"
    >
      <span class="relative after:absolute after:left-0 after:-bottom-1 after:h-px after:w-0 after:bg-[color:var(--color-ink)] after:transition-[width] after:duration-150 after:ease-out group-hover:after:w-full">Menu</span>
    </a>
    <a
      href="#"
      class="group relative inline-flex min-h-11 min-w-11 items-center font-sans text-[13px] font-normal uppercase tracking-wide text-[color:var(--color-ink)]"
    >
      <span class="relative after:absolute after:left-0 after:-bottom-1 after:h-px after:w-0 after:bg-[color:var(--color-ink)] after:transition-[width] after:duration-150 after:ease-out group-hover:after:w-full">Visit</span>
    </a>
    <button
      type="button"
      onclick={openSignIn}
      class="min-h-11 min-w-11 bg-[color:var(--color-ink)] px-6 py-3 font-sans text-[13px] font-normal uppercase tracking-wide text-[color:var(--color-paper)] transition-opacity duration-150 ease-out hover:opacity-85"
    >Sign in</button>
  </nav>

  <button
    type="button"
    aria-label="Open menu"
    onclick={openMobileMenu}
    class="inline-flex min-h-11 min-w-11 flex-col items-center justify-center gap-[6px] md:hidden"
  >
    <span class="block h-[2px] w-6 bg-[color:var(--color-ink)]"></span>
    <span class="block h-[2px] w-6 bg-[color:var(--color-ink)]"></span>
    <span class="block h-[2px] w-6 bg-[color:var(--color-ink)]"></span>
  </button>
</header>

<MobileMenu bind:open={mobileMenuOpen} />
