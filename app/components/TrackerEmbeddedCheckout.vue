<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        class="fixed inset-0 z-[80] flex flex-col bg-slate-950/95 backdrop-blur-sm"
      >
        <header class="flex shrink-0 items-center justify-between gap-3 border-b border-slate-800 px-4 pb-4 pt-[max(1rem,env(safe-area-inset-top))]">
          <div>
            <p class="text-xs font-bold uppercase tracking-[0.16em] text-amber-300">Secure checkout</p>
            <h2 class="mt-1 text-lg font-bold text-white">Symptom Tracker Pro</h2>
          </div>
          <button
            type="button"
            class="grid size-10 place-items-center rounded-full bg-slate-900 text-slate-300 ring-1 ring-slate-800 transition hover:bg-slate-800 hover:text-white"
            aria-label="Close checkout"
            :disabled="isLoading"
            @click="handleClose"
          >
            <UIcon name="i-lucide-x" class="size-5" />
          </button>
        </header>

        <div class="flex flex-1 flex-col overflow-hidden">
          <div
            v-if="isLoading"
            class="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center"
          >
            <UIcon name="i-lucide-loader-circle" class="size-8 animate-spin text-amber-300" />
            <p class="text-sm text-slate-300">Loading secure payment form...</p>
          </div>

          <div
            v-else-if="errorMessage"
            class="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center"
          >
            <div class="rounded-3xl border border-red-900/60 bg-red-950/30 px-5 py-4">
              <p class="text-sm leading-6 text-red-200">{{ errorMessage }}</p>
            </div>
            <button
              type="button"
              class="rounded-2xl bg-white px-5 py-3 text-sm font-bold text-slate-950"
              @click="initializeCheckout"
            >
              Try again
            </button>
          </div>

          <div
            ref="checkoutMountElement"
            class="min-h-0 flex-1 overflow-y-auto bg-white"
            :class="{ hidden: isLoading || errorMessage }"
          />
        </div>

        <p class="shrink-0 border-t border-slate-800 px-4 py-3 text-center text-[0.68rem] leading-5 text-slate-500 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          Payments processed by Stripe. You stay in the app until payment completes.
        </p>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { loadStripe, type StripeEmbeddedCheckout } from '@stripe/stripe-js'
import { nextTick, onUnmounted, ref, watch } from 'vue'
import { useEntitlements } from '../composables/useEntitlements'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  close: []
  error: [message: string]
}>()

const config = useRuntimeConfig()
const { createEmbeddedCheckoutSession } = useEntitlements()

const checkoutMountElement = ref<HTMLElement | null>(null)
const isLoading = ref(false)
const errorMessage = ref('')
let embeddedCheckout: StripeEmbeddedCheckout | null = null

function destroyCheckout() {
  if (embeddedCheckout) {
    embeddedCheckout.destroy()
    embeddedCheckout = null
  }
}

function handleClose() {
  destroyCheckout()
  emit('close')
}

async function initializeCheckout() {
  if (!import.meta.client || !props.open) {
    return
  }

  destroyCheckout()
  isLoading.value = true
  errorMessage.value = ''

  try {
    if (!config.public.stripePublishableKey) {
      throw new Error('Stripe publishable key is not configured.')
    }

    const stripe = await loadStripe(config.public.stripePublishableKey)

    if (!stripe) {
      throw new Error('Could not load Stripe.')
    }

    const session = await createEmbeddedCheckoutSession()

    if (!session.clientSecret) {
      throw new Error('Checkout session secret was missing.')
    }

    const checkout = await stripe.createEmbeddedCheckoutPage({
      clientSecret: session.clientSecret
    })

    isLoading.value = false
    await nextTick()

    if (!checkoutMountElement.value) {
      throw new Error('Checkout container was not ready.')
    }

    checkout.mount(checkoutMountElement.value)
    embeddedCheckout = checkout
  } catch (error) {
    isLoading.value = false
    errorMessage.value = error instanceof Error ? error.message : 'Could not load checkout.'
    emit('error', errorMessage.value)
  }
}

watch(() => props.open, async (isOpen) => {
  if (isOpen) {
    await initializeCheckout()
    return
  }

  destroyCheckout()
  errorMessage.value = ''
  isLoading.value = false
})

onUnmounted(() => {
  destroyCheckout()
})
</script>
