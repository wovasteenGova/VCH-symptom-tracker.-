import { _ as __nuxt_component_0$1, e as _sfc_main$d } from './server.mjs';
import { _ as __nuxt_component_5 } from './StickyActionBar-DXZsYWQC.mjs';
import { u as useSupabaseAuth, b as useSymptomEntries, m as mapEntryHistoryItem, a as _sfc_main$2, _ as _sfc_main$1 } from './entryDisplay-DEuUZYtU.mjs';
import { defineComponent, ref, computed, watch, mergeProps, withCtx, createVNode, unref, openBlock, createBlock, toDisplayString, createCommentVNode, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderAttr, ssrIncludeBooleanAttr, ssrRenderList } from 'vue/server-renderer';
import { i as useSupabaseClient } from './useSupabaseClient-K6OqxTB_.mjs';
import { useRoute } from 'vue-router';
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
import '@iconify/vue';
import 'tailwindcss/colors';
import '@vueuse/core';
import '@vueuse/shared';
import 'tailwind-variants';
import '@iconify/utils/lib/css/icon';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';
import 'aria-hidden';
import '@tanstack/vue-virtual';
import '@floating-ui/vue';
import '@supabase/supabase-js';

async function sha256Hex(value) {
  const encodedValue = new TextEncoder().encode(value);
  const hashBuffer = await crypto.subtle.digest("SHA-256", encodedValue);
  return Array.from(new Uint8Array(hashBuffer)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}
function createLinkToken() {
  const randomValues = new Uint8Array(32);
  crypto.getRandomValues(randomValues);
  return Array.from(randomValues).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}
function useUserProfiles() {
  const supabase = useSupabaseClient();
  async function getUserId() {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      throw error;
    }
    if (!data.user) {
      throw new Error("Please sign in first.");
    }
    return data.user.id;
  }
  async function getProfile() {
    const userId = await getUserId();
    const { data, error } = await supabase.from("user_profiles").select("*").eq("user_id", userId).maybeSingle();
    if (error) {
      throw error;
    }
    return data;
  }
  async function upsertProfile(payload) {
    const userId = await getUserId();
    const { data, error } = await supabase.from("user_profiles").upsert({
      user_id: userId,
      ...payload,
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    }).select().single();
    if (error) {
      throw error;
    }
    return data;
  }
  async function listSupporterProfiles() {
    const userId = await getUserId();
    const { data, error } = await supabase.from("supporter_profiles").select("*").eq("user_id", userId).order("created_at", { ascending: false });
    if (error) {
      throw error;
    }
    return data || [];
  }
  async function createSupporterProfile(payload) {
    const userId = await getUserId();
    const token = createLinkToken();
    const tokenHash = await sha256Hex(token);
    const linkLabel = payload.link_label?.trim();
    const displayName = linkLabel || "Private supporter link";
    const { data, error } = await supabase.from("supporter_profiles").insert({
      user_id: userId,
      display_name: displayName,
      visible_conditions: payload.visible_conditions,
      token_hash: tokenHash,
      linked_entry_id: payload.linked_entry_id || null,
      entry_context_summary: payload.entry_context_summary || null
    }).select().single();
    if (error) {
      throw error;
    }
    return {
      profile: data,
      token
    };
  }
  async function toggleSupporterProfile(id, active) {
    const { data, error } = await supabase.from("supporter_profiles").update({
      active,
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    }).eq("id", id).select().single();
    if (error) {
      throw error;
    }
    return data;
  }
  async function createSupporterProfileLink(profileId) {
    const userId = await getUserId();
    const token = createLinkToken();
    const tokenHash = await sha256Hex(token);
    const { error } = await supabase.from("supporter_link_tokens").insert({
      supporter_profile_id: profileId,
      user_id: userId,
      token_hash: tokenHash
    });
    if (error) {
      throw error;
    }
    return token;
  }
  async function deleteSupporterProfile(id) {
    const userId = await getUserId();
    const { error } = await supabase.from("supporter_profiles").delete().eq("id", id).eq("user_id", userId);
    if (error) {
      throw error;
    }
  }
  return {
    getProfile,
    upsertProfile,
    listSupporterProfiles,
    createSupporterProfile,
    createSupporterProfileLink,
    toggleSupporterProfile,
    deleteSupporterProfile
  };
}
function readDeletedEntriesForUser(userId) {
  {
    return [];
  }
}
function writeDeletedEntriesForUser(userId, entries) {
  {
    return;
  }
}
function useDeletedEntryArchive() {
  function listDeletedEntries(userId) {
    return readDeletedEntriesForUser();
  }
  function archiveDeletedEntry(userId, entry) {
    const archivedEntry = {
      ...entry,
      deleted_at: (/* @__PURE__ */ new Date()).toISOString()
    };
    writeDeletedEntriesForUser(userId, [archivedEntry, ...readDeletedEntriesForUser()]);
    return archivedEntry;
  }
  function removeDeletedEntry(userId, entryId) {
    writeDeletedEntriesForUser(
      userId,
      readDeletedEntriesForUser().filter((entry) => entry.id !== entryId)
    );
  }
  function takeDeletedEntry(userId, entryId) {
    const entries = readDeletedEntriesForUser();
    const entry = entries.find((item) => item.id === entryId);
    if (!entry) {
      return null;
    }
    writeDeletedEntriesForUser(userId, entries.filter((item) => item.id !== entryId));
    return entry;
  }
  return {
    listDeletedEntries,
    archiveDeletedEntry,
    removeDeletedEntry,
    takeDeletedEntry
  };
}
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "profile",
  __ssrInlineRender: true,
  setup(__props) {
    useRoute();
    const {
      user,
      isAuthLoading,
      authError,
      signIn,
      signUp,
      signInWithGoogle,
      signOut
    } = useSupabaseAuth();
    const {
      getProfile,
      upsertProfile,
      listSupporterProfiles
    } = useUserProfiles();
    useSymptomEntries();
    const {
      listDeletedEntries
    } = useDeletedEntryArchive();
    const conditionOptions = [
      "PTSD / Mental Health",
      "Back or Joint Pain",
      "Nerve / Radiculopathy",
      "Migraine / Headache",
      "GERD / IBS",
      "Sleep Issues"
    ];
    const authMode = ref("login");
    const authName = ref("");
    const authEmail = ref("");
    const authPassword = ref("");
    const authConfirmPassword = ref("");
    const authMessage = ref("");
    const isAuthSubmitting = ref(false);
    const profileForm = ref({
      full_name: ""
    });
    const supporterForm = ref({
      link_label: "",
      visible_conditions: []
    });
    const supporterProfiles = ref([]);
    const deletedEntries = ref([]);
    const createdLink = ref("");
    const createdLinkCopied = ref(false);
    ref(null);
    const linkedEntryContext = ref(null);
    const pageMessage = ref("");
    const pageError = ref("");
    const isSavingProfile = ref(false);
    const isCreatingSupporter = ref(false);
    const isRestoringEntryId = ref(null);
    const isDeletingSupporterId = ref(null);
    const isCopyingSupporterId = ref(null);
    const copiedSupporterId = ref(null);
    const pendingPurgeEntry = ref(null);
    const pendingDeleteSupporter = ref(null);
    const deletedHistoryEntries = computed(() => {
      return deletedEntries.value.map((entry) => mapEntryHistoryItem(entry, { deleted: true }));
    });
    watch(user, (currentUser) => {
      if (currentUser) {
        loadProfilePage();
      } else {
        deletedEntries.value = [];
        supporterProfiles.value = [];
      }
    });
    watch(isAuthLoading, (loading) => {
      if (!loading && user.value) {
        loadProfilePage();
      }
    });
    function loadDeletedEntries() {
      if (!user.value) {
        deletedEntries.value = [];
        return;
      }
      deletedEntries.value = listDeletedEntries(user.value.id);
    }
    async function loadProfilePage() {
      pageError.value = "";
      loadDeletedEntries();
      try {
        const [profile, supporters] = await Promise.all([
          getProfile(),
          listSupporterProfiles()
        ]);
        profileForm.value.full_name = profile?.full_name || user.value?.user_metadata?.full_name || "";
        supporterProfiles.value = supporters;
      } catch (error) {
        pageError.value = getErrorMessage(error);
      }
    }
    async function saveProfile() {
      isSavingProfile.value = true;
      pageMessage.value = "";
      pageError.value = "";
      try {
        await upsertProfile({
          full_name: profileForm.value.full_name,
          display_name: profileForm.value.full_name
        });
        pageMessage.value = "Profile saved.";
      } catch (error) {
        pageError.value = getErrorMessage(error);
      } finally {
        isSavingProfile.value = false;
      }
    }
    async function handleAuthSubmit() {
      isAuthSubmitting.value = true;
      authMessage.value = "";
      try {
        if (authMode.value === "login") {
          await signIn(authEmail.value, authPassword.value);
        } else {
          if (authPassword.value !== authConfirmPassword.value) {
            authMessage.value = "Passwords do not match.";
            return;
          }
          const data = await signUp(authEmail.value, authPassword.value, authName.value);
          if (data.user) {
            authMessage.value = data.session ? "Account created. You are signed in." : "Account created. Check your email to confirm before signing in.";
          } else {
            authMessage.value = "Signup did not return a user. Check Supabase Auth settings and try again.";
          }
        }
      } catch {
      } finally {
        isAuthSubmitting.value = false;
      }
    }
    async function handleGoogleSignIn() {
      isAuthSubmitting.value = true;
      authMessage.value = "";
      try {
        await signInWithGoogle();
      } catch {
      } finally {
        isAuthSubmitting.value = false;
      }
    }
    async function handleSignOut() {
      isAuthSubmitting.value = true;
      pageMessage.value = "";
      try {
        await signOut();
      } catch {
        pageError.value = authError.value;
      } finally {
        isAuthSubmitting.value = false;
      }
    }
    function getErrorMessage(error) {
      if (error instanceof Error) {
        return error.message;
      }
      return "Something went wrong. Please try again.";
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0$1;
      const _component_UIcon = _sfc_main$d;
      const _component_StickyActionBar = __nuxt_component_5;
      const _component_UBadge = _sfc_main$2;
      const _component_USelectMenu = _sfc_main$1;
      _push(`<main${ssrRenderAttrs(mergeProps({ class: "flex min-h-dvh flex-col bg-slate-950 text-white" }, _attrs))}><section class="mx-auto flex w-full max-w-md flex-1 flex-col px-4 pt-4 sm:max-w-lg"><header class="sticky top-0 z-40 -mx-4 flex shrink-0 items-center justify-between gap-3 border-b border-slate-800 bg-slate-950/95 px-4 pb-4 pt-4 backdrop-blur-md"><div><p class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Profile</p><h1 class="mt-1 text-2xl font-bold tracking-tight text-white">Account Settings</h1></div>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/",
        class: "grid size-10 place-items-center rounded-full bg-slate-900 text-white shadow-sm ring-1 ring-slate-800 transition hover:bg-slate-800",
        "aria-label": "Back to tracker"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UIcon, {
              name: "i-lucide-arrow-left",
              class: "size-5"
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UIcon, {
                name: "i-lucide-arrow-left",
                class: "size-5"
              })
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</header>`);
      if (unref(isAuthLoading)) {
        _push(`<section class="mt-6 shrink-0 rounded-4xl border border-slate-800 bg-slate-900 p-5"><h2 class="text-xl font-bold text-white">Loading account...</h2><p class="mt-2 text-sm leading-6 text-slate-400"> Checking your saved session. </p></section>`);
      } else if (!unref(user)) {
        _push(`<div class="mt-6 flex min-h-0 flex-1 flex-col"><div class="flex-1 overflow-y-auto no-scrollbar"><section class="rounded-4xl border border-slate-800 bg-slate-900 p-5"><h2 class="text-xl font-bold text-white">${ssrInterpolate(authMode.value === "login" ? "Sign in" : "Create account")}</h2><p class="mt-2 text-sm leading-6 text-slate-400"> Sign in to save symptom entries, export reports, and manage deleted logs. </p><div class="mt-5 space-y-4">`);
        if (authMode.value === "signup") {
          _push(`<label class="block"><span class="mb-2 block px-1 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Name</span><input${ssrRenderAttr("value", authName.value)} type="text" autocomplete="name" class="w-full rounded-3xl border border-slate-600/70 bg-slate-800/70 px-4 py-4 text-base font-medium text-white outline-none placeholder:text-slate-400 focus:border-slate-400" placeholder="Your full name" required></label>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<label class="block"><span class="mb-2 block px-1 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Email</span><input${ssrRenderAttr("value", authEmail.value)} type="email" autocomplete="email" class="w-full rounded-3xl border border-slate-600/70 bg-slate-800/70 px-4 py-4 text-base font-medium text-white outline-none placeholder:text-slate-400 focus:border-slate-400" placeholder="you@example.com" required></label>`);
        if (authMode.value === "signup") {
          _push(`<label class="block"><span class="mb-2 block px-1 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Confirm password</span><input${ssrRenderAttr("value", authConfirmPassword.value)} type="password" autocomplete="new-password" class="w-full rounded-3xl border border-slate-600/70 bg-slate-800/70 px-4 py-4 text-base font-medium text-white outline-none placeholder:text-slate-400 focus:border-slate-400" placeholder="Re-enter password" required></label>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<label class="block"><span class="mb-2 block px-1 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Password</span><input${ssrRenderAttr("value", authPassword.value)} type="password" autocomplete="current-password" class="w-full rounded-3xl border border-slate-600/70 bg-slate-800/70 px-4 py-4 text-base font-medium text-white outline-none placeholder:text-slate-400 focus:border-slate-400" placeholder="At least 6 characters" required></label><button type="button" class="w-full rounded-2xl px-4 py-2 text-sm font-semibold text-slate-300">${ssrInterpolate(authMode.value === "login" ? "Need an account? Sign up" : "Already have an account? Sign in")}</button></div></section></div>`);
        _push(ssrRenderComponent(_component_StickyActionBar, { tone: "dark" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              if (authMessage.value) {
                _push2(`<p class="mb-3 text-center text-sm font-medium text-slate-300"${_scopeId}>${ssrInterpolate(authMessage.value)}</p>`);
              } else {
                _push2(`<!---->`);
              }
              if (unref(authError)) {
                _push2(`<p class="mb-3 text-center text-sm font-medium text-red-300"${_scopeId}>${ssrInterpolate(unref(authError))}</p>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`<button type="button" class="w-full rounded-2xl bg-white px-5 py-4 text-base font-bold text-slate-950 shadow-lg transition hover:bg-slate-200"${ssrIncludeBooleanAttr(isAuthSubmitting.value) ? " disabled" : ""}${_scopeId}>${ssrInterpolate(isAuthSubmitting.value ? "Working..." : authMode.value === "login" ? "Sign in" : "Create account")}</button><button type="button" class="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-800 px-4 py-4 text-base font-bold text-white ring-1 ring-slate-700 transition hover:bg-slate-700"${ssrIncludeBooleanAttr(isAuthSubmitting.value) ? " disabled" : ""}${_scopeId}>`);
              _push2(ssrRenderComponent(_component_UIcon, {
                name: "i-lucide-chrome",
                class: "size-5"
              }, null, _parent2, _scopeId));
              _push2(` Continue with Google </button>`);
            } else {
              return [
                authMessage.value ? (openBlock(), createBlock("p", {
                  key: 0,
                  class: "mb-3 text-center text-sm font-medium text-slate-300"
                }, toDisplayString(authMessage.value), 1)) : createCommentVNode("", true),
                unref(authError) ? (openBlock(), createBlock("p", {
                  key: 1,
                  class: "mb-3 text-center text-sm font-medium text-red-300"
                }, toDisplayString(unref(authError)), 1)) : createCommentVNode("", true),
                createVNode("button", {
                  type: "button",
                  class: "w-full rounded-2xl bg-white px-5 py-4 text-base font-bold text-slate-950 shadow-lg transition hover:bg-slate-200",
                  disabled: isAuthSubmitting.value,
                  onClick: handleAuthSubmit
                }, toDisplayString(isAuthSubmitting.value ? "Working..." : authMode.value === "login" ? "Sign in" : "Create account"), 9, ["disabled"]),
                createVNode("button", {
                  type: "button",
                  class: "mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-800 px-4 py-4 text-base font-bold text-white ring-1 ring-slate-700 transition hover:bg-slate-700",
                  disabled: isAuthSubmitting.value,
                  onClick: handleGoogleSignIn
                }, [
                  createVNode(_component_UIcon, {
                    name: "i-lucide-chrome",
                    class: "size-5"
                  }),
                  createTextVNode(" Continue with Google ")
                ], 8, ["disabled"])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
      } else {
        _push(`<div class="mt-6 flex min-h-0 flex-1 flex-col"><div class="flex-1 space-y-5 overflow-y-auto no-scrollbar pb-4"><section class="rounded-4xl border border-slate-800 bg-slate-900 p-4"><div><p class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Your Info</p><h2 class="mt-1 text-xl font-bold text-white">${ssrInterpolate(unref(user).email)}</h2></div><div class="mt-5 space-y-4"><label class="block"><span class="mb-2 block px-1 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Full name</span><input${ssrRenderAttr("value", profileForm.value.full_name)} type="text" class="w-full rounded-3xl border border-slate-600/70 bg-slate-800/70 px-4 py-4 text-base font-medium text-white outline-none placeholder:text-slate-400 focus:border-slate-400" placeholder="Your full name"></label></div></section><section class="rounded-4xl border border-slate-800 bg-slate-900 p-4"><div><p class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Deleted Entries</p><h2 class="mt-1 text-xl font-bold text-white">Recovery bin</h2><p class="mt-2 text-sm leading-6 text-slate-400"> Entries removed from your log stay here until you restore or permanently remove them. </p></div>`);
        if (!deletedHistoryEntries.value.length) {
          _push(`<div class="mt-5 rounded-3xl border border-slate-800 bg-slate-950/60 p-5 text-center text-sm text-slate-400"> No deleted entries. </div>`);
        } else {
          _push(`<div class="mt-5 space-y-3"><!--[-->`);
          ssrRenderList(deletedHistoryEntries.value, (entry) => {
            _push(`<article class="rounded-3xl border border-slate-800 bg-slate-950/60 p-4"><div class="flex items-start justify-between gap-3"><div class="min-w-0"><div class="flex flex-wrap items-center gap-2">`);
            _push(ssrRenderComponent(_component_UBadge, {
              color: "neutral",
              variant: "soft",
              size: "sm"
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`${ssrInterpolate(entry.condition)}`);
                } else {
                  return [
                    createTextVNode(toDisplayString(entry.condition), 1)
                  ];
                }
              }),
              _: 2
            }, _parent));
            _push(ssrRenderComponent(_component_UBadge, {
              color: "error",
              variant: "soft",
              size: "sm"
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`Deleted`);
                } else {
                  return [
                    createTextVNode("Deleted")
                  ];
                }
              }),
              _: 2
            }, _parent));
            _push(`</div><h3 class="mt-2 font-bold text-white">${ssrInterpolate(entry.title)}</h3><p class="mt-1 text-xs text-slate-400">${ssrInterpolate(entry.deletedLabel)}</p></div><div class="flex shrink-0 flex-col gap-2"><button type="button" class="rounded-full bg-white px-3 py-2 text-xs font-bold text-slate-950"${ssrIncludeBooleanAttr(isRestoringEntryId.value === entry.id) ? " disabled" : ""}>${ssrInterpolate(isRestoringEntryId.value === entry.id ? "Restoring..." : "Restore")}</button><button type="button" class="rounded-full px-3 py-2 text-xs font-semibold text-red-300 transition hover:bg-red-950/40"> Remove </button></div></div></article>`);
          });
          _push(`<!--]--></div>`);
        }
        _push(`</section><section class="rounded-4xl border border-slate-800 bg-slate-900 p-4"><div><p class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Supporter Links</p><h2 class="mt-1 text-xl font-bold text-white">Family reporting access</h2><p class="mt-2 text-sm leading-6 text-slate-400"> Create a private link for someone you trust. They enter their own contact info on each report. You can also create a link from a saved entry in your history. </p></div>`);
        if (linkedEntryContext.value) {
          _push(`<div class="mt-4 rounded-3xl border border-sky-900/60 bg-sky-950/30 p-4"><p class="text-xs font-bold uppercase tracking-[0.14em] text-sky-300">Linked entry</p><p class="mt-2 font-semibold text-white">${ssrInterpolate(linkedEntryContext.value.summary)}</p><p class="mt-1 text-xs text-sky-200/80">${ssrInterpolate(linkedEntryContext.value.condition)}</p></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="mt-5 space-y-4"><label class="block"><span class="mb-2 block px-1 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Link label (optional)</span><input${ssrRenderAttr("value", supporterForm.value.link_label)} type="text" class="w-full rounded-3xl border border-slate-600/70 bg-slate-800/70 px-4 py-4 text-base font-medium text-white outline-none placeholder:text-slate-400 focus:border-slate-400" placeholder="Example: Mom, spouse, caregiver"><p class="mt-2 px-1 text-xs leading-5 text-slate-400"> This label is only for you to recognize the link. The supporter enters their real info when submitting a report. </p></label><div><span class="mb-2 block px-1 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Visible conditions</span>`);
        _push(ssrRenderComponent(_component_USelectMenu, {
          modelValue: supporterForm.value.visible_conditions,
          "onUpdate:modelValue": ($event) => supporterForm.value.visible_conditions = $event,
          items: conditionOptions,
          multiple: "",
          placeholder: "Choose visible conditions",
          class: "w-full",
          color: "neutral",
          size: "xl"
        }, null, _parent));
        _push(`</div><button type="button" class="w-full rounded-2xl bg-white px-5 py-4 text-base font-bold text-slate-950 shadow-lg transition hover:bg-slate-200"${ssrIncludeBooleanAttr(isCreatingSupporter.value) ? " disabled" : ""}>${ssrInterpolate(isCreatingSupporter.value ? "Creating..." : "Create Private Link")}</button></div>`);
        if (createdLink.value) {
          _push(`<div class="mt-4 rounded-3xl border border-emerald-900 bg-emerald-950/40 p-4"><p class="text-sm font-bold text-emerald-200">Private link created</p><p class="mt-2 break-all text-sm leading-6 text-emerald-100">${ssrInterpolate(createdLink.value)}</p><p class="mt-2 text-xs leading-5 text-emerald-200/80"> Save this now. For privacy, the raw token is only shown when the link is created. </p><button type="button" class="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-emerald-400">`);
          _push(ssrRenderComponent(_component_UIcon, {
            name: createdLinkCopied.value ? "i-lucide-check" : "i-lucide-copy",
            class: "size-4"
          }, null, _parent));
          _push(` ${ssrInterpolate(createdLinkCopied.value ? "Copied to clipboard" : "Copy link")}</button></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</section><section class="space-y-3"><h2 class="px-1 text-xl font-bold text-white">Existing supporter profiles</h2>`);
        if (!supporterProfiles.value.length) {
          _push(`<div class="rounded-4xl border border-slate-800 bg-slate-900 p-5 text-center text-sm text-slate-400"> No supporter links yet. </div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<!--[-->`);
        ssrRenderList(supporterProfiles.value, (profile) => {
          _push(`<article class="rounded-4xl border border-slate-800 bg-slate-900 p-4"><div class="flex items-start justify-between gap-3"><div><h3 class="font-bold text-white">${ssrInterpolate(profile.display_name || "Private supporter link")}</h3><p class="mt-1 text-sm text-slate-400">Reporter details are collected on each submission.</p></div>`);
          _push(ssrRenderComponent(_component_UBadge, {
            color: profile.active ? "success" : "neutral",
            variant: "soft"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(profile.active ? "Active" : "Disabled")}`);
              } else {
                return [
                  createTextVNode(toDisplayString(profile.active ? "Active" : "Disabled"), 1)
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(`</div><div class="mt-3 flex flex-wrap gap-2"><!--[-->`);
          ssrRenderList(profile.visible_conditions, (condition) => {
            _push(ssrRenderComponent(_component_UBadge, {
              key: condition,
              color: "neutral",
              variant: "soft"
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`${ssrInterpolate(condition)}`);
                } else {
                  return [
                    createTextVNode(toDisplayString(condition), 1)
                  ];
                }
              }),
              _: 2
            }, _parent));
          });
          _push(`<!--]--></div>`);
          if (profile.entry_context_summary) {
            _push(`<div class="mt-3 rounded-2xl border border-sky-900/50 bg-sky-950/20 px-3 py-2"><p class="text-xs font-bold uppercase tracking-[0.12em] text-sky-300">Linked entry</p><p class="mt-1 text-sm text-sky-100">${ssrInterpolate(profile.entry_context_summary)}</p></div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`<div class="mt-4 flex items-center gap-3"><button type="button" class="grid size-11 shrink-0 place-items-center rounded-full bg-slate-800 text-white ring-1 ring-slate-700 transition hover:bg-slate-700"${ssrIncludeBooleanAttr(isCopyingSupporterId.value === profile.id) ? " disabled" : ""}${ssrRenderAttr("aria-label", `Copy link for ${profile.display_name || "private supporter link"}`)}>`);
          _push(ssrRenderComponent(_component_UIcon, {
            name: copiedSupporterId.value === profile.id ? "i-lucide-check" : "i-lucide-copy",
            class: "size-4"
          }, null, _parent));
          _push(`<span class="sr-only">${ssrInterpolate(copiedSupporterId.value === profile.id ? "Copied" : "Copy link")}</span></button><button type="button" class="flex-1 rounded-2xl bg-slate-800 px-4 py-3 text-sm font-bold text-white ring-1 ring-slate-700">${ssrInterpolate(profile.active ? "Disable link" : "Reactivate link")}</button><button type="button" class="flex-1 rounded-2xl bg-red-950/50 px-4 py-3 text-sm font-bold text-red-300 ring-1 ring-red-900/60"> Delete link </button></div></article>`);
        });
        _push(`<!--]--></section></div>`);
        _push(ssrRenderComponent(_component_StickyActionBar, { tone: "dark" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              if (pageMessage.value) {
                _push2(`<p class="mb-3 text-center text-sm font-medium text-slate-300"${_scopeId}>${ssrInterpolate(pageMessage.value)}</p>`);
              } else {
                _push2(`<!---->`);
              }
              if (pageError.value) {
                _push2(`<p class="mb-3 text-center text-sm font-medium text-red-300"${_scopeId}>${ssrInterpolate(pageError.value)}</p>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`<button type="button" class="w-full rounded-2xl bg-white px-5 py-4 text-base font-bold text-slate-950 shadow-lg transition hover:bg-slate-200"${ssrIncludeBooleanAttr(isSavingProfile.value) ? " disabled" : ""}${_scopeId}>${ssrInterpolate(isSavingProfile.value ? "Saving..." : "Save Profile")}</button><button type="button" class="mt-3 w-full rounded-2xl bg-slate-800 px-4 py-3 text-sm font-bold text-white ring-1 ring-slate-700"${ssrIncludeBooleanAttr(isAuthSubmitting.value) ? " disabled" : ""}${_scopeId}>${ssrInterpolate(isAuthSubmitting.value ? "Signing out..." : "Sign out")}</button>`);
            } else {
              return [
                pageMessage.value ? (openBlock(), createBlock("p", {
                  key: 0,
                  class: "mb-3 text-center text-sm font-medium text-slate-300"
                }, toDisplayString(pageMessage.value), 1)) : createCommentVNode("", true),
                pageError.value ? (openBlock(), createBlock("p", {
                  key: 1,
                  class: "mb-3 text-center text-sm font-medium text-red-300"
                }, toDisplayString(pageError.value), 1)) : createCommentVNode("", true),
                createVNode("button", {
                  type: "button",
                  class: "w-full rounded-2xl bg-white px-5 py-4 text-base font-bold text-slate-950 shadow-lg transition hover:bg-slate-200",
                  disabled: isSavingProfile.value,
                  onClick: saveProfile
                }, toDisplayString(isSavingProfile.value ? "Saving..." : "Save Profile"), 9, ["disabled"]),
                createVNode("button", {
                  type: "button",
                  class: "mt-3 w-full rounded-2xl bg-slate-800 px-4 py-3 text-sm font-bold text-white ring-1 ring-slate-700",
                  disabled: isAuthSubmitting.value,
                  onClick: handleSignOut
                }, toDisplayString(isAuthSubmitting.value ? "Signing out..." : "Sign out"), 9, ["disabled"])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
      }
      _push(`</section>`);
      if (pendingPurgeEntry.value) {
        _push(`<div class="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/70 p-4 sm:items-center"><div class="w-full max-w-md rounded-[1.75rem] border border-slate-800 bg-slate-900 p-5 shadow-2xl"><p class="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Permanent removal</p><h3 class="mt-2 text-xl font-bold text-white">Remove forever?</h3><p class="mt-3 text-sm leading-6 text-slate-300"><span class="font-semibold text-white">${ssrInterpolate(pendingPurgeEntry.value.title)}</span> will be removed from your deleted archive. This cannot be undone. </p><div class="mt-5 grid grid-cols-2 gap-3"><button type="button" class="rounded-2xl bg-slate-800 px-4 py-3 text-sm font-bold text-white"> Cancel </button><button type="button" class="rounded-2xl bg-red-600 px-4 py-3 text-sm font-bold text-white"> Remove forever </button></div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (pendingDeleteSupporter.value) {
        _push(`<div class="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/70 p-4 sm:items-center"><div class="w-full max-w-md rounded-[1.75rem] border border-slate-800 bg-slate-900 p-5 shadow-2xl"><p class="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Delete supporter link</p><h3 class="mt-2 text-xl font-bold text-white">Remove this link forever?</h3><p class="mt-3 text-sm leading-6 text-slate-300"><span class="font-semibold text-white">${ssrInterpolate(pendingDeleteSupporter.value.display_name)}</span> will stop working immediately. Anyone with the old URL will no longer be able to submit reports. </p><div class="mt-5 grid grid-cols-2 gap-3"><button type="button" class="rounded-2xl bg-slate-800 px-4 py-3 text-sm font-bold text-white"> Cancel </button><button type="button" class="rounded-2xl bg-red-600 px-4 py-3 text-sm font-bold text-white"${ssrIncludeBooleanAttr(isDeletingSupporterId.value === pendingDeleteSupporter.value.id) ? " disabled" : ""}>${ssrInterpolate(isDeletingSupporterId.value === pendingDeleteSupporter.value.id ? "Deleting..." : "Delete link")}</button></div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</main>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/profile.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=profile-VyPINgjL.mjs.map
