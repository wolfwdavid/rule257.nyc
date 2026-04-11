<script lang="ts">
  import { authClient } from '$lib/auth-client';
  import { authModal } from '$lib/stores/auth-modal.svelte';
  import { fade, fly } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';

  let email = $state('');
  let status = $state<'input' | 'sending' | 'sent' | 'error'>('input');
  let errorMessage = $state('');

  let open = $derived(authModal.open);

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    status = 'sending';
    errorMessage = '';
    try {
      const result = await authClient.signIn.magicLink({
        email: email.trim(),
        callbackURL: '/account'
      });
      if (result?.error) {
        status = 'error';
        errorMessage = result.error.message ?? '';
        return;
      }
      status = 'sent';
    } catch (err) {
      status = 'error';
      errorMessage = err instanceof Error ? err.message : String(err);
    }
  }

  function handleClose() {
    authModal.close();
    email = '';
    status = 'input';
    errorMessage = '';
  }

  function handleUseDifferentEmail() {
    email = '';
    status = 'input';
    errorMessage = '';
  }

  function handleBackdropClick() {
    handleClose();
  }

  $effect(() => {
    if (!open) return;
    if (typeof window === 'undefined') return;
    const onKeydown = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', onKeydown);
    return () => window.removeEventListener('keydown', onKeydown);
  });
</script>

{#if open}
  <div
    role="dialog"
    aria-modal="true"
    aria-labelledby="auth-modal-heading"
    class="fixed inset-0 z-50 flex items-center justify-center"
    transition:fade={{ duration: 200 }}
  >
    <button
      type="button"
      aria-label="Close sign-in"
      onclick={handleBackdropClick}
      class="absolute inset-0 bg-[color:var(--color-ink)]/60 cursor-default"
    ></button>

    <div
      class="relative w-full max-w-md mx-6 p-12 bg-[color:var(--color-paper)] border border-[color:var(--color-hairline)]"
      transition:fly={{ y: 8, duration: 300, easing: cubicOut }}
    >
      <button
        type="button"
        aria-label="Close sign-in"
        onclick={handleClose}
        class="absolute top-4 right-4 inline-flex min-h-11 min-w-11 items-center justify-center font-sans text-[color:var(--color-ink)]"
      >
        <span aria-hidden="true" class="text-xl leading-none">&times;</span>
      </button>

      {#if status === 'input' || status === 'sending' || status === 'error'}
        <h2
          id="auth-modal-heading"
          class="font-serif text-[28px] font-normal leading-tight text-[color:var(--color-ink)]"
        >
          Sign in to Rule 257
        </h2>
        <p
          class="font-sans text-base leading-relaxed mt-4 text-[color:var(--color-ink-muted)]"
        >
          Enter your email and we'll send you a link.
        </p>

        <form onsubmit={handleSubmit} class="mt-8 space-y-4">
          <label
            for="auth-email"
            class="block font-sans text-[13px] uppercase tracking-wide text-[color:var(--color-ink-muted)]"
          >
            Email
          </label>
          <input
            id="auth-email"
            type="email"
            required
            bind:value={email}
            placeholder="you@example.com"
            aria-describedby={status === 'error' ? 'auth-error' : undefined}
            class="w-full border-b border-[color:var(--color-hairline)] bg-transparent py-3 font-sans text-base text-[color:var(--color-ink)] placeholder:text-[color:var(--color-ink-muted)] focus:outline-none focus:border-[color:var(--color-ink)]"
          />
          <button
            type="submit"
            disabled={status === 'sending'}
            class="w-full bg-[color:var(--color-ink)] text-[color:var(--color-paper)] py-4 font-sans text-[13px] uppercase tracking-wide min-h-11 transition-opacity duration-150 ease-out hover:opacity-85 disabled:opacity-50"
          >
            {status === 'sending' ? 'Sending...' : 'Send magic link'}
          </button>
          {#if status === 'error'}
            <p
              id="auth-error"
              role="alert"
              class="font-sans text-sm text-[color:var(--color-destructive)]"
            >
              We couldn't send that link. Check the email and try again.
            </p>
          {/if}
        </form>
      {:else if status === 'sent'}
        <h2
          id="auth-modal-heading"
          class="font-serif text-[28px] font-normal leading-tight text-[color:var(--color-ink)]"
        >
          Check your email
        </h2>
        <p
          class="font-sans text-base leading-relaxed mt-4 text-[color:var(--color-ink-muted)]"
          aria-live="polite"
        >
          We sent a sign-in link to <strong class="text-[color:var(--color-ink)]">{email}</strong>. It expires in 10 minutes.
        </p>
        <button
          type="button"
          onclick={handleUseDifferentEmail}
          class="mt-8 font-sans text-[13px] uppercase tracking-wide text-[color:var(--color-ink)] underline min-h-11"
        >
          Use a different email
        </button>
      {/if}
    </div>
  </div>
{/if}
