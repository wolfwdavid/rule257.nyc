<section
  aria-label="Coming soon"
  class="cover relative px-6 md:px-12 pt-10 md:pt-14 pb-20 md:pb-28 min-h-[calc(100vh-10rem)]"
>
  <!-- Editorial masthead — hairline-separated, tracked sans, derived from address only. -->
  <div
    class="flex items-center justify-between gap-6 border-b border-[color:var(--color-hairline)] pb-4 mb-12 md:mb-20"
  >
    <span class="cover-masthead">R · 257</span>
    <span class="cover-masthead">Eldridge · NYC</span>
  </div>

  <!-- Cover plate: hero bleeds right, oversize serif overlaps lower-left on md+.
       NB: no `isolation` here — the title's mix-blend-mode: difference must reach the page paper
       on the portion that extends past the image's left edge. -->
  <div class="relative">
    <!-- Hero (right-aligned, bleeds off right edge on desktop). Soft left-edge mask gives the
         overlapping title a paper-toned shoulder so it doesn't crash into the photo's busiest tones. -->
    <div class="grain w-full md:w-[88%] md:ml-auto md:-mr-12">
      <img
        src="/images/rule257-coming-soon.jpg"
        alt="Rule 257 — 54 Eldridge St, NYC"
        width="1600"
        height="900"
        loading="eager"
        fetchpriority="high"
        class="block w-full aspect-[16/9] object-cover"
        style="filter: saturate(0.88) contrast(1.06); mask-image: var(--cover-image-mask); -webkit-mask-image: var(--cover-image-mask);"
      />
    </div>

    <!-- Display title. Stacks below image on mobile, overlaps lower-left on md+. -->
    <h1 class="cover-display mt-8 md:mt-0 md:absolute md:left-0 md:bottom-6 lg:bottom-10 md:max-w-[62%] z-20">
      Coming<br />Soon.
    </h1>
  </div>

  <!-- Dek row: oxblood rule + tagline (hangs left, not centered) + Roman folio (right). -->
  <div class="mt-16 md:mt-24 grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
    <div class="md:col-span-8 md:col-start-1 flex items-start gap-4">
      <span
        aria-hidden="true"
        class="mt-[0.65em] block h-px w-10 shrink-0"
        style="background-color: var(--color-accent);"
      ></span>
      <p
        class="font-sans text-base md:text-lg leading-relaxed text-[color:var(--color-ink-muted)] max-w-prose"
      >
        Where art, fashion, design, and coffee converge. 54 Eldridge St, New York.
      </p>
    </div>
    <span class="cover-folio justify-self-end md:col-start-12" aria-hidden="true">I.</span>
  </div>
</section>
