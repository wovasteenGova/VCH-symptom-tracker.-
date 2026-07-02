import { d as _export_sfc, _ as __nuxt_component_0$1, e as _sfc_main$d } from './server.mjs';
import { _ as __nuxt_component_5 } from './StickyActionBar-DXZsYWQC.mjs';
import { mergeProps, withCtx, createVNode, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent } from 'vue/server-renderer';
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
import 'vue-router';
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

const _sfc_main = {};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs) {
  const _component_NuxtLink = __nuxt_component_0$1;
  const _component_UIcon = _sfc_main$d;
  const _component_StickyActionBar = __nuxt_component_5;
  _push(`<main${ssrRenderAttrs(mergeProps({ class: "flex min-h-dvh flex-col bg-slate-950 text-white" }, _attrs))}><section class="mx-auto flex w-full max-w-md flex-1 flex-col px-4 pt-5 sm:max-w-lg"><header class="flex shrink-0 items-center justify-between gap-3"><div><p class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Privacy</p><h1 class="mt-1 text-2xl font-bold tracking-tight text-white">Privacy and Data Use</h1></div>`);
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
  _push(`</header><div class="mt-6 flex-1 overflow-y-auto no-scrollbar pb-4"><section class="space-y-4 rounded-4xl border border-slate-800 bg-slate-900 p-5 text-sm leading-6 text-slate-300"><p> Veteran Symptom Tracker stores the information you enter so you can review symptom patterns, daily impact, and supporter observations. </p><div><h2 class="text-base font-bold text-white">Information we store</h2><ul class="mt-2 list-disc space-y-2 pl-5"><li>Account email and profile name.</li><li>Symptom entries, severity, dates, notes, and daily impact details.</li><li>Supporter link settings and the conditions you choose to make visible.</li><li>Supporter observations, reporter name, email, phone, relationship, affirmation, signature name, and timestamp.</li></ul></div><div><h2 class="text-base font-bold text-white">How supporter reports work</h2><p class="mt-2"> A supporter can only access the private report link you create. They can only see the condition labels you selected for that link. They cannot see your full account or full history. </p></div><div><h2 class="text-base font-bold text-white">Data provider</h2><p class="mt-2"> This app uses Supabase for authentication and database storage. Do not enter information you are not comfortable storing in a cloud database. </p></div><div><h2 class="text-base font-bold text-white">Data deletion</h2><p class="mt-2"> This beta does not yet have a self-serve delete account button. For now, contact the app owner to request deletion before using this with a large public audience. </p></div></section></div>`);
  _push(ssrRenderComponent(_component_StickyActionBar, { tone: "dark" }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_NuxtLink, {
          to: "/",
          class: "flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-4 text-base font-bold text-slate-950 shadow-lg transition hover:bg-slate-200"
        }, {
          default: withCtx((_2, _push3, _parent3, _scopeId2) => {
            if (_push3) {
              _push3(ssrRenderComponent(_component_UIcon, {
                name: "i-lucide-arrow-left",
                class: "size-5"
              }, null, _parent3, _scopeId2));
              _push3(` Back to tracker `);
            } else {
              return [
                createVNode(_component_UIcon, {
                  name: "i-lucide-arrow-left",
                  class: "size-5"
                }),
                createTextVNode(" Back to tracker ")
              ];
            }
          }),
          _: 1
        }, _parent2, _scopeId));
      } else {
        return [
          createVNode(_component_NuxtLink, {
            to: "/",
            class: "flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-4 text-base font-bold text-slate-950 shadow-lg transition hover:bg-slate-200"
          }, {
            default: withCtx(() => [
              createVNode(_component_UIcon, {
                name: "i-lucide-arrow-left",
                class: "size-5"
              }),
              createTextVNode(" Back to tracker ")
            ]),
            _: 1
          })
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`</section></main>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/privacy.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const privacy = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);

export { privacy as default };
//# sourceMappingURL=privacy-DD0AeBCB.mjs.map
