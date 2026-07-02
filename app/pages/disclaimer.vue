<template>
  <main class="min-h-dvh bg-slate-950 text-white">
    <section class="mx-auto min-h-dvh w-full max-w-md px-4 pb-8 pt-5 sm:max-w-lg">
      <header class="flex items-center justify-between gap-3">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Disclaimer</p>
          <h1 class="mt-1 text-2xl font-bold tracking-tight text-white">Important Medical Notice</h1>
        </div>

        <NuxtLink
          to="/"
          class="grid size-10 place-items-center rounded-full bg-slate-900 text-white shadow-sm ring-1 ring-slate-800 transition hover:bg-slate-800"
          aria-label="Back to tracker"
        >
          <UIcon name="i-lucide-arrow-left" class="size-5" />
        </NuxtLink>
      </header>

      <section class="mt-6 space-y-4 rounded-4xl border border-slate-800 bg-slate-900 p-5 text-sm leading-6 text-slate-300">
        <p>
          Veteran Symptom Tracker is for personal symptom organization and recordkeeping. It is not
          medical advice, diagnosis, treatment, legal advice, or a VA claim decision tool.
        </p>

        <div>
          <h2 class="text-base font-bold text-white">Not for emergencies</h2>
          <p class="mt-2">
            Do not use this app as an emergency or crisis response tool. If you may hurt yourself or
            someone else, or if you are having a medical emergency, call emergency services now.
          </p>
        </div>

        <div>
          <h2 class="text-base font-bold text-white">Veterans Crisis Line</h2>
          <p class="mt-2">
            In the United States, veterans can call 988 and press 1, text 838255, or chat at
            veteranscrisisline.net.
          </p>
        </div>

        <div>
          <h2 class="text-base font-bold text-white">Use with judgment</h2>
          <p class="mt-2">
            Symptom logs and supporter observations may help you remember details, but they do not
            guarantee any medical, legal, benefits, or VA outcome.
          </p>
        </div>
      </section>
    </section>
  </main>
</template>
