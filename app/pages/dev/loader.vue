<template>
  <main class="flex min-h-dvh flex-col items-center justify-center gap-10 bg-slate-950 p-6 text-white">
    <div class="text-center">
      <p class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Preview</p>
      <h1 class="mt-1 text-2xl font-bold">VCH tank loader</h1>
    </div>

    <VchLoader :width="320" />

    <VchLoader :width="200" label="Saving entry..." />

    <p class="max-w-md text-center text-sm leading-6 text-slate-400">
      Dev preview page — not linked from the app. Use
      <code class="rounded bg-slate-900 px-1.5 py-0.5 text-slate-300">&lt;VchLoader /&gt;</code>
      in this project, or copy
      <code class="rounded bg-slate-900 px-1.5 py-0.5 text-slate-300">public/vch-tank-loader.svg</code>
      into the VCH site and show it with a plain img tag.
    </p>
  </main>
</template>
