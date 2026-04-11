// Shared modal state for the Sign in button in SiteHeader and the AuthModal component.
// Plan 04 mounts <AuthModal /> inside +layout.svelte and binds to this state.

let open = $state(false);

export const authModal = {
  get open() { return open; },
  set open(v: boolean) { open = v; },
  openModal() { open = true; },
  close() { open = false; }
};
