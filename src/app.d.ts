// See https://kit.svelte.dev/docs/types#app
declare global {
  namespace App {
    interface Locals {
      session?: import('better-auth').Session;
      user?: import('better-auth').User;
    }
  }
}
export {};
