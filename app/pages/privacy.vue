<template>
  <main class="min-h-dvh bg-slate-950 text-white">
    <section class="mx-auto min-h-dvh w-full max-w-md px-4 pb-8 pt-5 sm:max-w-lg">
      <header class="flex items-center justify-between gap-3">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Privacy</p>
          <h1 class="mt-1 text-2xl font-bold tracking-tight text-white">Privacy and Data Use</h1>
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
          Veteran Symptom Tracker stores the information you enter so you can review symptom patterns,
          daily impact, and supporter observations.
        </p>

        <div>
          <h2 class="text-base font-bold text-white">Information we store</h2>
          <ul class="mt-2 list-disc space-y-2 pl-5">
            <li>Account email and profile name.</li>
            <li>Symptom entries, severity, dates, notes, and daily impact details.</li>
            <li>Supporter link settings and the conditions you choose to make visible.</li>
            <li>Supporter observations, reporter name, email, phone, relationship, affirmation, signature name, and timestamp.</li>
          </ul>
        </div>

        <div>
          <h2 class="text-base font-bold text-white">How supporter reports work</h2>
          <p class="mt-2">
            A supporter can only access the private report link you create. They can only see the
            condition labels you selected for that link. They cannot see your full account or full history.
          </p>
        </div>

        <div>
          <h2 class="text-base font-bold text-white">Data provider</h2>
          <p class="mt-2">
            This app uses Supabase for authentication and database storage. Do not enter information
            you are not comfortable storing in a cloud database.
          </p>
        </div>

        <div>
          <h2 class="text-base font-bold text-white">Data deletion</h2>
          <p class="mt-2">
            This beta does not yet have a self-serve delete account button. For now, contact the app owner
            to request deletion before using this with a large public audience.
          </p>
        </div>
      </section>
    </section>
  </main>
</template>
