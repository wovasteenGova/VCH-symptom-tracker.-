<template>
  <main class="min-h-dvh bg-slate-950 text-white">
    <section class="mx-auto min-h-dvh w-full max-w-md px-4 pb-8 pt-5 sm:max-w-lg">
      <header class="flex items-center justify-between gap-3">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.2em] text-teal-200">Install Guide</p>
          <h1 class="mt-1 text-2xl font-bold tracking-tight text-white">Add the app to your phone</h1>
        </div>

        <NuxtLink
          to="/"
          class="grid size-10 place-items-center rounded-full bg-slate-900 text-white shadow-sm ring-1 ring-slate-800 transition hover:bg-slate-800"
          aria-label="Back to tracker"
        >
          <UIcon name="i-lucide-arrow-left" class="size-5" />
        </NuxtLink>
      </header>

      <section class="mt-6 rounded-4xl border border-slate-800 bg-slate-900 p-5">
        <h2 class="text-xl font-bold text-white">iPhone</h2>
        <ol class="mt-4 space-y-3 text-sm leading-6 text-slate-300">
          <li><span class="font-bold text-white">1.</span> Open this site in Safari.</li>
          <li><span class="font-bold text-white">2.</span> Tap the Share button at the bottom of Safari.</li>
          <li><span class="font-bold text-white">3.</span> Scroll and tap Add to Home Screen.</li>
          <li><span class="font-bold text-white">4.</span> Tap Add. The app will appear with your other apps.</li>
        </ol>
      </section>

      <section class="mt-4 rounded-4xl border border-slate-800 bg-slate-900 p-5">
        <h2 class="text-xl font-bold text-white">Android</h2>
        <ol class="mt-4 space-y-3 text-sm leading-6 text-slate-300">
          <li><span class="font-bold text-white">1.</span> Open this site in Chrome.</li>
          <li><span class="font-bold text-white">2.</span> Tap Install app if Chrome shows it.</li>
          <li><span class="font-bold text-white">3.</span> If not, tap the three-dot menu.</li>
          <li><span class="font-bold text-white">4.</span> Tap Add to Home screen or Install app.</li>
        </ol>
      </section>

      <section class="mt-4 rounded-4xl border border-teal-500/30 bg-teal-950/30 p-5">
        <h2 class="text-xl font-bold text-white">Share this with testers</h2>
        <p class="mt-3 text-sm leading-6 text-teal-50/90">
          Open the app link on your phone. On iPhone use Safari Share > Add to Home Screen.
          On Android use Chrome > Install app or Add to Home screen.
        </p>
      </section>
    </section>
  </main>
</template>
