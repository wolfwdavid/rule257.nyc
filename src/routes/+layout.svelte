<script lang="ts">
  import '../app.css';
  import SafeArea from '$lib/components/SafeArea.svelte';
  import SiteHeader from '$lib/components/SiteHeader.svelte';
  import SiteFooter from '$lib/components/SiteFooter.svelte';
  import AuthModal from '$lib/components/AuthModal.svelte';

  let { children: pageContent } = $props();
</script>

<SafeArea>
  {#snippet children()}
    <div class="flex min-h-dvh flex-col">
      <SiteHeader />
      <main class="flex-1">
        {@render pageContent()}
      </main>
      <SiteFooter />
    </div>
  {/snippet}
</SafeArea>

<AuthModal />
