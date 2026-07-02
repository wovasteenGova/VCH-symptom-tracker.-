import { g as getSeverityGuidance, a as _sfc_main$3, _ as _sfc_main$1, s as severityQuickPresets } from './severityGuidance-B5KujaLU.mjs';
import { d as _export_sfc, e as _sfc_main$d, _ as __nuxt_component_0$1 } from './server.mjs';
import { defineComponent, ref, computed, watch, mergeProps, unref, withCtx, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrIncludeBooleanAttr, ssrRenderStyle, ssrRenderClass, ssrRenderAttr, ssrRenderList, ssrLooseContain, ssrLooseEqual } from 'vue/server-renderer';
import { i as useSupabaseClient } from './useSupabaseClient-K6OqxTB_.mjs';
import { useRoute } from 'vue-router';
import '@vueuse/core';
import '../_/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import '@iconify/utils';
import 'node:crypto';
import 'consola';
import 'node:fs';
import 'node:path';
import '@vueuse/shared';
import '@iconify/vue';
import 'tailwindcss/colors';
import 'tailwind-variants';
import '@iconify/utils/lib/css/icon';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';
import '@floating-ui/vue';
import '@supabase/supabase-js';

function normalizeSignatureValue(value) {
  return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}
function signatureMatchesReporter(signature, firstName, lastName) {
  const normalizedSignature = normalizeSignatureValue(signature);
  const normalizedFirst = normalizeSignatureValue(firstName);
  const normalizedLast = normalizeSignatureValue(lastName);
  if (normalizedSignature.length < 2) {
    return false;
  }
  if (!normalizedFirst || !normalizedLast) {
    return false;
  }
  const normalizedFull = `${normalizedFirst} ${normalizedLast}`.trim();
  if (normalizedSignature === normalizedFull) {
    return true;
  }
  if (normalizedSignature === `${normalizedLast} ${normalizedFirst}`) {
    return true;
  }
  return normalizedSignature.includes(normalizedFirst) && normalizedSignature.includes(normalizedLast);
}
const declarationText = "By submitting this observation, you confirm that the information provided reflects what you personally observed and is submitted in good faith. Your name, email, phone number, and relationship will be stored on this report for the veteran’s review.";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "[token]",
  __ssrInlineRender: true,
  setup(__props) {
    const observationStepTitles = [
      "Your information",
      "What you observed",
      "Severity",
      "Impact & notes",
      "Sign & submit"
    ];
    const observationStepCount = observationStepTitles.length;
    const relationshipSuggestions = [
      { label: "Partner", tone: "partner" },
      { label: "Spouse", tone: "default" },
      { label: "Parent", tone: "default" },
      { label: "Child", tone: "default" },
      { label: "Sibling", tone: "default" },
      { label: "Friend", tone: "default" },
      { label: "Caregiver", tone: "default" },
      { label: "Neighbor", tone: "default" },
      { label: "Other", tone: "default" }
    ];
    const route = useRoute();
    useSupabaseClient();
    String(route.params.token || "");
    const supporterProfile = ref(null);
    const observationStep = ref(0);
    const isLoading = ref(true);
    const isSubmitting = ref(false);
    const hasAffirmedDeclaration = ref(false);
    const signatureManuallyEdited = ref(false);
    const severityValue = ref(5);
    const pageError = ref("");
    const submitError = ref("");
    const pageMessage = ref("");
    const form = ref({
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      relationship: "",
      condition_label: "",
      observed_at: "",
      impact: "",
      notes: "",
      signature_name: ""
    });
    const reporterFullName = computed(() => {
      return [form.value.first_name, form.value.last_name].filter(Boolean).join(" ").trim();
    });
    const severityGuidance = computed(() => getSeverityGuidance(severityValue.value));
    const currentStepTitle = computed(() => observationStepTitles[observationStep.value] || "");
    const isLastObservationStep = computed(() => observationStep.value >= observationStepCount - 1);
    const observationProgressWidth = computed(() => {
      return `${(observationStep.value + 1) / observationStepCount * 100}%`;
    });
    const signatureMatchesName = computed(() => {
      return signatureMatchesReporter(
        form.value.signature_name,
        form.value.first_name,
        form.value.last_name
      );
    });
    const canSubmit = computed(() => getAllSubmitBlockers().length === 0);
    function getStepBlockers(step) {
      const blockers = [];
      if (step === 0) {
        if (!form.value.first_name.trim() || !form.value.last_name.trim()) {
          blockers.push("Enter your first and last name.");
        }
        if (!form.value.email.trim()) {
          blockers.push("Enter your email address.");
        } else if (!isValidEmail(form.value.email)) {
          blockers.push("Enter a valid email address.");
        }
        if (!form.value.phone.trim()) {
          blockers.push("Enter your phone number.");
        }
        if (!form.value.relationship.trim()) {
          blockers.push("Enter your relationship to the veteran.");
        }
      }
      if (step === 1) {
        if (!form.value.condition_label) {
          blockers.push("Choose a condition.");
        }
        if (!form.value.observed_at) {
          blockers.push("Choose when you observed this.");
        }
      }
      if (step === 3) {
        if (!form.value.impact.trim()) {
          blockers.push("Describe the impact you noticed.");
        }
      }
      if (step === 4) {
        if (!hasAffirmedDeclaration.value) {
          blockers.push("Check the affirmation box.");
        }
        if (!form.value.signature_name.trim()) {
          blockers.push("Type your electronic signature (full legal name).");
        } else if (!signatureMatchesName.value) {
          blockers.push("Signature should include your first and last name.");
        }
      }
      return blockers;
    }
    function getAllSubmitBlockers() {
      return observationStepTitles.flatMap((_, index) => getStepBlockers(index));
    }
    const currentStepBlockers = computed(() => getStepBlockers(observationStep.value));
    const showCurrentStepBlockers = computed(() => {
      return observationStep.value !== 3 || Boolean(submitError.value);
    });
    function relationshipChipClass(suggestion) {
      const isSelected = form.value.relationship === suggestion.label;
      if (isSelected) {
        if (suggestion.tone === "partner") {
          return "border-fuchsia-400 bg-fuchsia-500/25 text-fuchsia-100 ring-1 ring-fuchsia-400/50 dark:border-fuchsia-400 dark:bg-fuchsia-500/20 dark:text-fuchsia-100";
        }
        return "border-slate-950 bg-slate-950 text-white dark:border-slate-500 dark:bg-slate-700 dark:text-slate-100";
      }
      if (suggestion.tone === "partner") {
        return "border-fuchsia-400/40 bg-fuchsia-500/10 text-fuchsia-700 hover:bg-fuchsia-500/15 dark:border-fuchsia-500/40 dark:bg-fuchsia-500/10 dark:text-fuchsia-200 dark:hover:bg-fuchsia-500/20";
      }
      return "border-slate-300 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-200 dark:hover:bg-slate-800";
    }
    watch(reporterFullName, (fullName) => {
      if (!signatureManuallyEdited.value && fullName) {
        form.value.signature_name = fullName;
      }
    });
    watch(hasAffirmedDeclaration, (affirmed) => {
      if (affirmed && !form.value.signature_name.trim() && reporterFullName.value) {
        form.value.signature_name = reporterFullName.value;
        signatureManuallyEdited.value = false;
      }
    });
    function isValidEmail(value) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UColorModeSwitch = _sfc_main$3;
      const _component_UIcon = _sfc_main$d;
      const _component_USlider = _sfc_main$1;
      const _component_NuxtLink = __nuxt_component_0$1;
      _push(`<main${ssrRenderAttrs(mergeProps({ class: "flex min-h-dvh flex-col bg-slate-50 text-slate-950 transition-colors dark:bg-slate-950 dark:text-white" }, _attrs))} data-v-8695318f><section class="mx-auto flex w-full max-w-md flex-1 flex-col px-4 pt-4 sm:max-w-lg" data-v-8695318f><header class="sticky top-0 z-40 -mx-4 flex shrink-0 items-start justify-between gap-3 border-b border-slate-200 bg-slate-50/95 px-4 pb-4 pt-4 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/95" data-v-8695318f><div data-v-8695318f><p class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400" data-v-8695318f>Supporter Report</p><h1 class="mt-1 text-2xl font-bold tracking-tight text-slate-950 dark:text-white" data-v-8695318f>Submit an observation</h1></div>`);
      _push(ssrRenderComponent(_component_UColorModeSwitch, {
        size: "md",
        color: "primary",
        class: "header-color-toggle shrink-0"
      }, null, _parent));
      _push(`</header>`);
      if (pageMessage.value) {
        _push(`<div class="sticky top-[5.25rem] z-30 mt-4 flex items-start gap-3 rounded-3xl border border-emerald-200 bg-emerald-50 p-4 shadow-xl shadow-emerald-950/10 dark:border-emerald-900/70 dark:bg-emerald-950/40 dark:shadow-black/20" data-v-8695318f><span class="grid size-10 shrink-0 place-items-center rounded-full bg-emerald-600 text-white" data-v-8695318f>`);
        _push(ssrRenderComponent(_component_UIcon, {
          name: "i-lucide-circle-check",
          class: "size-5"
        }, null, _parent));
        _push(`</span><div class="min-w-0 flex-1" data-v-8695318f><p class="font-bold text-emerald-950 dark:text-emerald-100" data-v-8695318f>${ssrInterpolate(pageMessage.value)}</p><p class="mt-1 text-[0.875rem] leading-6 text-emerald-900/80 dark:text-emerald-100/80" data-v-8695318f> Your observation was sent to the veteran for review. </p></div><button type="button" class="grid size-8 shrink-0 place-items-center rounded-full text-emerald-800 transition hover:bg-emerald-100 dark:text-emerald-100 dark:hover:bg-emerald-900/60" aria-label="Dismiss submission confirmation" data-v-8695318f>`);
        _push(ssrRenderComponent(_component_UIcon, {
          name: "i-lucide-x",
          class: "size-4"
        }, null, _parent));
        _push(`</button></div>`);
      } else {
        _push(`<!---->`);
      }
      if (!supporterProfile.value?.entry_context_summary) {
        _push(`<div class="mt-5 rounded-4xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900" data-v-8695318f><p class="text-sm leading-6 text-slate-600 dark:text-slate-400" data-v-8695318f> Enter your information and what you observed. The veteran reviews these notes before using them. </p></div>`);
      } else {
        _push(`<!---->`);
      }
      if (isLoading.value) {
        _push(`<section class="mt-5 rounded-4xl border border-slate-200 bg-white p-5 text-center text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400" data-v-8695318f> Loading link... </section>`);
      } else if (pageError.value) {
        _push(`<section class="mt-5 rounded-4xl border border-red-200 bg-red-50 p-5 text-center text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200" data-v-8695318f>${ssrInterpolate(pageError.value)}</section>`);
      } else {
        _push(`<!--[--><div class="mt-5 shrink-0 space-y-5" data-v-8695318f>`);
        if (supporterProfile.value?.entry_context_summary) {
          _push(`<section class="rounded-4xl border border-teal-200 bg-teal-50 p-4 dark:border-teal-500/30 dark:bg-teal-950/30" data-v-8695318f><p class="text-xs font-bold uppercase tracking-[0.14em] text-teal-700 dark:text-teal-200" data-v-8695318f>About this entry</p><p class="mt-2 text-sm leading-6 text-teal-950/90 dark:text-teal-50/90" data-v-8695318f> Entry context: <span class="font-semibold text-slate-950 dark:text-white" data-v-8695318f>${ssrInterpolate(supporterProfile.value.entry_context_summary)}</span>. </p></section>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><form class="mt-5 flex min-h-0 flex-1 flex-col overflow-hidden rounded-4xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900" data-v-8695318f><div class="sticky top-0 z-20 flex shrink-0 items-center justify-between gap-4 border-b border-slate-200 bg-white/95 px-4 py-4 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95" data-v-8695318f><button type="button" class="grid size-10 place-items-center rounded-full bg-slate-100 text-slate-950 transition hover:bg-slate-200 disabled:opacity-30 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"${ssrIncludeBooleanAttr(observationStep.value === 0) ? " disabled" : ""} aria-label="Previous step" data-v-8695318f>`);
        _push(ssrRenderComponent(_component_UIcon, {
          name: "i-lucide-chevron-left",
          class: "size-5"
        }, null, _parent));
        _push(`</button><div class="min-w-0 flex-1" data-v-8695318f><p class="text-center text-xs font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400" data-v-8695318f> Step ${ssrInterpolate(observationStep.value + 1)} of ${ssrInterpolate(unref(observationStepCount))}</p><p class="mt-1 truncate text-center text-sm font-semibold text-slate-950 dark:text-white" data-v-8695318f>${ssrInterpolate(currentStepTitle.value)}</p><div class="mt-2.5 h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800" data-v-8695318f><div class="h-full rounded-full bg-slate-950 transition-all duration-300 dark:bg-slate-500" style="${ssrRenderStyle({ width: observationProgressWidth.value })}" data-v-8695318f></div></div></div><button type="button" class="grid size-10 place-items-center rounded-full bg-slate-100 text-slate-950 transition hover:bg-slate-200 disabled:opacity-30 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"${ssrIncludeBooleanAttr(isLastObservationStep.value) ? " disabled" : ""} aria-label="Next step" data-v-8695318f>`);
        _push(ssrRenderComponent(_component_UIcon, {
          name: "i-lucide-chevron-right",
          class: "size-5"
        }, null, _parent));
        _push(`</button></div><div class="flex min-h-[22rem] flex-col overflow-hidden" data-v-8695318f><div class="${ssrRenderClass([observationStep.value === 2 ? "justify-center gap-5 py-8" : "justify-start space-y-6 py-5", "flex min-h-0 flex-1 flex-col overflow-y-auto no-scrollbar px-4"])}" data-v-8695318f>`);
        if (observationStep.value === 0) {
          _push(`<!--[--><div data-v-8695318f><p class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400" data-v-8695318f>Your information</p><p class="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400" data-v-8695318f> This will appear on the report. Enter your own details — do not use someone else’s name. </p></div><div class="grid grid-cols-2 gap-3" data-v-8695318f><label class="block" data-v-8695318f><span class="mb-2 block px-1 text-xs font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400" data-v-8695318f>First name</span><input${ssrRenderAttr("value", form.value.first_name)} type="text" autocomplete="given-name" class="w-full rounded-3xl border border-slate-300 bg-white px-4 py-4 text-base font-medium text-slate-950 outline-none placeholder:text-slate-400 focus:border-slate-500 dark:border-slate-600/70 dark:bg-slate-800/70 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-slate-400" placeholder="First name" data-v-8695318f></label><label class="block" data-v-8695318f><span class="mb-2 block px-1 text-xs font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400" data-v-8695318f>Last name</span><input${ssrRenderAttr("value", form.value.last_name)} type="text" autocomplete="family-name" class="w-full rounded-3xl border border-slate-300 bg-white px-4 py-4 text-base font-medium text-slate-950 outline-none placeholder:text-slate-400 focus:border-slate-500 dark:border-slate-600/70 dark:bg-slate-800/70 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-slate-400" placeholder="Last name" data-v-8695318f></label></div><label class="block" data-v-8695318f><span class="mb-2 block px-1 text-xs font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400" data-v-8695318f>Email</span><input${ssrRenderAttr("value", form.value.email)} type="email" autocomplete="email" class="w-full rounded-3xl border border-slate-300 bg-white px-4 py-4 text-base font-medium text-slate-950 outline-none placeholder:text-slate-400 focus:border-slate-500 dark:border-slate-600/70 dark:bg-slate-800/70 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-slate-400" placeholder="you@example.com" data-v-8695318f></label><label class="block" data-v-8695318f><span class="mb-2 block px-1 text-xs font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400" data-v-8695318f>Phone</span><input${ssrRenderAttr("value", form.value.phone)} type="tel" autocomplete="tel" class="w-full rounded-3xl border border-slate-300 bg-white px-4 py-4 text-base font-medium text-slate-950 outline-none placeholder:text-slate-400 focus:border-slate-500 dark:border-slate-600/70 dark:bg-slate-800/70 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-slate-400" placeholder="(555) 555-5555" data-v-8695318f></label><label class="block" data-v-8695318f><span class="mb-2 block px-1 text-xs font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400" data-v-8695318f>Relationship to veteran</span><input${ssrRenderAttr("value", form.value.relationship)} type="text" class="w-full rounded-3xl border border-slate-300 bg-white px-4 py-4 text-base font-medium text-slate-950 outline-none placeholder:text-slate-400 focus:border-slate-500 dark:border-slate-600/70 dark:bg-slate-800/70 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-slate-400" placeholder="Partner, spouse, parent, friend, caregiver" data-v-8695318f><div class="mt-3 flex flex-wrap gap-2 px-1" data-v-8695318f><!--[-->`);
          ssrRenderList(relationshipSuggestions, (suggestion) => {
            _push(`<button type="button" class="${ssrRenderClass([relationshipChipClass(suggestion), "rounded-full border px-3 py-1.5 text-xs font-bold transition"])}" data-v-8695318f>${ssrInterpolate(suggestion.label)}</button>`);
          });
          _push(`<!--]--></div></label><!--]-->`);
        } else if (observationStep.value === 1) {
          _push(`<!--[--><div data-v-8695318f><p class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400" data-v-8695318f>What you observed</p><p class="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400" data-v-8695318f> Choose the condition and when you noticed it. </p></div><label class="block" data-v-8695318f><span class="mb-2 block px-1 text-xs font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400" data-v-8695318f>Condition</span><select class="w-full rounded-3xl border border-slate-300 bg-white px-4 py-4 text-base font-medium text-slate-950 outline-none focus:border-slate-500 dark:border-slate-600/70 dark:bg-slate-800/70 dark:text-white dark:focus:border-slate-400 dark:[color-scheme:dark]" data-v-8695318f><option value="" disabled data-v-8695318f${ssrIncludeBooleanAttr(Array.isArray(form.value.condition_label) ? ssrLooseContain(form.value.condition_label, "") : ssrLooseEqual(form.value.condition_label, "")) ? " selected" : ""}>Select condition</option><!--[-->`);
          ssrRenderList(supporterProfile.value?.visible_conditions || [], (condition) => {
            _push(`<option${ssrRenderAttr("value", condition)} data-v-8695318f${ssrIncludeBooleanAttr(Array.isArray(form.value.condition_label) ? ssrLooseContain(form.value.condition_label, condition) : ssrLooseEqual(form.value.condition_label, condition)) ? " selected" : ""}>${ssrInterpolate(condition)}</option>`);
          });
          _push(`<!--]--></select></label><label class="block" data-v-8695318f><span class="mb-2 block px-1 text-xs font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400" data-v-8695318f>Observed at</span><input${ssrRenderAttr("value", form.value.observed_at)} type="datetime-local" class="w-full rounded-3xl border border-slate-300 bg-white px-4 py-4 text-base font-medium text-slate-950 outline-none focus:border-slate-500 dark:border-slate-600/70 dark:bg-slate-800/70 dark:text-white dark:focus:border-slate-400 dark:[color-scheme:dark]" data-v-8695318f></label><!--]-->`);
        } else if (observationStep.value === 2) {
          _push(`<!--[--><div class="space-y-1 text-center" data-v-8695318f><p class="text-xs font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400" data-v-8695318f> Severity you noticed </p><p class="text-xs leading-5 text-slate-500 dark:text-slate-400" data-v-8695318f> Slide between mild and severe based on what you saw. </p></div><div class="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400" data-v-8695318f><span data-v-8695318f>Mild</span><span class="rounded-full bg-slate-950 px-3 py-1 text-xs font-bold text-white dark:bg-slate-700 dark:text-slate-100" data-v-8695318f>${ssrInterpolate(severityValue.value)}/10 </span><span data-v-8695318f>Severe</span></div>`);
          _push(ssrRenderComponent(_component_USlider, {
            modelValue: severityValue.value,
            "onUpdate:modelValue": ($event) => severityValue.value = $event,
            min: 0,
            max: 10,
            step: 1,
            size: "xl",
            color: "neutral",
            tooltip: ""
          }, null, _parent));
          _push(`<div class="flex flex-wrap justify-center gap-2" data-v-8695318f><!--[-->`);
          ssrRenderList(unref(severityQuickPresets), (preset) => {
            _push(`<button type="button" class="${ssrRenderClass([severityValue.value === preset.value ? "border-slate-950 bg-slate-950 text-white dark:border-slate-500 dark:bg-slate-700 dark:text-slate-100" : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-200 dark:hover:bg-slate-800", "rounded-full border px-3 py-1.5 text-xs font-bold transition"])}" data-v-8695318f>${ssrInterpolate(preset.label)}</button>`);
          });
          _push(`<!--]--></div><div class="min-h-[5rem] overflow-hidden" data-v-8695318f><div class="rounded-2xl bg-slate-100/80 px-5 py-4 dark:bg-slate-800/80" data-v-8695318f><p class="text-center text-xs font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400" data-v-8695318f>${ssrInterpolate(severityGuidance.value.title)}</p><p class="mt-2 text-center text-sm leading-6 text-slate-600 dark:text-slate-300" data-v-8695318f>${ssrInterpolate(severityGuidance.value.text)}</p></div></div><!--]-->`);
        } else if (observationStep.value === 3) {
          _push(`<!--[--><div data-v-8695318f><p class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400" data-v-8695318f>Impact &amp; notes</p><p class="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400" data-v-8695318f> Describe how this affected daily life, work, sleep, mood, or activity. </p></div><label class="block" data-v-8695318f><span class="mb-4 block text-xs font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400" data-v-8695318f>Impact you noticed</span><textarea rows="4" class="w-full resize-none border-0 border-b border-slate-300/80 bg-transparent px-0 py-4 text-base font-medium leading-7 text-slate-950 outline-none placeholder:text-slate-400 focus:border-slate-500 dark:border-slate-600 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-slate-400" placeholder="What changed in work, sleep, mood, chores, walking, family time, etc.?" data-v-8695318f>${ssrInterpolate(form.value.impact)}</textarea></label><label class="block" data-v-8695318f><span class="mb-4 block text-xs font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400" data-v-8695318f>Notes (optional)</span><textarea rows="3" class="w-full resize-none border-0 border-b border-slate-300/80 bg-transparent px-0 py-4 text-base font-medium leading-7 text-slate-950 outline-none placeholder:text-slate-400 focus:border-slate-500 dark:border-slate-600 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-slate-400" placeholder="Optional extra details" data-v-8695318f>${ssrInterpolate(form.value.notes)}</textarea></label><!--]-->`);
        } else {
          _push(`<!--[--><div data-v-8695318f><p class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400" data-v-8695318f>Sign &amp; submit</p><p class="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400" data-v-8695318f> Review the affirmation and sign with your full legal name. </p></div><div class="rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50" data-v-8695318f><p class="text-sm leading-6 text-slate-600 dark:text-slate-300" data-v-8695318f>${ssrInterpolate(declarationText)}</p>`);
          if (reporterFullName.value) {
            _push(`<p class="mt-3 rounded-2xl border border-slate-200 bg-slate-100/80 px-3 py-2 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200" data-v-8695318f> Report will list: <span class="font-bold text-slate-950 dark:text-white" data-v-8695318f>${ssrInterpolate(reporterFullName.value)}</span>`);
            if (form.value.email) {
              _push(`<span data-v-8695318f> · ${ssrInterpolate(form.value.email)}</span>`);
            } else {
              _push(`<!---->`);
            }
            if (form.value.phone) {
              _push(`<span data-v-8695318f> · ${ssrInterpolate(form.value.phone)}</span>`);
            } else {
              _push(`<!---->`);
            }
            if (form.value.relationship) {
              _push(`<span data-v-8695318f> · ${ssrInterpolate(form.value.relationship)}</span>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</p>`);
          } else {
            _push(`<!---->`);
          }
          _push(`<label class="mt-4 flex cursor-pointer items-start gap-3" data-v-8695318f><input${ssrIncludeBooleanAttr(Array.isArray(hasAffirmedDeclaration.value) ? ssrLooseContain(hasAffirmedDeclaration.value, null) : hasAffirmedDeclaration.value) ? " checked" : ""} type="checkbox" class="mt-1 size-5 shrink-0 rounded border-slate-300 bg-white text-slate-950 focus:ring-slate-400 dark:border-slate-600 dark:bg-slate-800/70 dark:text-slate-200" data-v-8695318f><span class="text-sm font-semibold leading-6 text-slate-950 dark:text-white" data-v-8695318f> I affirm that this statement is true and accurate to the best of my knowledge, and I agree that my name and contact information above will appear on this report. </span></label><label class="mt-4 block" data-v-8695318f><span class="mb-2 block px-1 text-xs font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400" data-v-8695318f>Electronic signature</span><input${ssrRenderAttr("value", form.value.signature_name)} type="text" autocomplete="name" class="w-full rounded-3xl border border-slate-300 bg-white px-4 py-4 text-base font-medium text-slate-950 outline-none placeholder:text-slate-400 focus:border-slate-500 dark:border-slate-600/70 dark:bg-slate-800/70 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-slate-400" placeholder="Type your full legal name" data-v-8695318f><p class="mt-2 px-1 text-xs leading-5 text-slate-500 dark:text-slate-400" data-v-8695318f> Include your first and last name (capitalization does not matter). </p></label></div><!--]-->`);
        }
        _push(`</div></div><div class="sticky bottom-0 z-30 -mx-4 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3" data-v-8695318f>`);
        if (showCurrentStepBlockers.value && currentStepBlockers.value.length && !isSubmitting.value) {
          _push(`<ul class="mb-4 rounded-3xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-900/60 dark:bg-amber-950/30" data-v-8695318f><!--[-->`);
          ssrRenderList(currentStepBlockers.value, (blocker) => {
            _push(`<li class="flex items-start gap-2 py-1 text-sm text-amber-950 dark:text-amber-100" data-v-8695318f>`);
            _push(ssrRenderComponent(_component_UIcon, {
              name: "i-lucide-circle-dot",
              class: "mt-0.5 size-4 shrink-0"
            }, null, _parent));
            _push(`<span data-v-8695318f>${ssrInterpolate(blocker)}</span></li>`);
          });
          _push(`<!--]--></ul>`);
        } else {
          _push(`<!---->`);
        }
        if (submitError.value) {
          _push(`<p class="mb-4 text-center text-sm font-medium text-red-600 dark:text-red-300" data-v-8695318f>${ssrInterpolate(submitError.value)}</p>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<button type="submit" class="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-4 text-base font-bold text-white shadow-lg transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600"${ssrIncludeBooleanAttr(isSubmitting.value || isLastObservationStep.value && !canSubmit.value) ? " disabled" : ""} data-v-8695318f>${ssrInterpolate(isSubmitting.value ? "Submitting..." : isLastObservationStep.value ? "Submit Observation" : "Continue")} `);
        _push(ssrRenderComponent(_component_UIcon, {
          name: isLastObservationStep.value ? "i-lucide-check" : "i-lucide-arrow-right",
          class: "size-5"
        }, null, _parent));
        _push(`</button></div></form><footer class="mt-6 flex shrink-0 items-center justify-center gap-3 pb-[max(1rem,env(safe-area-inset-bottom))] text-xs font-semibold text-slate-500" data-v-8695318f>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/privacy",
          class: "hover:text-slate-700 dark:hover:text-slate-300"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`Privacy`);
            } else {
              return [
                createTextVNode("Privacy")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/disclaimer",
          class: "hover:text-slate-700 dark:hover:text-slate-300"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`Disclaimer`);
            } else {
              return [
                createTextVNode("Disclaimer")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</footer><!--]-->`);
      }
      _push(`</section></main>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/report/[token].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const _token_ = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-8695318f"]]);

export { _token_ as default };
//# sourceMappingURL=_token_-BB5-lDg9.mjs.map
