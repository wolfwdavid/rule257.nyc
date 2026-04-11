<script lang="ts">
  import { authClient } from '$lib/auth-client';
  import { goto } from '$app/navigation';

  const session = authClient.useSession();

  $effect(() => {
    if (!$session.isPending && $session.data === null) {
      goto('/');
    }
  });

  async function handleSignOut() {
    await authClient.signOut();
    goto('/');
  }
</script>

<section class="px-6 py-32 md:py-40 max-w-3xl mx-auto" aria-label="Your account">
  {#if $session.isPending}
    <p class="p-8 font-sans text-[color:var(--color-ink-muted)]">Loading...</p>
  {:else if $session.data}
    <h1 class="font-serif text-[28px] font-normal leading-tight text-[color:var(--color-ink)]">Welcome</h1>
    <p class="font-sans text-base leading-relaxed mt-4 text-[color:var(--color-ink-muted)]">
      Signed in as <strong class="text-[color:var(--color-ink)]">{$session.data.user.email}</strong>. Your loyalty dashboard is coming soon.
    </p>
    <button
      type="button"
      onclick={handleSignOut}
      class="mt-12 bg-[color:var(--color-ink)] text-[color:var(--color-paper)] px-8 py-4 font-sans text-[13px] uppercase tracking-wide min-h-11 transition-opacity duration-150 ease-out hover:opacity-85"
    >
      Sign out
    </button>
  {/if}
</section>
